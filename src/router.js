import { createBrowserRouter } from 'react-router-dom';
import ChatApp from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatApp />,
  },
  {
    path: '/chat/:chatId',
    element: <ChatApp />,
  },
]);
