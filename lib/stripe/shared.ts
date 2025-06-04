// Configuración de precios por defecto
export const STRIPE_CONFIG = {
  // Planes para Nutricionistas
  nutritionist: {
    free: {
      name: 'Plan Gratuito',
      price: 0,
      maxPatients: 5,
      features: ['Chat IA básico', 'Panel básico', 'Soporte por email'],
    },
    professional: {
      name: 'Plan Profesional',
      price: 39.99,
      maxPatients: null, // Ilimitado
      features: [
        'Pacientes ilimitados',
        'IA personalizada avanzada',
        'Analytics detallados',
        'Soporte prioritario',
        'Exportar conversaciones'
      ],
    },
    clinic: {
      name: 'Plan Clínica',
      price: 99,
      maxPatients: null,
      features: [
        'Todo lo anterior',
        'Múltiples nutricionistas',
        'Dashboard administrativo',
        'API access',
        'White-label options',
        'Soporte telefónico'
      ],
    },
  },
  // Plan para Pacientes
  patient: {
    monthly: {
      name: 'Plan Mensual',
      price: 12.99,
      trialDays: 15,
      features: [
        'Chat personalizado con IA 24/7',
        'Seguimiento nutricional completo',
        'Plan de comidas personalizado',
        'Sincronización con nutricionista',
        'Historial completo',
        'Notificaciones push'
      ],
    },
  },
} as const

// Tipos TypeScript
export type StripePrice = {
  id: string
  product_id: string
  user_type: 'nutritionist' | 'patient'
  active: boolean
  currency: string
  unit_amount: number
  interval: 'month' | 'year' | 'one_time'
  interval_count: number
  trial_period_days?: number
  nickname: string
  metadata: Record<string, any>
}

export type StripeSubscription = {
  id: string
  user_id: string
  user_type: 'nutritionist' | 'patient'
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
  price_id: string
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
} 