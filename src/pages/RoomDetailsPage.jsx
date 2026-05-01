import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRoomById } from '../services/roomsService';

function RoomDetailsPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getRoomById(roomId);
      setRoom(data);
      setLoading(false);
    };
    load();
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">Room not found.</p>
        <Link
          to="/rooms"
          className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white"
        >
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.3fr,1fr]">
          <div className="overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
            <img
              src={room.image}
              alt={room.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {room.type} Room
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              {room.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              A refined space thoughtfully appointed for comfort and style, ideal for both business
              and leisure stays.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <p className="font-semibold text-slate-900">Capacity</p>
                <p className="mt-1 text-slate-600">Up to {room.capacity} guests</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <p className="font-semibold text-slate-900">Status</p>
                <p className="mt-1 capitalize text-slate-600">{room.status}</p>
              </div>
            </div>

            {room.amenities?.length ? (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700">Amenities</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">From</p>
                <p className="text-2xl font-semibold text-primary">
                  ${room.price}
                  <span className="text-xs font-normal text-slate-500"> / night</span>
                </p>
              </div>
              <Link
                to={`/booking/${room.id}`}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
              >
                Book this room
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailsPage;

