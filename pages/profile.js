import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Profile.module.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // Update Auth profile
      await updateAuthProfile(auth.currentUser, {
        displayName: displayName
      });

      // Update Firestore document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>My Profile</h1>
        
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className={styles.editNameContainer}>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={styles.nameInput}
                  placeholder="Display Name"
                />
                <div className={styles.editActions}>
                  <button 
                    className={styles.saveButton} 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => {
                      setDisplayName(user.displayName || '');
                      setIsEditing(false);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.nameContainer}>
                <h2 className={styles.userName}>{user.displayName || user.email}</h2>
                <button 
                  className={styles.editButton} 
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.profileInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user.email}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Earnings</span>
              <span className={styles.infoValue}>₹{user.earnings || 0}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Account Created</span>
              <span className={styles.infoValue}>
                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}