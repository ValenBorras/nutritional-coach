'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/components/auth/auth-provider'

interface PushNotificationState {
  permission: NotificationPermission
  isSupported: boolean
  isSubscribed: boolean
  subscription: PushSubscription | null
  loading: boolean
  error: string | null
}

export function usePushNotifications() {
  const { user } = useAuth()
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default' as NotificationPermission,
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    loading: false,
    error: null
  })

  // Helper function to get service worker registration
  const getServiceWorkerRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported')
      return null
    }

    try {
      // First, check if we have a ready registration
      const registration = await navigator.serviceWorker.ready
      console.log('✅ Service Worker ready:', registration.scope)
      return registration
    } catch (error) {
      console.log('⚠️ Service Worker not ready, checking registrations...')
      
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        if (registrations.length > 0) {
          console.log('✅ Found existing registration:', registrations[0].scope)
          return registrations[0]
        }
      } catch (regError) {
        console.error('❌ Error getting registrations:', regError)
      }
      
      return null
    }
  }, [])

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      // Basic checks
      const hasServiceWorker = 'serviceWorker' in navigator
      const hasPushManager = 'PushManager' in window
      const hasNotification = 'Notification' in window
      
      console.log('🔍 Push notification support check:', {
        hasServiceWorker,
        hasPushManager,
        hasNotification,
        userAgent: navigator.userAgent
      })

      if (!hasServiceWorker || !hasPushManager || !hasNotification) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          permission: 'denied'
        }))
        return
      }

      // For Safari, we need to be more patient and check multiple times
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      const maxAttempts = isSafari ? 5 : 3
      let attempts = 0
      
      const checkServiceWorkerReady = async () => {
        attempts++
        console.log(`🔍 Attempt ${attempts}/${maxAttempts} to verify service worker`)
        
        const registration = await getServiceWorkerRegistration()
        
        if (registration && registration.pushManager) {
          console.log('✅ Service Worker and PushManager confirmed')
          setState(prev => ({
            ...prev,
            isSupported: true,
            permission: Notification.permission
          }))
          return true
        }
        
        if (attempts < maxAttempts) {
          console.log(`⏳ Service Worker not ready, retrying in ${isSafari ? 3 : 2} seconds...`)
          setTimeout(checkServiceWorkerReady, isSafari ? 3000 : 2000)
          return false
        }
        
        console.log('❌ Service Worker not available after all attempts')
        setState(prev => ({
          ...prev,
          isSupported: false,
          permission: 'denied'
        }))
        return false
      }

      // Start checking
      await checkServiceWorkerReady()
    }

    // Listen for the service worker ready event from PWA installer
    const handleServiceWorkerReady = () => {
      console.log('🎉 Received SW ready event, rechecking support...')
      setTimeout(checkSupport, 500)
    }

    window.addEventListener('sw-ready', handleServiceWorkerReady)

    // Start initial check with a delay to let PWA installer register SW first
    const initialDelay = 1000
    setTimeout(checkSupport, initialDelay)

    return () => {
      window.removeEventListener('sw-ready', handleServiceWorkerReady)
    }
  }, [getServiceWorkerRegistration])

  // Get existing subscription
  useEffect(() => {
    const getExistingSubscription = async () => {
      if (!state.isSupported || !user) return

      try {
        const registration = await getServiceWorkerRegistration()
        if (!registration) {
          console.log('❌ No service worker registration available')
          return
        }

        const subscription = await registration.pushManager.getSubscription()
        
        setState(prev => ({
          ...prev,
          subscription,
          isSubscribed: !!subscription,
          permission: Notification.permission
        }))
      } catch (error) {
        console.error('Error getting subscription:', error)
        setState(prev => ({
          ...prev,
          error: 'Error al verificar suscripción existente'
        }))
      }
    }

    getExistingSubscription()
  }, [state.isSupported, user, getServiceWorkerRegistration])

  // Request permission for notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      const errorMessage = isSafari 
        ? 'Safari requiere iOS 16.4+ o macOS Safari 16+ para notificaciones push. Verifica tu versión y que esté instalado como PWA.'
        : 'Las notificaciones push no son compatibles con este navegador'
        
      setState(prev => ({
        ...prev,
        error: errorMessage
      }))
      return false
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const permission = await Notification.requestPermission()
      
      setState(prev => ({
        ...prev,
        permission,
        loading: false
      }))

      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      setState(prev => ({
        ...prev,
        permission: 'denied',
        loading: false,
        error: 'Error al solicitar permisos de notificación'
      }))
      return false
    }
  }, [state.isSupported])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !user) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // First request permission if not granted
      if (state.permission !== 'granted') {
        const permissionGranted = await requestPermission()
        if (!permissionGranted) return false
      }

      // Get service worker registration
      const registration = await getServiceWorkerRegistration()
      if (!registration) {
        throw new Error('Service Worker no está disponible')
      }
      
      // Get VAPID public key from environment variable
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BPdK3I5-SWo15agKaIqHvNHr1mPy1DZ6XPzCmpktM1N7JYB4kjUDcV3-Xd3mGtxRf6LKR81cGce-RIYEMQctHxc'
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Save subscription to your backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: user.id
        }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar suscripción en el servidor')
      }

      setState(prev => ({
        ...prev,
        subscription,
        isSubscribed: true,
        loading: false
      }))

      console.log('✅ Successfully subscribed to push notifications')
      return true

    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al suscribirse a notificaciones'
      }))
      return false
    }
  }, [state.isSupported, state.permission, user, requestPermission, getServiceWorkerRegistration])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription || !user) return false

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Unsubscribe from push manager
      await state.subscription.unsubscribe()

      // Remove subscription from backend
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      })

      setState(prev => ({
        ...prev,
        subscription: null,
        isSubscribed: false,
        loading: false
      }))

      console.log('✅ Successfully unsubscribed from push notifications')
      return true

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cancelar suscripción'
      }))
      return false
    }
  }, [state.subscription, user])

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (!user || !state.isSubscribed) return

    try {
      await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          message: '¡Hola! Esta es una notificación de prueba de NutriGuide 🍎'
        }),
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }, [user, state.isSubscribed])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
} 