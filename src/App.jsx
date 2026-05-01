import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingPage from './pages/BookingPage';
import GuestDashboard from './pages/GuestDashboard';
import GuestReservationsPage from './pages/GuestReservationsPage';
import GuestPaymentsPage from './pages/GuestPaymentsPage';
import GuestProfilePage from './pages/GuestProfilePage';
import StaffDashboard from './pages/StaffDashboard';
import StaffRoomsPage from './pages/StaffRoomsPage';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
          <Route path="/booking/:roomId" element={<BookingPage />} />
        </Route>

        <Route
          path="/guest"
          element={
            <RequireAuth allowedRoles={['guest']}>
              <DashboardLayout>
                <GuestDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/guest/dashboard"
          element={
            <RequireAuth allowedRoles={['guest']}>
              <DashboardLayout>
                <GuestDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/guest/reservation"
          element={
            <RequireAuth allowedRoles={['guest']}>
              <DashboardLayout>
                <GuestReservationsPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/guest/payment"
          element={
            <RequireAuth allowedRoles={['guest']}>
              <DashboardLayout>
                <GuestPaymentsPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/guest/profile"
          element={
            <RequireAuth allowedRoles={['guest']}>
              <DashboardLayout>
                <GuestProfilePage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireAuth allowedRoles={['staff']}>
              <DashboardLayout>
                <StaffDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/staff/rooms"
          element={
            <RequireAuth allowedRoles={['staff']}>
              <DashboardLayout>
                <StaffRoomsPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

