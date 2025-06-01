import { createBrowserRouter } from 'react-router-dom';
import ChatApp from './App';
import ProfilePage from './components/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';

const ProfilePageWithAuth = () => {
  return (
    <AuthProvider>
      <ProfilePage />
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
]);
