import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  subscribeAllRooms,
  updateRoom,
} from '../services/roomsService';
import {
  getAllReservations,
  subscribeAllReservations,
  updateReservationStatus,
} from '../services/reservationsService';
import { getAllUsers, subscribeAllUsers, updateUserRole } from '../services/usersService';
import ReservationDetailsModal from '../components/ReservationDetailsModal';
import { ROOM_IMAGE_OPTIONS } from '../constants/roomImageOptions';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const tab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  }, [location.search]);

  const setTab = (nextTab) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', nextTab);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  useEffect(() => {
    const ready = { rooms: false, reservations: false, users: false };
    setLoading(true);

    const unsubs = [
      subscribeAllRooms((data) => {
        setRooms(data);
        ready.rooms = true;
        if (ready.rooms && ready.reservations && ready.users) setLoading(false);
      }),
      subscribeAllReservations((data) => {
        setReservations(data);
        ready.reservations = true;
        if (ready.rooms && ready.reservations && ready.users) setLoading(false);
      }),
      subscribeAllUsers((data) => {
        setUsers(data);
        ready.users = true;
        if (ready.rooms && ready.reservations && ready.users) setLoading(false);
      }),
    ];

    return () => unsubs.forEach((u) => u && u());
  }, []);

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const totalReservations = reservations.length;
    const activeReservations = reservations.filter((r) =>
      ['pending', 'confirmed', 'checked-in'].includes(r.status),
    ).length;
    const staffCount = users.filter((u) => u.role === 'staff').length;

    return { totalRooms, availableRooms, totalReservations, activeReservations, staffCount };
  }, [rooms, reservations, users]);

  const refreshAll = async () => {
    const [roomsData, reservationsData, usersData] = await Promise.all([
      getAllRooms(),
      getAllReservations(),
      getAllUsers(),
    ]);
    setRooms(roomsData);
    setReservations(reservationsData);
    setUsers(usersData);
  };

  const handleCreateRoom = async (form) => {
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
      setMessage('Room created successfully.');
      await refreshAll();
      setTab('rooms');
    } catch (e) {
      console.error('Failed to create room', e);
      setMessage(e?.message || 'Failed to create room. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateRoom = async (id, patch) => {
    setBusy(true);
    setMessage('');
    try {
      await updateRoom(id, patch);
      setMessage('Room updated.');
      await refreshAll();
    } catch (e) {
      setMessage('Failed to update room. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    setBusy(true);
    setMessage('');
    try {
      await deleteRoom(id);
      setMessage('Room deleted.');
      await refreshAll();
    } catch (e) {
      setMessage('Failed to delete room. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const handleChangeReservationStatus = async (id, status) => {
    setBusy(true);
    setMessage('');
    try {
      await updateReservationStatus(id, status);
      setMessage('Reservation updated.');
      await refreshAll();
    } catch (e) {
      setMessage('Failed to update reservation. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const handleChangeUserRole = async (userId, role) => {
    setBusy(true);
    setMessage('');
    try {
      await updateUserRole(userId, role);
      setMessage('User role updated.');
      await refreshAll();
    } catch (e) {
      setMessage('Failed to update role. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  const roomsById = useMemo(() => {
    const map = new Map();
    rooms.forEach((r) => map.set(r.id, r));
    return map;
  }, [rooms]);

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const selectedReservation = useMemo(
    () => reservations.find((r) => r.id === selectedReservationId) || null,
    [reservations, selectedReservationId],
  );
  const selectedGuest = selectedReservation ? usersById.get(selectedReservation.guestId) : null;
  const selectedRoom = selectedReservation ? roomsById.get(selectedReservation.roomId) : null;

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Admin Portal
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage rooms, staff access, reservations, and system overview.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'rooms', label: 'Manage Rooms' },
          { id: 'staff', label: 'Manage Staff' },
          { id: 'reservations', label: 'Manage Reservations' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 ${
              tab === t.id
                ? 'bg-orange-50 text-primary ring-orange-100'
                : 'bg-white text-slate-600 ring-slate-100 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
          {message}
        </div>
      ) : null}

      {tab === 'overview' ? (
        <div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                label: 'Total rooms',
                value: stats.totalRooms,
                description: 'Configured in the inventory',
              },
              {
                label: 'Available today',
                value: stats.availableRooms,
                description: 'Ready to be booked',
              },
              {
                label: 'Reservations',
                value: stats.totalReservations,
                description: 'Lifetime reservations in the system',
              },
              {
                label: 'Active stays',
                value: stats.activeReservations,
                description: 'Pending, confirmed, or checked-in',
              },
              {
                label: 'Staff members',
                value: stats.staffCount,
                description: 'Front desk staff & managers',
              },
              {
                label: 'Total users',
                value: users.length,
                description: 'Guests + staff + admins',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-100"
              >
                <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {loading ? '—' : card.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'rooms' ? (
        <AdminRooms
          rooms={rooms}
          busy={busy}
          onCreate={handleCreateRoom}
          onUpdate={handleUpdateRoom}
          onDelete={handleDeleteRoom}
        />
      ) : null}

      {tab === 'staff' ? (
        <AdminStaff users={users} busy={busy} onRoleChange={handleChangeUserRole} />
      ) : null}

      {tab === 'reservations' ? (
        <AdminReservations
          reservations={reservations}
          busy={busy}
          onStatusChange={handleChangeReservationStatus}
          onOpenDetails={(id) => setSelectedReservationId(id)}
          roomsById={roomsById}
          usersById={usersById}
        />
      ) : null}

      <ReservationDetailsModal
        open={Boolean(selectedReservationId)}
        onClose={() => setSelectedReservationId(null)}
        reservation={selectedReservation}
        guest={selectedGuest}
        room={selectedRoom}
      />
    </div>
  );
}

function AdminRooms({ rooms, busy, onCreate, onUpdate, onDelete }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="mt-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Create room</p>
          <p className="mt-1 text-xs text-slate-500">
            Adds a new document to the `rooms` collection.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreate(form);
            }}
            className="mt-4 space-y-3"
          >
            <Field label="Name">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
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
                  <option value="standard">standard</option>
                  <option value="suite">suite</option>
                  <option value="deluxe">deluxe</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Price / night">
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
              <Field label="Capacity">
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
              {busy ? 'Working...' : 'Create room'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Rooms</p>
            <p className="text-xs text-slate-500">{rooms.length} total</p>
          </div>

          <div className="mt-4 space-y-3">
            {rooms.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                busy={busy}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-500">No rooms yet. Create one on the left.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomRow({ room, busy, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: room.name || '',
    type: room.type || 'standard',
    price: room.price ?? 0,
    capacity: room.capacity ?? 1,
    status: room.status || 'available',
    image: room.image || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{room.name}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {room.type} · ${room.price}/night · cap {room.capacity} · {room.status}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-400">{room.id}</p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {editing ? 'Close' : 'Edit'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(room.id)}
            className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input
              name="name"
              value={draft.name}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Type">
            <select
              name="type"
              value={draft.type}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="standard">standard</option>
              <option value="suite">suite</option>
              <option value="deluxe">deluxe</option>
            </select>
          </Field>
          <Field label="Price">
            <input
              name="price"
              type="number"
              min={0}
              value={draft.price}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              min={1}
              value={draft.capacity}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              value={draft.status}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="available">available</option>
              <option value="occupied">occupied</option>
            </select>
          </Field>
          <Field label="Image URL">
            <input
              name="image"
              value={draft.image}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>

          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onUpdate(room.id, draft)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500 disabled:opacity-60"
            >
              Save changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminStaff({ users, busy, onRoleChange }) {
  const staffAndAdmins = users.filter((u) => ['staff', 'admin'].includes(u.role));
  const guests = users.filter((u) => !u.role || u.role === 'guest');

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Promote guest → staff</p>
        <p className="mt-1 text-xs text-slate-500">
          Select a guest and assign them `staff` so they can access the front desk portal.
        </p>

        <div className="mt-4 space-y-2">
          {guests.map((u) => (
            <UserRow key={u.id} user={u} busy={busy} onRoleChange={onRoleChange} />
          ))}
          {guests.length === 0 ? (
            <p className="text-xs text-slate-500">No guests found.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">Staff & admins</p>
        <p className="mt-1 text-xs text-slate-500">
          Demote staff back to guest if needed. (Keep at least one admin account.)
        </p>

        <div className="mt-4 space-y-2">
          {staffAndAdmins.map((u) => (
            <UserRow key={u.id} user={u} busy={busy} onRoleChange={onRoleChange} />
          ))}
          {staffAndAdmins.length === 0 ? (
            <p className="text-xs text-slate-500">No staff/admin users found.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, busy, onRoleChange }) {
  const nextRoles = ['guest', 'staff', 'admin'];

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-900">
          {user.name || '(no name)'}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{user.email}</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">{user.id}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold capitalize text-white">
          {user.role || 'guest'}
        </span>
        <select
          value={user.role || 'guest'}
          disabled={busy}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          {nextRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function AdminReservations({ reservations, busy, onStatusChange, onOpenDetails, roomsById, usersById }) {
  const statuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Reservations</p>
        <p className="text-xs text-slate-500">{reservations.length} total</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Update</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr
                key={r.id}
                className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                onClick={() => onOpenDetails?.(r.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onOpenDetails?.(r.id);
                }}
              >
                <td className="px-4 py-3 text-[11px] text-slate-600">
                  {usersById?.get(r.guestId)?.name || usersById?.get(r.guestId)?.email || r.guestId}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-600">
                  {roomsById?.get(r.roomId)?.name || r.roomId}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-600">
                  {r.checkInDate} → {r.checkOutDate}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-600">{r.guests}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold capitalize text-white">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={r.status}
                    disabled={busy}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onStatusChange(r.id, e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No reservations found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default AdminDashboard;

