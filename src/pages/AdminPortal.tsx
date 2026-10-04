import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Megaphone,
  CalendarDays,
  BookOpen,
  FileText,
  Newspaper,
  Sparkles,
  Image,
  FolderOpen,
  Settings,
  LogOut,
  Home,
  RefreshCw,
} from 'lucide-react';
import { useApp, apiFetch } from '../context/AppContext.tsx';
import {
  AdminDashboardStatsView,
  AdminStudentsView,
  AdminGradesClassesView,
} from './admin/AdminStudentsAndClasses.tsx';
import {
  AdminAnnouncementsView,
  AdminTimetableView,
  AdminSubjectsView,
  AdminNoticesView,
} from './admin/AdminAcademicViews.tsx';
import {
  AdminNewsView,
  AdminEventsView,
  AdminGalleryView,
  AdminMaterialsView,
  AdminSettingsView,
} from './admin/AdminMediaAndSettings.tsx';

export type AdminTab =
  | 'dashboard'
  | 'students'
  | 'grades_classes'
  | 'announcements'
  | 'timetable'
  | 'subjects'
  | 'notices'
  | 'news'
  | 'events'
  | 'gallery'
  | 'materials'
  | 'settings';

export function AdminPortal({ initialTab = 'dashboard' }: { initialTab?: AdminTab }) {
  const { logout, refreshPublicMeta } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; isErr?: boolean } | null>(null);

  const [stats, setStats] = useState<any>({});
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (location.pathname === '/admin/announcements') setActiveTab('announcements');
    else if (location.pathname === '/admin/timetable') setActiveTab('timetable');
    else if (location.pathname === '/admin/settings') setActiveTab('settings');
    else if (initialTab) setActiveTab(initialTab);
  }, [location.pathname, initialTab]);

  const notify = (msg: string, isErr = false) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        dashRes,
        stuRes,
        grdRes,
        clsRes,
        annRes,
        ttRes,
        subRes,
        notRes,
        nwsRes,
        evRes,
        galRes,
        matRes,
        setRes,
      ] = await Promise.all([
        apiFetch('/api/admin/dashboard'),
        apiFetch('/api/admin/students'),
        apiFetch('/api/admin/grades'),
        apiFetch('/api/admin/classes'),
        apiFetch('/api/admin/announcements'),
        apiFetch('/api/admin/timetable'),
        apiFetch('/api/admin/subjects'),
        apiFetch('/api/admin/notices'),
        apiFetch('/api/admin/news'),
        apiFetch('/api/admin/events'),
        apiFetch('/api/admin/gallery'),
        apiFetch('/api/admin/materials'),
        apiFetch('/api/admin/settings'),
      ]);

      setStats(dashRes.stats || {});
      setPendingStudents(dashRes.recentPendingStudents || []);
      setStudents(stuRes.students || []);
      setGrades(grdRes.grades || []);
      setClasses(clsRes.classes || []);
      setAnnouncements(annRes.announcements || []);
      setTimetable(ttRes.timetable || []);
      setSubjects(subRes.subjects || []);
      setNotices(notRes.notices || []);
      setNews(nwsRes.news || []);
      setEvents(evRes.events || []);
      setGalleryImages(galRes.images || []);
      setMaterials(matRes.materials || []);
      setSettings(setRes.settings || {});
      await refreshPublicMeta();
    } catch (err: any) {
      notify(err.message || 'Failed to load admin data.', true);
    } finally {
      setLoading(false);
    }
  }, [refreshPublicMeta]);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === 'announcements') navigate('/admin/announcements', { replace: true });
    else if (tab === 'timetable') navigate('/admin/timetable', { replace: true });
    else if (tab === 'settings') navigate('/admin/settings', { replace: true });
    else navigate('/admin/dashboard', { replace: true });
  };

  const handleQuickApprove = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      notify(`Student marked as ${status}.`);
      await loadAllAdminData();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const sidebarItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'grades_classes', label: 'Grades & Classes', icon: GraduationCap },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'events', label: 'Events', icon: Sparkles },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'materials', label: 'Study Materials', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-[#3D0A14] text-white border-b-2 border-[#D4AF37] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif-display text-lg font-bold tracking-wide text-[#D4AF37]">
            A/GALENBINDUNUWEWA CENTRAL COLLEGE — ADMIN PANEL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAllAdminData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white border border-white/20 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh DB</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-200 hover:text-white border border-white/20 rounded-lg"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Website</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3D0A14] bg-[#D4AF37] rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg text-xs font-semibold shadow-md border ${
            toast.isErr
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-stone-200 p-4 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#6B1426] text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-28 bg-stone-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardStatsView
                  stats={stats}
                  pendingStudents={pendingStudents}
                  onApproveStudent={handleQuickApprove}
                  onNavigateTab={switchTab}
                />
              )}
              {activeTab === 'students' && (
                <AdminStudentsView
                  students={students}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'grades_classes' && (
                <AdminGradesClassesView
                  grades={grades}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'announcements' && (
                <AdminAnnouncementsView
                  announcements={announcements}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'timetable' && (
                <AdminTimetableView
                  timetable={timetable}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'subjects' && (
                <AdminSubjectsView
                  subjects={subjects}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'notices' && (
                <AdminNoticesView
                  notices={notices}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'news' && (
                <AdminNewsView news={news} onRefresh={loadAllAdminData} notify={notify} />
              )}
              {activeTab === 'events' && (
                <AdminEventsView
                  events={events}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'gallery' && (
                <AdminGalleryView
                  images={galleryImages}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'materials' && (
                <AdminMaterialsView
                  materials={materials}
                  classes={classes}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
              {activeTab === 'settings' && (
                <AdminSettingsView
                  settings={settings}
                  onRefresh={loadAllAdminData}
                  notify={notify}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
