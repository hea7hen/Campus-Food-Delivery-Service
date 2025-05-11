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

        <button 
          className={styles.googleButton} 
          onClick={signInWithGoogle} 
          type="button"
          disabled={loading}
        >
          <img src="/google-icon.png" alt="Google" className={styles.socialIcon} />
          Continue with Google
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