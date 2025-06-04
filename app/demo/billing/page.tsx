'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import EmbeddedCheckoutButton from '@/app/components/EmbeddedCheckoutButton'
import { 
  CreditCard, 
  Zap, 
  CheckCircle, 
  Star,
  Users,
  Shield,
  Info
} from 'lucide-react'

const demoBillingPlans = [
  {
    id: 'price_1RVDaj4E1fMQUCHehmZgPtIt',
    name: 'Free Trial',
    amount: 0,
    currency: 'USD',
    interval: 'month',
    description: 'Try all features for free',
    features: ['Basic AI nutrition chat', '7-day meal planning', 'Progress tracking'],
    recommended: false,
    badge: 'Free'
  },
  {
    id: 'price_1RVDer4E1fMQUCHe1bi3YujU',
    name: 'Basic Plan',
    amount: 1299,
    currency: 'USD',
    interval: 'month',
    description: 'Perfect for getting started',
    features: ['Unlimited AI nutrition chat', 'Personalized meal plans', 'Progress tracking', 'Email support'],
    recommended: false,
    badge: 'Popular'
  },
  {
    id: 'price_1RVDcc4E1fMQUCHeI84G5DZV',
    name: 'Pro Plan',
    amount: 3999,
    currency: 'USD',
    interval: 'month',
    description: 'For serious nutrition goals',
    features: ['Everything in Basic', 'Advanced analytics', 'Priority support', 'Custom recipes', 'Nutritionist chat'],
    recommended: true,
    badge: 'Best Value'
  }
]

export default function DemoBillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💳 Demo: Billing & Embedded Checkout
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This page demonstrates how the embedded checkout integrates into a billing page. 
            Perfect for subscription management and plan upgrades.
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" />
              Demo Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">No active subscription</p>
                <p className="text-blue-600 text-sm">Choose a plan below to get started</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Demo Mode</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {demoBillingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.recommended 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge 
                      variant="secondary" 
                      className={
                        plan.badge === 'Free' ? 'bg-green-100 text-green-800' :
                        plan.badge === 'Popular' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }
                    >
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="mt-4">
                  {plan.amount === 0 ? (
                    <div className="text-3xl font-bold text-green-600">Gratis</div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        ${formatPrice(plan.amount)}
                      </span>
                      <span className="text-gray-500 text-sm">/{plan.interval}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Checkout Button */}
                <EmbeddedCheckoutButton
                  priceId={plan.id}
                  customerEmail="demo@nutriguide.com"
                  buttonText={
                    plan.amount === 0 
                      ? 'Comenzar Gratis' 
                      : `Suscribirse por $${formatPrice(plan.amount)}/mes`
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.amount === 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  metadata={{
                    plan_name: plan.name,
                    demo: 'true',
                    source: 'demo_billing_page'
                  }}
                  onError={(error) => {
                    console.error('Demo checkout error:', error)
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Plan Features Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-center py-2">Free</th>
                    <th className="text-center py-2">Basic</th>
                    <th className="text-center py-2">Pro</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-3">AI Nutrition Chat</td>
                    <td className="text-center">Limited</td>
                    <td className="text-center">✅ Unlimited</td>
                    <td className="text-center">✅ Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Meal Planning</td>
                    <td className="text-center">7 days</td>
                    <td className="text-center">✅ Unlimited</td>
                    <td className="text-center">✅ Custom recipes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Progress Tracking</td>
                    <td className="text-center">✅ Basic</td>
                    <td className="text-center">✅ Advanced</td>
                    <td className="text-center">✅ Analytics</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Support</td>
                    <td className="text-center">Community</td>
                    <td className="text-center">Email</td>
                    <td className="text-center">Priority + Chat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Information Banner */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2">
              <p><strong>Demo Mode:</strong> This page demonstrates the embedded checkout integration.</p>
              <p className="text-sm">
                In production, this would integrate with your subscription management system 
                to handle plan upgrades, downgrades, and billing history.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs">Real Stripe Integration</Badge>
                <Badge variant="outline" className="text-xs">Secure Payments</Badge>
                <Badge variant="outline" className="text-xs">Instant Activation</Badge>
                <Badge variant="outline" className="text-xs">Mobile Optimized</Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 