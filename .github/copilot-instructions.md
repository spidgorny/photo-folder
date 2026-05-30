# Copilot instructions for `photo-folder`

## Build, test, and lint commands

### Main Next.js app

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Start Turbopack dev server: `npm run dev:turbo`
- Production build: `npm run build`
- Run production server: `npm run start`

There is currently **no root `lint` or `test` npm script**.

### Script-style tests in `test/`

This repository uses runnable TypeScript scripts instead of a formal test runner. Run them from the repository root with `tsx`; `test/bootstrap.ts` loads the nearest `.env` automatically.

- Example single-script check: `npx tsx test/test-placeholder.ts`
- Thumbnail generation script: `npx tsx test/thumbnails/run-thumbs.ts`
- Lambda reindex script: `npx tsx test/run-index-by-lambda.ts`

### Lambda package in `upload-handler/`

Run these from `upload-handler/`:

- Local invocation: `npm run sls:invoke:local`
- Alternate local event: `npm run sls:invoke:local-asd`
- Deploy Lambda stack: `npm run sls:deploy`
- Tail Serverless logs: `npm run sls:logs`

## High-level architecture

This repo has **two cooperating runtimes**:

1. The root project is a **Next.js 16 App Router UI** for browsing and managing photos stored in S3.
2. `upload-handler/` is a **Serverless Lambda package** that reacts to new S3 uploads and generates derived assets plus metadata.

### S3-driven data model

Each top-level S3 prefix is treated as a photo folder/album. The UI expects this structure inside each prefix:

```text
<prefix>/
  .thumbnails.json
  .thumbnails/<filename>
  .password.json   # optional
  original images...
```

- `.thumbnails.json` is the main metadata index consumed by the UI.
- `.thumbnails/` stores generated preview images.
- `.password.json` gates a folder for viewers without a previously approved session.

### Request/data flow

- `lib/S3Storage.ts` is the central wrapper for S3 reads, writes, listing, uploads, and deletes.
- `lib/thumb-file.ts` encapsulates reading/writing `.thumbnails.json`, with `ThumbFileS3` persisting it back to S3.
- `app/[prefix]/page.tsx` is the main folder page. It loads thumbnails through `getThumbnailsFallbackToFiles()` and falls back to raw S3 listing when `.thumbnails.json` is missing.
- The gallery UI uses SWR hooks (`components/use-thumbnails.tsx`, `components/use-client-session.tsx`) against JSON APIs.

### Mixed routing model

This codebase intentionally mixes **App Router** and **legacy `pages/api`**:

- `app/` contains the main pages and modern route handlers for S3 mutations such as upload, mkdir, and delete.
- `pages/api/auth/*.ts` still owns login/logout/session endpoints.
- `pages/api/s3/thumb/[...key].ts` and `pages/api/s3/jpg/[...key].ts` still serve binary image bytes.

Do not assume everything under `/api` has been migrated to `app/api`.

### Authentication and folder access

There are **two separate access mechanisms**:

- Admin/authenticated user access uses `iron-session` plus the `VALID_USERS` env var (`pages/api/auth/login.ts`). That controls UI features like folder creation, upload, and delete.
- Per-folder viewer access uses `.password.json` in S3. `app/[prefix]/page.tsx` checks it, and `app/[prefix]/handle-password.ts` stores accepted folder passwords in `session.validPasswords`.

### Upload processing pipeline

The UI uploads originals to S3 through `app/api/s3/upload/route.ts`. After that:

- S3 object-created events trigger `upload-handler/index.ts`.
- `handle-placeholder.ts` updates `.thumbnails.json` with low-res placeholder data, image metadata, and EXIF tags.
- `handle-thumbnail.ts` writes the resized image into `.thumbnails/`.

The Lambda can also be invoked through its HTTP API for backfilling existing uploads.

## Key conventions

- **Use the existing path aliases and keep TS extensions where the code already does.** `tsconfig.json` enables `allowImportingTsExtensions`, and imports commonly use `@/`, `@components/`, `@lib/`, plus explicit `.ts`/`.tsx` suffixes.
- **Prefer native `fetch` in client components and App Router boundaries.** Browser-side `axios` imports have already caused Turbopack/SSR dependency issues by pulling Node-only transitive packages into the bundle.
- **Preserve the mixed API layout.** If you change auth or image-serving endpoints, check both `app/api` and `pages/api` before moving or duplicating logic.
- **Treat `.thumbnails.json` as the UI source of truth, but preserve the fallback path.** The app is designed to keep working against raw S3 listings when that file is missing.
- **Keep thumbnail derivatives in sync with source-object mutations.** Delete flows remove both the original object and its `.thumbnails/` counterpart, then rewrite `.thumbnails.json` via the existing cleanup logic in `app/api/s3/deleteMany/route.ts`.
- **Folder creation is represented by an `.empty` object.** `app/api/s3/mkdir/route.ts` creates `<prefix>/.empty` rather than a real directory.
- **Hidden dotfiles are intentionally excluded from normal listings.** `S3Storage.list()` filters any key segment starting with `.`.
- **Client-side gallery selection is session-scoped in browser storage.** `useSelectedImages()` stores the delete queue in session storage under `selected-images`.
