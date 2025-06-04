// Script para obtener Price IDs desde Stripe
// Ejecutar con: node scripts/get-stripe-prices.js

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

// Configurar con tu STRIPE_SECRET_KEY desde .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_IDS = {
  'freemium_nutritionist': 'prod_SQ3idGmb4LqE0Y',
  'professional_nutritionist': 'prod_SQ3k5hXnvZEk5F', 
  'patient_monthly': 'prod_SQ3mk5NnUuvKSs'
};

async function getPrices() {
  console.log('🔍 Obteniendo Price IDs desde Stripe...\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY no encontrado en .env.local');
    return;
  }
  
  console.log('✅ STRIPE_SECRET_KEY encontrado, conectando...\n');
  
  try {
    for (const [name, productId] of Object.entries(PRODUCT_IDS)) {
      console.log(`📦 Producto: ${name} (${productId})`);
      
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });
      
      if (prices.data.length > 0) {
        prices.data.forEach(price => {
          console.log(`  💰 Price ID: ${price.id}`);
          console.log(`  💵 Precio: $${price.unit_amount ? price.unit_amount / 100 : 0}/${price.recurring?.interval || 'one-time'}`);
          if (price.recurring?.trial_period_days) {
            console.log(`  🔄 Trial: ${price.recurring.trial_period_days} días`);
          }
          console.log('');
        });
      } else {
        console.log('  ❌ No se encontraron precios para este producto\n');
      }
    }
    
    console.log('✅ Copia estos Price IDs y actualiza tu migración SQL');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('💡 Verifica que tu STRIPE_SECRET_KEY sea correcta en .env.local');
    }
  }
}

getPrices(); 