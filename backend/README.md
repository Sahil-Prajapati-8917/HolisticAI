# AI-Driven Resume Evaluation Platform - Backend

A robust Node.js/Express backend API for the AI-Driven Holistic Resume Evaluation Platform. This backend handles resume processing, Google Gemini AI evaluation, and provides APIs for the frontend.

## 🚀 Features

### Core API Functionality
- **Resume Processing**: Intelligent parsing of files with context preservation
- **AI Evaluation**: Holistic candidate assessment using Google Gemini
- **User Management**: Authentication and profile management (Planned)
- **Hiring Forms**: Configurable role definitions (Planned)
- **Universal Search**: Global search capability (Planned)

## 🛠️ Technology Stack

- **Runtime**: Node.js 18.0.0+
- **Framework**: Express.js
- **Database**: MongoDB (Planned)
- **AI Integration**: Google Gemini API
- **Security**: CORS, Environment Config

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# PORT=3001
# GEMINI_API_KEY=your_key
```

### Development
```bash
# Start development server with auto-reload
npm run dev
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── routes.ts             # API route definitions
│   ├── server.ts             # Application entry point
│   ├── constants.ts          # Configuration constants
│   ├── types.ts              # Core types
│   └── ai/
│       └── evaluation-engine/ # AI logic
│           └── geminiService.ts
├── package.json
└── README.md
```

## 🎯 API Endpoints

### AI Evaluation
- `POST /api/evaluate` - Evaluates a resume text against requirements

### Proposed Endpoints (To Be Implemented)
- `POST /api/auth/login`
- `POST /api/resume/upload`
- `GET /api/search`
