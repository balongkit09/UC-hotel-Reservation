import React, { useState } from 'react';

function SearchAvailability({ onSearch }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    checkInDate: today,
    checkOutDate: today,
    guests: 2,
    roomType: 'any',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl bg-white/95 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur sm:grid-cols-5"
    >
      <div className="flex flex-col">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Check in
        </label>
        <input
          type="date"
          name="checkInDate"
          value={form.checkInDate}
          min={today}
          onChange={handleChange}
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Check out
        </label>
        <input
          type="date"
          name="checkOutDate"
          value={form.checkOutDate}
          min={form.checkInDate}
          onChange={handleChange}
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Guests
        </label>
        <input
          type="number"
          name="guests"
          min={1}
          max={6}
          value={form.guests}
          onChange={handleChange}
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Room type
        </label>
        <select
          name="roomType"
          value={form.roomType}
          onChange={handleChange}
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="any">Any</option>
          <option value="standard">Standard</option>
          <option value="suite">Suite</option>
          <option value="deluxe">Deluxe</option>
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-md hover:bg-orange-500"
        >
          Search Availability
        </button>
      </div>
    </form>
  );
}

export default SearchAvailability;

