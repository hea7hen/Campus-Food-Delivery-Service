import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useUser } from '../../contexts/UserContext';
import styles from '../../styles/OrderDetail.module.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useUser();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrder() {
      if (id) {
        try {
          const orderRef = doc(db, 'orders', id);
          const orderSnap = await getDoc(orderRef);
          
          if (orderSnap.exists()) {
            setOrder({ id: orderSnap.id, ...orderSnap.data() });
          } else {
            console.error("Order not found");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoadingOrder(false);
        }
      }
    }

    fetchOrder();
  }, [id]);

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (loadingOrder) {
    return (
      <Layout>
        <div className={styles.loading}>Loading order details...</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className={styles.container}>
          <h1>Order not found</h1>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/home')}
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/home')}
        >
          ← Back to Home
        </button>
        
        <div className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <h1>Order Details</h1>
            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
              {order.status}
            </span>
          </div>
          
          <div className={styles.orderInfo}>
            <div className={styles.infoSection}>
              <h2>Order Information</h2>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Placed:</strong> {order.createdAt?.toDate().toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ₹{order.totalCost}</p>
            </div>
            
            <div className={styles.infoSection}>
              <h2>Delivery Information</h2>
              <p><strong>Delivery to:</strong> {order.deliveryLocation}</p>
              {order.courierName && (
                <p><strong>Courier:</strong> {order.courierName}</p>
              )}
            </div>
          </div>
          
          <div className={styles.itemsSection}>
            <h2>Order Items</h2>
            <div className={styles.itemsList}>
              {order.items?.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>₹{item.price}</p>
                  </div>
                  <p className={styles.itemQuantity}>x{item.qty}</p>
                </div>
              ))}
            </div>
            
            <div className={styles.orderSummary}>
              <div className={styles.summaryItem}>
                <span>Subtotal</span>
                <span>₹{order.subtotal || 0}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Delivery Fee</span>
                <span>₹30</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.total}`}>
                <span>Total</span>
                <span>₹{order.totalCost}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}