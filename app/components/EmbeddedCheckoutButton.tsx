'use client'

import React, { useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js'
import { X, CreditCard, Loader2 } from 'lucide-react'

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

console.log('🔍 Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...')

interface EmbeddedCheckoutButtonProps {
  /** Stripe Price ID (for existing products) */
  priceId?: string
  /** Custom amount in cents (for one-time payments) */
  customAmount?: number
  /** Customer email (optional) */
  customerEmail?: string
  /** Additional metadata */
  metadata?: Record<string, string>
  /** Button text */
  buttonText?: string
  /** Button styling classes */
  className?: string
  /** Callback when payment succeeds */
  onSuccess?: () => void
  /** Callback when payment fails */
  onError?: (error: string) => void
}

export default function EmbeddedCheckoutButton({
  priceId,
  customAmount,
  customerEmail,
  metadata = {},
  buttonText = 'Pay Now',
  className = '',
  onSuccess,
  onError
}: EmbeddedCheckoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch client secret from our API
  const fetchClientSecret = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 Fetching client secret with:', {
        priceId,
        customAmount,
        customerEmail,
        metadata
      })

      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customAmount,
          customerEmail,
          metadata,
        }),
      })

      const data = await response.json()
      console.log('📦 API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.client_secret) {
        throw new Error('No client_secret returned from API')
      }

      console.log('✅ Client secret obtained:', data.client_secret?.substring(0, 20) + '...')
      return data.client_secret

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching client secret:', errorMessage)
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [priceId, customAmount, customerEmail, metadata, onError])

  // Handle opening the checkout modal
  const handleOpenCheckout = async () => {
    try {
      console.log('🚀 Opening checkout modal')
      setIsModalOpen(true)
      // The client secret will be fetched when EmbeddedCheckoutProvider mounts
    } catch (err) {
      console.error('❌ Error opening checkout:', err)
      setIsModalOpen(false)
    }
  }

  // Handle closing the modal
  const handleCloseModal = () => {
    console.log('❌ Closing checkout modal')
    setIsModalOpen(false)
    setError(null)
  }

  // Handle successful payment
  const handlePaymentSuccess = () => {
    console.log('✅ Payment completed successfully')
    setIsModalOpen(false)
    onSuccess?.()
  }

  // Default button styles
  const defaultButtonStyles = `
    inline-flex items-center justify-center gap-2 px-6 py-3 
    bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
    transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpenCheckout}
        disabled={isLoading}
        className={className || defaultButtonStyles}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>

      {/* Modal Overlay - Exactly like the working one */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content - Centered and responsive */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                Completar Pago
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6">
                {error ? (
                  /* Error State */
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-red-800 font-medium mb-2">
                        Error en el Pago
                      </h3>
                      <p className="text-red-600 text-sm mb-4">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Intentar de Nuevo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Embedded Checkout */
                  <div>
                    <div className="text-center mb-4 text-sm text-gray-600">
                      Cargando formulario de pago seguro...
                    </div>
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ 
                        fetchClientSecret,
                        onComplete: handlePaymentSuccess
                      }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 