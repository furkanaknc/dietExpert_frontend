# DietExpert Frontend

A modern React frontend application for DietExpert - your AI-powered nutrition and diet advisor powered by Google's Gemini AI.

## Features

- 🥗 **Nutrition Consulting** - Get personalized nutrition advice
- 📸 **Food Photo Analysis** - Upload meal photos for instant nutrition analysis
- 🍽️ **Meal Planning** - Receive customized meal plans and recipes
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional interface with Tailwind CSS
- 💾 **Chat History** - Persistent conversation history
- ✏️ **Chat Management** - Rename and organize your nutrition consultations
- 🚀 **Fast & Lightweight** - Optimized performance

## Prerequisites

- Node.js 16+
- npm or yarn
- Running DietExpert backend server (see backend README)

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the frontend directory:

```bash
# Backend API URL - Update this for production
REACT_APP_API_URL=http://localhost:5000
```

For production deployment, update the URL to your deployed backend:

```bash
REACT_APP_API_URL=https://your-dietexpert-backend.com
```

## Development

Start the development server:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Building for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `build` directory.

## Deployment

### Deploy to Netlify

1. Build the project:

```bash
npm run build
```

2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard:
   - `REACT_APP_API_URL`: Your backend API URL

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Deploy to Other Platforms

The app is a standard React application and can be deployed to any static hosting service:

- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- Azure Static Web Apps

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── ChatSidebar.jsx
│   │   ├── ChatView.jsx
│   │   ├── Message.jsx
│   │   └── MessageInput.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── utils/          # Utility functions
│   │   ├── messageUtils.js
│   │   └── userUtils.js
│   ├── App.js          # Main App component
│   ├── index.js        # App entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## Key Features

### Nutrition Consultation

- Real-time chat with AI nutrition expert
- Personalized dietary advice
- Meal planning assistance
- Recipe recommendations

### Food Photo Analysis

- Upload photos of meals, ingredients, or food items
- Instant nutritional analysis
- Calorie counting and macro breakdown
- Dietary suggestions based on your goals

### Chat Management

- Organize nutrition consultations by topic
- Rename conversations for easy reference
- Delete unwanted chat history
- Persistent storage across sessions

## API Integration

The frontend communicates with the DietExpert NestJS backend through RESTful APIs:

- `POST /chat` - Create new nutrition consultation
- `GET /chat/user/:userId` - Get user's consultation history
- `GET /chat/:chatId` - Get consultation details
- `POST /chat/:chatId/message` - Send nutrition question
- `POST /chat/:chatId/image` - Send food photo for analysis
- `PUT /chat/:chatId/title` - Update consultation title
- `DELETE /chat/:chatId` - Delete consultation

## Styling

The app uses Tailwind CSS for styling with:

- Custom nutrition-focused color palette
- Responsive design patterns
- Component-based styling
- Accessibility features

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
