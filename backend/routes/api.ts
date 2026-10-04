import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();

const getJwtSecret = () =>
  process.env.JWT_SECRET || 'galenbindunuwewa-central-college-jwt-secret-key-2026';

export interface AuthPayload {
  id: string;
  role: 'ADMIN' | 'STUDENT';
}

function extractToken(req: Request): string | null {
  if (req.cookies && req.cookies.gcc_token) {
    return req.cookies.gcc_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('gcc_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Middleware: Verify Student & Load Fresh Approved Profile from MongoDB
async function requireStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    if (decoded.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Student access required.' });
    }
    const student = await db.findById('students', decoded.id);
    if (!student) {
      return res.status(401).json({ error: 'Student account not found.' });
    }
    if (student.status !== 'APPROVED') {
      return res.status(403).json({
        error: `Your student account status is ${student.status}. Access requires administrator approval.`,
      });
    }
    (req as any).student = student;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Middleware: Verify Admin from MongoDB
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Administrator authentication required.' });
    }
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Administrator privileges required.' });
    }
    const admin = await db.findById('admins', decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Administrator account not found.' });
    }
    (req as any).admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired administrator session.' });
  }
}

// Helper: Check if an item (Announcement, Notice, Event) is authorized for a specific student
function isAuthorizedForStudent(item: any, student: any): boolean {
  const targetType = item.targetType || 'ALL';
  if (targetType === 'ALL' || targetType === 'ALL_STUDENTS') {
    return true;
  }
  if (targetType === 'GRADE') {
    return Number(item.targetGrade) === Number(student.grade);
  }
  if (targetType === 'CLASS') {
    return (
      Number(item.targetGrade) === Number(student.grade) &&
      String(item.targetClass).trim().toUpperCase() === String(student.class).trim().toUpperCase()
    );
  }
  if (targetType === 'STREAM') {
    return (
      Number(item.targetGrade) === Number(student.grade) &&
      Boolean(student.stream) &&
      String(item.targetStream).trim().toLowerCase() === String(student.stream).trim().toLowerCase()
    );
  }
  return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/public/home', async (_req: Request, res: Response) => {
  try {
    const settingsList = await db.find('schoolSettings', {});
    const settings = settingsList[0] || {};
    const allAnnouncements = await db.find('announcements', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 });
    const publicAnnouncements = allAnnouncements.filter((a) => a.targetType === 'ALL');
    const allEvents = await db.find('events', { status: 'PUBLISHED' }, { date: 1, createdAt: -1 });
    const publicEvents = allEvents.filter((e) => !e.targetType || e.targetType === 'ALL');
    const news = await db.find('news', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 });
    const gallery = await db.find('galleries', {}, { createdAt: -1 });
    const albums = await db.find('galleryAlbums', {}, { createdAt: -1 });
    const grades = await db.find('grades', { active: true }, { gradeNumber: 1 });
    const classes = await db.find('classes', { active: true }, { grade: 1, name: 1 });

    res.json({
      settings,
      announcements: publicAnnouncements,
      events: publicEvents,
      news,
      gallery,
      albums,
      grades,
      classes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load homepage data.' });
  }
});

router.get('/public/settings', async (_req: Request, res: Response) => {
  try {
    const settingsList = await db.find('schoolSettings', {});
    res.json({ settings: settingsList[0] || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load school settings.' });
  }
});

router.get('/public/grades-classes', async (_req: Request, res: Response) => {
  try {
    const grades = await db.find('grades', { active: true }, { gradeNumber: 1 });
    const classes = await db.find('classes', { active: true }, { grade: 1, name: 1 });
    res.json({ grades, classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load grades and classes.' });
  }
});

router.get('/public/announcements', async (_req: Request, res: Response) => {
  try {
    const list = await db.find('announcements', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 });
    const publicOnly = list.filter((a) => a.targetType === 'ALL');
    res.json({ announcements: publicOnly });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load public announcements.' });
  }
});

router.get('/public/news', async (_req: Request, res: Response) => {
  try {
    const news = await db.find('news', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 });
    res.json({ news });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load news.' });
  }
});

router.get('/public/events', async (_req: Request, res: Response) => {
  try {
    const events = await db.find('events', { status: 'PUBLISHED' }, { date: 1, createdAt: -1 });
    const publicOnly = events.filter((e) => !e.targetType || e.targetType === 'ALL');
    res.json({ events: publicOnly });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load public events.' });
  }
});

router.get('/public/gallery', async (_req: Request, res: Response) => {
  try {
    const albums = await db.find('galleryAlbums', {}, { createdAt: -1 });
    const images = await db.find('galleries', {}, { createdAt: -1 });
    res.json({ albums, images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load gallery.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION ENDPOINTS (STUDENT & SESSION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, studentId, phone, grade, class: className, stream } = req.body;
    if (!name || !studentId || !phone || !grade || !className) {
      return res.status(400).json({
        error: 'All required fields (Full Name, Student ID, Mobile Number, Grade, Class) must be provided.',
      });
    }

    const gradeNum = Number(grade);
    if (isNaN(gradeNum) || gradeNum < 6 || gradeNum > 13) {
      return res.status(400).json({ error: 'Grade must be between Grade 6 and Grade 13.' });
    }

    const cleanStudentId = String(studentId).trim().toUpperCase();
    const existingById = await db.findOne('students', { studentId: cleanStudentId });
    if (existingById) {
      return res.status(409).json({
        error: `A student with Student ID "${cleanStudentId}" is already registered.`,
      });
    }

    const student = await db.create('students', {
      name: String(name).trim(),
      studentId: cleanStudentId,
      phone: String(phone).trim(),
      grade: gradeNum,
      class: String(className).trim().toUpperCase(),
      stream: gradeNum >= 12 && stream ? String(stream).trim() : '',
      role: 'STUDENT',
      status: 'PENDING',
    });

    await db.create('users', {
      name: student.name,
      role: 'STUDENT',
      referenceId: student._id,
    });

    res.status(201).json({
      message:
        'Registration submitted successfully. Your account status is PENDING until approved by the school administrator.',
      student: {
        name: student.name,
        studentId: student.studentId,
        grade: student.grade,
        class: student.class,
        status: student.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process student registration.' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { name, grade, class: className } = req.body;
    if (!name || !grade || !className) {
      return res.status(400).json({
        error: 'Please enter your Full Name, Grade, and Class to log in.',
      });
    }

    const trimmedInput = String(name).trim();
    const inputGrade = Number(grade);
    const inputClass = String(className).trim().toUpperCase();

    const allStudents = await db.find('students', {});
    // Match by exact case-insensitive Full Name or Student ID
    const matchingStudents = allStudents.filter(
      (s) =>
        String(s.name).trim().toLowerCase() === trimmedInput.toLowerCase() ||
        String(s.studentId).trim().toLowerCase() === trimmedInput.toLowerCase()
    );

    if (matchingStudents.length === 0) {
      return res.status(401).json({
        error: 'Student record not found. Please register first or verify your Full Name.',
      });
    }

    // Find the student matching the registered profile
    let student = matchingStudents.find(
      (s) => Number(s.grade) === inputGrade && String(s.class).trim().toUpperCase() === inputClass
    );

    if (!student) {
      const anyRecord = matchingStudents[0];
      if (anyRecord.status === 'PENDING') {
        return res.status(403).json({
          error:
            'Your registration is currently PENDING administrator approval. Please wait for approval before logging in.',
        });
      }
      return res.status(403).json({
        error: `Security verification failed: Your registered profile is assigned to Grade ${anyRecord.grade} (${anyRecord.class}), not Grade ${inputGrade} (${inputClass}). Please select your assigned Grade and Class.`,
      });
    }

    if (student.status === 'PENDING') {
      return res.status(403).json({
        error:
          'Your account is currently PENDING administrator approval. Once approved by the Admin, you can access your class dashboard.',
      });
    }

    if (student.status === 'REJECTED' || student.status === 'DEACTIVATED') {
      return res.status(403).json({
        error: `Your student account status is ${student.status}. Please contact the school administration.`,
      });
    }

    // Issue JWT containing only student._id and role (NEVER trusting frontend grade/class on subsequent requests)
    const token = jwt.sign({ id: student._id, role: 'STUDENT' }, getJwtSecret(), {
      expiresIn: '7d',
    });
    setAuthCookie(res, token);

    res.json({
      token,
      student: {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        phone: student.phone,
        grade: student.grade,
        class: student.class,
        stream: student.stream || '',
        role: student.role,
        status: student.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('gcc_token');
  res.json({ message: 'Logged out successfully.' });
});

router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.json({ user: null });
    }
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    if (decoded.role === 'ADMIN') {
      const admin = await db.findById('admins', decoded.id);
      if (!admin) return res.json({ user: null });
      return res.json({
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: 'ADMIN',
        },
      });
    } else if (decoded.role === 'STUDENT') {
      const student = await db.findById('students', decoded.id);
      if (!student || student.status !== 'APPROVED') {
        return res.json({ user: null });
      }
      return res.json({
        user: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          phone: student.phone,
          grade: student.grade,
          class: student.class,
          stream: student.stream || '',
          role: 'STUDENT',
          status: student.status,
        },
      });
    }
    return res.json({ user: null });
  } catch (_err) {
    return res.json({ user: null });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDENT PROTECTED ENDPOINTS (STRICT BACKEND GRADE/CLASS AUTHORIZATION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.get('/student/profile', requireStudent, async (req: Request, res: Response) => {
  const student = (req as any).student;
  res.json({
    profile: {
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      phone: student.phone,
      grade: student.grade,
      class: student.class,
      stream: student.stream || '',
      role: student.role,
      status: student.status,
      createdAt: student.createdAt,
    },
  });
});

router.get('/student/announcements', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    const allPublished = await db.find('announcements', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 });
    const authorized = allPublished.filter((item) => isAuthorizedForStudent(item, student));
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      announcements: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load class announcements.' });
  }
});

router.get('/student/timetable', requireStudent, async (req: Request, res: Response) => {
  try {
    // CRITICAL SECURITY: Ignore any req.query.grade or req.query.class!
    // Always use the authenticated student's approved Grade & Class from MongoDB.
    const student = (req as any).student;
    const allTimetable = await db.find(
      'timetables',
      { grade: Number(student.grade) },
      { period: 1 }
    );
    const authorized = allTimetable.filter(
      (t) =>
        String(t.class).trim().toUpperCase() === String(student.class).trim().toUpperCase()
    );
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      studentStream: student.stream || '',
      timetable: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load class timetable.' });
  }
});

router.get('/student/subjects', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    const gradeSubjects = await db.find('subjects', { grade: Number(student.grade) }, { name: 1 });
    const authorized = gradeSubjects.filter((s) => {
      const clsMatch =
        String(s.class).trim().toUpperCase() === String(student.class).trim().toUpperCase() ||
        String(s.class).trim().toUpperCase() === 'ALL';
      const streamMatch =
        !s.stream ||
        !student.stream ||
        String(s.stream).trim().toLowerCase() === String(student.stream).trim().toLowerCase();
      return clsMatch && streamMatch;
    });
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      subjects: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subjects.' });
  }
});

router.get('/student/notices', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    const allNotices = await db.find('notices', {}, { date: -1, createdAt: -1 });
    const authorized = allNotices.filter((n) => isAuthorizedForStudent(n, student));
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      notices: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notices.' });
  }
});

router.get('/student/materials', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    const gradeMaterials = await db.find(
      'studyMaterials',
      { grade: Number(student.grade) },
      { uploadedDate: -1, createdAt: -1 }
    );
    const authorized = gradeMaterials.filter((m) => {
      const clsMatch =
        String(m.class).trim().toUpperCase() === String(student.class).trim().toUpperCase() ||
        String(m.class).trim().toUpperCase() === 'ALL';
      const streamMatch =
        !m.stream ||
        !student.stream ||
        String(m.stream).trim().toLowerCase() === String(student.stream).trim().toLowerCase();
      return clsMatch && streamMatch;
    });
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      materials: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load study materials.' });
  }
});

router.get('/student/events', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    const allEvents = await db.find('events', { status: 'PUBLISHED' }, { date: 1, createdAt: -1 });
    const authorized = allEvents.filter((e) => isAuthorizedForStudent(e, student));
    res.json({
      studentGrade: student.grade,
      studentClass: student.class,
      events: authorized,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events.' });
  }
});

router.get('/student/dashboard', requireStudent, async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;

    const [allAnnouncements, allTimetable, gradeSubjects, allNotices, gradeMaterials, allEvents] =
      await Promise.all([
        db.find('announcements', { status: 'PUBLISHED' }, { date: -1, createdAt: -1 }),
        db.find('timetables', { grade: Number(student.grade) }, { period: 1 }),
        db.find('subjects', { grade: Number(student.grade) }, { name: 1 }),
        db.find('notices', {}, { date: -1, createdAt: -1 }),
        db.find('studyMaterials', { grade: Number(student.grade) }, { uploadedDate: -1, createdAt: -1 }),
        db.find('events', { status: 'PUBLISHED' }, { date: 1, createdAt: -1 }),
      ]);

    const announcements = allAnnouncements.filter((a) => isAuthorizedForStudent(a, student));
    const timetable = allTimetable.filter(
      (t) => String(t.class).trim().toUpperCase() === String(student.class).trim().toUpperCase()
    );
    const subjects = gradeSubjects.filter((s) => {
      const clsMatch =
        String(s.class).trim().toUpperCase() === String(student.class).trim().toUpperCase() ||
        String(s.class).trim().toUpperCase() === 'ALL';
      const streamMatch =
        !s.stream ||
        !student.stream ||
        String(s.stream).trim().toLowerCase() === String(student.stream).trim().toLowerCase();
      return clsMatch && streamMatch;
    });
    const notices = allNotices.filter((n) => isAuthorizedForStudent(n, student));
    const materials = gradeMaterials.filter((m) => {
      const clsMatch =
        String(m.class).trim().toUpperCase() === String(student.class).trim().toUpperCase() ||
        String(m.class).trim().toUpperCase() === 'ALL';
      const streamMatch =
        !m.stream ||
        !student.stream ||
        String(m.stream).trim().toLowerCase() === String(m.stream).trim().toLowerCase();
      return clsMatch && streamMatch;
    });
    const events = allEvents.filter((e) => isAuthorizedForStudent(e, student));

    res.json({
      profile: {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        phone: student.phone,
        grade: student.grade,
        class: student.class,
        stream: student.stream || '',
        role: student.role,
        status: student.status,
      },
      announcements,
      timetable,
      subjects,
      notices,
      materials,
      events,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load student dashboard.' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN AUTHENTICATION & PROTECTED MANAGEMENT ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Administrator password is required.' });
    }

    const admins = await db.find('admins', {});
    const admin = email
      ? admins.find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase()) || admins[0]
      : admins[0];

    if (!admin) {
      return res.status(401).json({ error: 'Administrator account not initialized.' });
    }

    const valid = await bcrypt.compare(String(password), admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign({ id: admin._id, role: 'ADMIN' }, getJwtSecret(), {
      expiresIn: '7d',
    });
    setAuthCookie(res, token);

    res.json({
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'ADMIN',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Admin login failed.' });
  }
});

router.put('/admin/password', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || String(newPassword).length < 4) {
      return res
        .status(400)
        .json({ error: 'Current password and a new password (min 4 chars) are required.' });
    }
    const admin = (req as any).admin;
    const isMatch = await bcrypt.compare(String(currentPassword), admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await db.findByIdAndUpdate('admins', admin._id, { passwordHash });
    res.json({ message: 'Administrator password updated and hashed in MongoDB.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

router.get('/admin/dashboard', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allStudents = await db.find('students', {});
    const classes = await db.find('classes', {});
    const publishedAnnouncements = await db.countDocuments('announcements', { status: 'PUBLISHED' });
    const upcomingEvents = await db.countDocuments('events', { status: 'PUBLISHED' });
    const totalSubjects = await db.countDocuments('subjects', {});
    const totalMaterials = await db.countDocuments('studyMaterials', {});
    const totalNotices = await db.countDocuments('notices', {});
    const totalNews = await db.countDocuments('news', {});

    const gradeStats: Record<number, number> = {
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
    };
    let pendingCount = 0;
    let approvedCount = 0;

    for (const s of allStudents) {
      if (s.status === 'PENDING') pendingCount++;
      if (s.status === 'APPROVED') approvedCount++;
      const g = Number(s.grade);
      if (g >= 6 && g <= 13) {
        gradeStats[g] = (gradeStats[g] || 0) + 1;
      }
    }

    res.json({
      stats: {
        totalStudents: allStudents.length,
        approvedStudents: approvedCount,
        pendingStudents: pendingCount,
        grade6Students: gradeStats[6],
        grade7Students: gradeStats[7],
        grade8Students: gradeStats[8],
        grade9Students: gradeStats[9],
        grade10Students: gradeStats[10],
        grade11Students: gradeStats[11],
        grade12Students: gradeStats[12],
        grade13Students: gradeStats[13],
        totalClasses: classes.length,
        publishedAnnouncements,
        upcomingEvents,
        totalSubjects,
        totalMaterials,
        totalNotices,
        totalNews,
      },
      recentPendingStudents: allStudents.filter((s) => s.status === 'PENDING').slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load real MongoDB statistics.' });
  }
});

// ── Admin Student Management ──
router.get('/admin/students', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const students = await db.find('students', {}, { createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load students.' });
  }
});

router.post('/admin/students', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, studentId, phone, grade, class: className, stream, status } = req.body;
    if (!name || !studentId || !phone || !grade || !className) {
      return res.status(400).json({ error: 'Name, Student ID, Phone, Grade, and Class are required.' });
    }
    const cleanId = String(studentId).trim().toUpperCase();
    const existing = await db.findOne('students', { studentId: cleanId });
    if (existing) {
      return res.status(409).json({ error: `Student ID "${cleanId}" already exists.` });
    }
    const student = await db.create('students', {
      name: String(name).trim(),
      studentId: cleanId,
      phone: String(phone).trim(),
      grade: Number(grade),
      class: String(className).trim().toUpperCase(),
      stream: Number(grade) >= 12 && stream ? String(stream).trim() : '',
      role: 'STUDENT',
      status: status || 'APPROVED',
    });
    await db.create('users', {
      name: student.name,
      role: 'STUDENT',
      referenceId: student._id,
    });
    res.status(201).json({ student });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student.' });
  }
});

router.put('/admin/students/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, studentId, phone, grade, class: className, stream, status } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (studentId !== undefined) updates.studentId = String(studentId).trim().toUpperCase();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (grade !== undefined) updates.grade = Number(grade);
    if (className !== undefined) updates.class = String(className).trim().toUpperCase();
    if (stream !== undefined) updates.stream = String(stream).trim();
    if (status !== undefined) updates.status = status;

    const updated = await db.findByIdAndUpdate('students', req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Student not found.' });
    res.json({ student: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

router.delete('/admin/students/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('students', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// ── Admin Grades & Classes Management ──
router.get('/admin/grades', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const grades = await db.find('grades', {}, { gradeNumber: 1 });
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load grades.' });
  }
});

router.post('/admin/grades', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { gradeNumber, labelEn, labelSi, isSenior, streams } = req.body;
    const num = Number(gradeNumber);
    if (!num || num < 6 || num > 13) {
      return res.status(400).json({ error: 'Grade number must be between 6 and 13.' });
    }
    const existing = await db.findOne('grades', { gradeNumber: num });
    if (existing) {
      return res.status(409).json({ error: `Grade ${num} already exists.` });
    }
    const created = await db.create('grades', {
      gradeNumber: num,
      labelEn: labelEn || `Grade ${num}`,
      labelSi: labelSi || `${num} ශ්‍රේණිය`,
      isSenior: Boolean(isSenior ?? num >= 12),
      streams: streams || (num >= 12 ? ['Science', 'Commerce', 'Arts', 'Technology'] : []),
      active: true,
    });
    res.status(201).json({ grade: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create grade.' });
  }
});

router.get('/admin/classes', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const classes = await db.find('classes', {}, { grade: 1, name: 1 });
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load classes.' });
  }
});

router.post('/admin/classes', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { grade, name, stream, classTeacher, active } = req.body;
    if (!grade || !name) {
      return res.status(400).json({ error: 'Grade and Class Name are required.' });
    }
    const cleanName = String(name).trim().toUpperCase();
    const existing = await db.findOne('classes', { name: cleanName });
    if (existing) {
      return res.status(409).json({ error: `Class "${cleanName}" already exists.` });
    }
    const created = await db.create('classes', {
      grade: Number(grade),
      name: cleanName,
      stream: stream ? String(stream).trim() : '',
      classTeacher: classTeacher ? String(classTeacher).trim() : '',
      active: active !== undefined ? Boolean(active) : true,
    });
    res.status(201).json({ classObj: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class.' });
  }
});

router.put('/admin/classes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { grade, name, stream, classTeacher, active } = req.body;
    const existing = await db.findById('classes', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Class not found.' });

    const updates: Record<string, any> = {};
    if (grade !== undefined) updates.grade = Number(grade);
    if (name !== undefined) updates.name = String(name).trim().toUpperCase();
    if (stream !== undefined) updates.stream = String(stream).trim();
    if (classTeacher !== undefined) updates.classTeacher = String(classTeacher).trim();
    if (active !== undefined) updates.active = Boolean(active);

    const updated = await db.findByIdAndUpdate('classes', req.params.id, updates);

    // If the class was renamed, cascade update to students, timetables, subjects, and materials
    if (updates.name && updates.name !== existing.name) {
      await db.updateMany('students', { class: existing.name }, { class: updates.name });
      await db.updateMany('timetables', { class: existing.name }, { class: updates.name });
      await db.updateMany('subjects', { class: existing.name }, { class: updates.name });
      await db.updateMany('studyMaterials', { class: existing.name }, { class: updates.name });
      await db.updateMany('announcements', { targetClass: existing.name }, { targetClass: updates.name });
      await db.updateMany('notices', { targetClass: existing.name }, { targetClass: updates.name });
    }

    res.json({ classObj: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class.' });
  }
});

router.delete('/admin/classes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('classes', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Class not found.' });
    res.json({ message: 'Class deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class.' });
  }
});

// ── Admin Announcements Management ──
router.get('/admin/announcements', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const announcements = await db.find('announcements', {}, { createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load announcements.' });
  }
});

router.post('/admin/announcements', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      sinhalaTitle,
      description,
      sinhalaDescription,
      image,
      date,
      priority,
      targetType,
      targetGrade,
      targetClass,
      targetStream,
      status,
      scheduledFor,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and Description are required.' });
    }

    const created = await db.create('announcements', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      description: String(description).trim(),
      sinhalaDescription: sinhalaDescription ? String(sinhalaDescription).trim() : '',
      image: image || '',
      date: date || new Date().toISOString().split('T')[0],
      priority: priority || 'NORMAL',
      targetType: targetType || 'ALL',
      targetGrade: targetGrade ? Number(targetGrade) : null,
      targetClass: targetClass ? String(targetClass).trim().toUpperCase() : '',
      targetStream: targetStream ? String(targetStream).trim() : '',
      status: status || 'PUBLISHED',
      scheduledFor: scheduledFor || '',
    });

    res.status(201).json({ announcement: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

router.put('/admin/announcements/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('announcements', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Announcement not found.' });
    res.json({ announcement: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement.' });
  }
});

router.delete('/admin/announcements/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('announcements', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Announcement not found.' });
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

// ── Admin Timetable Management ──
router.get('/admin/timetable', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const timetable = await db.find('timetables', {}, { grade: 1, class: 1, period: 1 });
    res.json({ timetable });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load timetable entries.' });
  }
});

router.post('/admin/timetable', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      grade,
      class: className,
      stream,
      day,
      period,
      startTime,
      endTime,
      subject,
      sinhalaSubject,
      teacher,
      room,
    } = req.body;

    if (!grade || !className || !day || !period || !subject || !teacher) {
      return res
        .status(400)
        .json({ error: 'Grade, Class, Day, Period, Subject, and Teacher are required.' });
    }

    const created = await db.create('timetables', {
      grade: Number(grade),
      class: String(className).trim().toUpperCase(),
      stream: stream || '',
      day,
      period: Number(period),
      startTime: startTime || '',
      endTime: endTime || '',
      subject: String(subject).trim(),
      sinhalaSubject: sinhalaSubject ? String(sinhalaSubject).trim() : '',
      teacher: String(teacher).trim(),
      room: room ? String(room).trim() : '',
    });

    res.status(201).json({ entry: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create timetable entry.' });
  }
});

router.put('/admin/timetable/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };
    if (updates.grade !== undefined) updates.grade = Number(updates.grade);
    if (updates.period !== undefined) updates.period = Number(updates.period);
    if (updates.class !== undefined) updates.class = String(updates.class).trim().toUpperCase();
    const updated = await db.findByIdAndUpdate('timetables', req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json({ entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timetable entry.' });
  }
});

router.delete('/admin/timetable/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('timetables', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Timetable entry not found.' });
    res.json({ message: 'Timetable entry deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete timetable entry.' });
  }
});

// ── Admin Subject Management ──
router.get('/admin/subjects', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const subjects = await db.find('subjects', {}, { grade: 1, class: 1, name: 1 });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subjects.' });
  }
});

router.post('/admin/subjects', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, sinhalaName, grade, class: className, stream, teacher } = req.body;
    if (!name || !grade || !className || !teacher) {
      return res.status(400).json({ error: 'Subject Name, Grade, Class, and Teacher are required.' });
    }
    const created = await db.create('subjects', {
      name: String(name).trim(),
      sinhalaName: sinhalaName ? String(sinhalaName).trim() : '',
      grade: Number(grade),
      class: String(className).trim().toUpperCase(),
      stream: stream || '',
      teacher: String(teacher).trim(),
    });
    res.status(201).json({ subject: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject.' });
  }
});

router.put('/admin/subjects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('subjects', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ subject: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject.' });
  }
});

router.delete('/admin/subjects/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('subjects', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ message: 'Subject deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
});

// ── Admin Notices Management ──
router.get('/admin/notices', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const notices = await db.find('notices', {}, { createdAt: -1 });
    res.json({ notices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notices.' });
  }
});

router.post('/admin/notices', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      sinhalaTitle,
      description,
      sinhalaDescription,
      date,
      priority,
      targetType,
      targetGrade,
      targetClass,
      targetStream,
    } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and Description are required.' });
    }
    const created = await db.create('notices', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      description: String(description).trim(),
      sinhalaDescription: sinhalaDescription ? String(sinhalaDescription).trim() : '',
      date: date || new Date().toISOString().split('T')[0],
      priority: priority || 'NORMAL',
      targetType: targetType || 'ALL_STUDENTS',
      targetGrade: targetGrade ? Number(targetGrade) : null,
      targetClass: targetClass ? String(targetClass).trim().toUpperCase() : '',
      targetStream: targetStream ? String(targetStream).trim() : '',
    });
    res.status(201).json({ notice: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notice.' });
  }
});

router.put('/admin/notices/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('notices', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Notice not found.' });
    res.json({ notice: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notice.' });
  }
});

router.delete('/admin/notices/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('notices', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Notice not found.' });
    res.json({ message: 'Notice deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice.' });
  }
});

// ── Admin News Management ──
router.get('/admin/news', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const news = await db.find('news', {}, { createdAt: -1 });
    res.json({ news });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load news.' });
  }
});

router.post('/admin/news', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, sinhalaTitle, description, sinhalaDescription, image, date, category, status } =
      req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and Description are required.' });
    }
    const created = await db.create('news', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      description: String(description).trim(),
      sinhalaDescription: sinhalaDescription ? String(sinhalaDescription).trim() : '',
      image: image || '',
      date: date || new Date().toISOString().split('T')[0],
      category: category || 'School News',
      status: status || 'PUBLISHED',
    });
    res.status(201).json({ newsItem: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create news article.' });
  }
});

router.put('/admin/news/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('news', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'News item not found.' });
    res.json({ newsItem: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update news item.' });
  }
});

router.delete('/admin/news/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('news', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'News item not found.' });
    res.json({ message: 'News item deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news item.' });
  }
});

// ── Admin Events Management ──
router.get('/admin/events', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const events = await db.find('events', {}, { date: 1, createdAt: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load events.' });
  }
});

router.post('/admin/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      sinhalaTitle,
      description,
      sinhalaDescription,
      date,
      time,
      location,
      image,
      targetType,
      targetGrade,
      targetClass,
      targetStream,
      status,
    } = req.body;
    if (!title || !description || !date || !time || !location) {
      return res
        .status(400)
        .json({ error: 'Title, Description, Date, Time, and Location are required.' });
    }
    const created = await db.create('events', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      description: String(description).trim(),
      sinhalaDescription: sinhalaDescription ? String(sinhalaDescription).trim() : '',
      date,
      time,
      location: String(location).trim(),
      image: image || '',
      targetType: targetType || 'ALL',
      targetGrade: targetGrade ? Number(targetGrade) : null,
      targetClass: targetClass ? String(targetClass).trim().toUpperCase() : '',
      targetStream: targetStream ? String(targetStream).trim() : '',
      status: status || 'PUBLISHED',
    });
    res.status(201).json({ event: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

router.put('/admin/events/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('events', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Event not found.' });
    res.json({ event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

router.delete('/admin/events/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await db.findByIdAndDelete('events', req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// ── Admin Gallery Management ──
router.get('/admin/gallery', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const albums = await db.find('galleryAlbums', {}, { createdAt: -1 });
    const images = await db.find('galleries', {}, { createdAt: -1 });
    res.json({ albums, images });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load gallery.' });
  }
});

router.post('/admin/gallery/albums', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, sinhalaTitle, category, description, coverImage } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Album Title and Category are required.' });
    }
    const created = await db.create('galleryAlbums', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      category,
      description: description || '',
      coverImage: coverImage || '',
    });
    res.status(201).json({ album: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create gallery album.' });
  }
});

router.delete('/admin/gallery/albums/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.findByIdAndDelete('galleryAlbums', req.params.id);
    res.json({ message: 'Album deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete album.' });
  }
});

router.post('/admin/gallery', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, sinhalaTitle, albumId, category, imageUrl, caption, date } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and Image are required.' });
    }
    const created = await db.create('galleries', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      albumId: albumId || '',
      category: category || 'School Events',
      imageUrl,
      caption: caption || '',
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json({ image: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload gallery image.' });
  }
});

router.delete('/admin/gallery/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.findByIdAndDelete('galleries', req.params.id);
    res.json({ message: 'Gallery image deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery image.' });
  }
});

// ── Admin Study Materials Management ──
router.get('/admin/materials', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const materials = await db.find('studyMaterials', {}, { createdAt: -1 });
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load study materials.' });
  }
});

router.post('/admin/materials', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      sinhalaTitle,
      description,
      grade,
      class: className,
      stream,
      subject,
      fileUrl,
      fileName,
      fileType,
      uploadedDate,
    } = req.body;
    if (!title || !grade || !className || !subject || !fileUrl) {
      return res
        .status(400)
        .json({ error: 'Title, Grade, Class, Subject, and File are required.' });
    }
    const created = await db.create('studyMaterials', {
      title: String(title).trim(),
      sinhalaTitle: sinhalaTitle ? String(sinhalaTitle).trim() : '',
      description: description || '',
      grade: Number(grade),
      class: String(className).trim().toUpperCase(),
      stream: stream || '',
      subject: String(subject).trim(),
      fileUrl,
      fileName: fileName || 'material.pdf',
      fileType: fileType || 'PDF',
      uploadedDate: uploadedDate || new Date().toISOString().split('T')[0],
    });
    res.status(201).json({ material: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload study material.' });
  }
});

router.put('/admin/materials/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await db.findByIdAndUpdate('studyMaterials', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Material not found.' });
    res.json({ material: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update study material.' });
  }
});

router.delete('/admin/materials/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.findByIdAndDelete('studyMaterials', req.params.id);
    res.json({ message: 'Study material deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete study material.' });
  }
});

// ── Admin School Settings Management ──
router.get('/admin/settings', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const list = await db.find('schoolSettings', {});
    res.json({ settings: list[0] || {} });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

router.put('/admin/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const list = await db.find('schoolSettings', {});
    if (list.length === 0) {
      const created = await db.create('schoolSettings', req.body);
      return res.json({ settings: created });
    }
    const updated = await db.findByIdAndUpdate('schoolSettings', list[0]._id, req.body);
    res.json({ settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update school settings.' });
  }
});

export default router;
