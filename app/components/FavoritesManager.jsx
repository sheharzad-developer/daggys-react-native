import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const FavoritesManager = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };

  const addToFavorites = async (item) => {
    const isAlreadyFavorite = favorites.some(fav => fav.id === item.id);
    if (isAlreadyFavorite) {
      Alert.alert('Already in Favorites', 'This item is already in your favorites!');
      return false;
    }
    
    const newFavorites = [...favorites, item];
    await saveFavorites(newFavorites);
    Alert.alert('Added to Favorites', `${item.name} has been added to your favorites!`);
    return true;
  };

  const removeFromFavorites = async (itemId) => {
    const newFavorites = favorites.filter(fav => fav.id !== itemId);
    await saveFavorites(newFavorites);
    Alert.alert('Removed from Favorites', 'Item has been removed from your favorites.');
  };

  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.id === itemId);
  };

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

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity style={styles.favoriteItem} onPress={() => handleItemPress(item)}>
      <View style={styles.itemInfo}>
        <Ionicons name={item.icon} size={30} color="#007AFF" />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFromFavorites(item.id)}
      >
        <Ionicons name="heart-dislike" size={24} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    FavoritesList: () => (
      <View style={styles.container}>
        <Text style={styles.title}>Your Favorites</Text>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Add items to your favorites to see them here</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    )
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  favoriteItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#007AFF',
    fontWeight: '500'
  },
  removeButton: {
    padding: 10
  },
  emptyState: {
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

export default FavoritesManager;