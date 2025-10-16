"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/NavBar";
import BookingFormCard from "../components/BookingFormCard";
import ConfirmDialog from "@/components/ComfirmDialog";


type Booking = { id: string; title: string; startAt: string; endAt: string };

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get<Booking[]>("/bookings/me");
      setBookings(data);
    } catch {
      toast.error("Couldn't load your bookings. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBooking = async ({
    title,
    startAtISO,
    endAtISO,
  }: {
    title: string;
    startAtISO: string;
    endAtISO: string;
  }) => {
    setCreating(true);
    try {
      await api.post("/bookings", { title, startAt: startAtISO, endAt: endAtISO });
      await load();
      toast.success("Booking created.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        "We couldn't create your booking. Please check the time range.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setCreating(false);
    }
  };

  const askDelete = (b: Booking) => {
    setTarget(b);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    try {
      setDeleting(true);
      await api.delete(`/bookings/${target.id}`);
      setConfirmOpen(false);
      setTarget(null);
      await load();
      toast.success("Booking deleted.");
    } catch {
      toast.error("We couldn't delete that booking.");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BookingFormCard onSubmit={createBooking} loading={creating} />
          </div>

          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="heading">My bookings</h2>
              <button
                className="btn-ghost"
                onClick={load}
                disabled={refreshing || creating}
                aria-busy={refreshing}
                title="Refresh list"
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="card">
                <p className="subtle">
                  You don’t have any bookings yet. Create your first one on the left.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {bookings.map((b) => (
                  <li key={b.id} className="card">
                    <div className="mb-2 font-medium">{b.title}</div>
                    <div className="subtle space-y-1">
                      <div>Starts: {fmt(b.startAt)}</div>
                      <div>Ends: {fmt(b.endAt)}</div>
                    </div>
                    <button
                      className="btn mt-3 w-full"
                      onClick={() => askDelete(b)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete booking?"
        description={
          target
            ? `This will remove “${target.title}”.`
            : "This will remove the selected booking."
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (deleting) return;
          setConfirmOpen(false);
          setTarget(null);
        }}
      />
    </>
  );
}
