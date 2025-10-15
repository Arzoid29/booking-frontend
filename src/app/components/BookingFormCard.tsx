"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  onSubmit: (payload: { title: string; startAtISO: string; endAtISO: string }) => Promise<void> | void;
  loading?: boolean;
};

function pad(n: number) { return n.toString().padStart(2, "0"); }
function toLocalDateInputValue(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function toLocalTimeInputValue(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fromLocalInputsToDate(dateStr: string, timeStr: string) {
  const [y,m,day] = dateStr.split("-").map(Number);
  const [h,min]  = timeStr.split(":").map(Number);
  return new Date(y, (m-1), day, h, min, 0, 0);
}
function roundToNextQuarter(d = new Date(), step = 15) {
  const r = new Date(d);
  r.setSeconds(0,0);
  const mins = r.getMinutes();
  const remainder = mins % step;
  if (remainder !== 0) r.setMinutes(mins + (step - remainder));
  return r;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function BookingFormCard({ onSubmit, loading }: Props) {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState(toLocalDateInputValue(new Date()));
  const [startTime, setStart]   = useState(toLocalTimeInputValue(roundToNextQuarter()));
  const [duration, setDuration] = useState<number>(60);
  const [endTime, setEnd]       = useState<string>("");

  useEffect(() => {
    const start = fromLocalInputsToDate(date, startTime);
    const end   = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    setEnd(toLocalTimeInputValue(end));
  }, [date, startTime, duration]);

  const hasErrors = useMemo(() => {
    const start = fromLocalInputsToDate(date, startTime);
    const end   = fromLocalInputsToDate(date, endTime);
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
    const end   = fromLocalInputsToDate(date, endTime);
    await onSubmit({
      title: title.trim(),
      startAtISO: start.toISOString(),
      endAtISO: end.toISOString(),
    });
  };

  const setToday = () => setDate(toLocalDateInputValue(new Date()));
  const setTomorrow = () => {
    const d = new Date(); d.setDate(d.getDate()+1);
    setDate(toLocalDateInputValue(d));
  };

  return (
    <section className="card">
      <h2 className="heading mb-2">Nueva reserva</h2>
      <p className="subtle mb-4">Zona horaria detectada: <b className="text-zinc-800">{tz}</b></p>

      <div className="grid gap-3">
        <div>
          <label className="subtle mb-1 block">Título</label>
          <input
            className="input"
            placeholder="Ej. Reunión con cliente"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {hasErrors.title && <p className="mt-1 text-sm text-red-600">Ingresa un título.</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="subtle">Fecha</label>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={setToday}>Hoy</button>
              <button type="button" className="btn-ghost" onClick={setTomorrow}>Mañana</button>
            </div>
          </div>
          <input
            type="date"
            className="input"
            min={toLocalDateInputValue(new Date())}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="subtle mb-1 block">Hora de inicio</label>
          <input
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStart(e.target.value)}
            step={300} 
          />
        </div>

        <div>
          <label className="subtle mb-1 block">Duración</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={`rounded-xl border px-3 py-1 text-sm transition ${
                  duration === m
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-300 hover:bg-zinc-100"
                }`}
                aria-pressed={duration === m}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="subtle mb-1 block">Hora de fin</label>
          <input
            type="time"
            className="input"
            value={endTime}
            onChange={(e) => setEnd(e.target.value)}
            step={300}
          />
          {hasErrors.range && (
            <p className="mt-1 text-sm text-red-600">La hora de fin debe ser posterior al inicio.</p>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button className="btn" disabled={loading || anyError} onClick={submit}>
            {loading ? "Creando…" : "Crear reserva"}
          </button>
          <span className="subtle">
            {hasErrors.past ? "⚠ Inicio en el pasado" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
