import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const About = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Ionicons name="information-circle" size={80} color="#007AFF" style={styles.icon} />
      <Text style={styles.title}>About Daggy's Menu</Text>
      <Text style={styles.description}>
        Welcome to Daggy's Menu App! We're passionate about bringing you the finest dining experience 
        right to your fingertips.
      </Text>
      
      <View style={styles.featureContainer}>
        <View style={styles.feature}>
          <Ionicons name="restaurant-outline" size={24} color="#007AFF" />
          <Text style={styles.featureTitle}>Fresh Ingredients</Text>
          <Text style={styles.featureText}>We use only the freshest, locally-sourced ingredients</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.featureTitle}>Fast Service</Text>
          <Text style={styles.featureText}>Quick preparation without compromising quality</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="heart-outline" size={24} color="#007AFF" />
          <Text style={styles.featureTitle}>Made with Love</Text>
          <Text style={styles.featureText}>Every dish is crafted with care and passion</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 40
  },
  icon: {
    marginBottom: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20
  },
  featureContainer: {
    width: '100%',
    alignItems: 'center'
  },
  feature: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center'
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  }
});