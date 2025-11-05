# Daily.co Webhook Setup Guide

This guide explains how to configure Daily.co webhooks to automatically save transcript metadata when meetings end.

## What This Does

When the last participant leaves a meeting:
1. Daily.co sends a `meeting.ended` webhook to your server
2. Your server waits 5 seconds for transcription to finish
3. Fetches the transcript from Daily.co API
4. Saves metadata to your Supabase `transcripts` table automatically

## Setup Steps

### 1. Deploy Your Application

First, deploy your application to a public URL (Vercel, Railway, etc.) so Daily.co can reach your webhook endpoint.

Your webhook endpoint will be:
```
https://your-domain.com/api/webhooks/daily
```

### 2. Configure Webhook in Daily.co Dashboard

1. Go to [Daily.co Dashboard](https://dashboard.daily.co)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add Webhook**
4. Fill in the details:
   - **Webhook URL**: `https://your-domain.com/api/webhooks/daily`
   - **Events to subscribe to**: Select `meeting.ended`
   - **Optional**: Add other events if needed (e.g., `transcription.finished`)

### 3. Test the Webhook

1. Create a new room in your app
2. Join the meeting
3. Speak for a few seconds (to generate transcript)
4. Leave the meeting (be the last participant)
5. Wait 2-5 minutes for processing
6. Check your Supabase `transcripts` table - you should see the entry!

### 4. Local Development Testing (Optional)

For local testing, use a tunnel service like ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, create a tunnel
ngrok http 3000
```

Use the ngrok URL for your webhook endpoint during development:
```
https://abc123.ngrok.io/api/webhooks/daily
```

## Webhook Payload Example

When Daily.co sends a `meeting.ended` event, it looks like this:

```json
{
  "type": "meeting.ended",
  "event": {
    "room": "your-room-name",
    "mtg_session_id": "abc-123-def-456",
    "duration": 120,
    "start_time": "2025-01-05T10:30:00Z",
    "max_participants": 2
  }
}
```

## Troubleshooting

### Webhook Not Firing?

1. **Check Daily.co Webhook Logs**:
   - Go to Dashboard → Developers → Webhooks
   - Click on your webhook to see delivery logs
   - Look for failed attempts or errors

2. **Verify Endpoint is Accessible**:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/daily \
     -H "Content-Type: application/json" \
     -d '{"type":"test","event":{}}'
   ```

3. **Check Server Logs**:
   - Look at your deployment logs (Vercel, Railway, etc.)
   - Search for "Received Daily.co webhook"

### Transcripts Not Saving?

1. **Check Supabase Logs**: Look for insert errors
2. **Verify RLS Policies**: The webhook uses a service role, so RLS shouldn't block it
3. **Check Transcript Availability**: Transcripts take 2-5 minutes to process after meeting ends

### Meeting Duration is Wrong?

The `duration` field in the webhook is in seconds. The code converts it to an interval format for Postgres.

## Security Considerations

### Webhook Verification (Recommended)

Daily.co signs webhooks with HMAC. To verify authenticity:

```typescript
import crypto from 'crypto'

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}
```

Get your webhook secret from the Daily.co dashboard and add it to `.env.local`:
```
DAILY_WEBHOOK_SECRET=your-secret-here
```

## Advanced: Multiple Event Types

You can subscribe to multiple events:

- `meeting.started` - Track when meetings begin
- `participant.joined` - Count active participants
- `participant.left` - Track who attended
- `transcription.finished` - Get notified immediately when transcript is ready
- `recording.ready` - Save recording links

Example handling multiple events:

```typescript
if (type === 'meeting.started') {
  // Track meeting start time
} else if (type === 'meeting.ended') {
  // Save transcript metadata
} else if (type === 'transcription.finished') {
  // Process transcript immediately
}
```

## Production Checklist

- [ ] Webhook endpoint is deployed and publicly accessible
- [ ] Webhook configured in Daily.co dashboard
- [ ] `meeting.ended` event is subscribed
- [ ] Tested with a real meeting
- [ ] Supabase `transcripts` table is populated automatically
- [ ] Webhook verification is enabled (optional but recommended)
- [ ] Error monitoring is set up (Sentry, LogRocket, etc.)

## Next Steps

Once webhooks are working, you can enhance the system:

1. **Real-time notifications**: Send users an email when transcript is ready
2. **Participant tracking**: Save who attended each meeting
3. **Analytics**: Track meeting duration, frequency, participant count
4. **Auto-sharing**: Share transcripts with all participants automatically
