<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

/*
 * Change these two addresses when the Villa Floyd owner mailbox is ready.
 * $owner  = where new booking requests arrive.
 * $sender = mailbox on this PHP hosting/domain used by mail().
 */
$owner = 'avshendrik@gmail.com';
$sender = 'info@dunoxstudio.com';

$expectedSupabaseHost = 'gclhmkrqcevbbvugjzsc.supabase.co';
$expectedReviewPath = '/functions/v1/booking-action';

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit;
}

function clean_text(mixed $value, int $maxLength): string
{
    if (!is_string($value)) {
        return '';
    }

    $value = trim(strip_tags($value));
    $value = str_replace(["\r\n", "\r"], "\n", $value);

    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength)
        : substr($value, 0, $maxLength);
}

function clean_single_line(mixed $value, int $maxLength): string
{
    return str_replace(["\r", "\n"], ' ', clean_text($value, $maxLength));
}

function clean_url(mixed $value): string
{
    $url = clean_single_line($value, 3000);
    if ($url === '' || filter_var($url, FILTER_VALIDATE_URL) === false) {
        return '';
    }

    return strtolower((string) parse_url($url, PHP_URL_SCHEME)) === 'https' ? $url : '';
}

function fetch_review_page(string $url): array
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 7,
            CURLOPT_USERAGENT => 'VillaFloyd-MailBridge/1.0',
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);
        return [is_string($body) ? $body : '', $status];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 7,
            'ignore_errors' => true,
            'header' => "User-Agent: VillaFloyd-MailBridge/1.0\r\n",
        ],
    ]);

    $body = @file_get_contents($url, false, $context);
    $status = 0;
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $header, $matches)) {
            $status = (int) $matches[1];
            break;
        }
    }

    return [is_string($body) ? $body : '', $status];
}

function verify_review_url(
    string $url,
    string $reference,
    string $email,
    string $expectedHost,
    string $expectedPath
): bool {
    $parts = parse_url($url);
    if (!is_array($parts)) {
        return false;
    }

    if (
        strtolower((string) ($parts['scheme'] ?? '')) !== 'https' ||
        strtolower((string) ($parts['host'] ?? '')) !== strtolower($expectedHost) ||
        (string) ($parts['path'] ?? '') !== $expectedPath
    ) {
        return false;
    }

    parse_str((string) ($parts['query'] ?? ''), $query);
    if (empty($query['booking']) || empty($query['token'])) {
        return false;
    }

    [$body, $status] = fetch_review_page($url);
    if ($status !== 200 || $body === '') {
        return false;
    }

    $escapedReference = htmlspecialchars($reference, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $escapedEmail = htmlspecialchars($email, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    return str_contains($body, $escapedReference) && str_contains($body, $escapedEmail);
}

function send_owner_mail(
    string $to,
    string $subject,
    string $body,
    string $sender,
    string $replyTo
): bool {
    if (
        preg_match('/[\r\n]/', $to) ||
        preg_match('/[\r\n]/', $sender) ||
        preg_match('/[\r\n]/', $replyTo)
    ) {
        return false;
    }

    $headers = [
        "From: Villa Floyd <{$sender}>",
        "Reply-To: {$replyTo}",
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    return mail(
        $to,
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        $body,
        implode("\r\n", $headers)
    );
}

$kind = clean_single_line($data['kind'] ?? '', 40);
$reference = clean_single_line($data['reference'] ?? '', 80);
$name = clean_single_line($data['name'] ?? '', 120);
$emailRaw = clean_single_line($data['email'] ?? '', 254);
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$phone = clean_single_line($data['phone'] ?? '', 80);
$message = clean_text($data['message'] ?? '', 2000);
$checkIn = clean_single_line($data['checkIn'] ?? '', 10);
$checkOut = clean_single_line($data['checkOut'] ?? '', 10);
$guests = filter_var(
    $data['guests'] ?? null,
    FILTER_VALIDATE_INT,
    ['options' => ['min_range' => 1, 'max_range' => 6]]
);
$estimatedTotal = is_numeric($data['estimatedTotal'] ?? null)
    ? (float) $data['estimatedTotal']
    : -1;
$reviewUrl = clean_url($data['reviewUrl'] ?? '');

if (
    $kind !== 'owner_request' ||
    $reference === '' ||
    $name === '' ||
    $email === false ||
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkIn) ||
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkOut) ||
    $guests === false ||
    $estimatedTotal < 0 ||
    $reviewUrl === ''
) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid booking data']);
    exit;
}

if (!verify_review_url(
    $reviewUrl,
    $reference,
    (string) $email,
    $expectedSupabaseHost,
    $expectedReviewPath
)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Booking verification failed']);
    exit;
}

$subject = "Villa Floyd booking request {$reference} · {$checkIn}–{$checkOut}";
$body = implode("\n", [
    'NEW VILLA FLOYD BOOKING REQUEST',
    '',
    "Check-in: {$checkIn}",
    "Check-out: {$checkOut}",
    "Guests: {$guests}",
    '',
    "Full name: {$name}",
    "Email: {$email}",
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    '',
    'Message:',
    $message !== '' ? $message : 'No message',
    '',
    'Estimated total: €' . number_format($estimatedTotal, 0, '.', ''),
    "Booking reference: {$reference}",
    '',
    'Review booking / Confirm / Decline:',
    $reviewUrl,
]);

if (!send_owner_mail($owner, $subject, $body, $sender, (string) $email)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail could not be sent']);
    exit;
}

echo json_encode(['success' => true]);