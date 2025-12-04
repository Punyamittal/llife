# Campus Chat Hub

A real-time chat application for campus communities. No login required - just open and start chatting!

## Features

- ⚡ **Ultra-fast real-time messaging** - Powered by Supabase Realtime (sub-second sync!)
- 👤 **Auto-generated usernames** - No registration needed
- ☁️ **Cloud database** - Messages saved in Supabase (PostgreSQL)
- 🗑️ **Auto-cleanup** - Messages automatically deleted after 1 week
- 📱 **Responsive design** - Works on desktop and mobile
- 🌐 **Scalable** - Handles thousands of concurrent users

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Database**: Supabase (PostgreSQL with real-time subscriptions)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Git-Vaibhav323/campus-chat-hub.git
cd campus-chat-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - Get your API keys from Settings → API

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser:
   - Frontend: http://localhost:8081

> **Note**: No backend server needed! Supabase handles everything in the cloud.

## Project Structure

```
campus-chat-hub/
├── supabase/         # Supabase setup files
│   ├── schema.sql    # Database schema
│   └── cleanup-function.sql  # Cleanup function
├── src/              # Frontend React app
│   ├── components/   # React components
│   ├── lib/          # Utilities (Supabase client)
│   ├── pages/        # Page components
│   └── types/        # TypeScript types
└── package.json      # Dependencies
```

## How It Works

1. **Auto-Username**: When you open the app, a unique username is automatically generated (e.g., "MysticPhoenix1234")
2. **Real-time Chat**: Messages sync instantly via Supabase Realtime (sub-second latency!)
3. **Cloud Database**: All messages are stored in Supabase PostgreSQL database
4. **Auto-cleanup**: Messages older than 1 week are automatically deleted (via Edge Function or cron)

## Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

See `SUPABASE_SETUP.md` for detailed setup instructions.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# mlife
