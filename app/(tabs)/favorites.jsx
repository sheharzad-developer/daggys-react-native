import React from 'react';
import { View, StyleSheet } from 'react-native';
import FavoritesManager from '../components/FavoritesManager';

const Favorites = () => {
  const favoritesManager = FavoritesManager();
  const { FavoritesList } = favoritesManager;

  return (
    <View style={styles.container}>
      <FavoritesList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});

export default Favorites;