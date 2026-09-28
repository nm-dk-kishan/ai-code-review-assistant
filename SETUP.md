# Setup & Run Instructions

## Complete AI-Powered Code Review Assistant

This is a production-ready full-stack application. Both backend and frontend have been built successfully with no errors.

## Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ running locally or accessible (Atlas recommended)
- An AI provider account (OpenAI, or local LM Studio)

## Step 1: Database Setup

### Install MongoDB
- Download from [MongoDB Website](https://www.mongodb.com/try/download/community) or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 2: Configure Environment Variables

### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
DATABASE_URL="mongodb://localhost:27017/code_review_db"
JWT_SECRET="your-super-secret-key-change-this"
JWT_EXPIRATION="7d"
MAX_FILE_SIZE=52428800
UPLOAD_DIR="./uploads"
API_PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
```

### Frontend Configuration
```bash
cd ../frontend
cp .env.local.example .env.local
```

`frontend/.env.local` is already configured correctly for development.

## Step 3: Start the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run start:dev
```

Backend will run on **http://localhost:3000**

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on **http://localhost:3001**

### Terminal 3 (Optional): Start LM Studio Locally
If using LM Studio instead of OpenAI:
```bash
# Open LM Studio GUI and load a model (e.g., Mistral, Llama, etc.)
# The API will be available at http://localhost:1234/v1
```

## Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## First-Time Setup in App

1. **Register Account**: Create a new account on the registration page
2. **Configure AI Provider**:
   - Go to Settings (top right)
   - Add your AI provider (OpenAI, LM Studio, or custom)
   - Set as default
3. **Create Project**: Go to Dashboard → New Project
4. **Upload Code**: Click on project → Upload ZIP file
5. **Run Review**: Select files → Choose review mode → Start Review
6. **Chat**: Use AI Chat tab to ask questions about your code

## AI Provider Configuration Examples

### OpenAI
- **Base URL**: `https://api.openai.com/v1`
- **API Key**: Get from https://platform.openai.com/api-keys
- **Model**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

### LM Studio (Local)
- **Base URL**: `http://localhost:1234/v1`
- **API Key**: `lm-studio` (any value)
- **Model**: Name of your loaded model

### Custom OpenAI-Compatible API
- **Base URL**: Your API endpoint (e.g., `https://api.together.ai/v1`)
- **API Key**: Your API key
- **Model**: Model name supported by your provider

## Build & Production Deployment

### Build Backend for Production
```bash
cd backend
npm run build
npm run start:prod
```

### Build Frontend for Production
```bash
cd frontend
npm run build
npm run start
```

## Testing

### Run Backend Tests
```bash
cd backend
npm run test          # Run tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage
npm run test:e2e     # End-to-end tests
```

### TypeScript Checking
```bash
cd backend
npm run build         # Full type check during build
```

## Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
docker ps
# If using a local installer, check your services panel
```

### AI Provider Connection Failed
1. Verify BASE_URL is correct and accessible
2. Check API_KEY is valid
3. Ensure model name exists in your provider account
4. Test with curl:
```bash
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

### File Upload Failed
- Verify file is a valid ZIP
- Check MAX_FILE_SIZE setting
- Ensure UPLOAD_DIR exists and is writable

### JWT Token Expired
- Clear browser localStorage: `localStorage.clear()`
- Log in again

## Project Structure

```
.
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── projects/          # Project CRUD
│   │   ├── files/             # ZIP handling
│   │   ├── reviews/           # Code reviews
│   │   ├── ai/                # AI integration
│   │   ├── providers/         # AI provider config
│   │   ├── chat/              # Chat feature
│   │   └── app.module.ts      # Main module
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
├── frontend/                   # Next.js UI
│   ├── app/
│   │   ├── page.tsx           # Home
│   │   ├── login/             # Auth pages
│   │   ├── dashboard/         # Project list
│   │   ├── projects/[id]/     # Project detail
│   │   ├── reviews/[id]/      # Review results
│   │   ├── chat/              # Chat interface
│   │   └── settings/          # AI provider config
│   ├── lib/
│   │   ├── auth-store.ts      # Auth state
│   │   └── api.ts             # API client
│   └── package.json
│
├── README.md                   # Project overview
├── ARCHITECTURE.md             # Technical architecture
├── AI_USAGE.md                # AI integration details
└── .gitignore
```

## Key Features

✅ **Authentication**: JWT + bcrypt password hashing
✅ **Authorization**: Per-user projects with ownership checks
✅ **File Upload**: Safe ZIP extraction with path traversal prevention
✅ **Code Review**: 3 modes - security, performance, code quality
✅ **AI Integration**: Configurable OpenAI-compatible providers
✅ **Chat**: Project-aware AI chat with code context
✅ **Review History**: Full searchable history
✅ **Professional UI**: Responsive design with Tailwind CSS

## Support

Refer to:
- `README.md` - Features and usage
- `ARCHITECTURE.md` - Technical design
- `AI_USAGE.md` - AI integration details
- Backend logs - Full error details

## Important Notes

- **API Keys are server-side only** - Never sent to frontend
- **No code execution** - Uploaded files are analyzed only
- **All data is per-user** - No cross-user data access
- **Production**: Use environment variables from secrets manager, enable HTTPS, use reverse proxy

Happy reviewing! 🚀
