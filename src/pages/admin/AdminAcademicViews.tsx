import React, { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { apiFetch } from '../../context/AppContext.tsx';

// ── 1. Admin Announcements Management (/admin/announcements) ──
export function AdminAnnouncementsView({
  announcements,
  classes,
  onRefresh,
  notify,
}: {
  announcements: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    sinhalaTitle: '',
    description: '',
    sinhalaDescription: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'NORMAL',
    targetType: 'ALL',
    targetGrade: 10,
    targetClass: '10-A',
    targetStream: 'Science',
    status: 'PUBLISHED',
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.targetGrade));

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      sinhalaTitle: '',
      description: '',
      sinhalaDescription: '',
      image: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'NORMAL',
      targetType: 'ALL',
      targetGrade: 10,
      targetClass: '10-A',
      targetStream: 'Science',
      status: 'PUBLISHED',
    });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        targetGrade:
          form.targetType === 'GRADE' ||
          form.targetType === 'CLASS' ||
          form.targetType === 'STREAM'
            ? Number(form.targetGrade)
            : null,
        targetClass: form.targetType === 'CLASS' ? form.targetClass : '',
        targetStream: form.targetType === 'STREAM' ? form.targetStream : '',
      };

      if (editingId) {
        await apiFetch(`/api/admin/announcements/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('Announcement updated.');
      } else {
        await apiFetch('/api/admin/announcements', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('Announcement created.');
      }
      resetForm();
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const togglePublish = async (item: any) => {
    const nextStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await apiFetch(`/api/admin/announcements/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(`Announcement ${nextStatus === 'PUBLISHED' ? 'published' : 'unpublished'}.`);
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      notify('Announcement deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Targeted Noticeboard System
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Announcement Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif-display text-xl font-bold text-stone-900">
            {editingId ? 'Edit Announcement' : 'Create Announcement'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Title (English)
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Grade 10 Mathematics Test"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinhala Title (සිංහල මාතෘකාව)
            </label>
            <input
              type="text"
              value={form.sinhalaTitle}
              onChange={(e) => setForm({ ...form, sinhalaTitle: e.target.value })}
              placeholder="10 ශ්‍රේණිය ගණිත පරීක්ෂණය"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description (English)
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinhala Description (සිංහල විස්තරය)
            </label>
            <textarea
              rows={3}
              value={form.sinhalaDescription}
              onChange={(e) => setForm({ ...form, sinhalaDescription: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target Audience</label>
            <select
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="ALL">Everyone (Public + Students)</option>
              <option value="ALL_STUDENTS">All Students (Grades 6–13)</option>
              <option value="GRADE">Specific Grade</option>
              <option value="CLASS">Specific Class</option>
              <option value="STREAM">Specific Senior Stream</option>
            </select>
          </div>

          {(form.targetType === 'GRADE' ||
            form.targetType === 'CLASS' ||
            form.targetType === 'STREAM') && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Grade
              </label>
              <select
                value={form.targetGrade}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  const firstCls = classes.find((c) => Number(c.grade) === g);
                  setForm({
                    ...form,
                    targetGrade: g,
                    targetClass: firstCls ? firstCls.name : `${g}-A`,
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
          )}

          {form.targetType === 'CLASS' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Class
              </label>
              {gradeClasses.length > 0 ? (
                <select
                  value={form.targetClass}
                  onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
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
                  value={form.targetClass}
                  onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
                />
              )}
            </div>
          )}

          {form.targetType === 'STREAM' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Stream
              </label>
              <select
                value={form.targetStream}
                onChange={(e) => setForm({ ...form, targetStream: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
              >
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="IMPORTANT">IMPORTANT</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
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
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">UNPUBLISHED (DRAFT)</option>
              <option value="SCHEDULED">SCHEDULED</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3 text-xs">
            <label className="font-semibold text-stone-700">Optional Image:</label>
            <input type="file" accept="image/*" onChange={handleImageFile} className="text-xs" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg cursor-pointer"
          >
            {editingId ? 'Update Announcement' : 'Publish Announcement'}
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-serif-display text-xl font-bold text-stone-900">
          All Announcements ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">No data available.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-stone-500">
                    <span>{a.date}</span>
                    <span>·</span>
                    <span className="font-sans font-semibold text-[#6B1426]">
                      {a.targetType === 'CLASS'
                        ? `Grade ${a.targetGrade} · Class ${a.targetClass}`
                        : a.targetType === 'GRADE'
                        ? `Grade ${a.targetGrade}`
                        : a.targetType === 'STREAM'
                        ? `Grade ${a.targetGrade} · ${a.targetStream}`
                        : a.targetType}
                    </span>
                    <span>·</span>
                    <span>{a.status}</span>
                  </div>
                  <p className="font-serif-display text-lg font-bold text-stone-900">
                    {a.title} {a.sinhalaTitle ? `/ ${a.sinhalaTitle}` : ''}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2">{a.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePublish(a)}
                    className="px-2.5 py-1 text-xs border border-stone-300 rounded hover:bg-stone-50 cursor-pointer"
                  >
                    {a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(a._id);
                      setForm({
                        title: a.title,
                        sinhalaTitle: a.sinhalaTitle || '',
                        description: a.description,
                        sinhalaDescription: a.sinhalaDescription || '',
                        image: a.image || '',
                        date: a.date,
                        priority: a.priority || 'NORMAL',
                        targetType: a.targetType || 'ALL',
                        targetGrade: a.targetGrade || 10,
                        targetClass: a.targetClass || '10-A',
                        targetStream: a.targetStream || 'Science',
                        status: a.status || 'PUBLISHED',
                      });
                    }}
                    className="p-1.5 text-stone-600 hover:text-[#6B1426] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a._id)}
                    className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. Separate Timetable Management (/admin/timetable) ──
export function AdminTimetableView({
  timetable,
  classes,
  onRefresh,
  notify,
}: {
  timetable: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [filterGrade, setFilterGrade] = useState<number>(10);
  const [filterClass, setFilterClass] = useState<string>('10-A');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    grade: 10,
    class: '10-A',
    day: 'Monday',
    period: 1,
    startTime: '07:50',
    endTime: '08:30',
    subject: '',
    sinhalaSubject: '',
    teacher: '',
    room: '',
  });

  const formClasses = classes.filter((c) => Number(c.grade) === Number(form.grade));
  const filterClasses = classes.filter((c) => Number(c.grade) === Number(filterGrade));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiFetch(`/api/admin/timetable/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        notify('Timetable entry updated.');
      } else {
        await apiFetch('/api/admin/timetable', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        notify(`Timetable period added for ${form.class}.`);
      }
      setEditingId(null);
      setForm((prev) => ({
        ...prev,
        period: prev.period < 8 ? prev.period + 1 : 1,
        subject: '',
        sinhalaSubject: '',
      }));
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/timetable/${id}`, { method: 'DELETE' });
      notify('Timetable period deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const filteredEntries = timetable.filter(
    (t) =>
      Number(t.grade) === Number(filterGrade) &&
      String(t.class).toUpperCase() === String(filterClass).toUpperCase()
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Class Schedule Engine
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Timetable Management System
        </h1>
      </div>

      {/* Add / Edit Timetable Entry */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-serif-display text-xl font-bold text-stone-900">
          {editingId ? 'Edit Timetable Period' : 'Add Timetable Period'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Grade</label>
            <select
              value={form.grade}
              onChange={(e) => {
                const g = Number(e.target.value);
                const firstCls = classes.find((c) => Number(c.grade) === g);
                const clsName = firstCls ? firstCls.name : `${g}-A`;
                setForm({ ...form, grade: g, class: clsName });
                setFilterGrade(g);
                setFilterClass(clsName);
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">Class</label>
            {formClasses.length > 0 ? (
              <select
                value={form.class}
                onChange={(e) => {
                  setForm({ ...form, class: e.target.value });
                  setFilterClass(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
              >
                {formClasses.map((c) => (
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
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Day</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Period (1–8)</label>
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Mathematics"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinhala Subject (Optional)
            </label>
            <input
              type="text"
              value={form.sinhalaSubject}
              onChange={(e) => setForm({ ...form, sinhalaSubject: e.target.value })}
              placeholder="ගණිතය"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Teacher</label>
            <input
              type="text"
              required
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              placeholder="Mr. Bandara"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Room</label>
            <input
              type="text"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="10-A / Lab 1"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg cursor-pointer"
          >
            {editingId ? 'Update Timetable Entry' : 'Add Period to Timetable'}
          </button>
        </div>
      </form>

      {/* Filter & View Class Timetable */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            Class {filterClass} Timetable ({filteredEntries.length} periods)
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={filterGrade}
              onChange={(e) => {
                const g = Number(e.target.value);
                setFilterGrade(g);
                const first = classes.find((c) => Number(c.grade) === g);
                setFilterClass(first ? first.name : `${g}-A`);
              }}
              className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              {filterClasses.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-8">
            No timetable entries added for {filterClass} yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-semibold">{entry.day}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#6B1426] font-semibold">
                      Period {entry.period}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">
                      {entry.subject} {entry.sinhalaSubject ? `(${entry.sinhalaSubject})` : ''}
                    </td>
                    <td className="py-2.5 px-3">{entry.teacher}</td>
                    <td className="py-2.5 px-3 font-mono">{entry.room || '—'}</td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(entry._id);
                          setForm({
                            grade: entry.grade,
                            class: entry.class,
                            day: entry.day,
                            period: entry.period,
                            startTime: entry.startTime || '',
                            endTime: entry.endTime || '',
                            subject: entry.subject,
                            sinhalaSubject: entry.sinhalaSubject || '',
                            teacher: entry.teacher,
                            room: entry.room || '',
                          });
                        }}
                        className="p-1 text-stone-600 hover:text-[#6B1426] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry._id)}
                        className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
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

// ── 3. Admin Subjects Management ──
export function AdminSubjectsView({
  subjects,
  classes,
  onRefresh,
  notify,
}: {
  subjects: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    sinhalaName: '',
    grade: 10,
    class: '10-A',
    teacher: '',
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.grade));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/subjects', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify('Subject created.');
      setForm({ ...form, name: '', sinhalaName: '', teacher: '' });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      notify('Subject deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Academic Curriculum
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Subject Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-serif-display text-xl font-bold text-stone-900">Assign Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Mathematics"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Sinhala Name</label>
            <input
              type="text"
              value={form.sinhalaName}
              onChange={(e) => setForm({ ...form, sinhalaName: e.target.value })}
              placeholder="ගණිතය"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Grade</label>
            <select
              value={form.grade}
              onChange={(e) => {
                const g = Number(e.target.value);
                const first = classes.find((c) => Number(c.grade) === g);
                setForm({ ...form, grade: g, class: first ? first.name : `${g}-A` });
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">Class</label>
            <select
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="ALL">All Classes in Grade {form.grade}</option>
              {gradeClasses.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Teacher</label>
            <input
              type="text"
              required
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              placeholder="Mrs. Perera"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
          >
            Add Subject
          </button>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        {subjects.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Sinhala Name</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subjects.map((s) => (
                  <tr key={s._id}>
                    <td className="py-2.5 px-3 font-mono">Grade {s.grade}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#6B1426]">
                      {s.class}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{s.name}</td>
                    <td className="py-2.5 px-3">{s.sinhalaName || '—'}</td>
                    <td className="py-2.5 px-3">{s.teacher}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s._id)}
                        className="p-1 text-red-600 cursor-pointer"
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

// ── 4. Admin Notices Management ──
export function AdminNoticesView({
  notices,
  classes,
  onRefresh,
  notify,
}: {
  notices: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    sinhalaTitle: '',
    description: '',
    sinhalaDescription: '',
    targetType: 'CLASS',
    targetGrade: 9,
    targetClass: '9-B',
    date: new Date().toISOString().split('T')[0],
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.targetGrade));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/notices', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify('Notice created.');
      setForm({ ...form, title: '', sinhalaTitle: '', description: '', sinhalaDescription: '' });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
      notify('Notice deleted.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Student Notice System
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Class & Grade Notices
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Sinhala Title</label>
            <input
              type="text"
              value={form.sinhalaTitle}
              onChange={(e) => setForm({ ...form, sinhalaTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinhala Description
            </label>
            <textarea
              rows={2}
              value={form.sinhalaDescription}
              onChange={(e) => setForm({ ...form, sinhalaDescription: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notice Type</label>
            <select
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="ALL_STUDENTS">General Notice (All Students)</option>
              <option value="GRADE">Grade Notice</option>
              <option value="CLASS">Class Notice</option>
            </select>
          </div>
          {(form.targetType === 'GRADE' || form.targetType === 'CLASS') && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Grade</label>
              <select
                value={form.targetGrade}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  const first = classes.find((c) => Number(c.grade) === g);
                  setForm({
                    ...form,
                    targetGrade: g,
                    targetClass: first ? first.name : `${g}-A`,
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
          )}
          {form.targetType === 'CLASS' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Class</label>
              <select
                value={form.targetClass}
                onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
              >
                {gradeClasses.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
            >
              Post Notice
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
        {notices.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="py-3 border-b border-stone-100 last:border-0 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-mono text-[#6B1426] font-semibold">
                  {n.date} ·{' '}
                  {n.targetType === 'CLASS'
                    ? `Class ${n.targetClass}`
                    : n.targetType === 'GRADE'
                    ? `Grade ${n.targetGrade}`
                    : 'All Students'}
                </p>
                <p className="font-semibold text-sm text-stone-900">{n.title}</p>
                <p className="text-xs text-stone-600">{n.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(n._id)}
                className="p-1.5 text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
