import '../styles/globals.css';
import { UserProvider } from '../contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
      <ToastContainer position="bottom-right" />
    </UserProvider>
  );
}

export default MyApp;