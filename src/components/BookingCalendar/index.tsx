import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { getAvailability } from '../../services/availability';
import type { AvailabilityBlock, DateRangeValue } from '../../types';
import Icon from '../../ui/Icon';
import { isBookedNight, isDisplayRangeDay, isStayAvailable } from './dateUtils';
import styles from './styles/index.module.scss';

interface BookingCalendarProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  refreshKey?: number;
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function BookingCalendar({ value, onChange, refreshKey = 0 }: BookingCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(value.from ?? new Date()));
  const [blocked, setBlocked] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = startOfDay(new Date());

  const months = useMemo(() => [visibleMonth, addMonths(visibleMonth, 1)], [visibleMonth]);

  const loadAvailability = async (force = false) => {
    setLoading(true);
    setError('');
    try {
      setBlocked(await getAvailability(force));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Live availability is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAvailability(refreshKey > 0);
  }, [refreshKey]);

  const selectDay = (day: Date) => {
    if (loading || error || isBefore(day, today)) return;

    const choosingCheckout = Boolean(value.from && !value.to && isBefore(value.from, day));
    const dayBooked = isBookedNight(day, blocked);

    if (choosingCheckout && value.from) {
      if (!isStayAvailable(value.from, day, blocked)) {
        onChange({ from: dayBooked ? value.from : day, to: null });
        return;
      }
      onChange({ from: value.from, to: day });
      return;
    }

    if (dayBooked) return;
    onChange({ from: day, to: null });
  };

  const canUseAsCheckout = (day: Date) => {
    if (!value.from || value.to || !isBefore(value.from, day)) return false;
    return isStayAvailable(value.from, day, blocked);
  };

  const renderMonth = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className={styles.month} key={month.toISOString()}>
        <h3>{format(month, 'MMMM yyyy')}</h3>
        <div className={styles.weekDays}>
          {weekDays.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        <div className={styles.days}>
          {days.map((day) => {
            const bookedNight = isBookedNight(day, blocked);
            const checkoutException = bookedNight && canUseAsCheckout(day);
            const disabled = loading || Boolean(error) || isBefore(day, today) || (bookedNight && !checkoutException);
            const outside = !isSameMonth(day, month);
            const isStart = value.from ? isSameDay(day, value.from) : false;
            const isEnd = value.to ? isSameDay(day, value.to) : false;
            const inRange = value.from && value.to ? isDisplayRangeDay(day, value.from, value.to) : false;

            return (
              <button
                type="button"
                key={day.toISOString()}
                className={`${styles.day} ${outside ? styles.outside : ''} ${
                  disabled ? styles.disabled : ''
                } ${bookedNight ? styles.booked : ''} ${checkoutException ? styles.checkout : ''} ${
                  inRange ? styles.inRange : ''
                } ${isStart ? styles.start : ''} ${isEnd ? styles.end : ''}`}
                disabled={disabled}
                onClick={() => selectDay(day)}
                aria-label={`${format(day, 'EEEE, d MMMM yyyy')}${bookedNight ? ', unavailable night' : ''}${
                  checkoutException ? ', available as check-out' : ''
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.calendar} aria-busy={loading}>
      <div className={styles.navigation}>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          aria-label="Previous month"
          disabled={loading || !isBefore(startOfMonth(today), visibleMonth)}
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <span>Select your dates</span>
        <button
          type="button"
          onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          aria-label="Next month"
          disabled={loading}
        >
          <Icon name="chevronRight" size={20} />
        </button>
      </div>

      {loading ? <div className={styles.status}>Checking live availability…</div> : null}
      {error ? (
        <div className={styles.errorState} role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadAvailability(true)}>Try again</button>
        </div>
      ) : null}

      {!error ? <div className={styles.months}>{months.map(renderMonth)}</div> : null}

      {!error ? (
        <div className={styles.legend}>
          <span><i className={styles.available} />Available</span>
          <span><i className={styles.unavailable} />Unavailable</span>
        </div>
      ) : null}
    </div>
  );
}

export default BookingCalendar;
