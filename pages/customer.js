import { useState } from 'react';
import menu from '../data/menu';
import vendors from '../data/vendors';
import Layout from '../components/Layout';
import styles from '../styles/Customer.module.css';
import { useUser } from '../contexts/UserContext';
import { createOrder } from '../services/orderService';
import { toast } from 'react-toastify';

export default function Customer() {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [vendorType, setVendorType] = useState('');
  const [vendorKey, setVendorKey] = useState('');
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const addToCart = item => {
    setCart([...cart, item]);
  };

  const removeFromCart = index => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter a delivery location');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Calculate total cost
      const itemsTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
      const deliveryFee = 30;
      const totalCost = itemsTotal + deliveryFee;
      
      // Create order object for Firestore
      const orderData = {
        items: cart,
        vendor: vendorType === 'bigMingos' ? 'Big Mingos' : `Vending Machine ${vendorKey}`,
        deliveryLocation: address,
        customerId: user.uid,
        customerName: user.displayName || user.email,
        deliveryFee: deliveryFee,
        totalCost: totalCost,
        status: 'Pending'
      };
      
      // Save to Firestore using the service
      await createOrder(orderData);
      
      toast.success('Order placed successfully!');
      setCart([]);
      setStep(1);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                      {cart.map((item, index) => (
                        <div key={index} className={styles.cartItem}>
                          <div className={styles.cartItemDetails}>
                            <span>{item.name}</span>
                            <span className={styles.price}>₹{item.price}</span>
                          </div>
                          <button 
                            className={styles.removeButton}
                            onClick={() => removeFromCart(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.cartSummary}>
                      <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>₹{cart.reduce((s, i) => s + i.price, 0)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Delivery Fee</span>
                        <span>₹30</span>
                      </div>
                      <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>₹{cart.reduce((s, i) => s + i.price, 0) + 30}</span>
                      </div>
                    </div>
                  </>
                )}
                
                <div className={styles.deliveryAddress}>
                  <h3>Delivery Address</h3>
                  <textarea 
                    placeholder="Enter your delivery address (room number, hostel, etc.)" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className={styles.addressInput}
                  />
                </div>
                
                <button 
                  className={styles.placeOrderButton} 
                  onClick={placeOrder}
                  disabled={cart.length === 0 || !address.trim()}
                >
                  Place Order • ₹{cart.reduce((s, i) => s + i.price, 0) + 30}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}