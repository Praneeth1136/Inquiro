import { router } from './app.routes';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/userAuth';
import { useEffect } from 'react';

function App() {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe();
  }, []);

  return (
    <>
     <RouterProvider router = {router}/>
    </>
  )
}

export default App
