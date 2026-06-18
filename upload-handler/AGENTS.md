# AGENTS.md — Upload Handler Lambda

This file contains instructions, conventions, and context for AI coding agents working on the upload-handler Lambda function.

## Project Overview

**Name**: Upload Handler Lambda  
**Tech**: Serverless Framework, AWS Lambda (Node.js 22.x), TypeScript, Sharp, S3  
**Purpose**: Automatically process images uploaded to S3 by generating thumbnails, placeholders, and extracting EXIF metadata.

**Core Features**:
- Triggers on S3 ObjectCreated events for .jpg and .png files
- Generates optimized thumbnails (max 1200px on longest side)
- Creates base64 placeholders using plaiceholder
- Extracts EXIF metadata using ts-exif-parser
- Stores metadata in `.thumbnails.json` file per folder
- Supports manual triggering via HTTP API endpoint

## Architecture

### S3 Event Trigger
The Lambda is triggered automatically when images are uploaded to the S3 bucket (`slawa-photo`):
- Monitors `.jpg` and `.png` file uploads
- Ignores files in `.thumbnails/` directories (prevents infinite loops)
- Processes images and stores results back to S3

### HTTP API Trigger
Alternative manual trigger via POST `/handle-upload`:
- Accepts JSON body with `file` key (S3 object key)
- Useful for reprocessing existing images or debugging

### Processing Pipeline

For each uploaded image:
1. **Validation**: Check file extension and ignore `.thumbnails/` files
2. **Download**: Fetch original image bytes from S3
3. **Placeholder Generation**: Create 8x8 base64 placeholder with plaiceholder
4. **EXIF Extraction**: Parse EXIF data with ts-exif-parser
5. **Thumbnail Generation**: Create optimized thumbnail (max 1200px) with Sharp
6. **Metadata Storage**: Update `.thumbnails.json` with all metadata
7. **Thumbnail Storage**: Save thumbnail to `.thumbnails/` directory

### S3 Structure
```
/bucket-name/
  {prefix}/
    .thumbnails.json          # metadata + base64 placeholders for all images
    .thumbnails/
      IMG_....jpg             # optimized thumbnails
    IMG_2024....jpg           # original images
```

## File Structure

- `src/index.ts` — Main Lambda handlers (S3 event + HTTP API)
- `src/handle-upload.ts` — Upload orchestration and validation
- `src/handle-thumbnail.ts` — Thumbnail generation with Sharp
- `src/handle-placeholder.ts` — Placeholder generation and EXIF extraction
- `src/utils.ts` — Utility functions (urlDecode, time, UploadObject type)
- `serverless.yml` — Serverless Framework configuration

## Environment Variables

Required environment variables (set in `.env` or deployment environment):
- `BUCKET_ACCESS_KEY_ID` — AWS access key for S3
- `BUCKET_SECRET_ACCESS_KEY` — AWS secret key for S3
- `BUCKET_NAME` — S3 bucket name (default: `slawa-photo`)
- `THUMBNAIL_SIZE` — Max thumbnail size in pixels (default: `500`)

## Deployment

Deploy using Serverless Framework:
```bash
serverless deploy
```

The service deploys two functions:
- `uploadHandler` — S3 event trigger (main)
- `uploadHandlerApi` — HTTP API endpoint (manual trigger)

## Coding Conventions

### Key Rules

1. **File Validation**
   - Always call `preventRunningIfWrongFileUploaded()` before processing
   - Allowed extensions: jpeg, jpg, png, webp, gif, avif, tiff, svg
   - Never process files in `.thumbnails/` directories

2. **Error Handling**
   - Use `invariant()` from `../lib/invariant` for type assertions
   - Log errors with Logger instance
   - Return structured error responses for API handler

3. **Image Processing**
   - Use Sharp for all image transformations
   - Thumbnail constraint: max `THUMBNAIL_SIZE` pixels on longest side (default: 500px)
   - Preserve aspect ratio (resize by width or height based on orientation)

4. **Metadata**
   - Extract EXIF with `ts-exif-parser`
   - Generate placeholders with `plaiceholder` (size: 8, autoOrient: true)
   - Clean metadata: remove icc, exif, xmp fields before storing

5. **S3 Operations**
   - Use `getS3Storage()` from `../lib/S3Storage`
   - Use `ThumbFileS3` for `.thumbnails.json` management
   - Always use the same S3 instance for consistency

## Important Dependencies

- `sharp` — Image processing (thumbnail generation)
- `plaiceholder` — Base64 placeholder generation
- `ts-exif-parser` — EXIF metadata extraction
- `aws-lambda` — TypeScript types for Lambda events
- `../lib/S3Storage` — S3 abstraction layer
- `../lib/logger` — Logging utility
- `../lib/invariant` — Type assertion utility

## Common Tasks

**Add support for new image format**:
1. Add extension to `allowedFiles` array in `src/handle-upload.ts`
2. Add S3 event trigger in `serverless.yml` with new suffix
3. Test with sample image

**Change thumbnail size**:
1. Update `THUMBNAIL_SIZE` in `.env` file
2. Redeploy with `serverless deploy`
3. Consider impact on storage costs and load times

**Add new metadata extraction**:
1. Add extraction logic in `src/handle-placeholder.ts`
2. Include in `value` object before `thumbFile.put()`
3. Update TypeScript types if needed

**Debug processing**:
1. Use HTTP API endpoint: `POST /handle-upload` with `{ "file": "prefix/image.jpg" }`
2. Check CloudWatch logs for Lambda execution
3. Logger outputs timing for placeholder and thumbnail generation

## Agent Instructions

When working on this project:

- **Prefer** minimal changes to avoid breaking existing image processing
- **Always** test with actual images after modifications
- **Keep** thumbnail generation fast (Lambda has 15-minute timeout, but aim for <30s)
- **Monitor** S3 storage costs when changing thumbnail sizes
- **Never** remove the `.thumbnails/` directory check (prevents infinite loops)
- After major changes, update this `AGENTS.md` file.

---

Last updated: June 2026
Maintained by Hermes Agent
