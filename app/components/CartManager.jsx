import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrderForm from './OrderForm';

const CartManager = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    }
  };

  const saveCart = async (newCart) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      setCartItems(newCart);
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const addToCart = async (item, quantity = 1) => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    let newCart;
    
    if (existingItemIndex >= 0) {
      newCart = [...cartItems];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart = [...cartItems, { ...item, quantity }];
    }
    
    await saveCart(newCart);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart!`);
  };

  const removeFromCart = async (itemId) => {
    const newCart = cartItems.filter(item => item.id !== itemId);
    await saveCart(newCart);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const newCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    await saveCart(newCart);
  };

  const clearCart = async () => {
    await saveCart([]);
    Alert.alert('Cart Cleared', 'All items have been removed from your cart.');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }
    setShowOrderForm(true);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Ionicons name={item.icon} size={30} color="#007AFF" />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price} each</Text>
        </View>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const CartModal = () => (
    <Modal visible={showCart} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.cartContainer}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Your Cart</Text>
          <TouchableOpacity onPress={() => setShowCart(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add some delicious items to get started</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              style={styles.cartList}
            />
            
            <View style={styles.cartFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total: </Text>
                <Text style={styles.totalAmount}>${getCartTotal()}</Text>
              </View>
              
              <View style={styles.cartActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                  <Text style={styles.clearButtonText}>Clear Cart</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    showCart: () => setShowCart(true),
    CartModal,
    OrderFormModal: () => (
      <OrderForm
        visible={showOrderForm}
        onClose={() => {
          setShowOrderForm(false);
          setShowCart(false);
        }}
        cartItems={cartItems}
        isMultipleItems={true}
        onOrderComplete={() => {
          clearCart();
          setShowOrderForm(false);
          setShowCart(false);
        }}
      />
    )
  };
};

const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  cartList: {
    flex: 1,
    padding: 15
  },
  cartItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  itemDetails: {
    marginLeft: 15,
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5
  },
  itemPrice: {
    fontSize: 14,
    color: '#666'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  quantityButton: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center'
  },
  removeButton: {
    padding: 10
  },
  cartFooter: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  cartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    fontWeight: '500'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center'
  }
});

export default CartManager;