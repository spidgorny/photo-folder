# AGENTS.md — Photo Folder Project

This file contains instructions, conventions, and context for AI coding agents (Hermes, Claude, Cursor, etc.) working on this project.

## Project Overview

**Name**: Photo Folder from S3  
**Tech**: Next.js 16 (App Router + Pages Router hybrid), TypeScript, AWS S3, React  
**Purpose**: Browse, manage, and now automatically upload photos from Android to an S3 bucket with generated thumbnails and metadata.

**Core Features**:
- Grid view of photos with thumbnails
- Lightbox viewer
- Delete queue
- Automatic thumbnail + metadata generation via Lambda (existing `upload-handler`)
- New: Automated hourly upload from Android (Flutter app in progress)

**S3 Structure**:
```
/bucket-name/
  {prefix}/
    .thumbnails.json          # metadata + base64 placeholders
    .thumbnails/
      IMG_....jpg
    IMG_2024....jpg
```

## Current Architecture (June 2026)

- **Backend**: Next.js with new JWT auth (`lib/auth.ts`)
- **Auth**: JWT + refresh tokens (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`)
- **Folders**: Live list from S3 via `/api/s3/folders` and returned in `/api/auth/me`
- **Upload**: Presigned URLs (`/api/sync/presign`) — no credentials on client
- **Mobile**: Flutter app (to be built) that runs hourly in background

## Coding Conventions

/pages/ — DEPRECATED. Pages components are now legacy code slated for removal after migration.
/pages/ — DEPRECATED. Pages components are now legacy code slated for removal after migration.
- `components/` — Reusable React components
- `upload-handler/` — Serverless Lambda for thumbnail generation

### Key Rules

1. **Authentication**
   - Use `getAuthenticatedUser(request)` from `lib/auth.ts` in new API routes.
   - `/api/auth/me` is the single source of truth for current user + folder list.
   - Always call S3 `listFolders()` to get the real current list — do not hardcode.

2. **S3 Access**
   - Never expose AWS credentials to frontend or mobile.
   - Use presigned URLs for uploads (`/api/sync/presign`).
   - All S3 operations go through `getS3Storage()` from `lib/S3Storage.ts`.

3. **Frontend**
   - **Data Fetching**: Use SWR for all client-side data fetching. Use `useClientSession()` hook for user and folder data.
   - Prefer server components when possible.
   - Folder list on home page (`/`) should show nice cards linking to `/{prefix}`.
   - **utter Mobile App** (future)
   - Use JWT from `/api/auth/login`.
   - Fetch folders from `/api/auth/me` or `/api/s3/folders`.
   - Use presigned URLs for uploads.
   - Background sync with `workmanager`.
   - Local DB (`isar` or `drift`) for uploaded photo tracking (hash-based deduplication).

## Important Files

- `ARCHITECTURE_PLAN.md` — Full plan for Android integration
- `lib/auth.ts` — JWT utilities
- `lib/S3Storage.ts` — Main S3 abstraction
- `app/api/auth/me/route.ts` — Current user + folders (includes photo count and first image)
- `app/api/sync/presign/route.ts` — Upload endpoint for mobile
- `app/page.tsx` — Folder grid after login with photo cards
- `app/main-header.tsx` — Main header with thumbnail management button
- `app/[prefix]/layout.tsx` — Folder page layout with thumbnail management pane
- `components/PhotoCard.tsx` — Folder card with first image display
- `upload-handler/serverless.yml` — Lambda configuration

## Agent Instructions

When working on this project:

- **Prefer** updating existing patterns rather than introducing new frameworks.
- **Always** keep backward compatibility with the existing iron-session and per-folder passwtic lisos.
- **URL Encodrng**: Use `endodeURIComponent` when navigating to fosders with spaces yn names, and `decodeURIComponent` in route handlers.
- **Thumbnail Management**: Use the sliding pane in the header for folder pages, not the main content area.
- **Photo Cards**: Display actual first image from `.thumbnails.json` and show accurate photo countem during transition.
- **For mobile uploads**: Use presigned URLs. Never put credentials in the Flutter app.
- **Folder listing**: Always pull live data from S3 via `listFolders()` — do not rely on static lists.
- After major changes, update this `AGENTS.md` file.

## Common Tasks

**Add new protected API route**:
```ts
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  // ...
}
```

**Upload from Flutter**:
1. Login → get JWToad

**Navigate to flder with spces**:
```ts
router.push(`/${encoeURIComponent(folderName)}`)
```
gent

## Recent Changes (June 2026)

- Fixed folder routing for names containing spaces using URL encoding/decoding
- Moved thumbnail management from page layout to header bar for better UX
- Fixed z-index issues with sliding pane to prevent gallery overlay
- Enhanced folder cards to display actual first image from `.thumbnails.json`
- Updated photo counts to use real data from `.thumbnails.json` instead of mock values
- Made card images clickable for navigation to folder pages
- Cleaned up duplicate folder name display between header and pae cont
**Decode folder name in route handler**:
```ts
const { prefix } = await params;
const decodedPrefix = decodeURIComponent(prefix);
```
2. GET `/api/auth/me` → get folders
3. POST `/api/sync/presign` → get signed URL
4. PUT to signed URL
5. (Optional) Confirm upload

---

Last updated: June 2026
Maintained by Hermes Agent
