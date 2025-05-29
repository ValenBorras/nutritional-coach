import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure VAPID keys from environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'nutriguide@app.com'

// Validate environment variables
if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('❌ VAPID keys not found in environment variables')
  console.error('Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env.local file')
}

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${vapidEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured. Missing VAPID keys.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { userId, message } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Get user name for personalized notification
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const userName = userData?.name || 'Usuario'

    // Prepare push subscription object
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title: '🍎 NutriGuide - Notificación de prueba',
      body: message || `¡Hola ${userName}! Tu PWA de NutriGuide está funcionando perfectamente 🎉`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      image: '/icons/icon-384x384.png',
      data: {
        url: '/dashboard',
        timestamp: Date.now(),
        type: 'test'
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Cerrar',
          icon: '/icons/icon-72x72.png'
        }
      ],
      tag: 'test-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200]
    })

    try {
      // Send push notification
      await webpush.sendNotification(pushSubscription, payload)
      
      console.log('✅ Test notification sent successfully to user:', user.id)
      
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully'
      })
      
    } catch (pushError: any) {
      console.error('❌ Error sending push notification:', pushError)
      
      // If subscription is invalid, mark as inactive
      if (pushError?.statusCode === 410 || pushError?.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          
        return NextResponse.json(
          { error: 'Subscription expired. Please resubscribe to notifications.' },
          { status: 410 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to send push notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// TODO: Implement actual push notification sending
// You'll need to install and configure web-push:
// npm install web-push
// and generate VAPID keys 