import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../styles/Login.module.css';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';

// Firebase imports
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
  const { user, signIn, signUp } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast.success('Account created successfully!');
      } else {
        await signIn(email, password);
      }
      router.push('/home');
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
        <h2 className={styles.appName}>SnackDash</h2>
        <p className={styles.subtitle}>
          {isSignUp ? 'Already have an account?' : 'New to SnackDash?'} 
          <a className={styles.signupLink} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </a>
        </p>

        {/* Google Material Button */}
        <button
          type="button"
          className="gsi-material-button"
          onClick={signInWithGoogle}
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents">Sign in with Google</span>
            <span style={{ display: 'none' }}>Sign in with Google</span>
          </div>
        </button>

        <div className={styles.divider}>
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Name</label>
              <input 
                className={styles.input}
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                placeholder="Your name"
              />
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              className={styles.input}
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordHeader}>
              <label className={styles.label}>Password</label>
              {!isSignUp && <a className={styles.forgotPassword}>Forgot your password?</a>}
            </div>
            <div className={styles.passwordContainer}>
              <input 
                className={styles.input}
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
              />
              <button 
                type="button" 
                className={styles.showButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                Show
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.signInButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}