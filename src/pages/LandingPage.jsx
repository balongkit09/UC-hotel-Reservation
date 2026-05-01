import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchAvailability from '../components/SearchAvailability';
import RoomCard from '../components/RoomCard';
import homeImage from '../img/Homepage.png';
import aboutImage from '../img/about.png';
import standardImage from '../img/standard.png';
import suiteImage from '../img/suite.png';
import deluxeImage from '../img/Deluxe.png';

const showcaseRooms = [
  {
    id: 'standard-room',
    name: 'Standard Room',
    type: 'Standard',
    price: 120,
    capacity: 2,
    amenities: ['Free WiFi', 'No Smoking', 'Smart TV', 'Breakfast'],
    image: standardImage,
  },
  {
    id: 'suite-room',
    name: 'Suite Room',
    type: 'Suite',
    price: 220,
    capacity: 3,
    amenities: ['City View', 'Living Area', 'Free WiFi', 'Mini Bar'],
    image: suiteImage,
  },
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    type: 'Deluxe',
    price: 320,
    capacity: 4,
    amenities: ['Ocean View', 'Balcony', 'Free WiFi', 'Premium Bedding'],
    image: deluxeImage,
  },
];

function LandingPage() {
  const navigate = useNavigate();

  const handleSearch = (filters) => {
    const params = new URLSearchParams(filters);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src={homeImage}
            alt="UC Hotel lobby"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
              Experience Luxury Like Never Before
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Discover world-class hospitality in the heart of paradise.
            </h1>
            <p className="mt-4 text-sm text-slate-200 sm:text-base">
              UC Hotel blends timeless elegance with modern comforts. Effortlessly browse rooms,
              view details, and secure your perfect stay online.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                24/7 concierge
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                Prime city location
              </span>
            </div>
          </div>

          <div className="lg:w-[28rem]">
            <SearchAvailability onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Our Service */}
      <section id="about" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Excellence
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Our Service
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">
              Experience the perfect blend of luxury, comfort, and personalized service with every
              stay.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: '24/7 Concierge',
                description: 'Dedicated concierge ready to assist with every request, any time.',
              },
              {
                title: 'Prime Location',
                description: 'Nestled in the heart of the city, moments from iconic views.',
              },
              {
                title: 'Premium Amenities',
                description: 'World-class spa, infinity pool, fine dining, and more.',
              },
              {
                title: 'Safe & Secure',
                description: 'Advanced security and contactless experiences for peace of mind.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-slate-50 p-5 text-left shadow-sm ring-1 ring-slate-100"
              >
                <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Our Rooms
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Luxury Accommodations
              </h2>
              <p className="mt-3 max-w-xl text-sm text-slate-500">
                Choose from our curated selection of rooms and suites, each designed for indulgent
                comfort and unforgettable stays.
              </p>
            </div>
            <Link
              to="/rooms"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              View all rooms
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {showcaseRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 shadow-xl ring-1 ring-slate-100 lg:w-1/2">
            <img
              src={aboutImage}
              alt="Front desk staff assisting guests"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Why choose us
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Unmatched Excellence
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              The UC Hotel Reservation System is designed to make every step of your journey
              effortless—from discovering the perfect room, to confirming your reservation, to
              checking in. Guests can explore room details, manage bookings, and receive real-time
              updates, while our staff and administrators keep operations running flawlessly.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Whether you&apos;re planning a romantic escape, a business stay, or a family holiday,
              UC Hotel ensures a seamless, luxurious experience.
            </p>
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-500"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;

