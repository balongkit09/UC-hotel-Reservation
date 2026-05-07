import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { subscribeAllReservations, updateReservationStatus } from '../services/reservationsService';
import { subscribeAllRooms } from '../services/roomsService';
import { subscribeAllUsers } from '../services/usersService';
import { confirmReservationPayment } from '../services/paymentsService';
import ReservationDetailsModal from '../components/ReservationDetailsModal';
import ReservationDashboardCharts from '../components/ReservationDashboardCharts';

function StaffDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('arrivals');
  const [selectedId, setSelectedId] = useState(null);
  const [paymentMethodById, setPaymentMethodById] = useState({});
  const [paymentBusyId, setPaymentBusyId] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const [scannerResult, setScannerResult] = useState('');
  const [scannerBusy, setScannerBusy] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [dataAccessError, setDataAccessError] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Real-time dashboard updates for rooms/reservations/users.
    const ready = { reservations: false, rooms: false, users: false };

    const unsubs = [
      subscribeAllReservations(
        (data) => {
          setReservations(data);
          ready.reservations = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
        (error) => {
          setDataAccessError(error?.message || 'Reservation data is blocked by Firestore rules.');
          ready.reservations = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
      ),
      subscribeAllRooms(
        (data) => {
          setRooms(data);
          ready.rooms = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
        (error) => {
          setDataAccessError(error?.message || 'Room data is blocked by Firestore rules.');
          ready.rooms = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
      ),
      subscribeAllUsers(
        (data) => {
          setUsers(data);
          ready.users = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
        (error) => {
          setDataAccessError(error?.message || 'User data is blocked by Firestore rules.');
          ready.users = true;
          if (ready.reservations && ready.rooms && ready.users) setLoading(false);
        },
      ),
    ];

    return () => unsubs.forEach((u) => u && u());
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (!tab || tab === 'arrivals') setActiveTab('arrivals');
    else if (tab === 'departures') setActiveTab('departures');
    else if (tab === 'payments') setActiveTab('payments');
    else if (tab === 'profile') setActiveTab('profile');
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'profile') setSelectedId(null);
  }, [activeTab]);

  const setTab = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const arrivalsToday = useMemo(() => {
    return reservations.filter(
      (r) => r.checkInDate === today && ['pending', 'confirmed'].includes(r.status),
    );
  }, [reservations, today]);

  const departuresToday = useMemo(() => {
    return reservations.filter(
      (r) => r.checkOutDate === today && ['checked-in', 'confirmed'].includes(r.status),
    );
  }, [reservations, today]);

  const pendingPayments = useMemo(() => {
    return reservations.filter((r) => {
      const paymentStatus = r.paymentStatus || 'unpaid';
      return paymentStatus !== 'paid' && !['cancelled', 'checked-out'].includes(r.status || '');
    });
  }, [reservations]);

  const occupancyRate = useMemo(() => {
    const active = reservations.filter((r) => ['confirmed', 'checked-in'].includes(r.status)).length;
    const total = Math.max(reservations.length, 1);
    return Math.round((active / total) * 100);
  }, [reservations]);

  const list =
    activeTab === 'arrivals'
      ? arrivalsToday
      : activeTab === 'departures'
        ? departuresToday
        : activeTab === 'payments'
          ? pendingPayments
          : [];

  const mark = async (id, status) => {
    try {
      setActionError('');
      await updateReservationStatus(id, status);
    } catch (error) {
      setActionError(error?.message || 'Action failed due to Firestore permissions.');
    }
  };

  const markPaid = async (reservation) => {
    const room = roomsById.get(reservation.roomId);
    const amount = Number(room?.price || 0);
    if (!amount) return;
    const method = paymentMethodById[reservation.id] || 'cash';
    setPaymentBusyId(reservation.id);
    try {
      setActionError('');
      await confirmReservationPayment({
        reservationId: reservation.id,
        guestId: reservation.guestId,
        amount,
        method,
        reference: '',
        notes: `Payment confirmed by staff (${method}).`,
      });
    } catch (error) {
      setActionError(error?.message || 'Unable to mark payment as paid. Check Firestore rules.');
    } finally {
      setPaymentBusyId('');
    }
  };

  const processScannedPayload = async (rawValue) => {
    if (!rawValue) {
      setScannerResult('No QR payload found.');
      return;
    }
    setScannerBusy(true);
    try {
      let reservationId = rawValue;
      try {
        const parsed = JSON.parse(rawValue);
        reservationId = parsed?.reservationId || rawValue;
      } catch {
        reservationId = rawValue;
      }
      const matched = reservations.find((r) => r.id === reservationId);
      if (!matched) {
        setScannerResult('Reservation not found from scanned QR.');
        return;
      }
      setSelectedId(matched.id);
      setCameraEnabled(false);
      if (matched.status !== 'checked-in') {
        await updateReservationStatus(matched.id, 'checked-in');
      }
      setScannerResult(`Checked in reservation #${matched.id.slice(0, 8).toUpperCase()}.`);
    } catch (error) {
      setScannerResult(error?.message || 'Failed to process QR scan.');
    } finally {
      setScannerBusy(false);
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
    () => (activeTab === 'profile' ? null : list.find((r) => r.id === selectedId)),
    [list, selectedId, activeTab],
  );
  const selectedGuest = selectedReservation ? usersById.get(selectedReservation.guestId) : null;
  const selectedRoom = selectedReservation ? roomsById.get(selectedReservation.roomId) : null;
  const scannerMatches = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return [];
    return reservations
      .filter((r) => !['cancelled', 'checked-out'].includes(r.status || ''))
      .map((r) => {
        const guest = usersById.get(r.guestId);
        const room = roomsById.get(r.roomId);
        return {
          reservation: r,
          guestLabel: guest?.name || guest?.email || r.guestId || '',
          roomLabel: room?.name || r.roomId || '',
        };
      })
      .filter(({ reservation, guestLabel, roomLabel }) => {
        return (
          reservation.id.toLowerCase().includes(needle) ||
          guestLabel.toLowerCase().includes(needle) ||
          roomLabel.toLowerCase().includes(needle)
        );
      })
      .slice(0, 8);
  }, [reservations, usersById, roomsById, searchTerm]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage today&apos;s guest flow and operational tasks.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard title="Arrivals Today" value={`${arrivalsToday.length} Guests`} badge="+12%" />
        <StatCard title="Departures Today" value={`${departuresToday.length} Guests`} badge="Normal" />
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} badge="High" />
      </div>
      {activeTab !== 'profile' ? (
        <ReservationDashboardCharts
          reservations={reservations}
          loading={loading}
          trendDirection="future"
          titleTrend="Upcoming check-ins (next 14 days)"
          titleStatus="Reservation status mix"
        />
      ) : null}
      {dataAccessError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Firestore access error: {dataAccessError}. Check your Firestore rules for staff read/write permissions.
        </div>
      ) : null}
      {actionError ? (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Action blocked: {actionError}
        </div>
      ) : null}

      {activeTab === 'profile' ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Signed in as front desk</p>
          <p className="mt-1 text-xs text-slate-500">
            This account is used for check-ins, payments, and room inventory. Contact an administrator to change
            roles or permissions.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{user?.displayName || '—'}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 break-all text-sm font-semibold text-slate-900">{user?.email || '—'}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">User ID</dt>
              <dd className="mt-1 font-mono text-xs text-slate-600">{user?.uid || '—'}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <TabButton active={activeTab === 'arrivals'} onClick={() => setTab('arrivals')}>
              Arrivals Today
            </TabButton>
            <TabButton active={activeTab === 'departures'} onClick={() => setTab('departures')}>
              Departures Today
            </TabButton>
            <TabButton active={activeTab === 'payments'} onClick={() => setTab('payments')}>
              Pending Payments
            </TabButton>
            <div className="ml-auto text-[11px] text-slate-400">
              Showing {Math.min(list.length, 42)} of {list.length} records
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Room No.</th>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="inline-block h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No records for this tab.
                    </td>
                  </tr>
                ) : (
                  list.slice(0, 42).map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedId(r.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedId(r.id);
                      }}
                    >
                      <td className="px-4 py-3 text-[11px] text-slate-700">
                        {usersById.get(r.guestId)?.name || usersById.get(r.guestId)?.email || shortId(r.guestId)}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-700">
                        {roomsById.get(r.roomId)?.name || shortId(r.roomId)}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-semibold text-slate-700">
                        #{r.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {activeTab === 'arrivals'
                          ? r.arrivalTime || '—'
                          : activeTab === 'departures'
                            ? '11:00'
                            : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusPill(r.status)}`}>
                          {humanStatus(r.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            (r.paymentStatus || 'unpaid') === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                          }`}
                        >
                          {r.paymentStatus || 'unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {activeTab === 'arrivals' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              mark(r.id, 'checked-in');
                            }}
                            className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-500"
                          >
                            Check-in
                          </button>
                        ) : activeTab === 'departures' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              mark(r.id, 'checked-out');
                            }}
                            className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-500"
                          >
                            Check-out
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={paymentMethodById[r.id] || 'cash'}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setPaymentMethodById((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                            >
                              <option value="cash">Cash</option>
                              <option value="bank">Bank Payment</option>
                            </select>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                mark(r.id, 'confirmed');
                              }}
                              className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={paymentBusyId === r.id || (r.paymentStatus || 'unpaid') === 'paid'}
                              onClick={(e) => {
                                e.stopPropagation();
                                markPaid(r);
                              }}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {paymentBusyId === r.id
                                ? 'Saving...'
                                : (r.paymentStatus || 'unpaid') === 'paid'
                                  ? 'Paid'
                                  : 'Mark Paid'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">QR Scanner (Check-in)</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Scan the guest QR and the reservation will be validated and checked in.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCameraEnabled((prev) => !prev);
                  setCameraError('');
                }}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
              >
                {cameraEnabled ? 'Stop Camera' : 'Start Camera'}
              </button>
              <button
                type="button"
                disabled={scannerBusy}
                onClick={() => processScannedPayload(scannerInput)}
                className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
              >
                {scannerBusy ? 'Processing...' : 'Validate Input QR'}
              </button>
            </div>
            <input
              type="text"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              placeholder='Paste QR payload or reservation id (e.g. {"reservationId":"abc123"})'
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reservation ID, guest name/email, or room name"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchTerm.trim() ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white">
                {scannerMatches.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] text-slate-500">No matching reservation found.</p>
                ) : (
                  scannerMatches.map(({ reservation, guestLabel, roomLabel }) => (
                    <div
                      key={reservation.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800">
                          #{reservation.id.slice(0, 8).toUpperCase()} - {guestLabel}
                        </p>
                        <p className="text-[11px] text-slate-500">{roomLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => processScannedPayload(reservation.id)}
                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:bg-orange-500"
                      >
                        Check-in
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : null}
            <QrCameraScanner
              enabled={cameraEnabled}
              onDetected={processScannedPayload}
              onError={setCameraError}
            />
            {cameraError ? <p className="mt-2 text-[11px] text-red-600">{cameraError}</p> : null}
            {scannerResult ? <p className="mt-2 text-[11px] text-slate-700">{scannerResult}</p> : null}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Internal Briefing</p>
          <div className="mt-3 space-y-3">
            <BriefingCard
              title="Elevator Maintenance"
              text="Elevator B will be out of service from 2:00 PM to 4:00 PM for routine checks."
            />
            <BriefingCard
              title="VIP Arrival: Room 501"
              text="Guest requires early check-in and complimentary breakfast vouchers."
            />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Upcoming Shifts</p>
          <div className="mt-3 space-y-3">
            <ShiftRow name="David Chen" time="Next: 3:00 PM - 11:00 PM" tag="Concierge" />
            <ShiftRow name="Emma Wilson" time="Next: 11:00 PM - 7:00 AM" tag="Night Audit" />
          </div>
        </div>
      </div>

      <ReservationDetailsModal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        reservation={selectedReservation}
        guest={selectedGuest}
        room={selectedRoom}
      />
    </div>
  );
}

function QrCameraScanner({ enabled, onDetected, onError }) {
  const [videoEl, setVideoEl] = useState(null);

  useEffect(() => {
    if (!enabled || !videoEl) return undefined;
    let stream;
    let timer;
    let cancelled = false;

    const start = async () => {
      if (!('BarcodeDetector' in window)) {
        onError?.('Camera QR scanning is not supported in this browser. Use input field instead.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        videoEl.srcObject = stream;
        await videoEl.play();
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        timer = setInterval(async () => {
          if (cancelled || videoEl.readyState < 2) return;
          try {
            const results = await detector.detect(videoEl);
            if (results?.length) {
              const value = results[0]?.rawValue;
              if (value) {
                onDetected?.(value);
              }
            }
          } catch {
            // keep scanner loop running
          }
        }, 900);
      } catch {
        onError?.('Unable to access camera. Allow permission and try again.');
      }
    };

    start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [enabled, videoEl, onDetected, onError]);

  if (!enabled) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black">
      <video
        ref={setVideoEl}
        muted
        playsInline
        className="h-48 w-full object-cover"
      />
    </div>
  );
}

function StatCard({ title, value, badge }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-100">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
        active ? 'bg-orange-50 text-primary ring-1 ring-orange-100' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function BriefingCard({ title, text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-[11px] text-slate-500">{text}</p>
    </div>
  );
}

function ShiftRow({ name, time, tag }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-900">{name}</p>
        <p className="truncate text-[11px] text-slate-500">{time}</p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
        {tag}
      </span>
    </div>
  );
}

function humanStatus(status) {
  if (!status) return '—';
  return String(status).replace('-', ' ');
}

function statusPill(status) {
  if (status === 'pending') return 'bg-orange-50 text-primary ring-1 ring-orange-100';
  if (status === 'confirmed') return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  if (status === 'checked-in') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (status === 'checked-out') return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  if (status === 'cancelled') return 'bg-red-50 text-red-600 ring-1 ring-red-100';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function shortId(id) {
  if (!id) return '—';
  return id.length > 8 ? id.slice(0, 8) : id;
}

export default StaffDashboard;

