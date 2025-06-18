import { createBrowserRouter } from 'react-router-dom';
import ChatApp from './App';
import ProfilePage from './components/ProfilePage';
import CalorieDashboard from './components/CalorieDashboard';
import { AuthProvider } from './contexts/AuthContext';

const ProfilePageWithAuth = () => {
  return (
    <AuthProvider>
      <ProfilePage />
    </AuthProvider>
  );
};

const CalorieDashboardWithAuth = () => {
  return (
    <AuthProvider>
      <CalorieDashboard />
    </AuthProvider>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatApp />,
  },
  {
    path: '/chat/:chatId',
    element: <ChatApp />,
  },
  {
    path: '/profile',
    element: <ProfilePageWithAuth />,
  },
  {
    path: '/nutrition',
    element: <CalorieDashboardWithAuth />,
  },
]);
