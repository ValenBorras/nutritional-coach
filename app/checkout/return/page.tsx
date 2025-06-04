import { Suspense } from 'react'
import { stripe } from '@/lib/stripe/server'
import { CheckCircle, XCircle, Clock, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface CheckoutReturnProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

// Loading component for Suspense
function CheckoutReturnLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your payment...</p>
      </div>
    </div>
  )
}

// Main return page component
async function CheckoutReturnContent({ searchParams }: CheckoutReturnProps) {
  const resolvedSearchParams = await searchParams
  const sessionId = resolvedSearchParams.session_id

  // Handle missing session ID
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Payment Session
          </h1>
          <p className="text-gray-600 mb-6">
            No payment session ID was provided. Please try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    })

    // Get session status and payment details
    const { status, payment_status, customer_details, amount_total, currency } = session
    const lineItems = session.line_items?.data || []

    // Format amount for display
    const formatAmount = (amount: number | null, currency: string) => {
      if (!amount) return 'N/A'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100)
    }

    // Determine status display
    const getStatusDisplay = () => {
      if (status === 'complete' && payment_status === 'paid') {
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Payment Successful!',
          message: 'Thank you for your purchase. Your payment has been processed successfully.',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
      } else if (status === 'complete' && payment_status === 'unpaid') {
        return {
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          title: 'Payment Pending',
          message: 'Your payment is being processed. We\'ll notify you once it\'s complete.',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        }
      } else {
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Payment Failed',
          message: 'There was an issue processing your payment. Please try again.',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        }
      }
    }

    const statusDisplay = getStatusDisplay()

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Status Icon and Title */}
            <div className="text-center mb-8">
              {statusDisplay.icon}
              <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                {statusDisplay.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {statusDisplay.message}
              </p>
            </div>

            {/* Payment Details */}
            {status === 'complete' && (
              <div className={`${statusDisplay.bgColor} rounded-lg p-6 mb-8`}>
                <h2 className={`font-semibold ${statusDisplay.textColor} mb-4`}>
                  Payment Details
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session ID:</span>
                    <span className="font-mono text-sm">{sessionId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {formatAmount(amount_total, currency || 'usd')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="capitalize font-semibold">
                      {payment_status || status}
                    </span>
                  </div>

                  {customer_details?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{customer_details.email}</span>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                {lineItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">Items:</h3>
                    <div className="space-y-2">
                      {lineItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>
                            {item.quantity}x {formatAmount(item.amount_total, currency || 'usd')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 ${statusDisplay.buttonColor} text-white rounded-lg transition-colors font-medium`}
              >
                <ArrowLeft className="w-4 h-4" />
                Continue to Dashboard
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </div>

            {/* Support Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Need help?{' '}
                <Link 
                  href="/support" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )

  } catch (error) {
    console.error('❌ Error retrieving checkout session:', error)
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Payment Status
          </h1>
          <p className="text-gray-600 mb-6">
            Unable to retrieve payment information. Please check your session ID or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

// Main exported page component with Suspense
export default function CheckoutReturnPage({ searchParams }: CheckoutReturnProps) {
  return (
    <Suspense fallback={<CheckoutReturnLoading />}>
      <CheckoutReturnContent searchParams={searchParams} />
    </Suspense>
  )
} 