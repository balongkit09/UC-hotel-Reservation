import React, { useEffect, useMemo, useState } from 'react';
import { createRoom, subscribeAllRooms, updateRoom } from '../services/roomsService';
import { ROOM_IMAGE_OPTIONS } from '../constants/roomImageOptions';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function StaffRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '',
    type: 'standard',
    price: 120,
    capacity: 2,
    amenities: 'Free WiFi, No Smoking',
    image:
      ROOM_IMAGE_OPTIONS[0],
    status: 'available',
  });

  useEffect(() => {
    const unsub = subscribeAllRooms((data) => {
      setRooms(data);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await createRoom({
        ...form,
        amenities: form.amenities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setMessage('Room added to inventory.');
      setForm((p) => ({
        ...p,
        name: '',
        price: 120,
        capacity: 2,
        amenities: 'Free WiFi, No Smoking',
        image: ROOM_IMAGE_OPTIONS[0],
        status: 'available',
      }));
    } catch (err) {
      console.error(err);
      setMessage(err?.message || 'Could not create room. Check your connection and Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusQuick = async (id, status) => {
    setBusy(true);
    setMessage('');
    try {
      await updateRoom(id, { status });
      setMessage('Room status updated.');
    } catch (err) {
      setMessage('Could not update room status.');
    } finally {
      setBusy(false);
    }
  };

  const filteredRooms = useMemo(() => {
    if (filter === 'available') return rooms.filter((r) => r.status === 'available');
    if (filter === 'occupied') return rooms.filter((r) => r.status === 'occupied');
    return rooms;
  }, [rooms, filter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Room inventory</h1>
      <p className="mt-1 text-sm text-slate-500">
        View rooms configured by administration and add new available rooms when needed.
      </p>

      {message ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
          {message}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All (${rooms.length})` },
          { id: 'available', label: `Available (${rooms.filter((r) => r.status === 'available').length})` },
          { id: 'occupied', label: `Occupied (${rooms.filter((r) => r.status === 'occupied').length})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 ${
              filter === f.id
                ? 'bg-orange-50 text-primary ring-orange-100'
                : 'bg-white text-slate-600 ring-slate-100 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,1.35fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Create available room</p>
          <p className="mt-1 text-xs text-slate-500">
            New entries appear in the same list guests and admins use for booking.
          </p>

          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <Field label="Room name / number">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Deluxe 301"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Type">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="standard">Standard</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Price / night ($)">
                <input
                  name="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
              <Field label="Capacity (guests)">
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
            </div>

            <Field label="Amenities (comma separated)">
              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </Field>

            <Field label="Image URL">
              <div className="space-y-2">
                <select
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ROOM_IMAGE_OPTIONS.map((url, index) => (
                    <option key={url} value={url}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Create room'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">All inventory</p>
            {loading ? (
              <span className="text-xs text-slate-400">Loading…</span>
            ) : (
              <p className="text-xs text-slate-500">{filteredRooms.length} shown</p>
            )}
          </div>

          <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <p className="text-xs text-slate-500">No rooms in this filter yet.</p>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{room.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {room.type} · ${room.price}/night · up to {room.capacity} guests
                      </p>
                      <p className="mt-1 truncate font-mono text-[10px] text-slate-400">{room.id}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
                        room.status === 'available'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                          : 'bg-amber-50 text-amber-800 ring-amber-100'
                      }`}
                    >
                      {room.status || '—'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.status !== 'available' ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleStatusQuick(room.id, 'available')}
                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
                      >
                        Mark available
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleStatusQuick(room.id, 'occupied')}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Mark occupied
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffRoomsPage;
