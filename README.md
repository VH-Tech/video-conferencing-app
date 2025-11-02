# Video Conferencing App

A modern video conferencing application built with Next.js, featuring Daily.co for video calls and Supabase for authentication.

## Features

- User authentication (signup/login) with Supabase
- Create and join video conference rooms
- Real-time video conferencing with Daily.co
- Protected routes with middleware
- Responsive design with Tailwind CSS
- TypeScript support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Supabase
- **Video**: Daily.co
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Daily.co account and domain

## Setup Instructions

### 1. Clone and Install

```bash
cd video-conferencing-app
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://app.supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your project URL and anon/public key
4. In your Supabase project, make sure you have email authentication enabled:
   - Go to Authentication > Providers
   - Enable Email provider

### 3. Set Up Daily.co

1. Go to [Daily.co](https://dashboard.daily.co) and sign up/login
2. Create a new domain or use your existing domain
3. Go to Developers > API Keys
4. Create a new API key

### 4. Configure Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Daily.co Configuration
DAILY_API_KEY=your-daily-api-key
NEXT_PUBLIC_DAILY_DOMAIN=your-daily-domain
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Sign in at `/login`
3. **Create Room**: From the home page, create a new video room (with optional custom name)
4. **Join Room**: Share the room URL with others to join the call

## Project Structure

```
video-conferencing-app/
├── app/
│   ├── api/
│   │   └── create-room/      # API route to create Daily.co rooms
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── room/
│   │   └── [roomName]/        # Dynamic room page
│   └── page.tsx               # Home page
├── components/
│   └── VideoRoom.tsx          # Video conferencing component
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client (browser)
│   │   └── server.ts          # Supabase client (server)
│   └── daily/
│       └── config.ts          # Daily.co configuration
├── middleware.ts              # Auth middleware for protected routes
└── .env.local                 # Environment variables
```

## Key Features Explained

### Authentication Flow

- Users must sign up/login to access the application
- Middleware protects the `/room` routes
- Session is maintained via Supabase cookies

### Video Conferencing

- Daily.co rooms are created via API route
- VideoRoom component handles the Daily.co iframe integration
- Rooms support chat, screen sharing, and recording

### Protected Routes

- Middleware checks authentication status
- Unauthenticated users are redirected to login
- Authenticated users can't access login/signup pages

## Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard > Settings > API |
| `DAILY_API_KEY` | Your Daily.co API key | Daily.co Dashboard > Developers > API Keys |
| `NEXT_PUBLIC_DAILY_DOMAIN` | Your Daily.co domain name | Daily.co Dashboard > Domains |

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### "Invalid API key" error
- Make sure your `DAILY_API_KEY` is correct in `.env.local`
- Restart your development server after changing environment variables

### "Invalid Supabase credentials"
- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure email authentication is enabled in Supabase

### Video not loading
- Check that your `NEXT_PUBLIC_DAILY_DOMAIN` is correct
- Ensure the room was created successfully (check browser console)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
