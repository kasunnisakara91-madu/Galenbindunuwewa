import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { SCHOOL_ASSETS } from '../utils/assets.ts';

export function AboutPage() {
  const { t, settings, user } = useApp();

  const sections = [
    {
      index: '01',
      titleEn: 'About the School',
      titleSi: 'විද්‍යාලය පිළිබඳව',
      contentEn: settings.aboutEn,
      contentSi: settings.aboutSi,
    },
    {
      index: '02',
      titleEn: 'School History',
      titleSi: 'විද්‍යාලයීය ඉතිහාසය',
      contentEn: settings.historyEn,
      contentSi: settings.historySi,
    },
    {
      index: '03',
      titleEn: 'Vision',
      titleSi: 'දැක්ම',
      contentEn: settings.visionEn,
      contentSi: settings.visionSi,
    },
    {
      index: '04',
      titleEn: 'Mission',
      titleSi: 'මෙහෙවර',
      contentEn: settings.missionEn,
      contentSi: settings.missionSi,
    },
    {
      index: '05',
      titleEn: 'Academic Life',
      titleSi: 'අධ්‍යයන ජීවිතය',
      contentEn: settings.academicLifeEn,
      contentSi: settings.academicLifeSi,
    },
    {
      index: '06',
      titleEn: 'Student Activities',
      titleSi: 'ශිෂ්‍ය ක්‍රියාකාරකම්',
      contentEn: settings.studentActivitiesEn,
      contentSi: settings.studentActivitiesSi,
    },
    {
      index: '07',
      titleEn: 'Clubs & Societies',
      titleSi: 'සංගම් සහ සමිති',
      contentEn: settings.clubsSocietiesEn,
      contentSi: settings.clubsSocietiesSi,
    },
    {
      index: '08',
      titleEn: 'Sports',
      titleSi: 'ක්‍රීඩා',
      contentEn: settings.sportsEn,
      contentSi: settings.sportsSi,
    },
    {
      index: '09',
      titleEn: 'Achievements',
      titleSi: 'ජයග්‍රහණ',
      contentEn: settings.achievementsEn,
      contentSi: settings.achievementsSi,
    },
    {
      index: '10',
      titleEn: 'School Community',
      titleSi: 'විද්‍යාලයීය ප්‍රජාව',
      contentEn: settings.schoolCommunityEn,
      contentSi: settings.schoolCommunitySi,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img
            src={settings.logo || SCHOOL_ASSETS.crest}
            alt="School Crest"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 p-1 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#6B1426]">
              {t('Official Institutional Profile', 'නිල විද්‍යාලයීය තොරතුරු')}
            </p>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              {t(
                'About A/GALENBINDUNUWEWA CENTRAL COLLEGE',
                'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය පිළිබඳව'
              )}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              {t(
                settings.location || 'Galenbindunuwewa, Sri Lanka',
                settings.locationSi || 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව'
              )}{' '}
              · {t('Grades 6–13', '6–13 ශ්‍රේණි')}
            </p>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/settings"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] rounded-lg whitespace-nowrap"
          >
            {t('Edit About Content', 'තොරතුරු සංස්කරණය කරන්න')}
          </Link>
        )}
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec) => {
          const text = t(sec.contentEn || '', sec.contentSi || '');
          return (
            <section
              key={sec.index}
              className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-3"
            >
              <p className="text-xs font-mono tabular-nums text-[#6B1426] font-semibold">
                {sec.index}. {t(sec.titleEn, sec.titleSi)}
              </p>
              <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                {t(sec.titleEn, sec.titleSi)}
              </h2>
              {text && text.trim().length > 0 ? (
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {text}
                </p>
              ) : (
                <p className="text-sm text-stone-400 italic">
                  {t(
                    'No data available. Official content for this section has not been published by the administrator yet.',
                    'දත්ත නොමැත. පරිපාලක විසින් මෙම කොටස සඳහා තවමත් නිල තොරතුරු ඇතුළත් කර නොමැත.'
                  )}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
