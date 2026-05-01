import React from 'react';
import { Link } from 'react-router-dom';

function RoomCard({ room }) {
  const {
    id,
    name,
    type,
    price,
    capacity,
    amenities,
    image,
    rating = 4.5,
  } = room;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-800 shadow-sm">
          {type}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
          ★ {rating}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Up to {capacity} guests · Free WiFi · No smoking
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">From</p>
            <p className="text-lg font-semibold text-primary">
              ${price}
              <span className="text-xs font-normal text-slate-500"> / night</span>
            </p>
          </div>
        </div>

        {amenities?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {a}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <Link
            to={`/rooms/${id}`}
            className="text-xs font-semibold text-slate-700 hover:text-primary"
          >
            View details
          </Link>
          <Link
            to={`/booking/${id}`}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-500"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;

