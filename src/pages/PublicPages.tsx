import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Phone, Mail, ExternalLink, Lock } from 'lucide-react';
import { useApp, apiFetch } from '../context/AppContext.tsx';

// ── 1. Public Announcements Page (/announcements) ──
export function AnnouncementsPage() {
  const { t, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/public/announcements')
      .then((res) => setAnnouncements(res.announcements || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
            {t('Official Noticeboard', 'නිල නිවේදන පුවරුව')}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            {t('Public School Announcements', 'පොදු විද්‍යාලයීය නිවේදන')}
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {t(
              'Showing general announcements for everyone. For Grade or Class-specific announcements, please sign in to the Student Portal.',
              'මෙහි දැක්වෙන්නේ පොදු නිවේදන පමණි. ඔබේ ශ්‍රේණියට හෝ පන්තියට අදාළ නිවේදන සඳහා ශිෂ්‍ය ද්වාරයට පිවිසෙන්න.'
            )}
          </p>
        </div>
        {user?.role === 'STUDENT' ? (
          <Link
            to="/student/dashboard"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] rounded-lg whitespace-nowrap"
          >
            {t('View Class Announcements', 'පන්ති නිවේදන බලන්න')} ({user.class})
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] rounded-lg whitespace-nowrap"
          >
            {t('Student Login for Class Notices', 'පන්ති නිවේදන සඳහා පිවිසෙන්න')}
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-stone-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-base font-semibold text-stone-800">
            {t('No data available.', 'දත්ත නොමැත.')}
          </p>
          <p className="text-sm text-stone-500">
            {t(
              'No public announcements have been published yet.',
              'තවමත් පොදු නිවේදන ප්‍රකාශයට පත් කර නොමැත.'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <article
              key={item._id}
              className="bg-white border border-stone-200 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                <span>{item.date}</span>
                <span aria-hidden="true">·</span>
                <span className="font-sans font-semibold text-[#6B1426]">{item.priority}</span>
              </div>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                {t(item.title, item.sinhalaTitle)}
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {t(item.description, item.sinhalaDescription)}
              </p>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="mt-3 max-h-80 rounded-lg object-cover border border-stone-200"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. Public Timetable Information Page (/timetable) ──
export function PublicTimetablePage() {
  const { t, user, grades, classes } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
          {t('Class Schedules · Grades 6–13', 'පන්ති කාලසටහන් · 6–13 ශ්‍රේණි')}
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('Class-Specific Timetable System', 'පන්ති අනුව වෙන්වූ කාලසටහන් පද්ධතිය')}
        </h1>
        <p className="text-sm text-stone-600 mt-2 max-w-2xl">
          {t(
            'For security and personalization, each student receives the official timetable assigned strictly to their approved Grade and Class (e.g., Grade 10-A, Grade 8-B, Grade 12 Science).',
            'ආරක්ෂාව සහ පුද්ගලීකරණය සඳහා සෑම සිසුවෙකුටම තමන්ගේ අනුමත ශ්‍රේණිය සහ පන්තියට අදාළ නිල කාලසටහන පමණක් ලබා දේ.'
          )}
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1426]">
            <Lock className="w-4 h-4" />
            <span>{t('Authorized Student Access', 'අනුමත ශිෂ්‍ය පිවිසුම')}</span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-stone-900">
            {user?.role === 'STUDENT'
              ? `${t('View Your Timetable for Grade', 'ඔබේ කාලසටහන බලන්න: ශ්‍රේණිය')} ${user.class}`
              : t(
                  'Log in to View Your Class Timetable',
                  'ඔබේ පන්ති කාලසටහන බැලීමට පිවිසෙන්න'
                )}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {t(
              'Timetables are organized Monday through Friday by period, subject, teacher, and classroom.',
              'කාලසටහන් සඳුදා සිට සිකුරාදා දක්වා කාලඡේදය, විෂය, ගුරුවරයා සහ පන්ති කාමරය අනුව සකසා ඇත.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'STUDENT' ? (
            <Link
              to="/student/timetable"
              className="px-5 py-3 text-sm font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg whitespace-nowrap"
            >
              {t('Open My Timetable', 'මගේ කාලසටහන විවෘත කරන්න')} ({user.class})
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-3 text-sm font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg whitespace-nowrap"
              >
                {t('Student Login', 'ශිෂ්‍ය පිවිසුම')}
              </Link>
              <Link
                to="/register"
                className="px-5 py-3 text-sm font-semibold text-[#6B1426] border border-[#6B1426] rounded-lg whitespace-nowrap"
              >
                {t('Register Account', 'ලියාපදිංචි වන්න')}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Overview of Active Grades & Classes */}
      <div className="space-y-4">
        <h3 className="font-serif-display text-2xl font-bold text-stone-900">
          {t('Configured Grades & Classes', 'ක්‍රියාත්මක ශ්‍රේණි සහ පන්ති')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {grades.map((g) => {
            const cls = classes.filter((c) => Number(c.grade) === Number(g.gradeNumber));
            return (
              <div
                key={g._id}
                className="bg-white border border-stone-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif-display text-lg font-bold text-[#6B1426]">
                    {t(g.labelEn, g.labelSi)}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-stone-500">
                    {cls.length} {t('classes', 'පන්ති')}
                  </span>
                </div>
                <p className="text-xs font-mono tabular-nums text-stone-600">
                  {cls.length > 0
                    ? cls.map((c) => c.name).join(' · ')
                    : t('No classes', 'පන්ති නොමැත')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 3. Public Grades Page (/grades) ──
export function GradesPage() {
  const { t, grades, classes } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
          {t('Academic Organization', 'අධ්‍යයන ව්‍යුහය')}
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('Grades 6–13 & Senior Streams', '6–13 ශ්‍රේණි සහ උසස් පෙළ අංශ')}
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          {t(
            'A/Galenbindunuwewa Central College serves students from Grade 6 to Grade 13. Classes are dynamically managed by the school administration.',
            'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය 6 ශ්‍රේණියේ සිට 13 ශ්‍රේණිය දක්වා සිසුන් සඳහා අධ්‍යාපනය ලබා දෙයි.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grades.map((g) => {
          const gradeClasses = classes.filter((c) => Number(c.grade) === Number(g.gradeNumber));
          return (
            <div
              key={g._id}
              className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-3">
                <div>
                  <h2 className="font-serif-display text-2xl font-bold text-[#6B1426]">
                    {t(g.labelEn, g.labelSi)}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {g.isSenior
                      ? t(
                          'Senior Secondary · G.C.E. Advanced Level (Science, Commerce, Arts, Technology)',
                          'උසස් පෙළ අංශය (විද්‍යා, වාණිජ, කලා, තාක්ෂණවේදය)'
                        )
                      : g.gradeNumber >= 10
                      ? t('G.C.E. Ordinary Level Division', 'අ.පො.ස. සාමාන්‍ය පෙළ අංශය')
                      : t('Junior Secondary Division', 'කනිෂ්ඨ ද්විතීයික අංශය')}
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums text-stone-500">
                  {gradeClasses.length} {t('Classes', 'පන්ති')}
                </span>
              </div>

              {gradeClasses.length === 0 ? (
                <p className="text-xs text-stone-400 italic">
                  {t('No classes created for this grade yet.', 'මෙම ශ්‍රේණිය සඳහා පන්ති නොමැත.')}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {gradeClasses.map((cls) => (
                    <div
                      key={cls._id}
                      className="border border-stone-200 rounded-lg px-3 py-2 text-xs flex items-center justify-between"
                    >
                      <span className="font-mono tabular-nums font-semibold text-stone-900">
                        {cls.name}
                      </span>
                      {cls.stream && (
                        <span className="text-stone-500 truncate ml-2">{cls.stream}</span>
                      )}
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

// ── 4. Public News Page (/news) ──
export function NewsPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');

  const categories = [
    'ALL',
    'School News',
    'Academic News',
    'Sports',
    'Competitions',
    'Activities',
    'Achievements',
  ];

  useEffect(() => {
    apiFetch('/api/public/news')
      .then((res) => setNews(res.news || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    category === 'ALL' ? news : news.filter((item) => item.category === category);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-6 space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
            {t('Campus Press & Reports', 'විද්‍යාලයීය පුවත් හා වාර්තා')}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            {t('School News & Updates', 'විද්‍යාලයීය පුවත්')}
          </h1>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-lg w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-white text-[#6B1426] font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat === 'ALL' ? t('All Categories', 'සියල්ල') : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-stone-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-base font-semibold text-stone-800">
            {t('No data available.', 'දත්ත නොමැත.')}
          </p>
          <p className="text-sm text-stone-500">
            {t(
              'No published news articles found in this category.',
              'මෙම කාණ්ඩය යටතේ පුවත් කිසිවක් ප්‍රකාශයට පත් කර නොමැත.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <article
              key={item._id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-16/9 object-cover border-b border-stone-100"
                />
              )}
              <div className="p-6 space-y-2.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-[#6B1426]">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.date}</span>
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                  {t(item.title, item.sinhalaTitle)}
                </h2>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {t(item.description, item.sinhalaDescription)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 5. Public Events Page (/events) ──
export function EventsPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/public/events')
      .then((res) => setEvents(res.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
          {t('Official Calendar', 'විද්‍යාලයීය දින දර්ශනය')}
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('Upcoming School Events', 'ඉදිරි උත්සව හා වැඩසටහන්')}
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-stone-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-base font-semibold text-stone-800">
            {t('No data available.', 'දත්ත නොමැත.')}
          </p>
          <p className="text-sm text-stone-500">
            {t(
              'No public school events have been scheduled yet.',
              'තවමත් පොදු උත්සව හෝ වැඩසටහන් ඇතුළත් කර නොමැත.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
            >
              {ev.image && (
                <img
                  src={ev.image}
                  alt={ev.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-16/9 object-cover border-b border-stone-100"
                />
              )}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#6B1426]" />
                  <span>{ev.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ev.time}</span>
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                  {t(ev.title, ev.sinhalaTitle)}
                </h2>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {t(ev.description, ev.sinhalaDescription)}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6B1426]" />
                  <span>{ev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 6. Public Gallery Page (/gallery) ──
export function GalleryPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');

  const categories = ['ALL', 'School Events', 'Sports', 'Academic', 'Clubs', 'Achievements', 'Other'];

  useEffect(() => {
    apiFetch('/api/public/gallery')
      .then((res) => {
        setImages(res.images || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    category === 'ALL' ? images : images.filter((img) => img.category === category);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="border-b border-stone-200 pb-6 space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
            {t('Photographic Archive', 'ඡායාරූප එකතුව')}
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            {t('School Photo Gallery', 'විද්‍යාලයීය ඡායාරූප ගැලරිය')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-lg w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                category === cat
                  ? 'bg-white text-[#6B1426] font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat === 'ALL' ? t('All Albums', 'සියල්ල') : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-stone-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-base font-semibold text-stone-800">
            {t('No data available.', 'දත්ත නොමැත.')}
          </p>
          <p className="text-sm text-stone-500">
            {t(
              'No photographs have been uploaded to this album category yet.',
              'මෙම කාණ්ඩය යටතේ තවමත් ඡායාරූප ඇතුළත් කර නොමැත.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((img) => (
            <figure
              key={img._id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col"
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-4/3 object-cover border-b border-stone-100"
              />
              <figcaption className="p-4 space-y-1">
                <div className="text-xs text-stone-500">
                  <span className="font-semibold text-[#6B1426]">{img.category}</span>
                  {img.date && (
                    <>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono tabular-nums">{img.date}</span>
                    </>
                  )}
                </div>
                <p className="font-serif-display text-lg font-bold text-stone-900">
                  {t(img.title, img.sinhalaTitle)}
                </p>
                {img.caption && <p className="text-xs text-stone-600">{img.caption}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 7. Public Contact Page (/contact) ──
export function ContactPage() {
  const { t, settings } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
          {t('Official Directory', 'නිල සබඳතා')}
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('Contact A/Galenbindunuwewa Central College', 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය අමතන්න')}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {t(
            'Official contact information configured by the school administration.',
            'විද්‍යාලයීය පරිපාලනය විසින් ලබා දී ඇති නිල සම්බන්ධතා තොරතුරු.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1426]">
            <MapPin className="w-4 h-4" />
            <span>{t('School Address', 'විද්‍යාලයීය ලිපිනය')}</span>
          </div>
          <p className="text-sm text-stone-800 leading-relaxed pt-1">
            {t(
              settings.addressEn ||
                'A/Galenbindunuwewa Central College, Galenbindunuwewa, Sri Lanka',
              settings.addressSi ||
                'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය, ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
            )}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1426]">
            <Phone className="w-4 h-4" />
            <span>{t('Telephone', 'දුරකථන අංකය')}</span>
          </div>
          <p className="text-sm font-mono tabular-nums text-stone-800 pt-1">
            {settings.phone ? (
              settings.phone
            ) : (
              <span className="font-sans text-stone-400 italic">
                {t('No data available.', 'දත්ත නොමැත.')}
              </span>
            )}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B1426]">
            <Mail className="w-4 h-4" />
            <span>{t('Official Email', 'විද්‍යුත් තැපෑල')}</span>
          </div>
          <p className="text-sm text-stone-800 pt-1 break-all">
            {settings.email ? (
              settings.email
            ) : (
              <span className="text-stone-400 italic">
                {t('No data available.', 'දත්ත නොමැත.')}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Google Maps & Social Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-serif-display text-xl font-bold text-stone-900">
            {t('Location & Google Maps', 'පිහිටීම සහ සිතියම')}
          </h2>
          {settings.googleMapsUrl ? (
            <div className="space-y-3">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B1426] hover:underline"
              >
                <span>{t('Open Location in Google Maps', 'Google Maps හි පිහිටීම බලන්න')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">
              {t(
                'No Google Maps link has been configured by the administrator yet.',
                'සිතියම් සබැඳිය තවමත් ඇතුළත් කර නොමැත.'
              )}
            </p>
          )}
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-serif-display text-xl font-bold text-stone-900">
            {t('Official Social Media Links', 'නිල සමාජ මාධ්‍ය ජාල')}
          </h2>
          {settings.facebookUrl || settings.youtubeUrl || settings.websiteUrl ? (
            <div className="flex flex-wrap gap-4 pt-1 text-sm font-medium text-[#6B1426]">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.websiteUrl && (
                <a
                  href={settings.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">
              {t('No social media links configured yet.', 'සමාජ මාධ්‍ය සබැඳි ඇතුළත් කර නොමැත.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
