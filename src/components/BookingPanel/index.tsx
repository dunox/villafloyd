import { useMemo, useState, type FormEvent } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { cleaningFee, nightlyRate } from '../../data/villa';
import { BookingRequestError, submitBookingRequest } from '../../services/booking';
import { invalidateAvailabilityCache } from '../../services/availability';
import type { DateRangeValue } from '../../types';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Input from '../../ui/Input';
import Modal from '../../ui/Modal';
import QuantitySelector from '../../ui/QuantitySelector';
import BookingCalendar from '../BookingCalendar';
import styles from './styles/index.module.scss';

function BookingPanel() {
  const [dates, setDates] = useState<DateRangeValue>({ from: null, to: null });
  const [guests, setGuests] = useState(2);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});

  const nights = useMemo(() => {
    if (!dates.from || !dates.to) return 0;
    return differenceInCalendarDays(dates.to, dates.from);
  }, [dates]);

  const total = nights ? nights * nightlyRate + cleaningFee : 0;

  const handleDates = (value: DateRangeValue) => {
    setDates(value);
    if (value.from && value.to) {
      window.setTimeout(() => setCalendarOpen(false), 180);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dates.from || !dates.to) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const nextFieldErrors: { name?: string; email?: string } = {};

    if (name.length < 2) nextFieldErrors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextFieldErrors.email = 'Please enter a valid email address.';

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      const firstInvalidName = nextFieldErrors.name ? 'name' : 'email';
      const firstInvalidField = form.elements.namedItem(firstInvalidName);
      if (firstInvalidField instanceof HTMLElement) firstInvalidField.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setFieldErrors({});

    try {
      const result = await submitBookingRequest({
        name,
        email,
        phone: String(data.get('phone') ?? '').trim(),
        message: String(data.get('message') ?? '').trim(),
        checkIn: format(dates.from, 'yyyy-MM-dd'),
        checkOut: format(dates.to, 'yyyy-MM-dd'),
        guests,
        estimatedTotal: total,
      });
      setBookingReference(result.reference);
      setSubmitted(true);
      form.reset();
      invalidateAvailabilityCache();
      setAvailabilityRefresh((value) => value + 1);
    } catch (error) {
      if (error instanceof BookingRequestError && error.code === 'dates_unavailable') {
        invalidateAvailabilityCache();
        setAvailabilityRefresh((value) => value + 1);
      }
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.panel} id="book">
        <div className={styles.topline}>
          <div>
            <span>From</span>
            <strong>€{nightlyRate}</strong>
            <small> / night</small>
          </div>
          <span className={styles.direct}>Best rate when booking direct</span>
        </div>

        <div className={styles.fields}>
          <button
            className={styles.field}
            type="button"
            onClick={() => {
              setCalendarOpen((value) => !value);
              setGuestsOpen(false);
            }}
          >
            <Icon name="calendar" size={19} />
            <span>
              <small>Check-in</small>
              <strong>{dates.from ? format(dates.from, 'd MMM yyyy') : 'Add date'}</strong>
            </span>
          </button>
          <button
            className={styles.field}
            type="button"
            onClick={() => {
              setCalendarOpen((value) => !value);
              setGuestsOpen(false);
            }}
          >
            <Icon name="calendar" size={19} />
            <span>
              <small>Check-out</small>
              <strong>{dates.to ? format(dates.to, 'd MMM yyyy') : 'Add date'}</strong>
            </span>
          </button>
          <button
            className={styles.field}
            type="button"
            onClick={() => {
              setGuestsOpen((value) => !value);
              setCalendarOpen(false);
            }}
          >
            <Icon name="users" size={19} />
            <span>
              <small>Guests</small>
              <strong>{guests} {guests === 1 ? 'guest' : 'guests'}</strong>
            </span>
          </button>
        </div>

        <div className={styles.popoverAnchor}>
          {calendarOpen ? (
            <div className={styles.calendarPopover}>
              <BookingCalendar value={dates} onChange={handleDates} refreshKey={availabilityRefresh} />
            </div>
          ) : null}
          {guestsOpen ? (
            <div className={styles.guestsPopover}>
              <QuantitySelector
                label="Guests"
                hint="Maximum 6 guests"
                value={guests}
                min={1}
                max={6}
                onChange={setGuests}
              />
              <Button fullWidth size="sm" onClick={() => setGuestsOpen(false)}>
                Done
              </Button>
            </div>
          ) : null}
        </div>

        {nights > 0 ? (
          <div className={styles.summary}>
            <div><span>€{nightlyRate} × {nights} nights</span><strong>€{nightlyRate * nights}</strong></div>
            <div><span>Cleaning fee</span><strong>€{cleaningFee}</strong></div>
            <div className={styles.total}><span>Estimated total</span><strong>€{total}</strong></div>
          </div>
        ) : (
          <p className={styles.helper}>Choose your dates to see an estimated stay total.</p>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!dates.from || !dates.to}
          onClick={() => {
            setSubmitted(false);
            setBookingReference('');
            setSubmitError('');
            setFieldErrors({});
            setModalOpen(true);
          }}
        >
          Request to book
        </Button>
        <p className={styles.note}>No payment is taken at this stage.</p>
      </div>

      <Modal
        open={modalOpen}
        title={submitted ? 'Request received' : 'Send a booking request'}
        description={
          submitted
            ? 'Your request is safely recorded and the selected dates are temporarily held.'
            : 'Share a few details and we will confirm availability personally.'
        }
        onClose={() => setModalOpen(false)}
      >
        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successSeal}>
              <span><Icon name="check" size={26} strokeWidth={2} /></span>
            </div>
            <p className={styles.successKicker}>Thank you</p>
            <h3>Your Villa Floyd stay starts here</h3>
            <p>
              The selected dates are temporarily held while the owner reviews your request. You will receive a confirmation or update after review.
            </p>
            <div className={styles.successSummary}>
              <div>
                <span>Stay</span>
                <strong>
                  {dates.from && dates.to
                    ? `${format(dates.from, 'd MMM')} – ${format(dates.to, 'd MMM yyyy')}`
                    : 'Dates selected'}
                </strong>
              </div>
              <div><span>Guests</span><strong>{guests}</strong></div>
              <div><span>Estimate</span><strong>€{total}</strong></div>
            </div>
            {bookingReference ? <small className={styles.reference}>Reference · {bookingReference}</small> : null}
            <Button onClick={() => setModalOpen(false)}>Back to the villa</Button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.requestLayout}>
              <aside className={styles.requestAside}>
                <div className={styles.asideLead}>
                  <span className={styles.asideMark}><Icon name="info" size={17} /></span>
                  <div>
                    <span className={styles.asideEyebrow}>Direct & personal</span>
                    <h3>A private stay, arranged around you.</h3>
                    <p>
                      Your request goes directly to the villa. We review your dates and reply with a personal confirmation.
                    </p>
                  </div>
                </div>
                <div className={styles.promiseList}>
                  <span><Icon name="check" size={16} /> No payment now</span>
                  <span><Icon name="check" size={16} /> Personal confirmation</span>
                  <span><Icon name="check" size={16} /> Best direct rate</span>
                </div>
              </aside>

              <div className={styles.requestBody}>
                <div className={styles.tripSummary}>
                  <div>
                    <span>Stay</span>
                    <strong>{dates.from && dates.to ? `${format(dates.from, 'd MMM')} – ${format(dates.to, 'd MMM yyyy')}` : 'Dates not selected'}</strong>
                  </div>
                  <div><span>Guests</span><strong>{guests}</strong></div>
                  <div><span>Estimate</span><strong>€{total}</strong></div>
                </div>

                <div className={styles.formGrid}>
                  <Input label="Full name" name="name" autoComplete="name" required placeholder="Your name" error={fieldErrors.name} onChange={() => setFieldErrors((errors) => ({ ...errors, name: undefined }))} />
                  <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" error={fieldErrors.email} onChange={() => setFieldErrors((errors) => ({ ...errors, email: undefined }))} />
                  <Input label="Phone" name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
                  <Input label="Message" name="message" multiline placeholder="Tell us anything useful about your stay…" className={styles.full} />
                </div>

                {submitError ? <p className={styles.error}>{submitError}</p> : null}

                <Button className={styles.submitButton} fullWidth type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send request'}
                </Button>
                <p className={styles.formNote}>
                  <Icon name="sparkle" size={14} /> Your details are used only to answer this booking request.
                </p>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export default BookingPanel;
