import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Order.module.css';
import menu from '../data/menu';
import vendors from '../data/vendors';
import { createOrder } from '../services/orderService';
import { toast } from 'react-toastify';

export default function Order() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vendorType, setVendorType] = useState('');
  const [vendorKey, setVendorKey] = useState('');
  const [cart, setCart] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.name === item.name);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.name === item.name 
          ? { ...i, qty: i.qty + 1 } 
          : i
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (itemName) => {
    const existingItem = cart.find(i => i.name === itemName);
    
    if (existingItem.qty > 1) {
      setCart(cart.map(i => 
        i.name === itemName 
          ? { ...i, qty: i.qty - 1 } 
          : i
      ));
    } else {
      setCart(cart.filter(i => i.name !== itemName));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + 30; // Add delivery fee
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!deliveryLocation.trim()) {
      toast.error('Please enter a delivery location');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const vendorName = vendors[vendorType][vendorKey].name;
      
      const orderData = {
        items: cart,
        vendor: vendorName,
        vendorType,
        vendorKey,
        deliveryLocation,
        customerId: user.uid,
        customerName: user.displayName || user.email,
        status: 'Pending',
        deliveryFee: 30,
        totalCost: calculateTotal()
      };
      
      const order = await createOrder(orderData);
      
      toast.success('Order placed successfully!');
      router.push(`/order/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. Select Vendor Type</div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. Choose Location</div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. Order Items</div>
        </div>

        {step === 1 && (
          <div className={styles.vendorTypeSelection}>
            <h2 className={styles.sectionTitle}>Select Vendor Type</h2>
            <div className={styles.vendorTypeGrid}>
              <div 
                className={styles.vendorTypeCard} 
                onClick={() => { setVendorType('vending'); setStep(2); }}
              >
                <div className={styles.vendorTypeIcon}>🥤</div>
                <h3>Vending Machines</h3>
                <p>Quick snacks and drinks from vending machines around campus</p>
              </div>
              <div 
                className={styles.vendorTypeCard} 
                onClick={() => { setVendorType('bigMingos'); setStep(2); }}
              >
                <div className={styles.vendorTypeIcon}>🍔</div>
                <h3>Big Mingos</h3>
                <p>Hot food and beverages from the campus canteen</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.locationSelection}>
            <h2 className={styles.sectionTitle}>
              Select {vendorType === 'vending' ? 'Vending Machine' : 'Canteen'} Location
            </h2>
            <button 
              className={styles.backButton} 
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <div className={styles.locationGrid}>
              {Object.keys(vendors[vendorType]).map(key => (
                <div 
                  key={key} 
                  className={styles.locationCard}
                  onClick={() => {setVendorKey(key); setStep(3);}}
                >
                  <h3>{vendors[vendorType][key].name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.orderSection}>
            <h2 className={styles.sectionTitle}>
              Order from {vendors[vendorType][vendorKey].name}
            </h2>
            <button 
              className={styles.backButton} 
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
            
            <div className={styles.menuAndCart}>
              <div className={styles.menuItems}>
                <h3>Menu</h3>
                <div className={styles.menuGrid}>
                  {menu[vendorType][vendorKey].map(item => (
                    <div key={item.name} className={styles.menuItem}>
                      <div className={styles.menuItemDetails}>
                        <h4>{item.name}</h4>
                        <p className={styles.price}>₹{item.price}</p>
                      </div>
                      <button 
                        className={styles.addButton}
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.cartSection}>
                <h3>Your Order</h3>
                {cart.length === 0 ? (
                  <p className={styles.emptyCart}>Your cart is empty</p>
                ) : (
                  <>
                    <div className={styles.cartItems}>
                      {cart.map((item) => (
                        <div key={item.name} className={styles.cartItem}>
                          <div className={styles.cartItemDetails}>
                            <span>{item.name} x{item.qty}</span>
                            <span className={styles.price}>₹{item.price * item.qty}</span>
                          </div>
                          <div className={styles.quantityControls}>
                            <button 
                              className={styles.quantityButton}
                              onClick={() => removeFromCart(item.name)}
                            >
                              -
                            </button>
                            <span className={styles.quantity}>{item.qty}</span>
                            <button 
                              className={styles.quantityButton}
                              onClick={() => addToCart(item)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.cartSummary}>
                      <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>₹{calculateSubtotal()}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Delivery Fee</span>
                        <span>₹30</span>
                      </div>
                      <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>
                    
                    <div className={styles.deliveryAddress}>
                      <h3>Delivery Address</h3>
                      <textarea 
                        placeholder="Enter your delivery address (room number, hostel, etc.)" 
                        value={deliveryLocation} 
                        onChange={e => setDeliveryLocation(e.target.value)}
                        className={styles.addressInput}
                        required
                      />
                    </div>
                    
                    <button 
                      className={styles.placeOrderButton} 
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || cart.length === 0 || !deliveryLocation.trim()}
                    >
                      {isSubmitting ? 'Placing Order...' : `Place Order • ₹${calculateTotal()}`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}