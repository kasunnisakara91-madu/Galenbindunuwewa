import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { useApp, apiFetch } from '../context/AppContext.tsx';
import { SCHOOL_ASSETS } from '../utils/assets.ts';

export function HomePage() {
  const { t, settings, grades, classes, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [homeData, setHomeData] = useState<{
    announcements: any[];
    events: any[];
    news: any[];
    gallery: any[];
  }>({
    announcements: [],
    events: [],
    news: [],
    gallery: [],
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch('/api/public/home');
        if (!mounted) return;
        setHomeData({
          announcements: res.announcements || [],
          events: res.events || [],
          news: res.news || [],
          gallery: res.gallery || [],
        });
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load homepage data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const achievementNews = homeData.news.filter((n) => n.category === 'Achievements');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#3D0A14] text-white border-b-4 border-[#D4AF37]">
        <div className="absolute inset-0">
          <img
            src={SCHOOL_ASSETS.heroCampus}
            alt="A/Galenbindunuwewa Central College Campus"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D0A14]/95 via-[#58101F]/85 to-[#3D0A14]/70" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={settings.logo || SCHOOL_ASSETS.crest}
                alt="School Crest"
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-white p-1 border-2 border-[#D4AF37] shrink-0"
              />
              <div className="text-xs sm:text-sm text-[#D4AF37] tracking-wider font-medium">
                <span>
                  {t(
                    settings.location || 'Galenbindunuwewa, Sri Lanka',
                    settings.locationSi || 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
                  )}
                </span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span>{t('Grades 6–13 Official Portal', '6–13 ශ්‍රේණි නිල ද්වාරය')}</span>
              </div>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-3xl">
              {t(
                settings.schoolName || 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
                settings.schoolNameSi || 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය'
              )}
            </h1>

            <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-2xl">
              {t(
                settings.welcomeMessageEn ||
                  'Welcome to the official digital academic portal for students in Grades 6 through 13. Access class-specific announcements, timetables, subjects, notices, and study materials.',
                settings.welcomeMessageSi ||
                  '6 ශ්‍රේණියේ සිට 13 ශ්‍රේණිය දක්වා සිසුන් සඳහා වන නිල අධ්‍යයන ද්වාරය වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ පන්තියට අදාළ නිවේදන, කාලසටහන්, විෂයයන් සහ ඉගෙනුම් ද්‍රව්‍ය වෙත පිවිසෙන්න.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user?.role === 'STUDENT' ? (
                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#3D0A14] bg-[#D4AF37] hover:bg-[#e0bd42] rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>
                    {t('Go to My Class Dashboard', 'මගේ පන්ති පුවරුවට යන්න')} ({user.class})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#3D0A14] bg-[#D4AF37] hover:bg-[#e0bd42] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>{t('Student Login', 'ශිෂ්‍ය පිවිසුම')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-white/40 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>{t('Student Registration', 'ශිෂ්‍ය ලියාපදිංචිය')}</span>
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-stone-200 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
              >
                <span>{t('About the College', 'විද්‍යාලය පිළිබඳ')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
              <div className="border-b border-white/15 pb-3">
                <p className="text-xs text-[#D4AF37] font-semibold tracking-wider">
                  {t('Quick Student Access', 'ශිෂ්‍ය ක්ෂණික පිවිසුම')}
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-white mt-1">
                  {t('Grades 6–13 Class Portal', '6–13 ශ්‍රේණි පන්ති ද්වාරය')}
                </h2>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">
                {t(
                  'Students log in with their Full Name, Grade, and Class to view personalized timetables, subjects, notices, and study materials authorized for their specific class.',
                  'සිසුන් තම සම්පූර්ණ නම, ශ්‍රේණිය සහ පන්තිය භාවිතා කර තම පන්තියට අදාළ කාලසටහන්, විෂයයන් සහ ඉගෙනුම් ද්‍රව්‍ය බලා ගත හැක.'
                )}
              </p>
              <div className="grid grid-cols-4 gap-2 pt-1 font-mono tabular-nums text-xs">
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <Link
                    key={g}
                    to="/grades"
                    className="py-2 text-center rounded bg-white/10 hover:bg-[#D4AF37] hover:text-[#3D0A14] font-semibold transition-colors"
                  >
                    G-{g}
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-stone-300">
                <span>{t('Active Classes Configured', 'සක්‍රීය පන්ති ගණන')}</span>
                <span className="font-mono tabular-nums font-semibold text-[#D4AF37]">
                  {classes.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Utility Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#6B1426]">
              {t('Academic Scope', 'අධ්‍යයන පරාසය')}:
            </span>
            <span>{t('Grades 6–11 (Junior & O/L)', '6–11 ශ්‍රේණි')}</span>
            <span aria-hidden="true">·</span>
            <span>
              {t(
                'Grades 12–13 Senior Streams (Science, Commerce, Arts, Technology)',
                '12–13 උසස් පෙළ අංශ (විද්‍යා, වාණිජ, කලා, තාක්ෂණවේදය)'
              )}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/timetable" className="hover:text-[#6B1426] font-medium transition-colors">
              {t('Class Timetables', 'පන්ති කාලසටහන්')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/admin/login" className="hover:text-[#6B1426] font-medium transition-colors">
              {t('Administrator Portal', 'පරිපාලක ද්වාරය')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-14 space-y-20">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Section 1: About School Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
              {t('01. Institutional Profile', '01. විද්‍යාලයීය හැඳින්වීම')}
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              {t(
                'About A/Galenbindunuwewa Central College',
                'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය පිළිබඳව'
              )}
            </h2>
            <p className="text-stone-700 leading-relaxed max-w-2xl">
              {settings.aboutEn || settings.aboutSi ? (
                t(settings.aboutEn, settings.aboutSi)
              ) : (
                <span className="text-stone-500 italic">
                  {t(
                    'Official school profile and history are managed by the school administration. Visit the About page or configure official institutional details in the Admin Panel.',
                    'නිල විද්‍යාලයීය තොරතුරු පරිපාලක විසින් කළමනාකරණය කරනු ලැබේ.'
                  )}
                </span>
              )}
            </p>

            {(settings.visionEn || settings.missionEn) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
                {settings.visionEn && (
                  <div>
                    <h3 className="font-serif-display text-lg font-bold text-[#6B1426]">
                      {t('Our Vision', 'අපගේ දැක්ම')}
                    </h3>
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                      {t(settings.visionEn, settings.visionSi)}
                    </p>
                  </div>
                )}
                {settings.missionEn && (
                  <div>
                    <h3 className="font-serif-display text-lg font-bold text-[#6B1426]">
                      {t('Our Mission', 'අපගේ මෙහෙවර')}
                    </h3>
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                      {t(settings.missionEn, settings.missionSi)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B1426] hover:underline"
              >
                <span>{t('Read Full Institutional Profile', 'සම්පූර්ණ විස්තරය කියවන්න')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <figure className="space-y-2">
              <img
                src={SCHOOL_ASSETS.scienceLab}
                alt="Senior Secondary Science Laboratory"
                referrerPolicy="no-referrer"
                className="w-full aspect-4/3 object-cover rounded-lg border border-stone-200"
              />
              <figcaption className="text-xs text-stone-500 italic">
                {t('Academic & Science Education', 'විද්‍යා හා අධ්‍යයන අංශය')}
              </figcaption>
            </figure>
            <figure className="space-y-2">
              <img
                src={SCHOOL_ASSETS.sportsGround}
                alt="College Sports Grounds"
                referrerPolicy="no-referrer"
                className="w-full aspect-4/3 object-cover rounded-lg border border-stone-200"
              />
              <figcaption className="text-xs text-stone-500 italic">
                {t('Campus Grounds & Athletics', 'ක්‍රීඩා හා එළිමහන් පරිශ්‍රය')}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Section 2: Latest Announcements & Upcoming Events */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-stone-200">
          {/* Latest Public Announcements */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                  {t('02. Official Notices', '02. නිල නිවේදන')}
                </p>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                  {t('Latest Announcements', 'නවතම නිවේදන')}
                </h2>
              </div>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-[#6B1426] hover:underline whitespace-nowrap"
              >
                {t('View All →', 'සියල්ල බලන්න →')}
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-24 bg-stone-100 animate-pulse rounded-lg border border-stone-200"
                  />
                ))}
              </div>
            ) : homeData.announcements.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {t('No data available.', 'දත්ත නොමැත.')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(
                    'Official public announcements published by the administrator will appear here.',
                    'පරිපාලක විසින් ප්‍රකාශයට පත් කරන නිල නිවේදන මෙහි දිස්වනු ඇත.'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {homeData.announcements.slice(0, 4).map((item) => (
                  <article
                    key={item._id}
                    className="bg-white border border-stone-200 rounded-lg p-5 space-y-2 hover:border-[#6B1426]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                      <span>{item.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans font-medium text-[#6B1426]">
                        {item.priority === 'URGENT'
                          ? t('Urgent Priority', 'හදිසි නිවේදනයකි')
                          : item.priority === 'IMPORTANT'
                          ? t('Important', 'වැදගත්')
                          : t('Public Notice', 'පොදු නිවේදනය')}
                      </span>
                    </div>
                    <h3 className="font-serif-display text-xl font-bold text-stone-900">
                      {t(item.title, item.sinhalaTitle)}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {t(item.description, item.sinhalaDescription)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                  {t('03. School Calendar', '03. විද්‍යාලයීය දින දර්ශනය')}
                </p>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                  {t('Upcoming Events', 'ඉදිරි උත්සව හා වැඩසටහන්')}
                </h2>
              </div>
              <Link
                to="/events"
                className="text-xs font-semibold text-[#6B1426] hover:underline whitespace-nowrap"
              >
                {t('All Events →', 'සියලුම උත්සව →')}
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-24 bg-stone-100 animate-pulse rounded-lg border border-stone-200"
                  />
                ))}
              </div>
            ) : homeData.events.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {t('No data available.', 'දත්ත නොමැත.')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(
                    'No upcoming school events have been scheduled yet.',
                    'ඉදිරි උත්සව හෝ වැඩසටහන් තවමත් ඇතුළත් කර නොමැත.'
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {homeData.events.slice(0, 4).map((ev) => (
                  <div
                    key={ev._id}
                    className="bg-white border border-stone-200 rounded-lg p-5 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-stone-500 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#6B1426]" />
                      <span>{ev.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ev.time}</span>
                    </div>
                    <h3 className="font-serif-display text-lg font-bold text-stone-900">
                      {t(ev.title, ev.sinhalaTitle)}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {t(ev.description, ev.sinhalaDescription)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Academic Structure (Grades 6–13) */}
        <section className="pt-8 border-t border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                {t('04. Academic Divisions', '04. අධ්‍යයන අංශ')}
              </p>
              <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                {t('Grades 6–13 & Senior Streams', '6–13 ශ්‍රේණි සහ උසස් පෙළ විෂය ධාරා')}
              </h2>
            </div>
            <Link
              to="/grades"
              className="text-xs font-semibold text-[#6B1426] hover:underline whitespace-nowrap"
            >
              {t('Explore All Grades & Classes →', 'සියලුම ශ්‍රේණි සහ පන්ති බලන්න →')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(grades.length > 0
              ? grades
              : [6, 7, 8, 9, 10, 11, 12, 13].map((n) => ({
                  _id: String(n),
                  gradeNumber: n,
                  labelEn: `Grade ${n}`,
                  labelSi: `${n} ශ්‍රේණිය`,
                  isSenior: n >= 12,
                  streams: n >= 12 ? ['Science', 'Commerce', 'Arts', 'Technology'] : [],
                }))
            ).map((g) => {
              const gradeClasses = classes.filter((c) => Number(c.grade) === Number(g.gradeNumber));
              return (
                <div
                  key={g._id}
                  className="bg-white border border-stone-200 rounded-lg p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif-display text-2xl font-bold text-[#6B1426]">
                        {t(g.labelEn, g.labelSi)}
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-stone-500">
                        {gradeClasses.length} {t('Classes', 'පන්ති')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {g.isSenior
                        ? t('G.C.E. Advanced Level', 'අ.පො.ස. උසස් පෙළ')
                        : g.gradeNumber >= 10
                        ? t('G.C.E. Ordinary Level', 'අ.පො.ස. සාමාන්‍ය පෙළ')
                        : t('Junior Secondary', 'කනිෂ්ඨ ද්විතීයික අංශය')}
                    </p>
                  </div>

                  <div className="text-xs text-stone-600 font-mono tabular-nums">
                    {gradeClasses.length > 0 ? (
                      <p className="truncate">
                        {gradeClasses.map((c) => c.name).join(' · ')}
                      </p>
                    ) : (
                      <p className="text-stone-400 font-sans">
                        {t('No classes configured', 'පන්ති ඇතුළත් කර නොමැත')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Latest News & School Achievements */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-stone-200">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                  {t('05. Campus Press', '05. විද්‍යාලයීය පුවත්')}
                </p>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                  {t('Latest School News', 'නවතම විද්‍යාලයීය පුවත්')}
                </h2>
              </div>
              <Link
                to="/news"
                className="text-xs font-semibold text-[#6B1426] hover:underline whitespace-nowrap"
              >
                {t('All News →', 'සියලුම පුවත් →')}
              </Link>
            </div>

            {homeData.news.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {t('No data available.', 'දත්ත නොමැත.')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(
                    'Official school news published by the administrator will be displayed here.',
                    'පරිපාලක විසින් ප්‍රකාශිත නිල පුවත් මෙහි දිස්වේ.'
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homeData.news.slice(0, 4).map((item) => (
                  <article
                    key={item._id}
                    className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-4/3 object-cover border-b border-stone-100"
                      />
                    )}
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-xs text-stone-500">
                          <span>{item.category}</span>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono tabular-nums">{item.date}</span>
                        </div>
                        <h3 className="font-serif-display text-xl font-bold text-stone-900">
                          {t(item.title, item.sinhalaTitle)}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {t(item.description, item.sinhalaDescription)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* School Achievements */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                {t('06. Excellence', '06. විශිෂ්ටත්වය')}
              </p>
              <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                {t('School Achievements', 'විද්‍යාලයීය ජයග්‍රහණ')}
              </h2>
            </div>

            {settings.achievementsEn || settings.achievementsSi ? (
              <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-3">
                <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                  {t(settings.achievementsEn, settings.achievementsSi)}
                </p>
              </div>
            ) : achievementNews.length > 0 ? (
              <div className="space-y-3">
                {achievementNews.slice(0, 3).map((ach) => (
                  <div
                    key={ach._id}
                    className="bg-white border border-stone-200 rounded-lg p-5 space-y-1.5"
                  >
                    <p className="text-xs font-mono tabular-nums text-stone-500">{ach.date}</p>
                    <h3 className="font-serif-display text-lg font-bold text-stone-900">
                      {t(ach.title, ach.sinhalaTitle)}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {t(ach.description, ach.sinhalaDescription)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {t('No data available.', 'දත්ත නොමැත.')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(
                    'Official school achievements will be displayed once recorded by the administrator.',
                    'පරිපාලක විසින් ඇතුළත් කරන නිල ජයග්‍රහණ මෙහි දිස්වේ.'
                  )}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Gallery Preview & Official Contact Preview */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-stone-200">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                  {t('07. Visual Archive', '07. ඡායාරූප එකතුව')}
                </p>
                <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                  {t('Gallery Preview', 'ඡායාරූප පෙරදසුන')}
                </h2>
              </div>
              <Link
                to="/gallery"
                className="text-xs font-semibold text-[#6B1426] hover:underline whitespace-nowrap"
              >
                {t('Open Gallery →', 'ඡායාරූප එකතුව →')}
              </Link>
            </div>

            {homeData.gallery.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
                <p className="text-sm font-medium text-stone-700">
                  {t('No data available.', 'දත්ත නොමැත.')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(
                    'No gallery photographs have been uploaded by the administrator yet.',
                    'පරිපාලක විසින් තවමත් ඡායාරූප ඇතුළත් කර නොමැත.'
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {homeData.gallery.slice(0, 6).map((img) => (
                  <figure
                    key={img._id}
                    className="bg-white border border-stone-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-4/3 object-cover"
                    />
                    <figcaption className="p-2.5 text-xs text-stone-700 truncate">
                      {t(img.title, img.sinhalaTitle)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
                {t('08. Directory', '08. සම්බන්ධතා')}
              </p>
              <h2 className="font-serif-display text-3xl font-bold text-stone-900 mt-1">
                {t('Contact Information', 'සම්බන්ධතා තොරතුරු')}
              </h2>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-xs text-stone-500">{t('Official Address', 'නිල ලිපිනය')}</p>
                <p className="text-sm font-medium text-stone-900 mt-0.5">
                  {t(
                    settings.addressEn ||
                      'A/Galenbindunuwewa Central College, Galenbindunuwewa, Sri Lanka',
                    settings.addressSi ||
                      'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය, ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
                <div>
                  <p className="text-xs text-stone-500">{t('Telephone', 'දුරකථන')}</p>
                  <p className="text-sm font-mono tabular-nums text-stone-800 mt-0.5">
                    {settings.phone || t('Not provided yet', 'ඇතුළත් කර නොමැත')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">{t('Email', 'විද්‍යුත් තැපෑල')}</p>
                  <p className="text-sm text-stone-800 mt-0.5 truncate">
                    {settings.email || t('Not provided yet', 'ඇතුළත් කර නොමැත')}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1426] hover:underline"
                >
                  <span>{t('Open Full Contact Page →', 'සම්බන්ධතා පිටුවට පිවිසෙන්න →')}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
