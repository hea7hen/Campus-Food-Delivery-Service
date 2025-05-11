import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, signOut } = useUser();
  
  const handleLogout = () => {
    signOut();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/home')}>SnackDash</div>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${router.pathname === '/home' ? styles.active : ''}`}
            onClick={() => router.push('/home')}
          >
            Home
          </button>
          <button 
            className={`${styles.navItem} ${router.pathname === '/order' ? styles.active : ''}`}
            onClick={() => router.push('/order')}
          >
            Order
          </button>
          <button 
            className={`${styles.navItem} ${router.pathname === '/courier' ? styles.active : ''}`}
            onClick={() => router.push('/courier')}
          >
            Deliver
          </button>
        </nav>
        <div className={styles.userInfo}>
          {user ? (
            <>
              <div className={styles.userDetails}>
                {user.photoURL && <img src={user.photoURL} alt="Profile" className={styles.avatar} />}
                <span>{user.displayName || user.email}</span>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© 2023 SnackDash - Campus Delivery App</p>
      </footer>
    </div>
  );
}