# AI-Powered Code Review Assistant

A professional code review tool powered by AI that provides security, performance, and code quality analysis. Upload your project as a ZIP file and get intelligent insights using configurable AI providers like OpenAI, LM Studio, or any OpenAI-compatible endpoint.

## Features

### Core Functionality
- **Multiple Review Modes**: Security, Performance, and Code Quality analysis
- **ZIP Upload**: Safe extraction with path traversal prevention and file filtering
- **File Explorer**: Browse and manage project files
- **Code Editor**: Read-only Monaco editor with syntax highlighting
- **Review Modes**:
  - Review single file
  - Review multiple files
  - Review entire project
- **Structured Results**: Issues with severity levels (Critical, High, Medium, Low), descriptions, and suggestions
- **Review History**: Track all reviews with search and filtering

### Bonus Features
- **Project-Aware AI Chat**: Ask questions about your code with full project context
- **AI Provider Configuration**: Support for OpenAI, LM Studio, and any OpenAI-compatible API
- **Documentation Generator**: Auto-generate documentation from code
- **Architecture Analysis**: Analyze and explain code architecture

### UI/UX
- Professional developer-focused interface
- Responsive design with Tailwind CSS
- Loading, empty, and error states
- Real-time notifications with React Hot Toast
- Authentication and authorization

## Tech Stack

### Frontend
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Authentication**: JWT tokens (client-side storage)

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT + Passport + bcrypt
- **File Handling**: Multer, Unzipper with safe extraction
- **AI Integration**: Axios for OpenAI-compatible APIs
- **Validation**: Class-Validator and Class-Transformer
- **CORS**: Enabled for frontend communication

## Environment Variables

### Backend (.env)
```
DATABASE_URL="mongodb://localhost:27017/code_review_db"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="7d"
MAX_FILE_SIZE=52428800
UPLOAD_DIR="./uploads"
API_PORT=3000
API_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
DEFAULT_AI_PROVIDER="openai"
DEFAULT_MODEL_NAME="gpt-4"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+ running locally
- An AI provider account (OpenAI, LM Studio, or compatible API)

### Database Setup

1. **Start MongoDB**
Ensure MongoDB is running locally (`mongodb://localhost:27017`).

2. **Generate Prisma Client**
```bash
cd backend
npx prisma generate
```

### Backend Installation

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure .env with your database URL and AI provider settings

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3001`

## Running the Application

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Access the Application
Open `http://localhost:3001` in your browser

## First Steps

1. **Register Account**: Create a new account on the registration page
2. **Configure AI Provider**: Go to Settings and add your AI provider (OpenAI, LM Studio, etc.)
3. **Create Project**: Create a new project on the dashboard
4. **Upload Code**: Upload a ZIP file containing your project
5. **Run Review**: Select files and run a security, performance, or code quality review
6. **View Results**: See detailed issues with severity levels and suggestions
7. **Chat**: Use AI chat to ask questions about your code

## AI Provider Configuration

### OpenAI
- **Base URL**: `https://api.openai.com/v1`
- **API Key**: Get from https://platform.openai.com/api-keys
- **Model**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`, etc.

### LM Studio (Local)
- **Base URL**: `http://localhost:1234/v1`
- **API Key**: `lm-studio` (or any key)
- **Model**: Model name loaded in LM Studio

### Other Compatible APIs
- **Base URL**: Your API endpoint
- **API Key**: Your API key
- **Model**: Model name supported by your provider

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Files
- `POST /api/files/upload/:projectId` - Upload ZIP file
- `GET /api/files/project/:projectId` - List project files
- `GET /api/files/:id` - Get file content
- `DELETE /api/files/:id` - Delete file

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - List reviews
- `GET /api/reviews/:id` - Get review details
- `DELETE /api/reviews/:id` - Delete review

### AI Providers
- `POST /api/providers` - Add AI provider
- `GET /api/providers` - List providers
- `GET /api/providers/default` - Get default provider
- `GET /api/providers/:id` - Get provider details
- `PUT /api/providers/:id` - Update provider
- `POST /providers/:id/set-default` - Set as default
- `DELETE /providers/:id` - Delete provider

### Chat
- `POST /chat/sessions` - Create chat session
- `GET /chat/sessions` - List sessions
- `GET /chat/sessions/:id` - Get session with messages
- `POST /chat/sessions/:id/messages` - Send message
- `DELETE /chat/sessions/:id` - Delete session

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: JWT guard on all protected endpoints
- **Authorization Checks**: Ownership verification on all resources
- **Safe ZIP Extraction**: Path traversal prevention
- **File Filtering**: Only safe file extensions allowed
- **API Key Protection**: Server-side storage, never exposed to client
- **CORS**: Configured for frontend origin
- **Input Validation**: DTO validation on all inputs
- **No Code Execution**: Uploaded code is never executed

## Error Handling

- Comprehensive error responses with meaningful messages
- Validation error details for debugging
- Graceful fallback for AI provider failures
- Proper HTTP status codes
- Toast notifications for user feedback

## Testing

### Backend Tests
```bash
cd backend
npm run test          # Run tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage
npm run test:e2e     # End-to-end tests
```

### Frontend Development
```bash
cd frontend
npm run dev       # Development with hot reload
npm run build     # Production build
npm run lint      # Run linter
```

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── projects/       # Project management
│   │   ├── files/          # File handling
│   │   ├── reviews/        # Code review logic
│   │   ├── ai/             # AI integration
│   │   ├── providers/      # AI provider management
│   │   ├── chat/           # Chat functionality
│   │   ├── prisma/         # Database connection
│   │   ├── app.module.ts   # Main module
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── .env.example        # Environment template
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── login/page.tsx        # Login page
│   │   ├── register/page.tsx     # Register page
│   │   ├── dashboard/page.tsx    # Dashboard
│   │   ├── projects/[id]/page.tsx # Project detail
│   │   ├── reviews/[id]/page.tsx  # Review details
│   │   ├── chat/page.tsx         # Chat interface
│   │   ├── settings/page.tsx     # Settings
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── lib/
│   │   ├── auth-store.ts         # Auth state (Zustand)
│   │   └── api.ts                # API client
│   └── .env.local.example        # Environment template
│
├── README.md          # This file
├── ARCHITECTURE.md    # Architecture documentation
├── AI_USAGE.md        # AI usage documentation
└── .gitignore         # Git ignore file
```

## Limitations

- Review context limited by AI token limits (depends on provider)
- File size limited to 50MB per upload
- ZIP extraction limited to 1000 files
- Chat history limited to last 100 messages per session
- No multi-user project collaboration (per-user projects only)
- No advanced file diff/comparison view
- Local LM Studio requires manual model loading

## Future Improvements

- [ ] Multi-user project collaboration
- [ ] PR/commit integration (GitHub, GitLab)
- [ ] Automated review on commit/push
- [ ] Code diff highlighting and comparison
- [ ] Advanced search and filtering in review history
- [ ] Custom review templates and rules
- [ ] Team management and permissions
- [ ] Slack/email notifications
- [ ] Batch reviews for multiple projects
- [ ] Performance metrics and trends
- [ ] Custom AI prompt templates
- [ ] Code snippet sharing
- [ ] API rate limiting
- [ ] WebSocket for real-time chat updates

## Troubleshooting

### MongoDB Connection Error
```
Ensure MongoDB is running locally
```

### AI Provider Connection Failed
```
- Verify BASE_URL and API_KEY in settings
- Check provider is accessible (curl to base URL)
- Ensure model name is correct
```

### File Upload Failed
```
- Verify MAX_FILE_SIZE setting
- Ensure file is valid ZIP
- Check UPLOAD_DIR exists and is writable
```

### JWT Token Expired
```
- Clear localStorage and login again
- Adjust JWT_EXPIRATION if needed
```

## Contributing

This is a full-stack application built with production-quality code. All modules follow NestJS best practices with proper dependency injection, error handling, and validation.

## License

MIT
# ai-code-review-assistant
