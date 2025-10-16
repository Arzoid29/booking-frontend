"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  onSubmit: (payload: {
    title: string;
    startAtISO: string;
    endAtISO: string;
  }) => Promise<void> | void;
  loading?: boolean;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toLocalDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toLocalTimeInputValue(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInputsToDate(dateStr: string, timeStr: string) {
  const [y, m, day] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, day, h, min, 0, 0);
}
function roundToNextQuarter(d = new Date(), step = 15) {
  const r = new Date(d);
  r.setSeconds(0, 0);
  const mins = r.getMinutes();
  const remainder = mins % step;
  if (remainder !== 0) r.setMinutes(mins + (step - remainder));
  return r;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function BookingFormCard({ onSubmit, loading }: Props) {
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toLocalDateInputValue(new Date()));
  const [startTime, setStart] = useState(
    toLocalTimeInputValue(roundToNextQuarter())
  );
  const [duration, setDuration] = useState<number>(60);
  const [endTime, setEnd] = useState<string>("");

  useEffect(() => {
    const start = fromLocalInputsToDate(date, startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    setEnd(toLocalTimeInputValue(end));
  }, [date, startTime, duration]);

  const hasErrors = useMemo(() => {
    const start = fromLocalInputsToDate(date, startTime);
    const end = fromLocalInputsToDate(date, endTime);
    return {
      title: title.trim().length === 0,
      range: !(end > start),
      past: start < new Date(),
    };
  }, [title, date, startTime, endTime]);

  const anyError = hasErrors.title || hasErrors.range;

  const submit = async () => {
    if (anyError) return;
    const start = fromLocalInputsToDate(date, startTime);
    const end = fromLocalInputsToDate(date, endTime);
    await onSubmit({
      title: title.trim(),
      startAtISO: start.toISOString(),
      endAtISO: end.toISOString(),
    });
  };

  const setToday = () => setDate(toLocalDateInputValue(new Date()));
  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(toLocalDateInputValue(d));
  };

  const submitHint = hasErrors.title
    ? "Please enter a title."
    : hasErrors.range
    ? "End time must be after start."
    : undefined;

  return (
    <section className="card">
      <h2 className="heading mb-2">New booking</h2>
      <p className="subtle mb-4">
        Detected time zone:{" "}
        <b className="text-zinc-800 dark:text-zinc-100">{tz}</b>
      </p>

      <div className="grid gap-3">
        <div>
          <label className="subtle mb-1 block" htmlFor="bk-title">
            Title
          </label>
          <input
            id="bk-title"
            className="input"
            placeholder="e.g., Client meeting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={hasErrors.title}
            aria-describedby={hasErrors.title ? "bk-title-err" : undefined}
          />
          {hasErrors.title && (
            <p id="bk-title-err" className="mt-1 text-sm text-red-600">
              Please enter a title.
            </p>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="subtle" htmlFor="bk-date">
              Date
            </label>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={setToday}>
                Today
              </button>
              <button type="button" className="btn-ghost" onClick={setTomorrow}>
                Tomorrow
              </button>
            </div>
          </div>
          <input
            id="bk-date"
            type="date"
            className="input"
            min={toLocalDateInputValue(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="subtle mb-1 block" htmlFor="bk-start">
            Start time
          </label>
          <input
            id="bk-start"
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStart(e.target.value)}
            step={300}
          />
        </div>

        <div>
          <label className="subtle mb-1 block">Duration</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={`rounded-xl border px-3 py-1 text-sm transition ${
                  duration === m
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800/60"
                }`}
                aria-pressed={duration === m}
                aria-label={`${m} minutes`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="subtle mb-1 block" htmlFor="bk-end">
            End time
          </label>
          <input
            id="bk-end"
            type="time"
            className="input"
            value={endTime}
            onChange={(e) => setEnd(e.target.value)}
            step={300}
            aria-invalid={hasErrors.range}
            aria-describedby={hasErrors.range ? "bk-range-err" : undefined}
          />
          {hasErrors.range && (
            <p id="bk-range-err" className="mt-1 text-sm text-red-600">
              End time must be after start.
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            className="btn"
            disabled={loading || anyError}
            onClick={submit}
            aria-busy={loading}
            title={submitHint}
          >
            {loading ? "Creating…" : "Create booking"}
          </button>
          <span className="subtle" role="status" aria-live="polite">
            {hasErrors.past ? "⚠ Start time is in the past" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
