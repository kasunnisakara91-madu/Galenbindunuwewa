import React, { useState } from 'react';
import { Plus, Search, Check, X, Trash2, Edit3, Power } from 'lucide-react';
import { useApp, apiFetch } from '../../context/AppContext.tsx';

// ── 1. Admin Dashboard Real MongoDB Statistics View ──
export function AdminDashboardStatsView({
  stats,
  pendingStudents,
  onApproveStudent,
  onNavigateTab,
}: {
  stats: any;
  pendingStudents: any[];
  onApproveStudent: (id: string, status: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}) {
  const { t } = useApp();

  const statCards = [
    { label: t('Total Students', 'මුළු සිසුන් ගණන'), value: stats?.totalStudents ?? 0 },
    { label: t('Grade 6 Students', '6 ශ්‍රේණියේ සිසුන්'), value: stats?.grade6Students ?? 0 },
    { label: t('Grade 7 Students', '7 ශ්‍රේණියේ සිසුන්'), value: stats?.grade7Students ?? 0 },
    { label: t('Grade 8 Students', '8 ශ්‍රේණියේ සිසුන්'), value: stats?.grade8Students ?? 0 },
    { label: t('Grade 9 Students', '9 ශ්‍රේණියේ සිසුන්'), value: stats?.grade9Students ?? 0 },
    { label: t('Grade 10 Students', '10 ශ්‍රේණියේ සිසුන්'), value: stats?.grade10Students ?? 0 },
    { label: t('Grade 11 Students', '11 ශ්‍රේණියේ සිසුන්'), value: stats?.grade11Students ?? 0 },
    { label: t('Grade 12 Students', '12 ශ්‍රේණියේ සිසුන්'), value: stats?.grade12Students ?? 0 },
    { label: t('Grade 13 Students', '13 ශ්‍රේණියේ සිසුන්'), value: stats?.grade13Students ?? 0 },
    { label: t('Total Classes', 'මුළු පන්ති ගණන'), value: stats?.totalClasses ?? 0 },
    {
      label: t('Published Announcements', 'ප්‍රකාශිත නිවේදන'),
      value: stats?.publishedAnnouncements ?? 0,
    },
    { label: t('Upcoming Events', 'ඉදිරි උත්සව'), value: stats?.upcomingEvents ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          {t('Live MongoDB Statistics', 'සජීවී දත්ත සංඛ්‍යාලේඛන')}
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          {t('Administrator Overview', 'පරිපාලක දළ විශ්ලේෂණය')}
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-stone-200 rounded-xl p-5 space-y-1.5"
          >
            <p className="text-xs text-stone-500">{s.label}</p>
            <p className="font-mono tabular-nums text-3xl font-bold text-[#6B1426]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Student Approvals */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif-display text-2xl font-bold text-stone-900">
              {t('Pending Student Approvals', 'අනුමැතිය අපේක්ෂිත සිසුන්')} (
              {stats?.pendingStudents ?? 0})
            </h2>
            <p className="text-xs text-stone-500">
              {t(
                'Verify and approve newly registered students so they can access their class dashboard.',
                'අලුතින් ලියාපදිංචි වූ සිසුන්ගේ ශ්‍රේණිය සහ පන්තිය පරීක්ෂා කර අනුමත කරන්න.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('students')}
            className="text-xs font-semibold text-[#6B1426] hover:underline cursor-pointer"
          >
            {t('Manage All Students →', 'සියලුම සිසුන් →')}
          </button>
        </div>

        {pendingStudents.length === 0 ? (
          <p className="text-xs text-stone-500 py-4">
            {t('No pending student registrations at the moment.', 'දැනට අනුමැතිය අපේක්ෂිත සිසුන් නොමැත.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 px-3">{t('Name', 'නම')}</th>
                  <th className="py-2.5 px-3">{t('Student ID', 'ශිෂ්‍ය අංකය')}</th>
                  <th className="py-2.5 px-3">{t('Grade & Class', 'ශ්‍රේණිය සහ පන්තිය')}</th>
                  <th className="py-2.5 px-3">{t('Phone', 'දුරකථන')}</th>
                  <th className="py-2.5 px-3 text-right">{t('Actions', 'ක්‍රියාමාර්ග')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {pendingStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-semibold text-stone-900">{st.name}</td>
                    <td className="py-3 px-3 font-mono tabular-nums">{st.studentId}</td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-[#6B1426]">
                      Grade {st.grade} · {st.class} {st.stream ? `(${st.stream})` : ''}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">{st.phone}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onApproveStudent(st._id, 'APPROVED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApproveStudent(st._id, 'REJECTED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded font-semibold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. Admin Student Management View ──
export function AdminStudentsView({
  students,
  classes,
  onRefresh,
  notify,
}: {
  students: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    studentId: '',
    phone: '',
    grade: 10,
    class: '10-A',
    stream: '',
    status: 'APPROVED',
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.grade));

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      studentId: '',
      phone: '',
      grade: 10,
      class: '10-A',
      stream: '',
      status: 'APPROVED',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/admin/students/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        notify('Student profile updated successfully.');
      } else {
        await apiFetch('/api/admin/students', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        notify('Student added successfully.');
      }
      resetForm();
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      notify(`Student status updated to ${status}.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      notify('Student record deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const startEdit = (st: any) => {
    setEditingId(st._id);
    setForm({
      name: st.name,
      studentId: st.studentId,
      phone: st.phone,
      grade: Number(st.grade),
      class: st.class,
      stream: st.stream || '',
      status: st.status,
    });
  };

  const filteredStudents = students.filter((s) => {
    if (filterGrade !== 'ALL' && Number(s.grade) !== Number(filterGrade)) return false;
    if (filterClass !== 'ALL' && s.class !== filterClass) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        String(s.name).toLowerCase().includes(q) ||
        String(s.studentId).toLowerCase().includes(q) ||
        String(s.phone).toLowerCase().includes(q) ||
        String(s.class).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          {t('Student Directory & Approvals', 'ශිෂ්‍ය කළමනාකරණය')}
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          {t('Manage Students (Grades 6–13)', 'සිසුන් කළමනාකරණය (6–13 ශ්‍රේණි)')}
        </h1>
      </div>

      {/* Add / Edit Student Form */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif-display text-xl font-bold text-stone-900">
            {editingId
              ? t('Edit Student / Reassign Class', 'ශිෂ්‍ය තොරතුරු / පන්තිය වෙනස් කරන්න')
              : t('Add New Student', 'නව ශිෂ්‍යයෙකු එක් කරන්න')}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Kamal Perera"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Student ID</label>
            <input
              type="text"
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="STU001"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0712345678"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Grade (6–13)</label>
            <select
              value={form.grade}
              onChange={(e) => {
                const g = Number(e.target.value);
                const firstCls = classes.find((c) => Number(c.grade) === g);
                setForm({
                  ...form,
                  grade: g,
                  class: firstCls ? firstCls.name : `${g}-A`,
                  stream: g >= 12 ? form.stream : '',
                });
              }}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Assigned Class
            </label>
            {gradeClasses.length > 0 ? (
              <select
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
              >
                {gradeClasses.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                placeholder={`${form.grade}-A`}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Senior Stream (G12–13)
            </label>
            <select
              value={form.stream}
              disabled={form.grade < 12}
              onChange={(e) => setForm({ ...form, stream: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg disabled:opacity-50"
            >
              <option value="">None</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Save Student Changes' : 'Add Student'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search & Filters */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
          >
            <option value="ALL">All Grades (6–13)</option>
            {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
            <option value="DEACTIVATED">DEACTIVATED</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-8">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Grade & Class</th>
                  <th className="py-2.5 px-3">Stream</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold">
                      {st.studentId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900">{st.name}</td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-[#6B1426]">
                      Grade {st.grade} · {st.class}
                    </td>
                    <td className="py-3 px-3 text-stone-600">{st.stream || '—'}</td>
                    <td className="py-3 px-3 font-mono tabular-nums">{st.phone}</td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      <span
                        className={
                          st.status === 'APPROVED'
                            ? 'text-emerald-700'
                            : st.status === 'PENDING'
                            ? 'text-amber-700'
                            : 'text-red-600'
                        }
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {st.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st._id, 'APPROVED')}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-700 text-white rounded cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {st.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st._id, 'DEACTIVATED')}
                          className="px-2 py-1 text-[11px] font-medium border border-stone-300 text-stone-700 rounded cursor-pointer"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEdit(st)}
                        className="p-1 text-stone-600 hover:text-[#6B1426] cursor-pointer"
                        title="Edit / Move Class"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(st._id)}
                        className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Admin Grades & Classes Management View ──
export function AdminGradesClassesView({
  grades,
  classes,
  onRefresh,
  notify,
}: {
  grades: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [gradeNum, setGradeNum] = useState(10);
  const [className, setClassName] = useState('');
  const [stream, setStream] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassId) {
        await apiFetch(`/api/admin/classes/${editingClassId}`, {
          method: 'PUT',
          body: JSON.stringify({
            grade: Number(gradeNum),
            name: className.trim().toUpperCase(),
            stream,
            classTeacher,
          }),
        });
        notify('Class updated and cascaded across records.');
      } else {
        await apiFetch('/api/admin/classes', {
          method: 'POST',
          body: JSON.stringify({
            grade: Number(gradeNum),
            name: className.trim().toUpperCase(),
            stream,
            classTeacher,
          }),
        });
        notify('New class created.');
      }
      setEditingClassId(null);
      setClassName('');
      setStream('');
      setClassTeacher('');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const toggleClassActive = async (cls: any) => {
    try {
      await apiFetch(`/api/admin/classes/${cls._id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !cls.active }),
      });
      notify(`Class ${cls.name} ${!cls.active ? 'activated' : 'deactivated'}.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await apiFetch(`/api/admin/classes/${id}`, { method: 'DELETE' });
      notify('Class deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Grades 6–13 & Class Configuration
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Grade & Class Management
        </h1>
      </div>

      <form
        onSubmit={handleSaveClass}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-serif-display text-xl font-bold text-stone-900">
          {editingClassId ? 'Rename / Edit Class' : 'Create New Class'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Grade</label>
            <select
              value={gradeNum}
              onChange={(e) => setGradeNum(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Class Name (e.g. 10-A)
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder={`${gradeNum}-A`}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Stream (Grade 12–13)
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="">General</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Class Teacher (Optional)
            </label>
            <input
              type="text"
              value={classTeacher}
              onChange={(e) => setClassTeacher(e.target.value)}
              placeholder="Mr. / Mrs. ..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
            >
              {editingClassId ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => {
          const gClasses = classes.filter((c) => Number(c.grade) === g);
          return (
            <div key={g} className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-serif-display text-xl font-bold text-[#6B1426]">Grade {g}</h3>
                <span className="text-xs font-mono tabular-nums text-stone-500">
                  {gClasses.length} classes
                </span>
              </div>
              {gClasses.length === 0 ? (
                <p className="text-xs text-stone-400">No classes created for Grade {g}.</p>
              ) : (
                <div className="divide-y divide-stone-100 text-xs">
                  {gClasses.map((cls) => (
                    <div key={cls._id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-stone-900">
                          {cls.name}
                        </span>
                        {cls.stream && <span className="text-stone-500">· {cls.stream}</span>}
                        {!cls.active && (
                          <span className="text-red-600 font-semibold">(Deactivated)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassId(cls._id);
                            setGradeNum(cls.grade);
                            setClassName(cls.name);
                            setStream(cls.stream || '');
                            setClassTeacher(cls.classTeacher || '');
                          }}
                          className="p-1 text-stone-600 hover:text-[#6B1426] cursor-pointer"
                          title="Rename / Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleClassActive(cls)}
                          className="p-1 text-stone-600 hover:text-amber-700 cursor-pointer"
                          title={cls.active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteClass(cls._id)}
                          className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
