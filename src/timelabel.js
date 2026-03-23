import React, { useMemo, useState } from 'react';

const VALID_FORMATS = ['auto', 'absolute', 'full'];
const formater = Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  day: 'numeric',
});

export function TimeLabel({ date, format = 'auto' }) {
  const [displayFormat, setDisplayFormat] = useState(format);

  const displayDate = useMemo(() => {
    switch (displayFormat) {
      case 'auto':
        return formatTimeAgo(date);
      case 'absolute':
        return formater.format(date);
      default:
        return date.toLocaleString();
    }
  }, [date, displayFormat]);

  function changeFormat() {
    const currentIndex = VALID_FORMATS.indexOf(displayFormat);
    const nextIndex = (currentIndex + 1) % VALID_FORMATS.length;
    setDisplayFormat(VALID_FORMATS[nextIndex]);
  }

  return (
    <span onClick={changeFormat} title={date.toLocaleString()}>
      {displayDate}
    </span>
  );
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diff < 60) return rtf.format(-Math.floor(diff), 'second');

  const minutes = diff / 60;
  if (minutes < 60) return rtf.format(-Math.floor(minutes), 'minute');

  const hours = minutes / 60;
  if (hours < 24) return rtf.format(-Math.floor(hours), 'hour');

  const days = hours / 24;
  if (days < 7) return rtf.format(-Math.floor(days), 'day');

  // > 7 days → format date
  return formater.format(date);
}
