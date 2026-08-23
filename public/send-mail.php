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

// Same Hostinger mailbox already used by the Dunox Studio PHP contact form.
$owner = 'avshendrik@gmail.com';
$sender = 'avshendrik@gmail.com';
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

function send_villa_mail(string $to, string $subject, string $body, string $sender, string $replyTo): bool
{
    if (preg_match('/[\r\n]/', $to) || preg_match('/[\r\n]/', $replyTo)) {
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
$guests = filter_var($data['guests'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 6]]);
$estimatedTotal = is_numeric($data['estimatedTotal'] ?? null) ? (float) $data['estimatedTotal'] : -1;
$reviewUrl = clean_url($data['reviewUrl'] ?? '');
$calendarUrl = clean_url($data['calendarUrl'] ?? '');

if (
    !in_array($kind, ['owner_request', 'guest_received', 'guest_confirmed', 'guest_declined'], true) ||
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

if (!verify_review_url($reviewUrl, $reference, (string) $email, $expectedSupabaseHost, $expectedReviewPath)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Booking verification failed']);
    exit;
}

$details = implode("\n", [
    "Stay: {$checkIn} → {$checkOut}",
    "Guests: {$guests}",
    "Reference: {$reference}",
    'Estimate: €' . number_format($estimatedTotal, 0, '.', ''),
]);

$to = '';
$replyTo = $sender;
$subject = '';
$body = '';

if ($kind === 'owner_request') {
    $to = $owner;
    $replyTo = (string) $email;
    $subject = "Villa Floyd request {$reference} · {$checkIn}–{$checkOut}";
    $body = implode("\n", [
        'New booking request',
        '',
        'The dates are temporarily held while you review this request.',
        '',
        $details,
        '',
        "Guest: {$name}",
        "Email: {$email}",
        'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
        '',
        'Message:',
        $message !== '' ? $message : 'No message',
        '',
        'Review / confirm / decline:',
        $reviewUrl,
        '',
        'Opening the link does not confirm anything. Use Confirm booking or Decline request on that page.',
    ]);
} elseif ($kind === 'guest_received') {
    $to = (string) $email;
    $subject = "Villa Floyd request received · {$reference}";
    $body = implode("\n", [
        "Hello {$name},",
        '',
        'We received your Villa Floyd booking request. Your dates are temporarily held while the owner reviews it.',
        '',
        $details,
        '',
        $calendarUrl !== '' ? "Add the requested dates to your Google Calendar:\n{$calendarUrl}" : '',
        '',
        'Adding or changing this personal calendar event does not change the booking itself.',
        'No payment has been taken.',
    ]);
} elseif ($kind === 'guest_confirmed') {
    $to = (string) $email;
    $subject = "Villa Floyd booking confirmed · {$reference}";
    $body = implode("\n", [
        "Hello {$name},",
        '',
        'Your Villa Floyd stay is confirmed.',
        '',
        $details,
        '',
        $calendarUrl !== '' ? "Add the confirmed stay to your Google Calendar:\n{$calendarUrl}" : '',
        '',
        'Changing or deleting the personal calendar event does not change the Villa Floyd booking.',
        'The owner will contact you directly with the next practical details.',
    ]);
} else {
    $to = (string) $email;
    $subject = "Villa Floyd booking request update · {$reference}";
    $body = implode("\n", [
        "Hello {$name},",
        '',
        'The requested stay could not be confirmed. The temporary hold has been released.',
        '',
        $details,
        '',
        'You can return to the Villa Floyd website and choose another available stay.',
    ]);
}

$body = preg_replace("/\n{3,}/", "\n\n", $body) ?? $body;

if (!send_villa_mail($to, $subject, trim($body), $sender, $replyTo)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail could not be sent']);
    exit;
}

echo json_encode(['success' => true]);
