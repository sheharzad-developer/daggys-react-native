import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../components/SearchBar';
import FavoritesManager from '../components/FavoritesManager';
import CartManager from '../components/CartManager';
import OrderHistory from '../components/OrderHistory';

const menuItems = [
  { id: '1', name: 'Classic Burger', price: '$12.99', icon: 'fast-food' },
  { id: '2', name: 'Margherita Pizza', price: '$15.99', icon: 'pizza' },
  { id: '3', name: 'Caesar Salad', price: '$9.99', icon: 'leaf' },
  { id: '4', name: 'Grilled Chicken', price: '$18.99', icon: 'flame' },
  { id: '5', name: 'Fish & Chips', price: '$16.99', icon: 'fish' },
  { id: '6', name: 'Pasta Carbonara', price: '$14.99', icon: 'restaurant' },
  { id: '7', name: 'Choco Cake', price: '$7.99', icon: 'ice-cream' },
  { id: '8', name: 'Fresh Juice', price: '$4.99', icon: 'wine' }
];

const Home = () => {
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  
  // Initialize managers
  const favoritesManager = FavoritesManager();
  const cartManager = CartManager();
  const orderHistory = OrderHistory();

  const handleItemPress = (item) => {
    router.push({
      pathname: '/food-detail',
      params: {
        id: item.id,
        name: item.name,
        price: item.price,
        icon: item.icon
      }
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredItems(menuItems);
  };

  const handleAddToCart = (item) => {
    cartManager.addToCart(item, 1);
  };

  const toggleFavorite = (item) => {
    if (favoritesManager.isFavorite(item.id)) {
      favoritesManager.removeFromFavorites(item.id);
    } else {
      favoritesManager.addToFavorites(item);
    }
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleItemPress(item)}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={40} color="#007AFF" />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons 
            name={favoritesManager.isFavorite(item.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={favoritesManager.isFavorite(item.id) ? "#ff4444" : "#666"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="add-circle" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="restaurant" size={40} color="#007AFF" />
            <View>
              <Text style={styles.title}>Daggy's Menu</Text>
              <Text style={styles.subtitle}>Delicious meals await you</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={orderHistory.showHistory}
            >
              <Ionicons name="receipt" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={favoritesManager.FavoritesList}
            >
              <Ionicons name="heart" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, styles.cartButton]} 
              onPress={cartManager.showCart}
            >
              <Ionicons name="cart" size={24} color="#007AFF" />
              {cartManager.getCartItemCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartManager.getCartItemCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <SearchBar 
        onSearch={handleSearch}
        onClear={handleClearSearch}
        placeholder="Search delicious meals..."
      />
      
      <FlatList
        data={filteredItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Modals */}
      <cartManager.CartModal />
      <cartManager.OrderFormModal />
      <orderHistory.HistoryModal />
      <orderHistory.OrderDetailModal />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 12,
    marginLeft: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartButton: {
    position: 'relative',
    padding: 12,
    marginLeft: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 10
  },
  gridContainer: {
    padding: 15
  },
  menuItem: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 160
  },
  iconContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5
  },
  actionButton: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 20,
    flex: 0.45,
    alignItems: 'center'
  }
})