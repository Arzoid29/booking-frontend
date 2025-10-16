"use client";

import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/NavBar";

export default function CalendarPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const pollAbort = useRef(false);

  const getStatus = async () => {
    try {
      setChecking(true);
      const { data } = await api.get<{ connected: boolean }>(
        "/calendar/status"
      );
      setConnected(data.connected);
      return data.connected;
    } catch {
      toast.error("Couldn't check Calendar status. Please try again.");
      return false;
    } finally {
      setChecking(false);
    }
  };

  const pollStatus = async (opts?: {
    attempts?: number;
    intervalMs?: number;
  }) => {
    const attempts = opts?.attempts ?? 6;
    const interval = opts?.intervalMs ?? 1500;
    for (let i = 0; i < attempts; i++) {
      if (pollAbort.current) return false;
      const ok = await getStatus();
      if (ok) return true;
      const waitMs = i >= 3 ? interval + i * 250 : interval;
      await new Promise((r) => setTimeout(r, waitMs));
    }
    return false;
  };

  useEffect(() => {
    getStatus();
    return () => {
      pollAbort.current = true;
    };
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      const { data } = await api.get<{ url: string }>("/calendar/connect");
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast(
        "Authorize in the new tab, then we'll check your status automatically."
      );
      const ok = await pollStatus({ attempts: 7, intervalMs: 1500 });

      if (ok) {
        toast.success("Your Google Calendar is connected. You're all set!");
      } else {
        toast(
          "Still waiting on authorization—click “Refresh status” if you already accepted."
        );
      }
    } catch {
      toast.error("We couldn’t start the Calendar connection.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await api.post("/calendar/disconnect");
      setConnected(false);
      toast.success("Calendar disconnected.");
    } catch {
      toast.error("We couldn’t disconnect your Calendar.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="heading">Google Calendar</h1>
            <button
              className="btn-ghost text-sm"
              onClick={getStatus}
              disabled={checking || connecting}
              aria-busy={checking}
              aria-label="Refresh connection status"
              title="Refresh connection status"
            >
              {checking ? "Checking…" : "Refresh status"}
            </button>
          </div>

          {connected === null ? (
            <p className="subtle">Loading status…</p>
          ) : connected ? (
            <div className="space-y-3">
              <p className="subtle">
                ✅ <b>Connected.</b> We’ll check your Google Calendar for
                conflicts whenever you create a booking.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="btn" onClick={connect} disabled={connecting}>
                  {connecting
                    ? "Re-authorizing…"
                    : "Re-authorize / Switch account"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={disconnect}
                  disabled={connecting || checking}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="subtle">
                Connect your Google Calendar (read-only) so we can prevent
                bookings that overlap your events.
              </p>
              <button className="btn" onClick={connect} disabled={connecting}>
                {connecting ? "Opening Google…" : "Connect my Google Calendar"}
              </button>
              <p className="subtle">
                Already authorized in the other tab?{" "}
                <button
                  className="btn-ghost"
                  onClick={getStatus}
                  disabled={checking || connecting}
                >
                  Refresh status
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
