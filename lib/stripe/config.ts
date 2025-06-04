import 'server-only';
import Stripe from 'stripe'

// Configuración del cliente de Stripe para el servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  appInfo: {
    name: 'NutriGuide',
    version: '1.0.0',
  },
}) 