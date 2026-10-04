import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp, apiFetch } from '../context/AppContext.tsx';
import { SCHOOL_ASSETS } from '../utils/assets.ts';

// ── 1. Student Login Page (/login) ──
export function StudentLoginPage() {
  const { t, classes, setUser, settings } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(10);
  const [className, setClassName] = useState('10-A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(grade));

  useEffect(() => {
    if (gradeClasses.length > 0) {
      const exists = gradeClasses.some((c) => c.name === className);
      if (!exists) {
        setClassName(gradeClasses[0].name);
      }
    } else {
      setClassName(`${grade}-A`);
    }
  }, [grade, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          grade: Number(grade),
          class: className.trim().toUpperCase(),
        }),
      });
      if (res.token) {
        localStorage.setItem('gcc_token', res.token);
      }
      setUser({ ...res.student, role: 'STUDENT' });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your registered profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3.5 border-b border-stone-100 pb-5">
          <img
            src={settings.logo || SCHOOL_ASSETS.crest}
            alt="School Crest"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover border border-stone-200 p-0.5 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-[#6B1426] uppercase tracking-wider">
              {t('Student Portal · Grades 6–13', 'ශිෂ්‍ය ද්වාරය · 6–13 ශ්‍රේණි')}
            </p>
            <h1 className="font-serif-display text-2xl font-bold text-stone-900">
              {t('Student Login', 'ශිෂ්‍ය පිවිසුම')}
            </h1>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('Full Name (or Student ID)', 'සම්පූර්ණ නම (හෝ ශිෂ්‍ය අංකය)')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kamal Perera"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Grade', 'ශ්‍රේණිය')}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
              >
                {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                  <option key={g} value={g}>
                    {t(`Grade ${g}`, `${g} ශ්‍රේණිය`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Class', 'පන්තිය')}
              </label>
              {gradeClasses.length > 0 ? (
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                >
                  {gradeClasses.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name} {c.stream ? `(${c.stream})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={`${grade}-A`}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? t('Verifying Profile...', 'පරීක්ෂා කරමින්...') : t('LOGIN', 'පිවිසෙන්න')}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-xs text-stone-600 space-y-2">
          <p>
            {t("Don't have a student account yet?", 'තවමත් ශිෂ්‍ය ගිණුමක් නොමැතිද?')}{' '}
            <Link to="/register" className="font-semibold text-[#6B1426] hover:underline">
              {t('Register as a Student →', 'ශිෂ්‍යයෙකු ලෙස ලියාපදිංචි වන්න →')}
            </Link>
          </p>
          <p className="text-stone-400">
            {t(
              'Security Notice: Your Grade and Class are verified against your administrator-approved profile in MongoDB.',
              'ආරක්ෂක සටහන: ඔබේ ශ්‍රේණිය සහ පන්තිය පරිපාලක විසින් අනුමත කළ දත්ත සමඟ පරීක්ෂා කෙරේ.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 2. Student Registration Page (/register) ──
export function StudentRegisterPage() {
  const { t, classes, settings } = useApp();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState<number>(10);
  const [className, setClassName] = useState('10-A');
  const [stream, setStream] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedStudent, setSubmittedStudent] = useState<any | null>(null);

  const gradeClasses = classes.filter((c) => Number(c.grade) === Number(grade));

  useEffect(() => {
    if (gradeClasses.length > 0) {
      setClassName(gradeClasses[0].name);
      if (grade >= 12 && gradeClasses[0].stream) {
        setStream(gradeClasses[0].stream);
      }
    } else {
      setClassName(`${grade}-A`);
    }
    if (grade < 12) {
      setStream('');
    }
  }, [grade, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          studentId: studentId.trim().toUpperCase(),
          phone: phone.trim(),
          grade: Number(grade),
          class: className.trim().toUpperCase(),
          stream: grade >= 12 ? stream : '',
        }),
      });
      setSubmittedStudent(res.student);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3.5 border-b border-stone-100 pb-5">
          <img
            src={settings.logo || SCHOOL_ASSETS.crest}
            alt="School Crest"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover border border-stone-200 p-0.5 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-[#6B1426] uppercase tracking-wider">
              {t('Grades 6–13 Enrollment', '6–13 ශ්‍රේණි ලියාපදිංචිය')}
            </p>
            <h1 className="font-serif-display text-2xl font-bold text-stone-900">
              {t('Student Registration', 'ශිෂ්‍ය ලියාපදිංචිය')}
            </h1>
          </div>
        </div>

        {submittedStudent ? (
          <div className="space-y-5 py-2">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-semibold text-sm">
                  {t('Registration Submitted — Status: PENDING', 'ලියාපදිංචිය යොමු කරන ලදී — තත්ත්වය: PENDING')}
                </p>
                <p className="leading-relaxed">
                  {t(
                    'Your student profile has been recorded and is awaiting administrator approval. Once the administrator verifies and approves your Grade and Class, you can log in.',
                    'ඔබගේ ශිෂ්‍ය තොරතුරු ඇතුළත් කර ඇති අතර පරිපාලක අනුමැතිය අපේක්ෂාවෙන් පවතී. අනුමත වූ පසු ඔබට පිවිසිය හැක.'
                  )}
                </p>
              </div>
            </div>

            <dl className="border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs">
              <div className="px-4 py-2.5 flex justify-between">
                <dt className="text-stone-500">{t('Full Name', 'සම්පූර්ණ නම')}</dt>
                <dd className="font-semibold text-stone-900">{submittedStudent.name}</dd>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <dt className="text-stone-500">{t('Student ID', 'ශිෂ්‍ය අංකය')}</dt>
                <dd className="font-mono tabular-nums font-semibold text-stone-900">
                  {submittedStudent.studentId}
                </dd>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <dt className="text-stone-500">{t('Requested Grade & Class', 'ශ්‍රේණිය සහ පන්තිය')}</dt>
                <dd className="font-mono tabular-nums font-semibold text-stone-900">
                  Grade {submittedStudent.grade} · {submittedStudent.class}
                </dd>
              </div>
              <div className="px-4 py-2.5 flex justify-between">
                <dt className="text-stone-500">{t('Account Status', 'ගිණුමේ තත්ත්වය')}</dt>
                <dd className="font-mono font-semibold text-amber-700">{submittedStudent.status}</dd>
              </div>
            </dl>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 text-xs font-semibold text-white bg-[#6B1426] rounded-lg"
              >
                {t('Go to Student Login', 'ශිෂ්‍ය පිවිසුමට යන්න')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedStudent(null);
                  setName('');
                  setStudentId('');
                  setPhone('');
                }}
                className="px-4 py-2.5 text-xs font-semibold text-stone-700 border border-stone-300 rounded-lg cursor-pointer"
              >
                {t('Register Another', 'තවත් ලියාපදිංචියක්')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t('Full Name', 'සම්පූර්ණ නම')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kamal Perera"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Student ID / Admission No.', 'ශිෂ්‍ය අංකය / ඇතුළත් වීමේ අංකය')}
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="STU001"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Mobile Number', 'දුරකථන අංකය')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Grade (6–13)', 'ශ්‍රේණිය (6–13)')}
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                >
                  {[6, 7, 8, 9, 10, 11, 12, 13].map((g) => (
                    <option key={g} value={g}>
                      {t(`Grade ${g}`, `${g} ශ්‍රේණිය`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Class', 'පන්තිය')}
                </label>
                {gradeClasses.length > 0 ? (
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                  >
                    {gradeClasses.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name} {c.stream ? `(${c.stream})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder={`${grade}-A`}
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                  />
                )}
              </div>
            </div>

            {grade >= 12 && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t('Senior Stream (Grade 12 / 13)', 'උසස් පෙළ විෂය ධාරාව')}
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
                >
                  <option value="">{t('Select Stream (Optional)', 'විෂය ධාරාව තෝරන්න')}</option>
                  <option value="Science">Science (විද්‍යා)</option>
                  <option value="Commerce">Commerce (වාණිජ)</option>
                  <option value="Arts">Arts (කලා)</option>
                  <option value="Technology">Technology (තාක්ෂණවේදය)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#6B1426] hover:bg-[#520F1D] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {loading
                ? t('Submitting Registration...', 'යොමු කරමින්...')
                : t('Submit Student Registration', 'ලියාපදිංචිය යොමු කරන්න')}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-stone-100 text-xs text-stone-600 flex items-center justify-between">
          <span>{t('Already registered and approved?', 'දැනටමත් ලියාපදිංචි වී තිබේද?')}</span>
          <Link to="/login" className="font-semibold text-[#6B1426] hover:underline">
            {t('Student Login →', 'ශිෂ්‍ය පිවිසුම →')}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── 3. Admin Login Page (/admin/login) ──
export function AdminLoginPage() {
  const { t, setUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@galenbindunuwewacc.lk');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) {
        localStorage.setItem('gcc_token', res.token);
      }
      setUser({ ...res.admin, role: 'ADMIN' });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5">
          <div className="w-11 h-11 rounded-lg bg-[#3D0A14] text-[#D4AF37] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B1426] uppercase tracking-wider">
              {t('Restricted Access', 'ආරක්ෂිත පිවිසුම')}
            </p>
            <h1 className="font-serif-display text-2xl font-bold text-stone-900">
              {t('Administrator Login', 'පරිපාලක පිවිසුම')}
            </h1>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('Administrator Email', 'පරිපාලක විද්‍යුත් තැපෑල')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('Administrator Password', 'පරිපාලක මුරපදය')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-stone-300 rounded-lg focus:outline-none focus:border-[#6B1426]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#3D0A14] hover:bg-[#58101F] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {loading
              ? t('Authenticating...', 'සත්‍යාපනය කරමින්...')
              : t('Sign In to Admin Panel', 'පරිපාලක පුවරුවට පිවිසෙන්න')}
          </button>
        </form>
      </div>
    </div>
  );
}
