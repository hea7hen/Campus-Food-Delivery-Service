import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Home.module.css';
import { getUserOrders } from '../services/orderService';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState([]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const unsubscribe = getUserOrders(user.uid, (orders) => {
        setActiveOrders(orders.filter(order => order.status !== 'Delivered'));
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.welcome}>
          <h1>Welcome, {user.displayName || user.email}!</h1>
          <p>What would you like to do today?</p>
        </div>

        <div className={styles.actionCards}>
          <div className={styles.card} onClick={() => router.push('/order')}>
            <div className={styles.cardIcon}>🍔</div>
            <h2>Place an Order</h2>
            <p>Order food and snacks from campus vendors</p>
          </div>
          
          <div className={styles.card} onClick={() => router.push('/courier')}>
            <div className={styles.cardIcon}>🚴</div>
            <h2>Deliver Orders</h2>
            <p>Earn ₹30 per delivery by becoming a courier</p>
          </div>
          
          <div className={styles.card} onClick={() => router.push('/profile')}>
            <div className={styles.cardIcon}>👤</div>
            <h2>My Profile</h2>
            <p>View your profile and earnings</p>
          </div>
        </div>

        {activeOrders.length > 0 && (
          <div className={styles.activeOrdersSection}>
            <h2>Your Active Orders</h2>
            <div className={styles.ordersList}>
              {activeOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <h3>Order from {order.vendor}</h3>
                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className={styles.orderDetails}>
                    <p><strong>Items:</strong> {order.items.map(item => `${item.name} x${item.qty}`).join(', ')}</p>
                    <p><strong>Delivery to:</strong> {order.deliveryLocation}</p>
                    {order.courierName && (
                      <p><strong>Courier:</strong> {order.courierName}</p>
                    )}
                    <p><strong>Total:</strong> ₹{order.totalCost}</p>
                  </div>
                  <button 
                    className={styles.viewButton}
                    onClick={() => router.push(`/order/${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}