import React, { useState, useEffect } from 'react';
import { Trash2, Save, Lock } from 'lucide-react';
import { apiFetch } from '../../context/AppContext.tsx';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 1. Admin News Management ──
export function AdminNewsView({
  news,
  onRefresh,
  notify,
}: {
  news: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    sinhalaTitle: '',
    description: '',
    sinhalaDescription: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    category: 'School News',
    status: 'PUBLISHED',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/news', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify('News article published.');
      setForm({
        ...form,
        title: '',
        sinhalaTitle: '',
        description: '',
        sinhalaDescription: '',
        image: '',
      });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          School Press
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          News Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
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
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sinhala Title
            </label>
            <input
              type="text"
              value={form.sinhalaTitle}
              onChange={(e) => setForm({ ...form, sinhalaTitle: e.target.value })}
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
              Sinhala Description
            </label>
            <textarea
              rows={3}
              value={form.sinhalaDescription}
              onChange={(e) => setForm({ ...form, sinhalaDescription: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="School News">School News</option>
              <option value="Academic News">Academic News</option>
              <option value="Sports">Sports</option>
              <option value="Competitions">Competitions</option>
              <option value="Activities">Activities</option>
              <option value="Achievements">Achievements</option>
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">Image Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setForm({ ...form, image: await readFileAsDataUrl(f) });
              }}
              className="text-xs pt-1.5"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
            >
              Publish News
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
        {news.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          news.map((item) => (
            <div
              key={item._id}
              className="py-3 border-b border-stone-100 last:border-0 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-[#6B1426] font-semibold">
                  {item.category} · {item.date}
                </p>
                <p className="font-semibold text-sm text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-600 line-clamp-1">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await apiFetch(`/api/admin/news/${item._id}`, { method: 'DELETE' });
                  notify('News deleted.');
                  await onRefresh();
                }}
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

// ── 2. Admin Events Management ──
export function AdminEventsView({
  events,
  classes,
  onRefresh,
  notify,
}: {
  events: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    sinhalaTitle: '',
    description: '',
    sinhalaDescription: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:30 AM',
    location: 'Main College Hall',
    targetType: 'ALL',
    targetGrade: 10,
    targetClass: '10-A',
    status: 'PUBLISHED',
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.targetGrade));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify('Event scheduled.');
      setForm({ ...form, title: '', sinhalaTitle: '', description: '', sinhalaDescription: '' });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          School Calendar
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Events Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Event Title</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Time</label>
            <input
              type="text"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target</label>
            <select
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="ALL">Public & All Students</option>
              <option value="GRADE">Specific Grade</option>
              <option value="CLASS">Specific Class</option>
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
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
          >
            Create Event
          </button>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
        {events.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev._id}
              className="py-3 border-b border-stone-100 last:border-0 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-mono text-[#6B1426] font-semibold">
                  {ev.date} · {ev.time} · {ev.location}
                </p>
                <p className="font-semibold text-sm text-stone-900">{ev.title}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await apiFetch(`/api/admin/events/${ev._id}`, { method: 'DELETE' });
                  notify('Event deleted.');
                  await onRefresh();
                }}
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

// ── 3. Admin Gallery Management ──
export function AdminGalleryView({
  images,
  onRefresh,
  notify,
}: {
  images: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    sinhalaTitle: '',
    category: 'School Events',
    imageUrl: '',
    caption: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      notify('Please select an image file or provide an image URL.', true);
      return;
    }
    try {
      await apiFetch('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify('Photograph uploaded to gallery.');
      setForm({ ...form, title: '', sinhalaTitle: '', imageUrl: '', caption: '' });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Media Archive
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Gallery & Albums Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Photo Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Album Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="School Events">School Events</option>
              <option value="Sports">Sports</option>
              <option value="Academic">Academic</option>
              <option value="Clubs">Clubs</option>
              <option value="Achievements">Achievements</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Upload Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setForm({ ...form, imageUrl: await readFileAsDataUrl(f) });
              }}
              className="text-xs pt-1.5"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
            >
              Upload to Gallery
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6">
        {images.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img._id}
                className="border border-stone-200 rounded-lg overflow-hidden flex flex-col justify-between"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-4/3 object-cover"
                />
                <div className="p-2.5 flex items-center justify-between text-xs">
                  <span className="truncate font-semibold">{img.title}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch(`/api/admin/gallery/${img._id}`, { method: 'DELETE' });
                      notify('Image removed.');
                      await onRefresh();
                    }}
                    className="text-red-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

// ── 4. Admin Study Materials Management ──
export function AdminMaterialsView({
  materials,
  classes,
  onRefresh,
  notify,
}: {
  materials: any[];
  classes: any[];
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    grade: 10,
    class: '10-A',
    subject: '',
    fileUrl: '',
    fileName: '',
    fileType: 'PDF',
    uploadedDate: new Date().toISOString().split('T')[0],
  });

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(form.grade));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fileUrl) {
      notify('Please upload a file or provide a resource URL.', true);
      return;
    }
    try {
      await apiFetch('/api/admin/materials', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      notify(`Study material uploaded for ${form.class}.`);
      setForm({ ...form, title: '', description: '', subject: '', fileUrl: '', fileName: '' });
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Class Learning Resources
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          Study Materials Management
        </h1>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Material Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Term 1 Past Paper"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">Target Class</label>
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
            <label className="block text-xs font-semibold text-stone-700 mb-1">File Type</label>
            <select
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            >
              <option value="PDF">PDF Document</option>
              <option value="DOCUMENT">Word / Notes</option>
              <option value="IMAGE">Worksheet Image</option>
              <option value="LINK">External Resource URL</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Upload PDF / Document / Image
            </label>
            <input
              type="file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const dataUrl = await readFileAsDataUrl(f);
                  setForm({ ...form, fileUrl: dataUrl, fileName: f.name });
                }
              }}
              className="text-xs pt-1"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 text-xs font-semibold text-white bg-[#6B1426] rounded-lg cursor-pointer"
          >
            Upload Material
          </button>
        </div>
      </form>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
        {materials.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">No data available.</p>
        ) : (
          materials.map((m) => (
            <div
              key={m._id}
              className="py-3 border-b border-stone-100 last:border-0 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-mono text-[#6B1426] font-semibold">
                  Grade {m.grade} · {m.class} · {m.subject} ({m.fileType})
                </p>
                <p className="font-semibold text-sm text-stone-900">{m.title}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await apiFetch(`/api/admin/materials/${m._id}`, { method: 'DELETE' });
                  notify('Material deleted.');
                  await onRefresh();
                }}
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

// ── 5. Admin Settings & About Page Editor (/admin/settings) ──
export function AdminSettingsView({
  settings,
  onRefresh,
  notify,
}: {
  settings: any;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isErr?: boolean) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({ ...settings });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      notify('Official school settings and About content saved.');
      await onRefresh();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/password', {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      });
      notify('Administrator password updated and hashed in MongoDB.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const bilingualSections = [
    { keyEn: 'aboutEn', keySi: 'aboutSi', label: 'About the School' },
    { keyEn: 'historyEn', keySi: 'historySi', label: 'School History' },
    { keyEn: 'visionEn', keySi: 'visionSi', label: 'Vision' },
    { keyEn: 'missionEn', keySi: 'missionSi', label: 'Mission' },
    { keyEn: 'academicLifeEn', keySi: 'academicLifeSi', label: 'Academic Life' },
    { keyEn: 'studentActivitiesEn', keySi: 'studentActivitiesSi', label: 'Student Activities' },
    { keyEn: 'clubsSocietiesEn', keySi: 'clubsSocietiesSi', label: 'Clubs & Societies' },
    { keyEn: 'sportsEn', keySi: 'sportsSi', label: 'Sports' },
    { keyEn: 'achievementsEn', keySi: 'achievementsSi', label: 'Achievements' },
    { keyEn: 'schoolCommunityEn', keySi: 'schoolCommunitySi', label: 'School Community' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B1426]">
          Institutional Configuration
        </p>
        <h1 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
          School Settings, About Content & Security
        </h1>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-6"
      >
        <h2 className="font-serif-display text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
          1. Identity & Official Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              School Name (English)
            </label>
            <input
              type="text"
              value={form.schoolName || ''}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              School Name (සිංහල)
            </label>
            <input
              type="text"
              value={form.schoolNameSi || ''}
              onChange={(e) => setForm({ ...form, schoolNameSi: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Welcome Message (English)
            </label>
            <textarea
              rows={2}
              value={form.welcomeMessageEn || ''}
              onChange={(e) => setForm({ ...form, welcomeMessageEn: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Welcome Message (සිංහල)
            </label>
            <textarea
              rows={2}
              value={form.welcomeMessageSi || ''}
              onChange={(e) => setForm({ ...form, welcomeMessageSi: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Official Telephone
            </label>
            <input
              type="text"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Address (English)
            </label>
            <input
              type="text"
              value={form.addressEn || ''}
              onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Address (සිංහල)
            </label>
            <input
              type="text"
              value={form.addressSi || ''}
              onChange={(e) => setForm({ ...form, addressSi: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Google Maps URL
            </label>
            <input
              type="text"
              value={form.googleMapsUrl || ''}
              onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Facebook Page URL
            </label>
            <input
              type="text"
              value={form.facebookUrl || ''}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>

        <h2 className="font-serif-display text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 pt-4">
          2. About Page Sections (English & සිංහල)
        </h2>

        <div className="space-y-4">
          {bilingualSections.map((sec) => (
            <div
              key={sec.keyEn}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[#FAF8F5] border border-stone-200"
            >
              <div>
                <label className="block text-xs font-semibold text-[#6B1426] mb-1">
                  {sec.label} (English)
                </label>
                <textarea
                  rows={3}
                  value={form[sec.keyEn] || ''}
                  onChange={(e) => setForm({ ...form, [sec.keyEn]: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B1426] mb-1">
                  {sec.label} (සිංහල)
                </label>
                <textarea
                  rows={3}
                  value={form[sec.keySi] || ''}
                  onChange={(e) => setForm({ ...form, [sec.keySi]: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All School Settings</span>
          </button>
        </div>
      </form>

      {/* Change Admin Password */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 max-w-xl"
      >
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Lock className="w-4 h-4 text-[#6B1426]" />
          <h2 className="font-serif-display text-xl font-bold text-stone-900">
            Change Administrator Password
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-stone-300 rounded-lg"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-white bg-[#3D0A14] rounded-lg cursor-pointer"
        >
          Update & Hash Password
        </button>
      </form>
    </div>
  );
}
