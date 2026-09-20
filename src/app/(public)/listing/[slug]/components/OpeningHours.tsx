'use client';
import { useEffect, useState } from 'react'
import { DAY_LABEL, DAYS_OF_WEEK, formatTime24to12, OpeningHoursRow } from '@/lib/public-listing';

const findDay = (hours: OpeningHoursRow[] | null, day: string) =>
  hours?.find((row) => row.day?.toUpperCase() === day) ?? null;

type Props = {
  openingHours: OpeningHoursRow[] | null
}
const OpeningHours = ({ openingHours }: Props) => {
  const [today, setToday] = useState<string | null>(null);
  const formatDayCell = (row: OpeningHoursRow | null) => {
    if (!row || row.isClosed) return "Closed";
    if (!row.openTime && !row.closeTime) return "—";
    return `${formatTime24to12(row.openTime)} – ${formatTime24to12(row.closeTime)}`;
  };

  useEffect(() => {
    const day = DAYS_OF_WEEK.at(
      new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
    );
    setToday(day ?? null);
  }, []);

  return (
    <div className="mt-4 flex flex-col gap-3">
      {DAYS_OF_WEEK.map((day) => {
        const row = findDay(openingHours, day);
        const label = DAY_LABEL[day] ?? day;
        const isToday = today === day;
        return (
          <div key={day} className="flex justify-between gap-3 text-xs">
            <span
              className={
                isToday ? "font-bold text-[#31594c]" : "text-[#758b82]"
              }
            >
              {label}
            </span>
            <span className="text-right text-[#58776a]">
              {openingHours ? formatDayCell(row) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  )
}

export default OpeningHours