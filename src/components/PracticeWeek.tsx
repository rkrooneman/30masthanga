/**
 * PracticeWeek — the calm "last 7 days" row on Home.
 *
 * NOT a streak counter: seven quiet day-markers, today rightmost, each a small
 * PetalMark that is an empty outline when no practice was recorded that day and a
 * filled sage bloom when one was. A weekday letter sits beneath each. Today is
 * subtly highlighted (a faint ring behind its petal + a full-strength label)
 * even when empty, so there's a gentle "you are here" without any pressure. The
 * row is ALWAYS shown — with zero history it's simply seven empty petals.
 *
 * It reads the practice log ONCE at mount via getLastNDays(7) and does not
 * subscribe to changes: history only changes DURING a practice, after which the
 * user returns to Home (remounting it), so a live subscription would be needless
 * complexity. Accessibility: the row is a list; each day cell carries an
 * aria-label like "Monday 3 March: practiced" / "…: no practice", with today
 * noted, so the petals' meaning is available to screen readers.
 */

import { getLastNDays, weekdayLetter } from '../lib/practiceLog';
import PetalMark from './PetalMark';

/** Full weekday names, Sunday-first to match Date.getDay() (0..6). */
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Full month names, Jan-first to match Date.getMonth() (0..11). */
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Build the accessible label for a day cell, e.g.
 * "Monday 3 March: practiced" / "Wednesday 5 March, today: no practice".
 */
function dayLabel(date: Date, practiced: boolean, isToday: boolean): string {
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const month = MONTH_NAMES[date.getMonth()];
  const when = `${weekday} ${date.getDate()} ${month}${isToday ? ', today' : ''}`;
  return `${when}: ${practiced ? 'practiced' : 'no practice'}`;
}

function PracticeWeek() {
  // Read the log once at mount (getLastNDays reads the practiced set internally).
  const days = getLastNDays(7);

  return (
    <ul className="practice-week" aria-label="Your last 7 days of practice">
      {days.map((day) => (
        <li
          key={day.key}
          className={
            'practice-week__day' +
            (day.isToday ? ' practice-week__day--today' : '')
          }
          aria-label={dayLabel(day.date, day.practiced, day.isToday)}
        >
          <PetalMark filled={day.practiced} className="practice-week__petal" />
          <span className="practice-week__label" aria-hidden="true">
            {weekdayLetter(day.date)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default PracticeWeek;
