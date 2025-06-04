"use client";

import { useState } from 'react';
import EmbeddedCheckoutButton from '@/app/components/EmbeddedCheckoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';

export default function TestSimpleCheckout() {
  const [customAmount, setCustomAmount] = useState(1299); // $12.99
  const [customerEmail, setCustomerEmail] = useState('');

  const testPlans = [
    {
      id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
      name: 'Basic Plan',
      amount: 1299,
      description: 'Perfect for testing'
    },
    {
      id: 'price_1RVDcc4E1fMQUCHeI84G5DZV', 
      name: 'Pro Plan',
      amount: 3999,
      description: 'Advanced features'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Simple Embedded Checkout Test
          </h1>
          <p className="text-gray-600">
            Quick testing interface for the embedded checkout functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Predefined Plans */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Test Plans</h2>
            
            {testPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <Badge variant="secondary">
                      ${(plan.amount / 100).toFixed(2)}/mo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <EmbeddedCheckoutButton
                    priceId={plan.id}
                    customerEmail={customerEmail}
                    buttonText={`Subscribe for $${(plan.amount / 100).toFixed(2)}/month`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    metadata={{
                      plan_name: plan.name,
                      test: 'true',
                      source: 'simple_test_page'
                    }}
                    onError={(error) => {
                      console.error('Test checkout error:', error);
                      alert(`Checkout error: ${error}`);
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Custom Amount Test</h2>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>One-time Payment</CardTitle>
                <p className="text-sm text-gray-600">Test with any custom amount</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Customer Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (in cents)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    placeholder="1299"
                    min="50"
                    step="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current: ${(customAmount / 100).toFixed(2)} USD
                  </p>
                </div>

                <EmbeddedCheckoutButton
                  customAmount={customAmount}
                  customerEmail={customerEmail}
                  buttonText={`Pay $${(customAmount / 100).toFixed(2)}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  metadata={{
                    payment_type: 'custom_amount',
                    test: 'true',
                    source: 'simple_test_page'
                  }}
                  onError={(error) => {
                    console.error('Custom payment error:', error);
                    alert(`Payment error: ${error}`);
                  }}
                />
              </CardContent>
            </Card>

            {/* Test Info */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <h3 className="font-medium text-yellow-900 mb-2">Test Card Numbers</h3>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><code>4242 4242 4242 4242</code> - Success</p>
                  <p><code>4000 0000 0000 0002</code> - Declined</p>
                  <p><code>4000 0000 0000 9995</code> - Insufficient funds</p>
                  <p className="mt-2">
                    <strong>Expiry:</strong> Any future date<br />
                    <strong>CVC:</strong> Any 3 digits
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 