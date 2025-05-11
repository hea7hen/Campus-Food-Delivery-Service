import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  onSnapshot,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date(),
      status: 'Pending',
      courierId: null,
      courierName: null
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order: ", error);
    throw error;
  }
};

// Get pending orders (excluding user's own orders)
export const getPendingOrders = (userId, callback) => {
  const q = query(
    collection(db, 'orders'),
    where('status', '==', 'Pending'),
    where('customerId', '!=', userId),
    orderBy('customerId'), // Add this line
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
};

// Get user's active orders as a customer
export const getUserOrders = (userId, callback) => {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
};

// Get user's active deliveries as a courier
export const getUserDeliveries = (userId, callback) => {
  const q = query(
    collection(db, 'orders'),
    where('courierId', '==', userId),
    where('status', '==', 'Accepted')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
};

// Accept an order
export const acceptOrder = async (orderId, courier) => {
  const orderRef = doc(db, 'orders', orderId);
  
  await updateDoc(orderRef, {
    status: 'Accepted',
    courierId: courier.uid,
    courierName: courier.displayName || courier.email
  });
};

// Mark order as delivered
export const markOrderDelivered = async (orderId, courierId) => {
  const orderRef = doc(db, 'orders', orderId);
  const userRef = doc(db, 'users', courierId);
  
  // Get current user data to update earnings
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentEarnings = userData.earnings || 0;
    
    // Update user's earnings
    await updateDoc(userRef, {
      earnings: currentEarnings + 30 // Add ₹30 for completed delivery
    });
    
    // Update order status
    await updateDoc(orderRef, {
      status: 'Delivered',
      deliveredAt: new Date()
    });
  } else {
    throw new Error("Courier user document not found");
  }
};