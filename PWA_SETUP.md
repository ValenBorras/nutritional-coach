# PWA Setup - NutriGuide

## ¿Qué es una PWA?

Una Progressive Web App (PWA) es una aplicación web que utiliza tecnologías modernas para ofrecer una experiencia similar a una aplicación nativa en dispositivos móviles y de escritorio.

## Características Implementadas

### ✅ Funcionalidades PWA Completadas

1. **Web App Manifest** (`/public/manifest.json`)
   - Configuración completa de la aplicación
   - Iconos en múltiples tamaños (16x16 hasta 512x512)
   - Configuración de pantalla completa
   - Shortcuts de aplicación
   - Soporte para screenshots
   - URL de inicio con parámetros PWA

2. **Service Worker** (`/public/sw.js`)
   - Caché de recursos estáticos
   - Funcionalidad offline básica
   - Estrategia de cache-first para recursos
   - Limpieza automática de cachés antiguos
   - **✅ Soporte completo para notificaciones push**
   - Background sync
   - **✅ Manejo avanzado de clics en notificaciones**

3. **Iconos PWA**
   - Generación automática de iconos en SVG y PNG
   - Tamaños: 16, 32, 72, 96, 128, 144, 152, 192, 384, 512 píxeles
   - Iconos optimizados para diferentes dispositivos
   - Apple Touch Icons para iOS
   - Favicon personalizado

4. **Meta Tags Optimizadas**
   - Viewport optimizado para móviles
   - Theme color configurado
   - Apple Web App meta tags
   - Open Graph y Twitter Cards
   - Configuración para pantalla completa

5. **Componentes React**
   - **PWAInstaller**: Prompt de instalación personalizado
   - **OfflineIndicator**: Indicador de estado de conexión
   - **PWARedirect**: Redirección automática para usuarios móviles
   - **PWALoading**: Pantalla de carga durante redirecciones
   - **✅ PushNotificationsManager**: Gestión completa de notificaciones push
   - Integración automática en el layout principal

6. **🆕 Redirección Automática para PWA**
   - Detección automática de acceso desde PWA instalada
   - Redirección directa al dashboard (usuarios autenticados)
   - Redirección directa al login (usuarios no autenticados)
   - **Los usuarios NO ven el landing page al acceder desde la app móvil**
   - Persistencia de sesión mejorada
   - Detección multiplataforma (iOS, Android, Desktop)

7. **🔔 Notificaciones Push Completas**
   - Sistema completo de notificaciones push funcional
   - Hook personalizado para manejo de suscripciones
   - Componente UI intuitivo en configuraciones
   - APIs backend para suscripción/cancelación/prueba
   - Base de datos con tabla `push_subscriptions`
   - Claves VAPID generadas y configuradas
   - Service worker optimizado para notificaciones
   - Soporte para notificaciones con acciones
   - Manejo inteligente de permisos
   - Sistema de pruebas integrado

## Instalación y Uso

### Generar Iconos

```bash
# Generar iconos desde el logo (RECOMENDADO)
npm run generate:icons-from-logo

# O usar el comando completo
npm run build:icons-logo

# Métodos alternativos (SVG generados):
# Generar iconos SVG
npm run generate:icons

# Convertir SVG a PNG
npm run convert:icons

# Hacer ambos en un comando
npm run build:icons
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La PWA estará disponible en http://localhost:3000
```

### Producción

```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm run start
```

## Comportamiento de la PWA

### 🔄 Flujo de Redirección Automática

Cuando un usuario accede desde la PWA instalada:

1. **Detección PWA**: Se detecta automáticamente el acceso desde la app instalada
2. **Verificación de Sesión**: Se verifica si el usuario está autenticado
3. **Redirección Inteligente**:
   - ✅ **Usuario autenticado** → Redirige a `/dashboard`
   - 🔐 **Usuario no autenticado** → Redirige a `/login`
4. **Pantalla de Carga**: Se muestra feedback visual durante el proceso

### 📱 Detección PWA Avanzada

El sistema detecta PWA usando múltiples métodos:

- **Display Mode**: `(display-mode: standalone)`
- **iOS Safari**: `navigator.standalone`
- **URL Parameters**: `utm_source=pwa`
- **Android TWA**: Trusted Web Activity detection
- **Referrer**: Android app referrer detection
- **LocalStorage**: Marcadores de instalación

## Cómo Instalar la PWA

### En Android (Chrome/Edge)

1. Abre la aplicación en el navegador
2. Aparecerá un banner de instalación automáticamente
3. O ve al menú del navegador → "Instalar aplicación"
4. Sigue las instrucciones en pantalla
5. **Al abrir la app instalada, irás directamente al dashboard o login**

### En iOS (Safari)

1. Abre la aplicación en Safari
2. Toca el botón de compartir (cuadrado con flecha hacia arriba)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación
5. **Al abrir la app desde la pantalla de inicio, saltarás el landing page**

### En Desktop (Chrome/Edge)

1. Abre la aplicación en el navegador
2. Busca el ícono de instalación en la barra de direcciones
3. O ve al menú → "Instalar NutriGuide"
4. Confirma la instalación
5. **La app de escritorio también redirige automáticamente**

## Funcionalidades Offline

### Recursos Cacheados Automáticamente

- Página principal (`/`)
- Dashboard (`/dashboard`)
- Páginas de login y registro
- Manifest y iconos principales
- Archivos CSS y JS críticos

### Estrategia de Cache

- **Cache First**: Para recursos estáticos (CSS, JS, imágenes)
- **Network First**: Para contenido dinámico (API calls)
- **Stale While Revalidate**: Para contenido que puede estar desactualizado

## Configuración Avanzada

### Personalizar el Manifest

Edita `/public/manifest.json` para cambiar:

```json
{
  "name": "Tu App Name",
  "short_name": "App",
  "theme_color": "#F88379",
  "background_color": "#F5EBDD",
  "start_url": "/?utm_source=pwa"
}
```

### Personalizar Colores de Marca

Los colores están centralizados en `/lib/brand-colors.ts`:

```typescript
export const brandColors = {
  softRose: '#F7CAC9',      // Soft Rose
  charcoalGray: '#4A4A4A',  // Text Colors - Charcoal Gray  
  coral: '#F88379',         // Accent Color - Coral
  sageGreen: '#A8CBB7',     // Sage Green
  warmSand: '#F5EBDD',      // Warm Sand
}
```

Para cambiar colores:
1. Modifica `/lib/brand-colors.ts`
2. Actualiza `/public/manifest.json`
3. Regenera iconos: `npm run build:icons`
4. Actualiza componentes PWA si es necesario

### Personalizar Redirección PWA

Edita `/app/components/pwa-redirect.tsx` para:

- Cambiar rutas de redirección
- Modificar lógica de autenticación
- Personalizar mensajes de carga
- Ajustar timeouts

### Personalizar Detección PWA

Edita `/hooks/use-pwa-detection.ts` para:

- Agregar nuevos métodos de detección
- Modificar criterios de plataforma
- Personalizar logging de debug

### Personalizar Service Worker

Edita `/public/sw.js` para:

- Agregar más URLs al cache
- Cambiar estrategias de cache
- Implementar background sync personalizado
- Configurar notificaciones push

### Personalizar Iconos

**Opción 1: Usar tu propio logo (Recomendado)**
1. Reemplaza `/public/NUTRI APP (1).png` con tu logo
2. Ejecuta `npm run generate:icons-from-logo`
3. Los iconos se generarán automáticamente en todos los tamaños

**Opción 2: Modificar iconos SVG generados**
1. Modifica el script en `/scripts/generate-icons.js`
2. Cambia colores, formas o texto
3. Ejecuta `npm run build:icons`

## Testing PWA

### Herramientas de Desarrollo

1. **Chrome DevTools**
   - Application tab → Manifest
   - Application tab → Service Workers
   - Lighthouse audit

2. **PWA Builder**
   - Visita: https://www.pwabuilder.com/
   - Ingresa tu URL para análisis completo

3. **Lighthouse**
   ```bash
   # Instalar Lighthouse CLI
   npm install -g lighthouse
   
   # Auditar PWA
   lighthouse http://localhost:3000 --view
   ```

### Testing Redirección PWA

Para probar la redirección automática:

1. **Simular PWA en DevTools**:
   ```javascript
   // En Console de DevTools
   window.history.pushState({}, '', '/?utm_source=pwa')
   location.reload()
   ```

2. **Verificar Detección**:
   ```javascript
   // Ver logs de detección PWA
   localStorage.getItem('pwa-detected')
   localStorage.getItem('pwa-platform')
   ```

3. **Limpiar Estado**:
   ```javascript
   // Limpiar marcadores PWA
   localStorage.removeItem('pwa-detected')
   localStorage.removeItem('pwa-installed')
   ```

### Checklist PWA

- ✅ Manifest válido
- ✅ Service Worker registrado
- ✅ Iconos en múltiples tamaños
- ✅ HTTPS (requerido en producción)
- ✅ Responsive design
- ✅ Funcionalidad offline básica
- ✅ Meta tags optimizadas
- ✅ **Redirección automática PWA**
- ✅ **Detección multiplataforma**
- ✅ **Persistencia de sesión**
- ✅ **🔔 Notificaciones Push completas**

## Próximos Pasos

### Funcionalidades Avanzadas a Implementar

1. **Push Notifications** ✅ **COMPLETADO**
   - ✅ Configurar servidor de notificaciones
   - ✅ Implementar suscripciones
   - ✅ Personalizar mensajes
   - ✅ Sistema de pruebas
   - ✅ Manejo de permisos

2. **Background Sync**
   - Sincronizar datos cuando vuelva la conexión
   - Queue de acciones offline

3. **App Shortcuts**
   - Accesos directos desde el ícono de la app
   - Configurar en el manifest

4. **Share Target**
   - Permitir que otras apps compartan contenido
   - Configurar en el manifest

## Troubleshooting

### Problemas Comunes

1. **Service Worker no se registra**
   - Verificar que esté en HTTPS o localhost
   - Revisar console para errores

2. **Iconos no aparecen**
   - Verificar que los archivos PNG existan
   - Comprobar rutas en el manifest

3. **No aparece prompt de instalación**
   - Verificar criterios PWA en DevTools
   - Asegurar que el manifest sea válido

4. **Cache no funciona offline**
   - Verificar que las URLs estén en el cache
   - Comprobar estrategia de cache en SW

5. **🆕 Redirección PWA no funciona**
   - Verificar console para logs de detección
   - Comprobar localStorage para marcadores PWA
   - Verificar que el parámetro `utm_source=pwa` esté presente

### Logs y Debugging

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then(console.log)

// Ver cache actual
caches.keys().then(console.log)

// Ver contenido de cache específico
caches.open('nutriguide-v1').then(cache => 
  cache.keys().then(console.log)
)

// 🆕 Debug PWA Detection
console.log('PWA Detection:', {
  displayMode: window.matchMedia('(display-mode: standalone)').matches,
  standalone: navigator.standalone,
  urlParams: window.location.search,
  referrer: document.referrer,
  localStorage: {
    pwaDetected: localStorage.getItem('pwa-detected'),
    pwaInstalled: localStorage.getItem('pwa-installed'),
    pwaPlatform: localStorage.getItem('pwa-platform')
  }
})
```

## Recursos Adicionales

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Nota**: Esta implementación proporciona una experiencia nativa completa donde los usuarios de la PWA van directamente a la funcionalidad principal sin ver el landing page, mejorando significativamente la UX móvil. 