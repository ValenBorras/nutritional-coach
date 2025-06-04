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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      console.log('✅ Checkout session created:', data.session_id)
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
      setIsModalOpen(true)
      // The client secret will be fetched when EmbeddedCheckoutProvider mounts
    } catch (err) {
      console.error('❌ Error opening checkout:', err)
      setIsModalOpen(false)
    }
  }

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError(null)
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Complete Your Payment
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4">
                {error ? (
                  /* Error State */
                  <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="text-red-800 font-medium mb-2">
                        Payment Error
                      </h3>
                      <p className="text-red-600 text-sm">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Embedded Checkout */
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ fetchClientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 