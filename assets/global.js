// Modern Shopify Theme - Global JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Shopify theme loaded successfully!');
});

// Cart management
const CartManager = {
  async addItem(variantId, quantity = 1) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: quantity })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }
};

window.CartManager = CartManager;