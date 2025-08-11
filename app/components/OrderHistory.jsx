import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orderHistory');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.log('Error loading order history:', error);
    }
  };

  const saveOrderToHistory = async (orderData) => {
    try {
      const newOrder = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...orderData,
        status: 'Pending'
      };
      
      const updatedOrders = [newOrder, ...orders];
      await AsyncStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } catch (error) {
      console.log('Error saving order to history:', error);
    }
  };

  const clearOrderHistory = async () => {
    try {
      await AsyncStorage.setItem('orderHistory', JSON.stringify([]));
      setOrders([]);
    } catch (error) {
      console.log('Error clearing order history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOrderTotal = (order) => {
    if (order.cartItems) {
      return order.cartItems.reduce((total, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return total + (price * item.quantity);
      }, 0).toFixed(2);
    } else if (order.foodItem) {
      const price = parseFloat(order.foodItem.price.replace('$', ''));
      return (price * order.quantity).toFixed(2);
    }
    return '0.00';
  };

  const getOrderItemCount = (order) => {
    if (order.cartItems) {
      return order.cartItems.reduce((count, item) => count + item.quantity, 0);
    } else if (order.foodItem) {
      return order.quantity;
    }
    return 0;
  };

  const renderOrderItem = ({ item: order }) => (
    <TouchableOpacity 
      style={styles.orderItem} 
      onPress={() => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
        <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.orderItems}>
          {getOrderItemCount(order)} item(s)
        </Text>
        <Text style={styles.orderTotal}>${getOrderTotal(order)}</Text>
      </View>
      
      <View style={styles.orderStatus}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'Confirmed': return '#007AFF';
      case 'Preparing': return '#ff6b35';
      case 'Delivered': return '#28a745';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const OrderDetailModal = () => (
    <Modal visible={showOrderDetail} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>Order Details</Text>
          <TouchableOpacity onPress={() => setShowOrderDetail(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {selectedOrder && (
          <ScrollView style={styles.detailContent}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <Text style={styles.detailText}>Order ID: #{selectedOrder.id.slice(-6)}</Text>
              <Text style={styles.detailText}>Date: {formatDate(selectedOrder.date)}</Text>
              <Text style={styles.detailText}>Status: {selectedOrder.status}</Text>
              <Text style={styles.detailText}>Total: ${getOrderTotal(selectedOrder)}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Items Ordered</Text>
              {selectedOrder.cartItems ? (
                selectedOrder.cartItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                  </View>
                ))
              ) : selectedOrder.foodItem ? (
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{selectedOrder.foodItem.name}</Text>
                  <Text style={styles.itemQuantity}>x{selectedOrder.quantity}</Text>
                  <Text style={styles.itemPrice}>{selectedOrder.foodItem.price}</Text>
                </View>
              ) : null}
            </View>
            
            {selectedOrder.customerInfo && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <Text style={styles.detailText}>Name: {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</Text>
                <Text style={styles.detailText}>Email: {selectedOrder.customerInfo.email}</Text>
                <Text style={styles.detailText}>Phone: {selectedOrder.customerInfo.phone}</Text>
                <Text style={styles.detailText}>Address: {selectedOrder.customerInfo.address}</Text>
                {selectedOrder.customerInfo.specialInstructions && (
                  <Text style={styles.detailText}>Special Instructions: {selectedOrder.customerInfo.specialInstructions}</Text>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const HistoryModal = () => (
    <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Order History</Text>
          <TouchableOpacity onPress={() => setShowHistory(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {orders.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your order history will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            style={styles.historyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );

  return {
    orders,
    saveOrderToHistory,
    clearOrderHistory,
    showHistory: () => setShowHistory(true),
    HistoryModal,
    OrderDetailModal
  };
};

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  historyList: {
    flex: 1,
    padding: 15
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  orderDate: {
    fontSize: 14,
    color: '#666'
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  orderItems: {
    fontSize: 14,
    color: '#666'
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  orderStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyHistory: {
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
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  detailContent: {
    flex: 1,
    padding: 15
  },
  detailSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 10
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  }
});

export default OrderHistory;