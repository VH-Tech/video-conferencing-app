# Meeting Transcript Feature - Setup Guide

## Overview
This feature allows users to view meeting transcripts post-call using Daily.co's built-in transcription storage.

## What Was Implemented

### 1. Backend Changes

#### API Endpoints Created:
- **GET /api/transcripts** - Lists all transcripts for the authenticated user's rooms
- **GET /api/transcripts/[id]** - Fetches specific transcript details and download link

#### Room Creation Updated:
- Added `enable_transcription_storage: true` to Daily.co room creation
- Location: [app/api/create-room/route.ts](app/api/create-room/route.ts:33)

### 2. Database Schema

Created SQL migration for optional transcript metadata storage:
- File: [sql/create_transcripts_table.sql](sql/create_transcripts_table.sql)
- Run this in your Supabase SQL editor to create the table
- Stores: transcript_id, room_name, meeting_date, duration, status

### 3. Frontend Pages

#### Transcript History Page
- URL: `/transcripts`
- File: [app/transcripts/page.tsx](app/transcripts/page.tsx)
- Features:
  - Lists all past meetings with transcripts
  - Shows room name, date, duration, status
  - Links to individual transcript views

#### Transcript Viewer Page
- URL: `/transcripts/[id]`
- File: [app/transcripts/[id]/page.tsx](app/transcripts/[id]/page.tsx)
- Features:
  - Parses and displays WebVTT transcripts
  - Search functionality
  - Export as TXT, JSON, or WebVTT
  - Shows timestamps and speakers

### 4. Navigation
- Added "View Transcripts" link to home page navigation
- Location: [app/page.tsx](app/page.tsx:121-126)

## Setup Instructions

### Step 1: Run Database Migration
1. Log into your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `sql/create_transcripts_table.sql`
4. Run the query

### Step 2: Verify Daily.co Configuration
No additional Daily.co configuration needed! The code already:
- Enables transcription when creating rooms
- Enables transcription storage automatically
- Auto-starts transcription for room owners

### Step 3: Test the Feature
1. Create a new room from the home page
2. Join the meeting and speak (transcription will auto-start)
3. Leave the meeting
4. Wait a few minutes for Daily.co to process the transcript
5. Click "View Transcripts" in the navigation
6. You should see your meeting listed
7. Click on it to view the full transcript

## How It Works

1. **During Meeting Creation:**
   - `enable_transcription_storage: true` is set on the Daily.co room
   - Transcription auto-starts when the room owner joins

2. **During Meeting:**
   - Daily.co captures and stores transcription in real-time
   - Updates WebVTT file every 2 minutes

3. **After Meeting:**
   - Daily.co finalizes the transcript
   - Status changes to "finished"
   - WebVTT file becomes available

4. **Viewing Transcripts:**
   - App fetches transcript list from Daily.co API
   - Filters to show only user's rooms
   - Downloads and parses WebVTT files for display
   - Provides export options

## API Flow

```
User → /transcripts
  → GET /api/transcripts
    → Daily.co GET /v1/transcript
      → Filters by user's rooms
        → Returns list

User → /transcripts/[id]
  → GET /api/transcripts/[id]
    → Daily.co GET /v1/transcript/[id]
    → Daily.co GET /v1/transcript/[id]/access-link
      → Returns transcript info + download link
        → App fetches WebVTT file
          → Parses and displays
```

## Features

### Current Features:
- ✅ Automatic transcription storage
- ✅ List all past meeting transcripts
- ✅ View individual transcripts with timestamps
- ✅ Search within transcripts
- ✅ Export as TXT, JSON, or WebVTT
- ✅ Access control (only room owners can view)

### Potential Future Enhancements:
- Speaker identification improvements
- Transcript summary generation (AI)
- Share transcripts with meeting participants
- Email transcript after meeting
- Integration with calendar

## Troubleshooting

### No transcripts showing up?
1. Wait 2-5 minutes after meeting ends for processing
2. Verify transcription was enabled during the meeting
3. Check that you're the room owner (transcription only starts for owners)
4. **IMPORTANT**: Make sure you created the room AFTER the `enable_transcription_storage` update

### Transcript parsing issues?
- Daily.co WebVTT format may vary
- Check browser console for parsing errors
- The parser handles most standard WebVTT formats

### API errors?
- Verify `DAILY_API_KEY` is set in `.env.local`
- Check Daily.co dashboard for API usage
- Ensure transcript storage is enabled on your Daily.co account

## Bug Fixes Applied

### Field Name Mismatch Fixed (Critical)
**Issue**: Daily.co API returns camelCase fields (`roomName`, `transcriptId`) but code was looking for snake_case (`room_name`).

**Fixed in**:
- `app/api/transcripts/route.ts` - Line 52: Changed `transcript.room_name` to `transcript.roomName`
- `app/api/transcripts/[id]/route.ts` - Line 46: Changed `transcriptInfo.room_name` to `transcriptInfo.roomName`
- `app/transcripts/page.tsx` - Updated interface and component to use Daily.co field names

This was preventing transcripts from being filtered and displayed correctly.

## File Structure

```
app/
├── api/
│   ├── create-room/
│   │   └── route.ts (updated with enable_transcription_storage)
│   └── transcripts/
│       ├── route.ts (list transcripts)
│       └── [id]/
│           └── route.ts (get transcript details)
├── transcripts/
│   ├── page.tsx (transcript list)
│   └── [id]/
│       └── page.tsx (transcript viewer)
└── page.tsx (updated with navigation link)

sql/
└── create_transcripts_table.sql (database migration)
```

## Notes

- Transcripts are stored in Daily.co's cloud by default
- WebVTT is the standard format (compatible with many tools)
- The database table is optional - mainly for metadata
- All transcript data comes from Daily.co's API
- No additional storage costs on your end
