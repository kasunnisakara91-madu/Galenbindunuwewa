# A/GALENBINDUNUWEWA CENTRAL COLLEGE — Official Portal (Grades 6–13)

Full-stack school management website and student academic portal for **A/Galenbindunuwewa Central College, Galenbindunuwewa, Sri Lanka**.

## Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS + React Router (`/src`)
- **Backend**: Node.js + Express.js + JWT / Cookie Auth + Helmet + Rate Limiting (`/server.ts`, `/backend`)
- **Database**: MongoDB with Mongoose models (`/backend/models/schemas.ts` & `/backend/db.ts`)

---

## 1. MongoDB Setup

1. Install MongoDB locally or create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Copy `.env.example` to `.env` and set your `MONGODB_URI`:
   ```env
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/galenbindunuwewa_cc"
   ```
3. All 15 Mongoose models (`Admin`, `User`, `Student`, `Grade`, `Class`, `Subject`, `Announcement`, `Timetable`, `Notice`, `News`, `Event`, `GalleryAlbum`, `Gallery`, `StudyMaterial`, `SchoolSettings`) and their indexes (`studentId`, `phone`, `grade`, `class`, `createdAt`) are automatically registered on startup.
4. If `MONGODB_URI` is not yet configured in development/preview, the database layer automatically falls back to a local persistent MongoDB-compatible document store (`backend/data/mongodb_store.json`) so all collections and queries work out of the box.

---

## 2. Environment Variables

Configure the following in `.env`:

```env
MONGODB_URI="mongodb://localhost:27017/galenbindunuwewa_cc"
ADMIN_EMAIL="admin@galenbindunuwewacc.lk"
ADMIN_PASSWORD="damith"
JWT_SECRET="galenbindunuwewa-central-college-jwt-secret-key-2026"
PORT=3000
```

---

## 3. Admin Setup & Security

- On first boot, the backend reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, hashes the password with `bcryptjs`, and creates the `Admin` record in MongoDB.
- The password is never exposed in frontend code.
- Navigate to `/admin/login` to sign in and manage students, classes, announcements, timetables, subjects, notices, news, events, gallery, study materials, and bilingual (English / සිංහල) school settings.
- You can update the administrator password at any time from `/admin/settings`.

---

## 4. Running Frontend & Backend

Install dependencies and start the unified Express + Vite server on port `3000`:

```bash
npm install
npm run dev
```

---

## 5. Production Build & Deployment

1. Build the frontend bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   NODE_ENV=production npm start
   ```
