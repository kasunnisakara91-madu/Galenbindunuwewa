import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Megaphone,
  CalendarDays,
  BookOpen,
  FileText,
  FolderOpen,
  Sparkles,
  User,
  LogOut,
  RefreshCw,
  Download,
  ExternalLink,
  Home,
  LayoutDashboard,
} from 'lucide-react';
import { useApp, apiFetch } from '../context/AppContext.tsx';
import { SCHOOL_ASSETS } from '../utils/assets.ts';

type StudentTab =
  | 'overview'
  | 'announcements'
  | 'timetable'
  | 'subjects'
  | 'notices'
  | 'materials'
  | 'events'
  | 'profile';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export function StudentPortal({ initialTab = 'overview' }: { initialTab?: StudentTab }) {
  const { lang, setLang, t, user, setUser, logout, settings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<StudentTab>(initialTab);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    profile: any;
    announcements: any[];
    timetable: any[];
    subjects: any[];
    notices: any[];
    materials: any[];
    events: any[];
  }>({
    profile: null,
    announcements: [],
    timetable: [],
    subjects: [],
    notices: [],
    materials: [],
    events: [],
  });

  useEffect(() => {
    if (location.pathname === '/student/timetable') {
      setActiveTab('timetable');
    } else if (location.pathname === '/student/materials') {
      setActiveTab('materials');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  const loadStudentDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch('/api/student/dashboard');
      setData({
        profile: res.profile,
        announcements: res.announcements || [],
        timetable: res.timetable || [],
        subjects: res.subjects || [],
        notices: res.notices || [],
        materials: res.materials || [],
        events: res.events || [],
      });
      if (res.profile) {
        setUser({ ...res.profile, role: 'STUDENT' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    loadStudentDashboard();
  }, [loadStudentDashboard]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const switchTab = (tab: StudentTab) => {
    setActiveTab(tab);
    if (tab === 'timetable') {
      navigate('/student/timetable', { replace: true });
    } else if (tab === 'materials') {
      navigate('/student/materials', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  const profile = data.profile || user;
  const studentClass = profile?.class || '';
  const studentGrade = profile?.grade || '';
  const studentStream = profile?.stream || '';

  const navItems: { id: StudentTab; label: string; count?: number; icon: any }[] = [
    {
      id: 'overview',
      label: t('Dashboard', 'මුල් පුවරුව'),
      icon: LayoutDashboard,
    },
    {
      id: 'announcements',
      label: `${studentClass} ${t('Announcements', 'නිවේදන')}`,
      count: data.announcements.length,
      icon: Megaphone,
    },
    {
      id: 'timetable',
      label: `${studentClass} ${t('Timetable', 'කාලසටහන')}`,
      count: data.timetable.length,
      icon: CalendarDays,
    },
    {
      id: 'subjects',
      label: `${studentClass} ${t('Subjects', 'විෂයයන්')}`,
      count: data.subjects.length,
      icon: BookOpen,
    },
    {
      id: 'notices',
      label: `${studentClass} ${t('Notices', 'දැන්වීම්')}`,
      count: data.notices.length,
      icon: FileText,
    },
    {
      id: 'materials',
      label: `${studentClass} ${t('Study Materials', 'ඉගෙනුම් ද්‍රව්‍ය')}`,
      count: data.materials.length,
      icon: FolderOpen,
    },
    {
      id: 'events',
      label: `${studentClass} ${t('Events', 'උත්සව')}`,
      count: data.events.length,
      icon: Sparkles,
    },
    {
      id: 'profile',
      label: t('My Profile', 'මගේ ගිණුම'),
      icon: User,
    },
  ];

  const periodsList = Array.from(
    new Set([1, 2, 3, 4, 5, 6, 7, 8, ...data.timetable.map((t) => Number(t.period))])
  ).sort((a, b) => a - b);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] pb-16 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-[#3D0A14] text-white border-b-2 border-[#D4AF37] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={settings.logo || SCHOOL_ASSETS.crest}
            alt="School Crest"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-md object-cover bg-white p-0.5 border border-[#D4AF37]"
          />
          <div>
            <p className="font-serif-display text-base sm:text-lg font-bold tracking-wide text-white truncate max-w-[200px] sm:max-w-none">
              {t(
                settings.schoolName || 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
                settings.schoolNameSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-0.5 bg-white/10 rounded-md">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs font-medium rounded cursor-pointer ${
                lang === 'en' ? 'bg-[#D4AF37] text-[#3D0A14] font-semibold' : 'text-stone-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('si')}
              className={`px-2 py-1 text-xs font-medium rounded cursor-pointer ${
                lang === 'si' ? 'bg-[#D4AF37] text-[#3D0A14] font-semibold' : 'text-stone-200'
              }`}
            >
              සිං
            </button>
          </div>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white border border-white/20 rounded-lg"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t('Public Website', 'මුල් වෙබ් අඩවිය')}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3D0A14] bg-[#D4AF37] hover:bg-[#e3be42] rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('Logout', 'ඉවත් වන්න')}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-68 flex-col bg-white border-r border-stone-200 p-5 justify-between shrink-0">
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-1">
              <p className="text-xs text-stone-500">{t('Logged in Student', 'ශිෂ්‍ය ගිණුම')}</p>
              <p className="font-serif-display text-xl font-bold text-stone-900 truncate">
                {profile?.name}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#6B1426] font-semibold pt-0.5">
                <span>Grade {studentGrade}</span>
                <span aria-hidden="true">·</span>
                <span>{studentClass}</span>
                {studentStream && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans">{studentStream}</span>
                  </>
                )}
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#6B1426] text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.count !== undefined && (
                      <span
                        className={`font-mono tabular-nums text-xs ${
                          active ? 'text-[#D4AF37]' : 'text-stone-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 space-y-2">
            <button
              type="button"
              onClick={loadStudentDashboard}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-700 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Sync Class Data', 'දත්ත යාවත්කාලීන කරන්න')}</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Personalized Student Welcome Banner */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                <span>ID: {profile?.studentId}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">{profile?.status || 'APPROVED'}</span>
              </div>
              <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-stone-900">
                {t('Welcome,', 'සාදරයෙන් පිළිගනිමු,')} {profile?.name} 👋
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#6B1426] font-mono tabular-nums">
                {t('Grade', 'ශ්‍රේණිය')} {studentClass}
                {studentStream ? ` · ${studentStream} Stream` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadStudentDashboard}
                className="px-3.5 py-2 text-xs font-semibold text-[#6B1426] border border-[#6B1426]/30 hover:bg-[#6B1426]/5 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('Refresh', 'යාවත්කාලීන කරන්න')}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-32 bg-stone-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* 7 Dashboard Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => switchTab('announcements')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>📢 {t('My Announcements', 'මගේ නිවේදන')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.announcements.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Announcements', 'නිවේදන')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('Authorized for your Grade & Class', 'ඔබේ පන්තියට අදාළ නිවේදන')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('timetable')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>📅 {t('My Timetable', 'මගේ කාලසටහන')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.timetable.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Timetable', 'කාලසටහන')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('Monday – Friday class schedule', 'සඳුදා – සිකුරාදා කාලසටහන')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('subjects')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>📚 {t('My Subjects', 'මගේ විෂයයන්')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.subjects.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Subjects', 'විෂයයන්')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('Assigned subjects & teachers', 'විෂයයන් සහ ගුරුවරුන්')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('notices')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>📝 {t('My Notices', 'මගේ දැන්වීම්')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.notices.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Notices', 'දැන්වීම්')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('Class & grade notices', 'පන්ති සහ ශ්‍රේණි දැන්වීම්')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('materials')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>📖 {t('Study Materials', 'ඉගෙනුම් ද්‍රව්‍ය')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.materials.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Materials', 'ඉගෙනුම් ද්‍රව්‍ය')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('PDFs, notes & assignments', 'නිබන්ධන සහ ප්‍රශ්න පත්‍ර')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('events')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>🎉 {t('Events', 'උත්සව')}</span>
                        <span className="font-mono tabular-nums font-bold text-[#6B1426] text-base">
                          {data.events.length}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {studentClass} {t('Events', 'උත්සව')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t('School & class programs', 'විද්‍යාලයීය හා පන්ති වැඩසටහන්')}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchTab('profile')}
                      className="text-left bg-white border border-stone-200 hover:border-[#6B1426] rounded-xl p-5 space-y-2 transition-colors cursor-pointer sm:col-span-2"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>👤 {t('My Profile', 'මගේ ගිණුම')}</span>
                        <span className="font-mono tabular-nums text-emerald-700 font-semibold">
                          {profile?.status}
                        </span>
                      </div>
                      <p className="font-serif-display text-xl font-bold text-stone-900">
                        {profile?.name} · {t('Grade', 'ශ්‍රේණිය')} {studentClass}
                      </p>
                      <p className="text-xs text-stone-500 font-mono tabular-nums">
                        ID: {profile?.studentId} · {profile?.phone}
                      </p>
                    </button>
                  </div>

                  {/* Recent Class Announcements & Today's Schedule */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                          📢 {studentClass} {t('Announcements', 'නිවේදන')}
                        </h2>
                        <button
                          type="button"
                          onClick={() => switchTab('announcements')}
                          className="text-xs font-semibold text-[#6B1426] hover:underline cursor-pointer"
                        >
                          {t('View All →', 'සියල්ල →')}
                        </button>
                      </div>

                      {data.announcements.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4">
                          {t(
                            `No announcements have been posted for ${studentClass} yet.`,
                            `${studentClass} පන්තිය සඳහා තවමත් නිවේදන නොමැත.`
                          )}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {data.announcements.slice(0, 3).map((a) => (
                            <div
                              key={a._id}
                              className="p-4 rounded-lg bg-[#FAF8F5] border border-stone-200 space-y-1.5"
                            >
                              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                                <span>{a.date}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-sans font-semibold text-[#6B1426]">
                                  {a.targetType === 'CLASS'
                                    ? `Class ${a.targetClass}`
                                    : a.targetType === 'GRADE'
                                    ? `Grade ${a.targetGrade}`
                                    : a.targetType === 'STREAM'
                                    ? `${a.targetStream} Stream`
                                    : 'All Students'}
                                </span>
                              </div>
                              <h3 className="font-serif-display text-lg font-bold text-stone-900">
                                {t(a.title, a.sinhalaTitle)}
                              </h3>
                              <p className="text-xs text-stone-600 leading-relaxed">
                                {t(a.description, a.sinhalaDescription)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                          📚 {studentClass} {t('Subjects', 'විෂයයන්')}
                        </h2>
                        <button
                          type="button"
                          onClick={() => switchTab('subjects')}
                          className="text-xs font-semibold text-[#6B1426] hover:underline cursor-pointer"
                        >
                          {t('All Subjects →', 'සියලුම විෂයයන් →')}
                        </button>
                      </div>

                      {data.subjects.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4">
                          {t(
                            `No subjects have been assigned to ${studentClass} yet.`,
                            `${studentClass} පන්තිය සඳහා තවමත් විෂයයන් ඇතුළත් කර නොමැත.`
                          )}
                        </p>
                      ) : (
                        <div className="divide-y divide-stone-100">
                          {data.subjects.slice(0, 6).map((sub) => (
                            <div
                              key={sub._id}
                              className="py-2.5 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-semibold text-stone-900">
                                  {t(sub.name, sub.sinhalaName)}
                                </p>
                                <p className="text-stone-500">{sub.teacher}</p>
                              </div>
                              <span className="font-mono tabular-nums text-stone-500">
                                {sub.class}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: MY ANNOUNCEMENTS ── */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      📢 {studentClass} {t('Announcements', 'නිවේදන')}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {t(
                        `Showing announcements targeted to Grade ${studentGrade}, Class ${studentClass}, and All Students.`,
                        `${studentGrade} ශ්‍රේණියට සහ ${studentClass} පන්තියට අදාළ නිවේදන.`
                      )}
                    </p>
                  </div>

                  {data.announcements.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-1">
                      <p className="text-sm font-semibold text-stone-800">
                        {t('No data available.', 'දත්ත නොමැත.')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `No announcements have been published for ${studentClass} yet.`,
                          `${studentClass} පන්තිය සඳහා තවමත් නිවේදන ප්‍රකාශයට පත් කර නොමැත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.announcements.map((item) => (
                        <article
                          key={item._id}
                          className="bg-white border border-stone-200 rounded-xl p-6 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                            <span>{item.date}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans font-semibold text-[#6B1426]">
                              {item.targetType === 'CLASS'
                                ? `Class ${item.targetClass} Only`
                                : item.targetType === 'GRADE'
                                ? `Grade ${item.targetGrade}`
                                : item.targetType === 'STREAM'
                                ? `${item.targetStream} Stream`
                                : 'All Students'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.priority}</span>
                          </div>
                          <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                            {t(item.title, item.sinhalaTitle)}
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                            {t(item.description, item.sinhalaDescription)}
                          </p>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="mt-3 max-h-72 rounded-lg object-cover border border-stone-200"
                            />
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: MY TIMETABLE (/student/timetable) ── */}
              {activeTab === 'timetable' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
                        {t('My Timetable', 'මගේ කාලසටහන')}
                      </p>
                      <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-0.5">
                        {t('Grade', 'ශ්‍රේණිය')} {studentClass} — {t('Weekly Timetable', 'සතිපතා කාලසටහන')}
                      </h2>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-stone-500">
                      {data.timetable.length} {t('scheduled periods', 'කාලඡේද')}
                    </span>
                  </div>

                  {data.timetable.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
                      <p className="text-base font-semibold text-stone-800">
                        {t(
                          'No timetable has been added for your class yet.',
                          'ඔබේ පන්තිය සඳහා තවමත් කාලසටහනක් ඇතුළත් කර නොමැත.'
                        )}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `Once the school administrator adds timetable periods for ${studentClass}, they will appear here automatically.`,
                          `පරිපාලක විසින් ${studentClass} කාලසටහන ඇතුළත් කළ පසු මෙහි දිස්වනු ඇත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Day Selector + Card Layout (md:hidden) */}
                      <div className="md:hidden space-y-4">
                        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-lg overflow-x-auto">
                          {DAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedDay(day)}
                              className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                                selectedDay === day
                                  ? 'bg-[#6B1426] text-white font-semibold'
                                  : 'text-stone-700'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {data.timetable
                            .filter((t) => t.day === selectedDay)
                            .sort((a, b) => Number(a.period) - Number(b.period))
                            .map((entry) => (
                              <div
                                key={entry._id}
                                className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#6B1426] font-semibold">
                                    <span>Period {entry.period}</span>
                                    {entry.startTime && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                          {entry.startTime}
                                          {entry.endTime ? ` - ${entry.endTime}` : ''}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <p className="font-serif-display text-lg font-bold text-stone-900">
                                    {t(entry.subject, entry.sinhalaSubject)}
                                  </p>
                                  <p className="text-xs text-stone-600">{entry.teacher}</p>
                                </div>
                                {entry.room && (
                                  <span className="text-xs font-mono tabular-nums text-stone-500">
                                    {t('Room', 'කාමරය')} {entry.room}
                                  </span>
                                )}
                              </div>
                            ))}
                          {data.timetable.filter((t) => t.day === selectedDay).length === 0 && (
                            <div className="bg-white border border-stone-200 rounded-xl p-6 text-center text-xs text-stone-500">
                              {t(
                                `No periods scheduled for ${selectedDay}.`,
                                `${selectedDay} දින සඳහා කාලඡේද ඇතුළත් කර නොමැත.`
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Full Monday–Friday Grid Table (hidden md:block) */}
                      <div className="hidden md:block bg-white border border-stone-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#3D0A14] text-white text-xs">
                              <th className="py-3.5 px-4 font-semibold w-28 border-r border-white/10">
                                {t('Period', 'කාලඡේදය')}
                              </th>
                              {DAYS.map((day) => (
                                <th
                                  key={day}
                                  className="py-3.5 px-4 font-semibold border-r border-white/10 last:border-r-0"
                                >
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 text-xs">
                            {periodsList.map((periodNum) => {
                              const hasAnyInPeriod = data.timetable.some(
                                (t) => Number(t.period) === periodNum
                              );
                              if (!hasAnyInPeriod && periodNum > 5) return null;
                              return (
                                <tr key={periodNum} className="hover:bg-stone-50/70">
                                  <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-[#6B1426] border-r border-stone-200 bg-[#FAF8F5]">
                                    Period {periodNum}
                                  </td>
                                  {DAYS.map((day) => {
                                    const slot = data.timetable.find(
                                      (t) =>
                                        t.day === day && Number(t.period) === Number(periodNum)
                                    );
                                    return (
                                      <td
                                        key={day}
                                        className="py-3.5 px-4 border-r border-stone-200 last:border-r-0 align-top"
                                      >
                                        {slot ? (
                                          <div className="space-y-1">
                                            <p className="font-semibold text-stone-900 text-sm">
                                              {t(slot.subject, slot.sinhalaSubject)}
                                            </p>
                                            <p className="text-stone-600">{slot.teacher}</p>
                                            {(slot.room || slot.startTime) && (
                                              <p className="text-stone-400 font-mono tabular-nums">
                                                {slot.room ? `Rm ${slot.room}` : ''}
                                                {slot.room && slot.startTime ? ' · ' : ''}
                                                {slot.startTime}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-stone-300">—</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── TAB 4: MY SUBJECTS ── */}
              {activeTab === 'subjects' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      📚 {studentClass} {t('Subjects', 'විෂයයන්')}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {t(
                        `Academic subjects assigned to Grade ${studentGrade} (${studentClass}).`,
                        `${studentGrade} ශ්‍රේණිය (${studentClass}) සඳහා නියමිත විෂයයන්.`
                      )}
                    </p>
                  </div>

                  {data.subjects.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-1">
                      <p className="text-sm font-semibold text-stone-800">
                        {t('No data available.', 'දත්ත නොමැත.')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `No subjects have been added for ${studentClass} yet.`,
                          `${studentClass} පන්තිය සඳහා තවමත් විෂයයන් ඇතුළත් කර නොමැත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.subjects.map((sub) => (
                        <div
                          key={sub._id}
                          className="bg-white border border-stone-200 rounded-xl p-5 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
                            <span>Grade {sub.grade}</span>
                            <span>{sub.class}</span>
                          </div>
                          <h3 className="font-serif-display text-xl font-bold text-stone-900">
                            {t(sub.name, sub.sinhalaName)}
                          </h3>
                          {sub.sinhalaName && lang === 'en' && (
                            <p className="text-xs text-stone-500">{sub.sinhalaName}</p>
                          )}
                          <p className="text-xs text-stone-700 pt-1 border-t border-stone-100">
                            <span className="text-stone-500">{t('Teacher', 'ගුරුවරයා')}: </span>
                            <span className="font-semibold">{sub.teacher}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 5: MY NOTICES ── */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      📝 {studentClass} {t('Notices', 'දැන්වීම්')}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {t(
                        `Special notices for ${studentClass}, Grade ${studentGrade}, and All Students.`,
                        `${studentClass} පන්තියට සහ ${studentGrade} ශ්‍රේණියට අදාළ විශේෂ දැන්වීම්.`
                      )}
                    </p>
                  </div>

                  {data.notices.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-1">
                      <p className="text-sm font-semibold text-stone-800">
                        {t('No data available.', 'දත්ත නොමැත.')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `No notices have been posted for ${studentClass} yet.`,
                          `${studentClass} පන්තිය සඳහා තවමත් දැන්වීම් නොමැත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.notices.map((n) => (
                        <div
                          key={n._id}
                          className="bg-white border border-stone-200 rounded-xl p-6 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                            <span>{n.date}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans font-semibold text-[#6B1426]">
                              {n.targetType === 'CLASS'
                                ? `Class ${n.targetClass} Notice`
                                : n.targetType === 'GRADE'
                                ? `Grade ${n.targetGrade} Notice`
                                : 'General Student Notice'}
                            </span>
                          </div>
                          <h3 className="font-serif-display text-xl font-bold text-stone-900">
                            {t(n.title, n.sinhalaTitle)}
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                            {t(n.description, n.sinhalaDescription)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 6: STUDY MATERIALS (/student/materials) ── */}
              {activeTab === 'materials' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      📖 {studentClass} {t('Study Materials', 'ඉගෙනුම් ද්‍රව්‍ය')}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {t(
                        `Learning documents, PDFs, and resources uploaded for ${studentClass}.`,
                        `${studentClass} පන්තිය සඳහා ඇතුළත් කර ඇති ඉගෙනුම් ද්‍රව්‍ය සහ නිබන්ධන.`
                      )}
                    </p>
                  </div>

                  {data.materials.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-1">
                      <p className="text-sm font-semibold text-stone-800">
                        {t('No data available.', 'දත්ත නොමැත.')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `No study materials have been uploaded for ${studentClass} yet.`,
                          `${studentClass} පන්තිය සඳහා තවමත් ඉගෙනුම් ද්‍රව්‍ය ඇතුළත් කර නොමැත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.materials.map((mat) => (
                        <div
                          key={mat._id}
                          className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                              <span className="font-sans font-semibold text-[#6B1426]">
                                {mat.subject}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{mat.fileType}</span>
                              <span aria-hidden="true">·</span>
                              <span>{mat.uploadedDate}</span>
                            </div>
                            <h3 className="font-serif-display text-xl font-bold text-stone-900">
                              {t(mat.title, mat.sinhalaTitle)}
                            </h3>
                            {mat.description && (
                              <p className="text-xs text-stone-600 leading-relaxed">
                                {mat.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-xs font-mono tabular-nums text-stone-500">
                              {mat.class}
                            </span>
                            <a
                              href={mat.fileUrl}
                              download={mat.fileName || mat.title}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg"
                            >
                              {mat.fileUrl.startsWith('data:') ? (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>{t('Download File', 'බාගත කරන්න')}</span>
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>{t('Open Resource', 'විවෘත කරන්න')}</span>
                                </>
                              )}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 7: EVENTS ── */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      🎉 {studentClass} {t('Events', 'උත්සව හා වැඩසටහන්')}
                    </h2>
                  </div>

                  {data.events.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-1">
                      <p className="text-sm font-semibold text-stone-800">
                        {t('No data available.', 'දත්ත නොමැත.')}
                      </p>
                      <p className="text-xs text-stone-500">
                        {t(
                          `No upcoming events scheduled for ${studentClass}.`,
                          `${studentClass} සඳහා ඉදිරි උත්සව නොමැත.`
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.events.map((ev) => (
                        <div
                          key={ev._id}
                          className="bg-white border border-stone-200 rounded-xl p-6 space-y-2.5"
                        >
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                            <span>{ev.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>{ev.time}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans text-[#6B1426] font-semibold">
                              {ev.location}
                            </span>
                          </div>
                          <h3 className="font-serif-display text-xl font-bold text-stone-900">
                            {t(ev.title, ev.sinhalaTitle)}
                          </h3>
                          <p className="text-sm text-stone-700 leading-relaxed">
                            {t(ev.description, ev.sinhalaDescription)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 8: MY PROFILE ── */}
              {activeTab === 'profile' && (
                <div className="max-w-2xl space-y-6">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="font-serif-display text-3xl font-bold text-stone-900">
                      👤 {t('My Student Profile', 'මගේ ශිෂ්‍ය ගිණුම')}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {t(
                        'Official student registration record verified by the school administrator. Students cannot modify their approved Grade or Class themselves.',
                        'විද්‍යාලයීය පරිපාලක විසින් අනුමත කරන ලද නිල ශිෂ්‍ය තොරතුරු. සිසුන්ට තම අනුමත ශ්‍රේණිය හෝ පන්තිය තනිවම වෙනස් කළ නොහැක.'
                      )}
                    </p>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 text-sm">
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Full Name', 'සම්පූර්ණ නම')}</span>
                      <span className="font-semibold text-stone-900">{profile?.name}</span>
                    </div>
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Student ID', 'ශිෂ්‍ය අංකය')}</span>
                      <span className="font-mono tabular-nums font-semibold text-stone-900">
                        {profile?.studentId}
                      </span>
                    </div>
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Mobile Number', 'දුරකථන අංකය')}</span>
                      <span className="font-mono tabular-nums text-stone-900">
                        {profile?.phone}
                      </span>
                    </div>
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Approved Grade', 'අනුමත ශ්‍රේණිය')}</span>
                      <span className="font-mono tabular-nums font-semibold text-[#6B1426]">
                        Grade {profile?.grade}
                      </span>
                    </div>
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Approved Class', 'අනුමත පන්තිය')}</span>
                      <span className="font-mono tabular-nums font-semibold text-[#6B1426]">
                        {profile?.class}
                      </span>
                    </div>
                    {profile?.stream && (
                      <div className="px-6 py-4 flex justify-between">
                        <span className="text-stone-500">{t('Senior Stream', 'විෂය ධාරාව')}</span>
                        <span className="font-semibold text-stone-900">{profile?.stream}</span>
                      </div>
                    )}
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Role', 'භූමිකාව')}</span>
                      <span className="font-mono text-stone-800">{profile?.role}</span>
                    </div>
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-stone-500">{t('Account Status', 'ගිණුමේ තත්ත්වය')}</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {profile?.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white border-t border-stone-200 grid grid-cols-5 px-2">
        {[
          { id: 'overview' as StudentTab, label: t('Home', 'මුල'), icon: LayoutDashboard },
          { id: 'announcements' as StudentTab, label: t('Notices', 'නිවේදන'), icon: Megaphone },
          { id: 'timetable' as StudentTab, label: t('Timetable', 'කාලසටහන'), icon: CalendarDays },
          { id: 'materials' as StudentTab, label: t('Materials', 'පාඩම්'), icon: FolderOpen },
          { id: 'profile' as StudentTab, label: t('Profile', 'ගිණුම'), icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => switchTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium cursor-pointer ${
                active ? 'text-[#6B1426] font-semibold' : 'text-stone-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
