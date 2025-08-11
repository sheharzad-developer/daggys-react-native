import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import OrderForm from './components/OrderForm';
import FavoritesManager from './components/FavoritesManager';
import CartManager from './components/CartManager';

const FoodDetail = () => {
  const { id, name, price, icon } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  // Initialize managers
  const favoritesManager = FavoritesManager();
  const cartManager = CartManager();

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const foodDetails = {
    '1': {
      description: 'Juicy beef patty with fresh lettuce, tomato, onion, and our special sauce on a toasted bun.',
      ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Onion', 'Special Sauce', 'Sesame Bun'],
      calories: '650 cal'
    },
    '2': {
      description: 'Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil leaves.',
      ingredients: ['Pizza Dough', 'Mozzarella', 'Tomato Sauce', 'Fresh Basil', 'Olive Oil'],
      calories: '720 cal'
    },
    '3': {
      description: 'Crispy golden fries seasoned with sea salt and served hot.',
      ingredients: ['Potatoes', 'Sea Salt', 'Vegetable Oil'],
      calories: '365 cal'
    },
    '4': {
      description: 'Fresh garden salad with mixed greens, cherry tomatoes, and balsamic dressing.',
      ingredients: ['Mixed Greens', 'Cherry Tomatoes', 'Cucumber', 'Red Onion', 'Balsamic Dressing'],
      calories: '180 cal'
    },
    '5': {
      description: 'Grilled chicken breast with herbs and spices, served with vegetables.',
      ingredients: ['Chicken Breast', 'Herbs', 'Spices', 'Mixed Vegetables'],
      calories: '320 cal'
    },
    '6': {
      description: 'Classic Italian pasta with crispy bacon, eggs, and parmesan cheese.',
      ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan', 'Black Pepper', 'Cream'],
      calories: '680 cal'
    },
    '7': {
      description: 'Rich and moist chocolate cake with chocolate ganache frosting.',
      ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter', 'Cocoa'],
      calories: '420 cal'
    },
    '8': {
      description: 'Freshly squeezed orange juice packed with vitamin C.',
      ingredients: ['Fresh Oranges', 'Natural Pulp'],
      calories: '110 cal'
    }
  };

  const detail = foodDetails[id] || {};

  const handleAddToCart = () => {
    setShowOrderForm(true);
  };

  const handleQuickAddToCart = () => {
    const item = getFoodItemWithDetails();
    cartManager.addToCart(item, quantity);
  };

  const toggleFavorite = () => {
    const item = getFoodItemWithDetails();
    if (favoritesManager.isFavorite(id)) {
      favoritesManager.removeFromFavorites(id);
    } else {
      favoritesManager.addToFavorites(item);
    }
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
  };

  const getFoodItemWithDetails = () => {
    return {
      id,
      name,
      price,
      icon,
      description: detail.description,
      ingredients: detail.ingredients,
      calories: detail.calories
    };
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={80} color="#007AFF" />
          </View>
          
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.foodName}>{name}</Text>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.calories}>{detail.calories}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={favoritesManager.isFavorite(id) ? "heart" : "heart-outline"} 
                size={28} 
                color={favoritesManager.isFavorite(id) ? "#ff4444" : "#666"} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{detail.description}</Text>
          
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {detail.ingredients?.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.quickAddButton} onPress={handleQuickAddToCart}>
              <Ionicons name="add-circle" size={20} color="#007AFF" />
              <Text style={styles.quickAddText}>Quick Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Ionicons name="cart" size={20} color="#fff" style={styles.cartIcon} />
              <Text style={styles.addToCartText}>Order Now ({quantity})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <OrderForm
        visible={showOrderForm}
        onClose={handleCloseOrderForm}
        foodItem={getFoodItemWithDetails()}
        quantity={quantity}
      />
    </>
  );
};

export default FoodDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    padding: 20
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 30,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  titleInfo: {
    flex: 1
  },
  favoriteButton: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 25,
    marginLeft: 15
  },
  foodName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5
  },
  calories: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 20
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20
  },
  ingredientsList: {
    marginBottom: 30
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15
  },
  quickAddButton: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4,
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  quickAddText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.55,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  cartIcon: {
    marginRight: 10
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  quantityButton: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 10,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 30,
    minWidth: 30,
    textAlign: 'center'
  }
});