import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Modal, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OrderForm = ({ visible, onClose, foodItem, quantity, cartItems, isMultipleItems = false, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    specialInstructions: '',
    discountCode: ''
  });

  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const discountCodes = {
    'FIRST10': 10,
    'STUDENT15': 15,
    'FAMILY20': 20,
    'VIP25': 25
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyDiscount = () => {
    const code = formData.discountCode.toUpperCase();
    if (discountCodes[code]) {
      setDiscountAmount(discountCodes[code]);
      setDiscountApplied(true);
      Alert.alert('Discount Applied!', `${discountCodes[code]}% discount has been applied to your order.`);
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid discount code.');
      setDiscountAmount(0);
      setDiscountApplied(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const discount = discountApplied ? (subtotal * discountAmount / 100) : 0;
    const total = subtotal - discount;
    return total.toFixed(2);
  };

  const calculateSubtotal = () => {
    if (isMultipleItems && cartItems) {
      return cartItems.reduce((total, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return total + (price * item.quantity);
      }, 0).toFixed(2);
    } else if (foodItem?.price) {
      const basePrice = parseFloat(foodItem.price.replace('$', ''));
      return (basePrice * quantity).toFixed(2);
    }
    return '0.00';
  };

  const calculateDiscountValue = () => {
    if (!discountApplied || !foodItem?.price) return '0.00';
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * discountAmount / 100).toFixed(2);
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    for (let field of required) {
      if (!formData[field].trim()) {
        Alert.alert('Missing Information', `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    
    return true;
  };

  const submitOrder = async () => {
    if (!validateForm()) return;

    try {
      const subtotal = calculateSubtotal();
      const discountValue = calculateDiscountValue();
      const total = calculateTotal();
      
      let emailSubject, emailBody;
      
      if (isMultipleItems && cartItems) {
        const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        emailSubject = `Delivery Order - ${itemCount} items`;
        
        const itemsList = cartItems.map(item => 
          `• ${item.name} (x${item.quantity}) - ${item.price} each`
        ).join('\n');
        
        emailBody = `
New Delivery Order from Daggy's Menu

📋 ORDER DETAILS:
${itemsList}
• Subtotal: $${subtotal}
${discountApplied ? `• Discount (${discountAmount}%): -$${discountValue}\n` : ''}• Total: $${total}

👤 CUSTOMER INFORMATION:
• Name: ${formData.firstName} ${formData.lastName}
• Email: ${formData.email}
• Phone: ${formData.phone}

🚚 DELIVERY ADDRESS:
${formData.address}
${formData.city}, ${formData.zipCode}

${formData.specialInstructions ? `📝 SPECIAL INSTRUCTIONS:\n${formData.specialInstructions}\n\n` : ''}Please confirm this order and provide estimated delivery time.

Thank you!
        `;
      } else {
        emailSubject = `Delivery Order - ${foodItem.name} (x${quantity})`;
        emailBody = `
New Delivery Order from Daggy's Menu

📋 ORDER DETAILS:
• Item: ${foodItem.name}
• Quantity: ${quantity}
• Unit Price: ${foodItem.price}
• Subtotal: $${subtotal}
${discountApplied ? `• Discount (${discountAmount}%): -$${discountValue}\n` : ''}• Total: $${total}

👤 CUSTOMER INFORMATION:
• Name: ${formData.firstName} ${formData.lastName}
• Email: ${formData.email}
• Phone: ${formData.phone}

🚚 DELIVERY ADDRESS:
${formData.address}
${formData.city}, ${formData.zipCode}

${formData.specialInstructions ? `📝 SPECIAL INSTRUCTIONS:\n${formData.specialInstructions}\n\n` : ''}🍽️ ITEM DETAILS:
• Description: ${foodItem.description || 'N/A'}
• Calories: ${foodItem.calories || 'N/A'}
• Ingredients: ${foodItem.ingredients?.join(', ') || 'N/A'}

Please confirm this order and provide estimated delivery time.

Thank you!
        `;
      }

      // Send email notification - cross-platform solution
      const emailTo = 'sheharzad.salahuddin9000@outlook.com';
      const emailUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      const canOpenEmail = await Linking.canOpenURL(emailUrl);
      if (canOpenEmail) {
        await Linking.openURL(emailUrl);
      } else {
        throw new Error('No email client available');
      }

      // Send SMS notification (optional)
      const smsBody = `New order from ${formData.firstName} ${formData.lastName}. Total: $${total}. Check email for details.`;
      const smsUrl = `sms:+1234567890?body=${encodeURIComponent(smsBody)}`;
      
      Alert.alert(
        'Order Submitted!',
        'Your order has been sent. You will receive a confirmation email shortly.',
        [
          { text: 'Send SMS Alert', onPress: () => Linking.openURL(smsUrl) },
          { text: 'OK', onPress: () => {
            if (onOrderComplete) onOrderComplete();
            onClose();
          }}
        ]
      );
    } catch (error) {
      console.log('Email error:', error);
      
      // Provide alternative contact methods if email fails
      Alert.alert(
        'Order Submission',
        'We\'re having trouble opening your email client. Please contact us directly to place your order:\n\n📧 Email: sheharzad.salahuddin9000@outlook.com\n📞 Phone: (555) 123-4567\n\nOr try again if you have an email app installed.',
        [
          {
            text: 'Call Now',
            onPress: () => Linking.openURL('tel:+15551234567')
          },
          {
            text: 'Copy Email',
            onPress: () => {
              // For web, we can try to copy to clipboard or show the email
              Alert.alert('Contact Email', 'sheharzad.salahuddin9000@outlook.com');
            }
          },
          { text: 'OK' }
        ]
      );
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      specialInstructions: '',
      discountCode: ''
    });
    setDiscountApplied(false);
    setDiscountAmount(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.orderItem}>
              <Text style={styles.itemName}>{foodItem?.name}</Text>
              <Text style={styles.itemDetails}>Quantity: {quantity} × {foodItem?.price}</Text>
            </View>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Enter first name"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter street address"
            />

            <View style={styles.row}>
              <View style={styles.expandedInput}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="Enter city"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  placeholder="ZIP"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Discount Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discount Code</Text>
            <View style={styles.discountRow}>
              <TextInput
                style={[styles.input, styles.discountInput]}
                value={formData.discountCode}
                onChangeText={(value) => handleInputChange('discountCode', value)}
                placeholder="Enter discount code"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyButton} onPress={applyDiscount}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.discountHint}>Available codes: FIRST10, STUDENT15, FAMILY20, VIP25</Text>
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialInstructions}
              onChangeText={(value) => handleInputChange('specialInstructions', value)}
              placeholder="Any special delivery instructions or food preferences..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Order Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>${calculateSubtotal()}</Text>
            </View>
            {discountApplied && (
              <View style={styles.totalRow}>
                <Text style={styles.discountLabel}>Discount ({discountAmount}%):</Text>
                <Text style={styles.discountValue}>-${calculateDiscountValue()}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>${calculateTotal()}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={submitOrder}>
            <Ionicons name="send" size={20} color="#fff" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>Submit Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  closeButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 34
  },
  content: {
    flex: 1,
    padding: 20
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderItem: {
    marginTop: 10
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    flex: 0.48
  },
  expandedInput: {
    flex: 0.65
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  discountInput: {
    flex: 1,
    marginRight: 10
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  discountHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic'
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  totalLabel: {
    fontSize: 16,
    color: '#333'
  },
  totalValue: {
    fontSize: 16,
    color: '#333'
  },
  discountLabel: {
    fontSize: 16,
    color: '#4CAF50'
  },
  discountValue: {
    fontSize: 16,
    color: '#4CAF50'
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30
  },
  submitIcon: {
    marginRight: 10
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default OrderForm;