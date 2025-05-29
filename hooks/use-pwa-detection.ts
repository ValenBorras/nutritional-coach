'use client'

import { useEffect, useState } from 'react'

interface PWADetection {
  isPWA: boolean
  isStandalone: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  source: 'manifest' | 'standalone' | 'url_param' | 'referrer' | 'none'
}

export function usePWADetection(): PWADetection {
  const [detection, setDetection] = useState<PWADetection>({
    isPWA: false,
    isStandalone: false,
    platform: 'unknown',
    source: 'none'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const detectPWA = () => {
      let isPWA = false
      let isStandalone = false
      let platform: PWADetection['platform'] = 'unknown'
      let source: PWADetection['source'] = 'none'

      // Detect platform
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      const isMacOS = /macintosh|mac os x/.test(userAgent)
      const isWindows = /windows/.test(userAgent)

      if (isIOS) {
        platform = 'ios'
      } else if (isAndroid) {
        platform = 'android'
      } else if (isMacOS || isWindows) {
        platform = 'desktop'
      }

      // Method 1: Check display-mode media query (most reliable for modern browsers)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        isPWA = true
        isStandalone = true
        source = 'standalone'
      }

      // Method 2: iOS Safari specific detection
      if (!isPWA && (navigator as any).standalone === true) {
        isPWA = true
        isStandalone = true
        source = 'standalone'
        platform = 'ios'
      }

      // Method 3: Check URL parameters (from manifest start_url)
      if (!isPWA) {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('utm_source') === 'pwa' || urlParams.get('utm_source') === 'pwa_shortcut') {
          isPWA = true
          source = 'url_param'
        }
      }

      // Method 4: Check document referrer for Android app launches
      if (!isPWA && document.referrer.includes('android-app://')) {
        isPWA = true
        source = 'referrer'
        platform = 'android'
      }

      // Method 5: Check for TWA (Trusted Web Activity) indicators
      if (!isPWA && isAndroid) {
        // Check for TWA specific headers or indicators
        const isTWA = window.matchMedia('(display-mode: standalone)').matches ||
                     document.referrer.startsWith('android-app://') ||
                     (window as any).chrome?.webstore === undefined
        
        if (isTWA) {
          isPWA = true
          source = 'manifest'
        }
      }

      // Additional check: Look for PWA-specific localStorage keys
      if (!isPWA) {
        const pwaKeys = [
          'pwa-installed',
          'app-installed',
          'standalone-mode'
        ]
        
        const hasPWAStorage = pwaKeys.some(key => localStorage.getItem(key))
        if (hasPWAStorage) {
          isPWA = true
          source = 'url_param'
        }
      }

      return {
        isPWA,
        isStandalone,
        platform,
        source
      }
    }

    const result = detectPWA()
    setDetection(result)

    // Log detection results for debugging
    if (result.isPWA) {
      console.log('🔍 PWA Detection Results:', {
        isPWA: result.isPWA,
        platform: result.platform,
        source: result.source,
        isStandalone: result.isStandalone,
        userAgent: navigator.userAgent,
        displayMode: window.matchMedia('(display-mode: standalone)').matches,
        navigatorStandalone: (navigator as any).standalone,
        referrer: document.referrer,
        urlParams: window.location.search
      })
    }

    // Set a flag in localStorage for future reference
    if (result.isPWA) {
      localStorage.setItem('pwa-detected', 'true')
      localStorage.setItem('pwa-platform', result.platform)
      localStorage.setItem('pwa-source', result.source)
    }

  }, [])

  return detection
} 