import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import SearchAvailability from '../components/SearchAvailability';
import { getAllRooms, getAvailableRooms } from '../services/roomsService';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = useQuery();

  const initialFilters = {
    checkInDate: query.get('checkInDate') || '',
    checkOutDate: query.get('checkOutDate') || '',
    guests: Number(query.get('guests') || 1),
    roomType: query.get('roomType') || 'any',
  };

  const loadRooms = async (filters) => {
    try {
      setLoading(true);
      setError('');
      const data =
        filters?.checkInDate && filters?.checkOutDate
          ? await getAvailableRooms(filters)
          : await getAllRooms();
      setRooms(data);
    } catch (err) {
      setError('Unable to fetch rooms from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(initialFilters);
  }, []);

  return (
    <div className="bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-lg sm:px-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
              Find your stay
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Browse our curated selection of rooms and suites.
            </h1>
          </div>
          <SearchAvailability onSearch={loadRooms} />
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-sm font-medium text-red-500">{error}</p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              No rooms match your search criteria just yet. Try adjusting your filters.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomsPage;

