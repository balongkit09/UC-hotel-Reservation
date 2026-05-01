import React from 'react';

function AppModal({ open, title, message, onClose, actions }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />

      <div className="relative mx-auto mt-24 w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          {actions || (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppModal;
