"use client";

import { useState } from 'react';
import EmbeddedCheckoutButton from '@/app/components/EmbeddedCheckoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export default function EmbeddedCheckoutDemo() {
  const [customAmount, setCustomAmount] = useState<number>(2999); // $29.99 in cents
  const [customerEmail, setCustomerEmail] = useState('');

  // Real price IDs from your Stripe dashboard
  const examplePrices = [
    {
      id: 'price_1RVDer4E1fMQUCHe1bi3YujU', // Your real price ID
      name: 'NutriGuide Basic',
      amount: 1299, // $12.99 - Real price from Stripe
      currency: 'USD',
      interval: 'month',
      description: 'Essential nutrition guidance and AI chat'
    },
    {
      id: 'price_1RVDcc4E1fMQUCHeI84G5DZV', // Your real price ID
      name: 'NutriGuide Pro',
      amount: 3999, // $39.99 - Real price from Stripe
      currency: 'USD',
      interval: 'month',
      description: 'Advanced nutrition coaching with premium features'
    },
    {
      id: 'price_1RVDaj4E1fMQUCHehmZgPtIt', // Your real price ID
      name: 'NutriGuide Free Trial',
      amount: 0, // Free - Real price from Stripe
      currency: 'USD',
      interval: 'month',
      description: 'Try NutriGuide for free'
    }
  ];

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Embedded Checkout Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the Stripe embedded checkout functionality with different payment scenarios.
            This page demonstrates how to integrate the payment system into your application.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Predefined Products */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              📦 Predefined Products
            </h2>
            
            {examplePrices.map((price) => (
              <Card key={price.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{price.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {price.interval}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{price.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">
                        {formatPrice(price.amount, price.currency)}
                      </span>
                      <span className="text-gray-500">/{price.interval}</span>
                    </div>
                    
                    <EmbeddedCheckoutButton
                      priceId={price.id}
                      customerEmail={customerEmail}
                      buttonText="Subscribe Now"
                      metadata={{
                        product_name: price.name,
                        demo: 'true'
                      }}
                      onError={(error) => {
                        console.error('❌ Payment failed:', error)
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              💰 Custom Amount
            </h2>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>One-time Payment</CardTitle>
                <p className="text-gray-600">
                  Test with any custom amount you specify
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (in cents)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    placeholder="2999"
                    min="50"
                    step="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current: {formatPrice(customAmount, 'USD')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="email">Customer Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="pt-4">
                  <EmbeddedCheckoutButton
                    customAmount={customAmount}
                    customerEmail={customerEmail}
                    buttonText={`Pay ${formatPrice(customAmount, 'USD')}`}
                    metadata={{
                      payment_type: 'custom_amount',
                      demo: 'true'
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    onError={(error) => {
                      console.error('❌ Custom payment failed:', error);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Testing Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">🧪 Testing Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800">
                <div className="space-y-2">
                  <p><strong>Test Card Numbers:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><code>4242 4242 4242 4242</code> - Successful payment</li>
                    <li><code>4000 0000 0000 0002</code> - Card declined</li>
                    <li><code>4000 0000 0000 9995</code> - Insufficient funds</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Expiry:</strong> Any future date (e.g., 12/25)
                    <br />
                    <strong>CVC:</strong> Any 3-digit number (e.g., 123)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Development Notes */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900">⚠️ Development Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800">
            <div className="space-y-3">
              <p>
                <strong>Before using in production:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Replace example price IDs with real ones from your Stripe Dashboard</li>
                <li>Set up proper webhook handling for payment events</li>
                <li>Configure your environment variables correctly</li>
                <li>Test with various payment scenarios</li>
                <li>Implement proper error logging and monitoring</li>
              </ul>
              
              <p className="mt-4">
                <strong>Files created:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 font-mono text-xs">
                <li>app/api/checkout_sessions/route.ts</li>
                <li>components/EmbeddedCheckoutButton.tsx</li>
                <li>app/checkout/return/page.tsx</li>
                <li>app/demo/embedded-checkout/page.tsx</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 