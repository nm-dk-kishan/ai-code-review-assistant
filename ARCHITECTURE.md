# Architecture Documentation

## Overview

The AI-Powered Code Review Assistant is a full-stack web application with a clear separation of concerns:

- **Frontend**: Next.js with client-side state management
- **Backend**: NestJS microservices-ready architecture
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI-compatible API abstraction layer

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Code Editor**: Monaco Editor
- **Notifications**: React Hot Toast

### Structure

```
app/
├── (auth)
│   ├── login/page.tsx        - Login page
│   └── register/page.tsx     - Registration page
├── (authenticated)
│   ├── dashboard/page.tsx    - Projects list
│   ├── projects/[id]/page.tsx - Project detail with file upload
│   ├── reviews/[id]/page.tsx  - Review results
│   ├── chat/page.tsx         - AI chat interface
│   └── settings/page.tsx     - AI provider configuration
├── page.tsx                   - Home/landing page
├── layout.tsx                - Root layout with auth check
└── globals.css               - Global styles

lib/
├── auth-store.ts             - Zustand store for authentication
├── api.ts                    - API client wrapper
└── types.ts                  - TypeScript interfaces
```

### State Management

**Auth Store (Zustand)**
- User information (id, email, name)
- JWT token
- Login/register/logout operations
- Auth state persistence in localStorage

### API Communication

**API Wrapper** (`lib/api.ts`)
- Handles JWT token attachment to all requests
- Centralizes error handling and 401 response
- Type-safe with generics
- Consistent error messages

### Key Pages

**Home Page** (`/page.tsx`)
- Landing page for unauthenticated users
- Feature highlights
- Login/Register buttons

**Login/Register** (`/login` & `/register`)
- Form validation
- Error handling
- Redirect to dashboard on success

**Dashboard** (`/dashboard`)
- Lists user projects
- Create new project form
- Project deletion
- Navigation to project details

**Project Detail** (`/projects/[id]`)
- File upload (ZIP)
- File list with selection
- Review mode selector
- Review start button
- Link to AI chat

**Review Details** (`/reviews/[id]`)
- Summary section
- Issue statistics by severity
- Expandable issue details
- Recommendations
- Link to review history

**Chat** (`/chat`)
- Sidebar with chat sessions
- Create new session
- Message history
- Message input with context awareness
- Project files as context

**Settings** (`/settings`)
- List configured AI providers
- Add new provider
- Set default provider
- Delete provider
- Security notice about API keys

## Backend Architecture

### Tech Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL + Prisma
- **Authentication**: JWT + Passport
- **Validation**: Class-Validator, Class-Transformer
- **File Handling**: Multer, Unzipper
- **HTTP**: Axios for AI provider communication

### Module Structure

```
src/
├── auth/
│   ├── auth.service.ts       - Authentication logic
│   ├── auth.controller.ts    - Auth endpoints
│   ├── jwt.strategy.ts       - Passport JWT strategy
│   ├── auth.module.ts        - Auth module
│   └── dto/auth.dto.ts       - DTO validation
│
├── users/
│   ├── users.service.ts      - User operations
│   ├── users.controller.ts   - User endpoints
│   ├── users.module.ts       - Users module
│   └── (no DTO needed)
│
├── projects/
│   ├── projects.service.ts   - Project CRUD
│   ├── projects.controller.ts - Project endpoints
│   ├── projects.module.ts    - Projects module
│   └── dto/project.dto.ts    - Project DTOs
│
├── files/
│   ├── files.service.ts      - File handling
│   ├── files.controller.ts   - File endpoints
│   ├── files.module.ts       - Files module
│   └── (no DTO needed)
│
├── reviews/
│   ├── reviews.service.ts    - Review logic
│   ├── reviews.controller.ts - Review endpoints
│   ├── reviews.module.ts     - Reviews module
│   └── dto/review.dto.ts     - Review DTOs
│
├── ai/
│   ├── ai.service.ts         - AI integration
│   └── ai.module.ts          - AI module
│
├── providers/
│   ├── providers.service.ts  - Provider management
│   ├── providers.controller.ts - Provider endpoints
│   ├── providers.module.ts   - Providers module
│   └── dto/provider.dto.ts   - Provider DTOs
│
├── chat/
│   ├── chat.service.ts       - Chat logic
│   ├── chat.controller.ts    - Chat endpoints
│   ├── chat.module.ts        - Chat module
│   └── dto/chat.dto.ts       - Chat DTOs
│
├── prisma/
│   ├── prisma.service.ts     - DB connection
│   └── prisma.module.ts      - Prisma module
│
├── app.module.ts             - Root module
└── main.ts                   - Entry point
```

### Key Services

**AuthService**
- User registration with email validation
- Login with password verification
- JWT token generation
- Token validation

**ProjectsService**
- Create, read, update, delete projects
- Ownership verification
- File association

**FilesService**
- Safe ZIP extraction
- Path traversal prevention
- File extension filtering
- Language detection
- File size validation
- Dangerous path filtering (.git, node_modules, .env, etc.)

**AIService**
- Review code using AI providers
- Three review modes: security, performance, quality
- Documentation generation
- Architecture analysis
- OpenAI-compatible API integration

**ProvidersService**
- CRUD for AI provider configurations
- Default provider management
- API key storage (server-side only)
- Provider retrieval for AI operations

**ReviewsService**
- Create code reviews using AI
- Retrieve review history
- Delete reviews
- Integration with AIService and ProvidersService

**ChatService**
- Create chat sessions
- Send/receive messages
- Project context injection
- AI response generation
- Message history management

### Guard & Middleware

**JWT Strategy**
- Passport JWT strategy
- Validates token signature
- Retrieves user from database
- Applied via `@UseGuards(AuthGuard('jwt'))`

**Global Validation Pipe**
- `ValidationPipe` in main.ts
- DTO validation on all POST/PUT requests
- Whitelist mode (unknown properties rejected)
- Automatic transformation

**CORS**
- Enabled for frontend origin
- Configured in main.ts

## Database Design

### Schema

**User**
- id: String (unique identifier)
- email: String (unique)
- password: String (hashed)
- name: String (optional)
- createdAt, updatedAt: DateTime

**Project**
- id, userId, name, description
- createdAt, updatedAt
- Relation: belongsTo User, hasMany Files, hasMany Reviews

**File**
- id, projectId, path, content, language, size
- createdAt, updatedAt
- Relation: belongsTo Project, hasMany Reviews

**Review**
- id, userId, projectId, fileIds (JSON array), mode
- summary, issues (JSON), recommendations
- createdAt, updatedAt
- Relation: belongsTo User, belongsTo Project

**AIProvider**
- id, userId, name, baseUrl, apiKey, modelName, isDefault
- createdAt, updatedAt
- Relation: belongsTo User

**ChatSession**
- id, userId, projectId (optional), title
- createdAt, updatedAt
- Relation: belongsTo User, hasMany Messages

**Message**
- id, sessionId, role ('user'|'assistant'), content
- createdAt
- Relation: belongsTo ChatSession

### Relationships

- One-to-Many: User → Projects, Files, Reviews, ChatSessions, AIProviders
- One-to-Many: Project → Files, Reviews
- One-to-Many: ChatSession → Messages
- All with CASCADE delete for data integrity

## Authentication Flow

### Registration
1. User submits email, password, name
2. Backend validates input (email format, password strength)
3. Check for duplicate email
4. Hash password with bcrypt
5. Create user in database
6. Generate JWT token
7. Return user + token to frontend
8. Frontend stores token in localStorage

### Login
1. User submits email, password
2. Backend retrieves user by email
3. Compare hashed password with bcrypt
4. Generate JWT token
5. Return user + token to frontend
6. Frontend stores token in localStorage

### Protected Routes
1. Frontend includes JWT in Authorization header
2. NestJS JWT strategy validates token
3. Retrieve user from database
4. Attach user to request object
5. Route handler accesses req.user

### Logout
1. Frontend removes token from localStorage
2. Frontend clears user state
3. Redirects to login page

## File Processing

### ZIP Upload Process
1. Frontend sends ZIP file via multipart form
2. Backend saves file to disk temporarily
3. Extract ZIP using unzipper library
4. For each file in ZIP:
   - Check path safety (no ../, no absolute paths)
   - Check extension against whitelist
   - Check file size
   - Check for dangerous paths (.git/, .env, etc.)
   - Read file content
   - Create File record in database with detected language
5. Delete temporary ZIP file
6. Return list of processed files

### Safety Measures
- Path traversal prevention: normalize paths, reject ../ patterns
- Extension whitelist: only safe programming/config file types
- Dangerous path filtering: exclude .git, node_modules, secrets, etc.
- Size limits: individual files and total upload limited
- No code execution: files are only stored and read

### Language Detection
Auto-detect programming language from file extension:
- TypeScript/JavaScript, Python, Java, C++, Go, etc.
- Used for syntax highlighting in editor
- Included in review prompts

## AI Integration

### Provider Abstraction
**AIService** communicates with any OpenAI-compatible API:
- Base URL: configurable per provider
- API Key: stored server-side, never exposed
- Model name: specified per provider

### Review Flow
1. User selects files and review mode
2. Frontend sends review request
3. Backend retrieves default AI provider
4. Combine selected files into prompt
5. Send to AI provider with mode-specific prompt
6. Parse JSON response from AI
7. Validate response structure
8. Save review to database
9. Return review to frontend

### Review Prompts
- **Security**: Vulnerabilities, authentication, data exposure, cryptography
- **Performance**: Algorithm complexity, memory, database queries, caching
- **Quality**: Code style, error handling, testing, design patterns

### Response Structure
```json
{
  "summary": "Brief findings",
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestion": "How to fix",
      "lineNumber": 42
    }
  ],
  "recommendations": "General recommendations"
}
```

### Error Handling
- If AI provider is unreachable: return BadRequestException
- If response is invalid JSON: return BadRequestException
- If response structure is invalid: return BadRequestException
- If provider rate limited: return BadRequestException with provider message

## Chat Flow

### Session Creation
1. User creates new chat session (optional: with project)
2. Session stored in database
3. Empty message history

### Message Flow
1. User sends message
2. Message saved to database with role='user'
3. Retrieve chat history for context
4. If project selected: retrieve project files and include as context
5. Send conversation history + new message to AI
6. Receive AI response
7. Save AI response to database with role='assistant'
8. Return AI message to frontend
9. Frontend appends both messages to UI

### Context Awareness
- Project files included in messages (limited to 10 files to prevent token overflow)
- File paths and first 1000 chars of content
- AI can reference code in responses

## Security Considerations

### Authentication
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens with 7-day expiration
- Token refresh can be implemented (not in MVP)

### Authorization
- Every endpoint checks user ownership
- ForbiddenException for unauthorized access
- No cross-user data access possible

### API Keys
- Stored in database (server-side only)
- Never sent to frontend
- Only used for backend-to-AI provider communication
- Can be encrypted in production (AES-256)

### Input Validation
- All DTOs validated with class-validator
- Type transformation with class-transformer
- Whitelist mode rejects unknown properties
- Maximum request sizes enforced

### File Security
- Path traversal prevention in ZIP extraction
- Extension whitelist prevents executable uploads
- Dangerous paths filtered (.git, .env, secrets)
- Files never executed or interpreted
- Size limits prevent resource exhaustion

### Data Privacy
- Per-user projects and reviews
- No data shared between users
- No personal data in logs
- HTTPS recommended in production

## Error Handling Strategy

### Validation Errors
- BadRequestException with detailed field errors
- Frontend displays field-specific error messages

### Authorization Errors
- ForbiddenException for ownership violations
- 403 status code
- Generic message (no info leakage)

### Not Found Errors
- NotFoundException for missing resources
- 404 status code

### AI Provider Errors
- Catch axios errors from provider
- BadRequestException with provider error message
- Graceful degradation (review can be retried)

### Database Errors
- Prisma client errors caught
- Logged with context
- Generic InternalServerErrorException to client

## Performance Considerations

### Database
- Indexes on userId for faster user queries
- Indexes on projectId for project-specific queries
- Indexes on sessionId for chat queries
- Lazy loading of relations where needed

### API
- File uploads limited to 50MB
- ZIP extraction limited to 1000 files
- Chat context limited to 10 files
- Response pagination not implemented (small datasets)

### AI Integration
- Request timeout: 30 seconds
- Max tokens: 2000-3000 depending on operation
- No caching of AI responses (fresh reviews each time)

### Frontend
- Client-side state with Zustand (no server-side sessions)
- No unnecessary re-renders (proper memo usage)
- Lazy loading for routes (Next.js App Router)
- Image optimization (if images used)

## Deployment Considerations

### Backend
- NestJS app in Docker or Node.js process
- PostgreSQL database (AWS RDS, DigitalOcean, Managed DB)
- Environment variables from secrets manager
- API behind reverse proxy (nginx, Caddy)
- SSL/TLS certificates
- Rate limiting middleware recommended

### Frontend
- Next.js deployed on Vercel, Netlify, or self-hosted
- Static site generation where possible
- Environment variables for API URL

### Database
- PostgreSQL with automatic backups
- Connection pooling for multiple instances
- Regular backups and disaster recovery

### Monitoring
- Error tracking (Sentry, LogRocket)
- Performance monitoring (DataDog, New Relic)
- Log aggregation (ELK, Cloudwatch)

## Engineering Decisions

### Why NestJS?
- Enterprise-grade framework
- Built-in dependency injection
- Modular architecture scales well
- Great TypeScript support
- Rich ecosystem (Passport, Prisma, etc.)

### Why Prisma?
- Type-safe database queries
- Automatic migrations
- Great developer experience
- Database-agnostic (easy to switch)
- Built-in connection pooling

### Why Zustand for state?
- Lightweight (1kb)
- Simple API (easier than Redux)
- Perfect for auth/simple state
- No boilerplate

### Why Monaco Editor?
- Industry standard (VS Code)
- Great syntax highlighting
- Read-only mode for safety
- Large language support
- Fast performance

### Why Tailwind CSS?
- Utility-first approach
- Small bundle size
- Great for rapid prototyping
- Excellent customization
- Strong community

### API Key Storage
- Server-side only (never frontend)
- Can be encrypted at rest in production
- Rotation policy recommended
- Audit logging for key usage

## Testing Strategy

### Unit Tests
- Service logic isolated
- Database mocked
- AI provider mocked

### Integration Tests
- Database with test data
- Real API calls (or mocked)
- Full flow testing

### E2E Tests
- Full application flow
- Browser automation
- Real database

## Scalability Notes

### Current Limitations
- Single backend instance
- No horizontal scaling
- No message queue for async jobs
- Synchronous AI API calls

### Future Improvements
- Queue system for reviews (Bull, RabbitMQ)
- Caching layer (Redis)
- Database read replicas
- API rate limiting per user
- Async job processing
- WebSocket for real-time chat updates
- CDN for static assets
