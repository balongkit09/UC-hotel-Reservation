import React, { useState } from 'react';

function BookingForm({ room, onSubmit, initialDates }) {
  const [form, setForm] = useState({
    checkInDate: initialDates?.checkInDate || '',
    checkOutDate: initialDates?.checkOutDate || '',
    guests: initialDates?.guests || 1,
    arrivalTime: initialDates?.arrivalTime || '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600">Check-in date</label>
          <input
            type="date"
            name="checkInDate"
            value={form.checkInDate}
            onChange={handleChange}
            required
            className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-600">Check-out date</label>
          <input
            type="date"
            name="checkOutDate"
            value={form.checkOutDate}
            onChange={handleChange}
            required
            className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Guests</label>
        <input
          type="number"
          name="guests"
          min={1}
          max={room?.capacity || 6}
          value={form.guests}
          onChange={handleChange}
          required
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Estimated arrival time (optional)</label>
        <input
          type="time"
          name="arrivalTime"
          value={form.arrivalTime}
          onChange={handleChange}
          className="mt-1 h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-slate-600">Special requests (optional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
      >
        Confirm Reservation
      </button>
    </form>
  );
}

export default BookingForm;

