import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Courier.module.css';
import { getPendingOrders, getUserDeliveries, acceptOrder, markOrderDelivered } from '../services/orderService';
import { toast } from 'react-toastify';

export default function Courier() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Get pending orders (excluding user's own)
      const unsubscribePending = getPendingOrders(user.uid, (orders) => {
        setPendingOrders(orders);
      });
      
      // Get user's active deliveries
      const unsubscribeDeliveries = getUserDeliveries(user.uid, (deliveries) => {
        setMyDeliveries(deliveries);
      });
      
      return () => {
        unsubscribePending();
        unsubscribeDeliveries();
      };
    }
  }, [user]);

  const handleAcceptOrder = async (orderId) => {
    if (!user) return;
    
    setProcessingOrderId(orderId);
    try {
      await acceptOrder(orderId, user);
      toast.success('Order accepted! Head to the vendor to pick it up.');
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    if (!user) return;
    
    setProcessingOrderId(orderId);
    try {
      await markOrderDelivered(orderId, user.uid);
      toast.success('Delivery completed! You earned ₹30.');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery. Please try again.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.welcome}>
          <h1>Courier Dashboard</h1>
          <p>Earn ₹30 per delivery by accepting orders below.</p>
          <p className={styles.earnings}>Your total earnings: <span>₹{user.earnings || 0}</span></p>
        </div>

        {/* Active Deliveries Section */}
        <div className={styles.activeOrdersSection}>
          <h2 className={styles.sectionTitle}>Your Active Deliveries</h2>
          
          {myDeliveries.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🚚</div>
              <h3>No active deliveries</h3>
              <p>Accept an order below to start delivering!</p>
            </div>
          ) : (
            <div className={styles.orderGrid}>
              {myDeliveries.map(order => (
                <div key={order.id} className={`${styles.orderCard} ${styles.activeOrder}`}>
                  <div className={styles.orderHeader}>
                    <h3>Delivery to {order.customerName}</h3>
                    <span className={styles.statusBadge}>In Progress</span>
                  </div>
                  
                  <div className={styles.orderDetails}>
                    <div className={styles.orderInfo}>
                      <p><strong>From:</strong> {order.vendor}</p>
                      <p><strong>To:</strong> {order.deliveryLocation}</p>
                      <p><strong>Order Total:</strong> ₹{order.totalCost}</p>
                    </div>
                    
                    <div className={styles.orderItems}>
                      <h4>Items:</h4>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.name} x{item.qty} - ₹{item.price * item.qty}
                          </li>
                        ))}
                      </ul>
                      <div className={styles.orderTotal}>
                        <span>Delivery Fee:</span>
                        <span>₹30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.orderActions}>
                    <button 
                      className={styles.completeButton}
                      onClick={() => handleCompleteDelivery(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id ? 'Processing...' : 'Mark as Delivered'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Orders Section */}
        <div className={styles.availableOrdersSection}>
          <h2 className={styles.sectionTitle}>Available Orders</h2>
          
          {pendingOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>No pending orders</h3>
              <p>Check back later for new delivery opportunities!</p>
            </div>
          ) : (
            <div className={styles.orderGrid}>
              {pendingOrders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <h3>Order from {order.customerName || 'Anonymous'}</h3>
                    <span className={styles.statusBadge}>Pending</span>
                  </div>
                  
                  <div className={styles.orderDetails}>
                    <div className={styles.orderInfo}>
                      <p><strong>From:</strong> {order.vendor}</p>
                      <p><strong>To:</strong> {order.deliveryLocation}</p>
                      <p><strong>Order Total:</strong> ₹{order.totalCost}</p>
                    </div>
                    
                    <div className={styles.orderItems}>
                      <h4>Items:</h4>
                      <ul>
                        {order.items && order.items.map((item, index) => (
                          <li key={index}>
                            {item.name} x{item.qty} - ₹{item.price * item.qty}
                          </li>
                        ))}
                      </ul>
                      <div className={styles.orderTotal}>
                        <span>Delivery Fee:</span>
                        <span>₹30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.orderActions}>
                    <button 
                      className={styles.acceptButton}
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={processingOrderId === order.id}
                    >
                      {processingOrderId === order.id ? 'Processing...' : 'Accept Order'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}