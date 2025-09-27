# FitBud AI - AI-Powered Fitness Platform

FitBud AI is a comprehensive fitness platform that leverages AI to provide personalized workout plans, form analysis, nutrition tracking, and progress monitoring.

## Features

- **AI Workout Generation**: Get personalized workout plans based on your goals, equipment, and fitness level
- **Form Monitoring**: Real-time form analysis and feedback using AI-powered pose detection
- **Equipment-Based Workouts**: Find workouts tailored to the equipment you have available
- **Nutrition Tracking**: Log and analyze your food intake with AI-powered food image analysis
- **Progress Tracking**: Monitor your fitness journey with detailed progress metrics and visualizations
- **Personalized Dashboard**: Get insights and recommendations based on your activity

## Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Shadcn UI Components
  - React Router Dom
  - React Query
  - Zustand (State Management)
  - Chart.js / Recharts
- **Backend**:

  - Supabase (Authentication, Database, Storage)
  - Supabase Edge Functions
  - OpenAI API Integration

- **AI/ML**:
  - TensorFlow.js
  - MediaPipe
  - Hugging Face Transformers

## Project Structure

The project follows a feature-based architecture:

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Shared UI components
├── core/                # Core functionality
│   ├── config/          # App configuration
│   ├── providers/       # Context providers
│   ├── services/        # Service integrations
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── features/            # Feature modules
│   ├── auth/            # Authentication feature
│   ├── dashboard/       # Dashboard feature
│   ├── form-monitor/    # Form monitoring feature
│   ├── landing/         # Landing page
│   ├── nutrition/       # Nutrition tracking feature
│   ├── profile/         # User profile feature
│   ├── progress/        # Progress tracking feature
│   └── workout/         # Workout feature
└── lib/                 # Third-party libraries and utils
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for backend services

### Installation

```bash
# Clone the repository
git clone https://github.com/manupranavm/dynamo-pulse-fit.git
cd dynamo-pulse-fit

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [MediaPipe](https://google.github.io/mediapipe/)
