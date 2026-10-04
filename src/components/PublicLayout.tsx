import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SCHOOL_ASSETS } from '../utils/assets.ts';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t, user, settings } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryLinks = [
    { to: '/', label: t('Home', 'මුල් පිටුව') },
    { to: '/about', label: t('About', 'විද්‍යාලය පිළිබඳ') },
    { to: '/announcements', label: t('Announcements', 'නිවේදන') },
    { to: '/timetable', label: t('Timetable', 'කාලසටහන') },
    { to: '/grades', label: t('Grades', 'ශ්‍රේණි') },
  ];

  const secondaryLinks = [
    { to: '/news', label: t('News', 'පුවත්') },
    { to: '/events', label: t('Events', 'උත්සව') },
    { to: '/gallery', label: t('Gallery', 'ඡායාරූප') },
    { to: '/contact', label: t('Contact', 'සම්බන්ධ වන්න') },
    { to: '/admin/login', label: t('Admin Portal', 'පරිපාලක ද්වාරය') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[#6B1426] whitespace-nowrap truncate max-w-[230px] sm:max-w-none"
        >
          {t(
            settings.schoolName || 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
            settings.schoolNameSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය'
          )}
        </Link>

        {/* Zone 2: Clean text navigation links + More dropdown */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`whitespace-nowrap py-1 transition-colors border-b-2 ${
                isActive(item.to)
                  ? 'border-[#6B1426] text-[#6B1426] font-semibold'
                  : 'border-transparent hover:text-[#6B1426] hover:border-[#D4AF37]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 180)}
              className="flex items-center gap-1 whitespace-nowrap py-1 text-stone-700 hover:text-[#6B1426] transition-colors cursor-pointer"
            >
              <span>{t('More', 'තවත්')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-lg py-1.5 shadow-sm z-50">
                {secondaryLinks.map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                      isActive(sub.to)
                        ? 'bg-[#6B1426]/5 text-[#6B1426] font-semibold'
                        : 'text-stone-700 hover:bg-stone-50 hover:text-[#6B1426]'
                    }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Language Switcher & Primary Portal Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-stone-200/80 rounded-md">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-[#6B1426] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('si')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'si'
                  ? 'bg-white text-[#6B1426] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              සිං
            </button>
          </div>

          {user?.role === 'STUDENT' ? (
            <Link
              to="/student/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg transition-colors whitespace-nowrap"
            >
              {t('My Dashboard', 'මගේ පුවරුව')} ({user.class})
            </Link>
          ) : user?.role === 'ADMIN' ? (
            <Link
              to="/admin/dashboard"
              className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg transition-colors whitespace-nowrap"
            >
              {t('Admin Panel', 'පරිපාලක පුවරුව')}
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg transition-colors whitespace-nowrap"
            >
              {t('Student Login', 'ශිෂ්‍ය පිවිසුම')}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle Navigation"
            className="lg:hidden p-2 text-stone-700 hover:text-[#6B1426] rounded-lg cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[...primaryLinks, ...secondaryLinks].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                  isActive(item.to)
                    ? 'bg-[#6B1426]/10 text-[#6B1426] font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-stone-200 flex items-center gap-3">
            {user?.role === 'STUDENT' ? (
              <Link
                to="/student/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 text-xs font-semibold text-white bg-[#6B1426] rounded-lg"
              >
                {t('My Dashboard', 'මගේ පුවරුව')} ({user.class})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-semibold text-white bg-[#6B1426] rounded-lg"
                >
                  {t('Student Login', 'ශිෂ්‍ය පිවිසුම')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-xs font-semibold text-[#6B1426] border border-[#6B1426] rounded-lg"
                >
                  {t('Register', 'ලියාපදිංචි වන්න')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Institutional Footer */}
      <footer className="bg-[#3D0A14] text-stone-200 border-t-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={settings.logo || SCHOOL_ASSETS.crest}
                alt="A/Galenbindunuwewa Central College Crest"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-lg object-cover border border-[#D4AF37]/40 bg-white p-0.5 shrink-0"
              />
              <div>
                <h2 className="font-serif-display text-xl font-bold text-white tracking-wide">
                  {t(
                    settings.schoolName || 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
                    settings.schoolNameSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය'
                  )}
                </h2>
                <p className="text-xs text-[#D4AF37] mt-0.5">
                  {t(
                    settings.location || 'Galenbindunuwewa, Sri Lanka',
                    settings.locationSi || 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
                  )}{' '}
                  · {t('Grades 6–13', '6–13 ශ්‍රේණි')}
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed max-w-md">
              {t(
                settings.welcomeMessageEn ||
                  'Official academic and student management portal serving students in Grades 6 through 13.',
                settings.welcomeMessageSi ||
                  '6 ශ්‍රේණියේ සිට 13 ශ්‍රේණිය දක්වා සිසුන් සඳහා වන නිල අධ්‍යයන හා ශිෂ්‍ය කළමනාකරණ ද්වාරය.'
              )}
            </p>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#D4AF37] tracking-wider">
                {t('Academic Portal', 'අධ්‍යයන ද්වාරය')}
              </p>
              <ul className="space-y-2 text-stone-300">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    {t('About the College', 'විද්‍යාලය පිළිබඳ')}
                  </Link>
                </li>
                <li>
                  <Link to="/announcements" className="hover:text-white transition-colors">
                    {t('Announcements', 'නිවේදන')}
                  </Link>
                </li>
                <li>
                  <Link to="/timetable" className="hover:text-white transition-colors">
                    {t('Class Timetables', 'කාලසටහන්')}
                  </Link>
                </li>
                <li>
                  <Link to="/grades" className="hover:text-white transition-colors">
                    {t('Grades 6–13', '6–13 ශ්‍රේණි')}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#D4AF37] tracking-wider">
                {t('Campus & Access', 'විද්‍යාලයීය පිවිසුම')}
              </p>
              <ul className="space-y-2 text-stone-300">
                <li>
                  <Link to="/news" className="hover:text-white transition-colors">
                    {t('School News', 'විද්‍යාලයීය පුවත්')}
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-white transition-colors">
                    {t('Upcoming Events', 'ඉදිරි උත්සව')}
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-white transition-colors">
                    {t('Photo Gallery', 'ඡායාරූප එකතුව')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    {t('Student Login', 'ශිෂ්‍ය පිවිසුම')}
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    {t('Student Registration', 'ශිෂ්‍ය ලියාපදිංචිය')}
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition-colors">
                    {t('Admin Login', 'පරිපාලක පිවිසුම')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <p className="text-xs font-semibold text-[#D4AF37] tracking-wider">
              {t('Official Contact', 'නිල සබඳතා')}
            </p>
            <p className="text-stone-300 leading-relaxed">
              {t(
                settings.addressEn || 'A/Galenbindunuwewa Central College, Galenbindunuwewa, Sri Lanka',
                settings.addressSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය, ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
              )}
            </p>
            {settings.phone && (
              <p className="text-stone-300 font-mono tabular-nums">{settings.phone}</p>
            )}
            {settings.email && <p className="text-stone-300">{settings.email}</p>}
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-block text-xs font-semibold text-[#D4AF37] hover:underline"
              >
                {t('View Contact Details →', 'සම්බන්ධතා විස්තර බලන්න →')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 px-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()}{' '}
          {t(
            settings.schoolName || 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
            settings.schoolNameSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය'
          )}
          . {t('All Rights Reserved.', 'සියලුම හිමිකම් ඇවිරිණි.')}
        </div>
      </footer>
    </div>
  );
}
