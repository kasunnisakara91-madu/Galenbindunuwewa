import mongoose, { Schema } from 'mongoose';

// 1. Admin Model
const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Administrator' },
  role: { type: String, default: 'ADMIN', enum: ['ADMIN'] },
  createdAt: { type: Date, default: Date.now },
});
AdminSchema.index({ createdAt: -1 });

// 2. User Model (Unified base user identity)
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, enum: ['ADMIN', 'STUDENT'] },
  referenceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
UserSchema.index({ createdAt: -1 });

// 3. Student Model
const StudentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, trim: true },
  grade: { type: Number, required: true, min: 6, max: 13 },
  class: { type: String, required: true, trim: true },
  stream: { type: String, default: '', enum: ['', 'Science', 'Commerce', 'Arts', 'Technology'] },
  role: { type: String, default: 'STUDENT', enum: ['STUDENT'] },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'DEACTIVATED'],
  },
  createdAt: { type: Date, default: Date.now },
});
StudentSchema.index({ studentId: 1 }, { unique: true });
StudentSchema.index({ phone: 1 });
StudentSchema.index({ grade: 1 });
StudentSchema.index({ class: 1 });
StudentSchema.index({ createdAt: -1 });

// 4. Grade Model
const GradeSchema = new Schema({
  gradeNumber: { type: Number, required: true, unique: true, min: 6, max: 13 },
  labelEn: { type: String, required: true },
  labelSi: { type: String, required: true },
  isSenior: { type: Boolean, default: false },
  streams: [{ type: String }],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
GradeSchema.index({ gradeNumber: 1 }, { unique: true });
GradeSchema.index({ createdAt: -1 });

// 5. Class Model
const ClassSchema = new Schema({
  grade: { type: Number, required: true, min: 6, max: 13 },
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "10-A"
  stream: { type: String, default: '' }, // Optional for Grade 12-13
  classTeacher: { type: String, default: '' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
ClassSchema.index({ grade: 1 });
ClassSchema.index({ name: 1 }, { unique: true });
ClassSchema.index({ createdAt: -1 });

// 6. Subject Model
const SubjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  sinhalaName: { type: String, default: '', trim: true },
  grade: { type: Number, required: true, min: 6, max: 13 },
  class: { type: String, required: true, trim: true }, // e.g. "10-A" or "ALL"
  stream: { type: String, default: '' },
  teacher: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});
SubjectSchema.index({ grade: 1, class: 1 });
SubjectSchema.index({ createdAt: -1 });

// 7. Announcement Model
const AnnouncementSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  sinhalaDescription: { type: String, default: '' },
  image: { type: String, default: '' },
  date: { type: String, required: true },
  priority: { type: String, default: 'NORMAL', enum: ['NORMAL', 'IMPORTANT', 'URGENT'] },
  targetType: {
    type: String,
    required: true,
    enum: ['ALL', 'ALL_STUDENTS', 'GRADE', 'CLASS', 'STREAM'],
    default: 'ALL',
  },
  targetGrade: { type: Number, default: null },
  targetClass: { type: String, default: '' },
  targetStream: { type: String, default: '' },
  status: { type: String, default: 'PUBLISHED', enum: ['PUBLISHED', 'DRAFT', 'SCHEDULED'] },
  scheduledFor: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
AnnouncementSchema.index({ targetGrade: 1, targetClass: 1 });
AnnouncementSchema.index({ createdAt: -1 });

// 8. Timetable Model
const TimetableSchema = new Schema({
  grade: { type: Number, required: true, min: 6, max: 13 },
  class: { type: String, required: true, trim: true },
  stream: { type: String, default: '' },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  period: { type: Number, required: true, min: 1, max: 10 },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  sinhalaSubject: { type: String, default: '' },
  teacher: { type: String, required: true, trim: true },
  room: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
TimetableSchema.index({ grade: 1, class: 1, day: 1, period: 1 });
TimetableSchema.index({ createdAt: -1 });

// 9. Notice Model
const NoticeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  sinhalaDescription: { type: String, default: '' },
  date: { type: String, required: true },
  priority: { type: String, default: 'NORMAL', enum: ['NORMAL', 'IMPORTANT', 'URGENT'] },
  targetType: {
    type: String,
    required: true,
    enum: ['ALL_STUDENTS', 'GRADE', 'CLASS', 'STREAM'],
    default: 'ALL_STUDENTS',
  },
  targetGrade: { type: Number, default: null },
  targetClass: { type: String, default: '' },
  targetStream: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
NoticeSchema.index({ targetGrade: 1, targetClass: 1 });
NoticeSchema.index({ createdAt: -1 });

// 10. News Model
const NewsSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  sinhalaDescription: { type: String, default: '' },
  image: { type: String, default: '' },
  date: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['School News', 'Academic News', 'Sports', 'Competitions', 'Activities', 'Achievements'],
    default: 'School News',
  },
  status: { type: String, default: 'PUBLISHED', enum: ['PUBLISHED', 'DRAFT'] },
  createdAt: { type: Date, default: Date.now },
});
NewsSchema.index({ createdAt: -1 });

// 11. Event Model
const EventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  sinhalaDescription: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, default: '' },
  targetType: {
    type: String,
    default: 'ALL',
    enum: ['ALL', 'ALL_STUDENTS', 'GRADE', 'CLASS', 'STREAM'],
  },
  targetGrade: { type: Number, default: null },
  targetClass: { type: String, default: '' },
  targetStream: { type: String, default: '' },
  status: { type: String, default: 'PUBLISHED', enum: ['PUBLISHED', 'DRAFT', 'COMPLETED'] },
  createdAt: { type: Date, default: Date.now },
});
EventSchema.index({ targetGrade: 1, targetClass: 1 });
EventSchema.index({ createdAt: -1 });

// 12. GalleryAlbum Model
const GalleryAlbumSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['School Events', 'Sports', 'Academic', 'Clubs', 'Achievements', 'Other'],
    default: 'School Events',
  },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
GalleryAlbumSchema.index({ createdAt: -1 });

// 13. Gallery Model
const GallerySchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '' },
  albumId: { type: String, default: '' },
  category: {
    type: String,
    required: true,
    enum: ['School Events', 'Sports', 'Academic', 'Clubs', 'Achievements', 'Other'],
    default: 'School Events',
  },
  imageUrl: { type: String, required: true },
  caption: { type: String, default: '' },
  date: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
GallerySchema.index({ createdAt: -1 });

// 14. StudyMaterial Model
const StudyMaterialSchema = new Schema({
  title: { type: String, required: true, trim: true },
  sinhalaTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  grade: { type: Number, required: true, min: 6, max: 13 },
  class: { type: String, required: true, trim: true }, // e.g. "10-A" or "ALL"
  stream: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, default: 'document.pdf' },
  fileType: { type: String, default: 'PDF', enum: ['PDF', 'DOCUMENT', 'IMAGE', 'LINK'] },
  uploadedDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
StudyMaterialSchema.index({ grade: 1, class: 1 });
StudyMaterialSchema.index({ createdAt: -1 });

// 15. SchoolSettings Model
const SchoolSettingsSchema = new Schema({
  schoolName: { type: String, default: 'A/GALENBINDUNUWEWA CENTRAL COLLEGE' },
  schoolNameSi: { type: String, default: 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය' },
  location: { type: String, default: 'Galenbindunuwewa, Sri Lanka' },
  locationSi: { type: String, default: 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව' },
  welcomeTitleEn: { type: String, default: '' },
  welcomeTitleSi: { type: String, default: '' },
  welcomeMessageEn: { type: String, default: '' },
  welcomeMessageSi: { type: String, default: '' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  aboutEn: { type: String, default: '' },
  aboutSi: { type: String, default: '' },
  historyEn: { type: String, default: '' },
  historySi: { type: String, default: '' },
  visionEn: { type: String, default: '' },
  visionSi: { type: String, default: '' },
  missionEn: { type: String, default: '' },
  missionSi: { type: String, default: '' },
  academicLifeEn: { type: String, default: '' },
  academicLifeSi: { type: String, default: '' },
  studentActivitiesEn: { type: String, default: '' },
  studentActivitiesSi: { type: String, default: '' },
  clubsSocietiesEn: { type: String, default: '' },
  clubsSocietiesSi: { type: String, default: '' },
  sportsEn: { type: String, default: '' },
  sportsSi: { type: String, default: '' },
  achievementsEn: { type: String, default: '' },
  achievementsSi: { type: String, default: '' },
  schoolCommunityEn: { type: String, default: '' },
  schoolCommunitySi: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  addressEn: { type: String, default: '' },
  addressSi: { type: String, default: '' },
  googleMapsUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const GradeModel = mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
export const ClassModel = mongoose.models.Class || mongoose.model('Class', ClassSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
export const TimetableModel = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
export const NoticeModel = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
export const NewsModel = mongoose.models.News || mongoose.model('News', NewsSchema);
export const EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);
export const GalleryAlbumModel = mongoose.models.GalleryAlbum || mongoose.model('GalleryAlbum', GalleryAlbumSchema);
export const GalleryModel = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
export const StudyMaterialModel = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', StudyMaterialSchema);
export const SchoolSettingsModel = mongoose.models.SchoolSettings || mongoose.model('SchoolSettings', SchoolSettingsSchema);
