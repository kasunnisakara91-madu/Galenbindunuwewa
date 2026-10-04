import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AdminModel,
  UserModel,
  StudentModel,
  GradeModel,
  ClassModel,
  SubjectModel,
  AnnouncementModel,
  TimetableModel,
  NoticeModel,
  NewsModel,
  EventModel,
  GalleryAlbumModel,
  GalleryModel,
  StudyMaterialModel,
  SchoolSettingsModel,
} from './models/schemas.ts';

export type CollectionName =
  | 'admins'
  | 'users'
  | 'students'
  | 'grades'
  | 'classes'
  | 'subjects'
  | 'announcements'
  | 'timetables'
  | 'notices'
  | 'news'
  | 'events'
  | 'galleryAlbums'
  | 'galleries'
  | 'studyMaterials'
  | 'schoolSettings';

const MODEL_MAP: Record<CollectionName, mongoose.Model<any>> = {
  admins: AdminModel,
  users: UserModel,
  students: StudentModel,
  grades: GradeModel,
  classes: ClassModel,
  subjects: SubjectModel,
  announcements: AnnouncementModel,
  timetables: TimetableModel,
  notices: NoticeModel,
  news: NewsModel,
  events: EventModel,
  galleryAlbums: GalleryAlbumModel,
  galleries: GalleryModel,
  studyMaterials: StudyMaterialModel,
  schoolSettings: SchoolSettingsModel,
};

interface LocalStoreData {
  admins: any[];
  users: any[];
  students: any[];
  grades: any[];
  classes: any[];
  subjects: any[];
  announcements: any[];
  timetables: any[];
  notices: any[];
  news: any[];
  events: any[];
  galleryAlbums: any[];
  galleries: any[];
  studyMaterials: any[];
  schoolSettings: any[];
}

const DATA_DIR = path.resolve(process.cwd(), 'backend', 'data');
const STORE_PATH = path.join(DATA_DIR, 'mongodb_store.json');

let isMongoConnected = false;
let localStore: LocalStoreData = {
  admins: [],
  users: [],
  students: [],
  grades: [],
  classes: [],
  subjects: [],
  announcements: [],
  timetables: [],
  notices: [],
  news: [],
  events: [],
  galleryAlbums: [],
  galleries: [],
  studyMaterials: [],
  schoolSettings: [],
};

function loadLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      localStore = { ...localStore, ...parsed };
    } else {
      saveLocalStore();
    }
  } catch (err) {
    console.error('Error loading local MongoDB document store:', err);
  }
}

function saveLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local MongoDB document store:', err);
  }
}

function generateObjectId(): string {
  return crypto.randomBytes(12).toString('hex');
}

function matchesFilter(doc: any, filter: Record<string, any> = {}): boolean {
  for (const [key, cond] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(cond)) {
      const anyMatch = cond.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }
    if (key === '$and' && Array.isArray(cond)) {
      const allMatch = cond.every((subFilter) => matchesFilter(doc, subFilter));
      if (!allMatch) return false;
      continue;
    }

    const val = doc[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof RegExp)) {
      if ('$in' in cond && Array.isArray(cond.$in)) {
        if (!cond.$in.includes(val)) return false;
      }
      if ('$ne' in cond) {
        if (val === cond.$ne) return false;
      }
      if ('$regex' in cond) {
        const flags = cond.$options || '';
        const regex = cond.$regex instanceof RegExp ? cond.$regex : new RegExp(cond.$regex, flags);
        if (!regex.test(String(val ?? ''))) return false;
      }
    } else if (cond instanceof RegExp) {
      if (!cond.test(String(val ?? ''))) return false;
    } else {
      if (val !== cond) return false;
    }
  }
  return true;
}

export const db = {
  isUsingRemoteMongo(): boolean {
    return isMongoConnected;
  },

  async find(
    collection: CollectionName,
    filter: Record<string, any> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<any[]> {
    if (isMongoConnected) {
      const docs = await MODEL_MAP[collection].find(filter).sort(sort).lean();
      return docs.map((d: any) => ({ ...d, _id: String(d._id) }));
    }
    const items = (localStore[collection] || []).filter((item) => matchesFilter(item, filter));
    const sortEntries = Object.entries(sort);
    if (sortEntries.length > 0) {
      items.sort((a, b) => {
        for (const [field, dir] of sortEntries) {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
        }
        return 0;
      });
    }
    return items.map((i) => ({ ...i }));
  },

  async findOne(collection: CollectionName, filter: Record<string, any> = {}): Promise<any | null> {
    if (isMongoConnected) {
      const doc = await MODEL_MAP[collection].findOne(filter).lean();
      return doc ? { ...doc, _id: String((doc as any)._id) } : null;
    }
    const found = (localStore[collection] || []).find((item) => matchesFilter(item, filter));
    return found ? { ...found } : null;
  },

  async findById(collection: CollectionName, id: string): Promise<any | null> {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const doc = await MODEL_MAP[collection].findById(id).lean();
      return doc ? { ...doc, _id: String((doc as any)._id) } : null;
    }
    const found = (localStore[collection] || []).find((item) => String(item._id) === String(id));
    return found ? { ...found } : null;
  },

  async create(collection: CollectionName, data: Record<string, any>): Promise<any> {
    if (isMongoConnected) {
      const created = await MODEL_MAP[collection].create(data);
      const plain = created.toObject();
      return { ...plain, _id: String(plain._id) };
    }
    const now = new Date().toISOString();
    const newDoc = {
      _id: generateObjectId(),
      createdAt: now,
      ...data,
    };
    localStore[collection].push(newDoc);
    saveLocalStore();
    return { ...newDoc };
  },

  async findByIdAndUpdate(
    collection: CollectionName,
    id: string,
    update: Record<string, any>
  ): Promise<any | null> {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await MODEL_MAP[collection]
        .findByIdAndUpdate(id, { $set: update }, { new: true })
        .lean();
      return updated ? { ...updated, _id: String((updated as any)._id) } : null;
    }
    const list = localStore[collection] || [];
    const idx = list.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;
    const cleanUpdate = update.$set ? update.$set : update;
    list[idx] = {
      ...list[idx],
      ...cleanUpdate,
      _id: list[idx]._id,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore();
    return { ...list[idx] };
  },

  async updateMany(
    collection: CollectionName,
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<number> {
    if (isMongoConnected) {
      const res = await MODEL_MAP[collection].updateMany(filter, { $set: update });
      return res.modifiedCount || 0;
    }
    const list = localStore[collection] || [];
    let count = 0;
    const cleanUpdate = update.$set ? update.$set : update;
    for (let i = 0; i < list.length; i++) {
      if (matchesFilter(list[i], filter)) {
        list[i] = { ...list[i], ...cleanUpdate, updatedAt: new Date().toISOString() };
        count++;
      }
    }
    if (count > 0) saveLocalStore();
    return count;
  },

  async findByIdAndDelete(collection: CollectionName, id: string): Promise<boolean> {
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const deleted = await MODEL_MAP[collection].findByIdAndDelete(id);
      return Boolean(deleted);
    }
    const list = localStore[collection] || [];
    const initialLen = list.length;
    localStore[collection] = list.filter((item) => String(item._id) !== String(id));
    if (localStore[collection].length !== initialLen) {
      saveLocalStore();
      return true;
    }
    return false;
  },

  async countDocuments(collection: CollectionName, filter: Record<string, any> = {}): Promise<number> {
    if (isMongoConnected) {
      return MODEL_MAP[collection].countDocuments(filter);
    }
    return (localStore[collection] || []).filter((item) => matchesFilter(item, filter)).length;
  },
};

export async function initializeDatabase() {
  const mongoUri = (process.env.MONGODB_URI || '').trim();
  if (mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
      isMongoConnected = true;
      console.log('Connected to MongoDB via MONGODB_URI.');
    } catch (err) {
      console.warn('Could not connect to remote MONGODB_URI, using persistent local MongoDB store.');
      isMongoConnected = false;
      loadLocalStore();
    }
  } else {
    loadLocalStore();
  }

  // 1. Initialize Admin account with hashed ADMIN_PASSWORD from .env
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@galenbindunuwewacc.lk').trim().toLowerCase();
  const initialPassword = process.env.ADMIN_PASSWORD || 'damith';
  const existingAdmins = await db.find('admins', {});
  if (existingAdmins.length === 0) {
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const admin = await db.create('admins', {
      email: adminEmail,
      passwordHash,
      name: 'System Administrator',
      role: 'ADMIN',
    });
    await db.create('users', {
      name: 'System Administrator',
      role: 'ADMIN',
      referenceId: admin._id,
    });
  }

  // 2. Initialize SchoolSettings (without inventing fake history or fake contact details)
  const existingSettings = await db.find('schoolSettings', {});
  if (existingSettings.length === 0) {
    await db.create('schoolSettings', {
      schoolName: 'A/GALENBINDUNUWEWA CENTRAL COLLEGE',
      schoolNameSi: 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය',
      location: 'Galenbindunuwewa, Sri Lanka',
      locationSi: 'ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව',
      welcomeTitleEn: 'Official Academic & Student Portal — Grades 6 to 13',
      welcomeTitleSi: 'නිල අධ්‍යයන හා ශිෂ්‍ය ද්වාරය — 6 සිට 13 ශ්‍රේණිය දක්වා',
      welcomeMessageEn:
        'Welcome to the official digital portal of A/Galenbindunuwewa Central College, Galenbindunuwewa. Access official school announcements, class-specific timetables, academic subjects, notices, and study materials for Grades 6 through 13.',
      welcomeMessageSi:
        'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලයේ නිල ඩිජිටල් ද්වාරය වෙත සාදරයෙන් පිළිගනිමු. 6 ශ්‍රේණියේ සිට 13 ශ්‍රේණිය දක්වා නිල නිවේදන, පන්ති කාලසටහන්, විෂයයන් සහ ඉගෙනුම් ද්‍රව්‍ය වෙත පිවිසෙන්න.',
      logo: '',
      favicon: '',
      aboutEn: '',
      aboutSi: '',
      historyEn: '',
      historySi: '',
      visionEn: '',
      visionSi: '',
      missionEn: '',
      missionSi: '',
      academicLifeEn: '',
      academicLifeSi: '',
      studentActivitiesEn: '',
      studentActivitiesSi: '',
      clubsSocietiesEn: '',
      clubsSocietiesSi: '',
      sportsEn: '',
      sportsSi: '',
      achievementsEn: '',
      achievementsSi: '',
      schoolCommunityEn: '',
      schoolCommunitySi: '',
      phone: '',
      email: '',
      addressEn: 'A/Galenbindunuwewa Central College, Galenbindunuwewa, Sri Lanka',
      addressSi: 'අ/ගලෙන්බිඳුණුවැව මධ්‍ය මහා විද්‍යාලය, ගලෙන්බිඳුණුවැව, ශ්‍රී ලංකාව',
      googleMapsUrl: '',
      facebookUrl: '',
      youtubeUrl: '',
      websiteUrl: '',
    });
  }

  // 3. Initialize Grades 6–13 and dynamic Classes in DB if empty (Admin can create, rename, deactivate, or delete any class)
  const existingGrades = await db.find('grades', {});
  if (existingGrades.length === 0) {
    for (let g = 6; g <= 13; g++) {
      const isSenior = g >= 12;
      await db.create('grades', {
        gradeNumber: g,
        labelEn: `Grade ${g}`,
        labelSi: `${g} ශ්‍රේණිය`,
        isSenior,
        streams: isSenior ? ['Science', 'Commerce', 'Arts', 'Technology'] : [],
        active: true,
      });
    }
  }

  const existingClasses = await db.find('classes', {});
  if (existingClasses.length === 0) {
    const JuniorSections = ['A', 'B', 'C', 'D', 'E'];
    for (let g = 6; g <= 11; g++) {
      for (const sec of JuniorSections) {
        await db.create('classes', {
          grade: g,
          name: `${g}-${sec}`,
          stream: '',
          classTeacher: '',
          active: true,
        });
      }
    }
    // Senior Grades 12 & 13 classes
    const seniorConfigs = [
      { grade: 12, name: '12-A', stream: 'Science' },
      { grade: 12, name: '12-B', stream: 'Commerce' },
      { grade: 12, name: '12-C', stream: 'Arts' },
      { grade: 12, name: '12-D', stream: 'Technology' },
      { grade: 13, name: '13-A', stream: 'Science' },
      { grade: 13, name: '13-B', stream: 'Commerce' },
      { grade: 13, name: '13-C', stream: 'Arts' },
      { grade: 13, name: '13-D', stream: 'Technology' },
    ];
    for (const sc of seniorConfigs) {
      await db.create('classes', {
        grade: sc.grade,
        name: sc.name,
        stream: sc.stream,
        classTeacher: '',
        active: true,
      });
    }
  }
}
