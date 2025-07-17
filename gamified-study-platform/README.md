# StudyQuest - Gamified Study Platform

A comprehensive web-based learning management system that transforms traditional studying into an engaging, game-like experience. Built with React, TypeScript, and modern web technologies.

## Features

- 🎮 **Gamified Learning**: Earn XP, level up, and unlock achievements
- 🐾 **Virtual Study Pet**: Adopt and care for a pet that grows with your study habits
- 📚 **Smart Course Management**: Upload syllabi and get organized study plans
- ✅ **Quest System**: Auto-generated study quests based on your curriculum
- 📊 **Progress Analytics**: Detailed insights into your learning patterns
- ⏰ **Pomodoro Timer**: Built-in focus timer with productivity tracking
- 🤖 **AI Assistant**: Get personalized study recommendations
- 👥 **Study Groups**: Collaborate with other learners
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for form handling
- **Chart.js** for data visualization

### Backend & Services
- **Supabase** for database and authentication
- **Gemini AI** for intelligent study assistance
- **Vercel/Netlify** for deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamified-study-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_GEMINI_API_KEY`: Your Gemini AI API key (optional)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services and external integrations
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
└── assets/             # Static assets
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the existing ESLint and Prettier configuration
- Use functional components with hooks
- Implement proper error boundaries
- Write meaningful commit messages

### Component Organization
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper prop types
- Add loading and error states
- Make components accessible (WCAG 2.1 AA)

### State Management
- Use Zustand for global state
- Keep local state in components when possible
- Use React Query for server state
- Implement optimistic updates where appropriate

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Setup

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema (see `/docs/database-schema.sql`)
3. Configure Row Level Security policies
4. Get your project URL and anon key

### Gemini AI Setup (Optional)
1. Get an API key from Google AI Studio
2. Add it to your environment variables
3. Configure rate limiting as needed

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push to main

### Database (Supabase)
- Automatic scaling and backups
- Built-in authentication
- Real-time subscriptions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ for learners everywhere.