import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { PublicLayout } from './components/PublicLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import {
  AnnouncementsPage,
  PublicTimetablePage,
  GradesPage,
  NewsPage,
  EventsPage,
  GalleryPage,
  ContactPage,
} from './pages/PublicPages.tsx';
import {
  StudentLoginPage,
  StudentRegisterPage,
  AdminLoginPage,
} from './pages/AuthPages.tsx';
import { StudentPortal } from './pages/StudentPortal.tsx';
import { AdminPortal } from './pages/AdminPortal.tsx';

function RequireStudentRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-sm text-stone-600">
        Verifying student session...
      </div>
    );
  }
  if (!user || user.role !== 'STUDENT') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RequireAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-sm text-stone-600">
        Verifying administrator session...
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public School Website Routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/announcements"
        element={
          <PublicLayout>
            <AnnouncementsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/timetable"
        element={
          <PublicLayout>
            <PublicTimetablePage />
          </PublicLayout>
        }
      />
      <Route
        path="/grades"
        element={
          <PublicLayout>
            <GradesPage />
          </PublicLayout>
        }
      />
      <Route
        path="/news"
        element={
          <PublicLayout>
            <NewsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/events"
        element={
          <PublicLayout>
            <EventsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <GalleryPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        }
      />

      {/* Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <StudentLoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <StudentRegisterPage />
          </PublicLayout>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PublicLayout>
            <AdminLoginPage />
          </PublicLayout>
        }
      />

      {/* Protected Personalized Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <RequireStudentRoute>
            <StudentPortal initialTab="overview" />
          </RequireStudentRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <RequireStudentRoute>
            <StudentPortal initialTab="timetable" />
          </RequireStudentRoute>
        }
      />
      <Route
        path="/student/materials"
        element={
          <RequireStudentRoute>
            <StudentPortal initialTab="materials" />
          </RequireStudentRoute>
        }
      />

      {/* Protected Admin Panel Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdminRoute>
            <AdminPortal initialTab="dashboard" />
          </RequireAdminRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <RequireAdminRoute>
            <AdminPortal initialTab="announcements" />
          </RequireAdminRoute>
        }
      />
      <Route
        path="/admin/timetable"
        element={
          <RequireAdminRoute>
            <AdminPortal initialTab="timetable" />
          </RequireAdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireAdminRoute>
            <AdminPortal initialTab="settings" />
          </RequireAdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
