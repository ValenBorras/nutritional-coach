# NutriGuide MVP - Lista de Tareas

## 🎯 Objetivo del MVP
Crear una aplicación funcional con **chat de IA personalizado** para pacientes y nutricionistas, con registro básico y autenticación.

---

## ✅ COMPLETADO

### Core Infrastructure
- [x] Supabase setup con autenticación
- [x] Base de datos con tablas: users, profiles, ai_rules, patient_keys
- [x] Sistema de registro para pacientes y nutricionistas
- [x] Autenticación con Supabase Auth
- [x] RLS (Row Level Security) configurado
- [x] Sistema de claves para conectar pacientes con nutricionistas

### UI/UX Básico
- [x] Landing page con información del producto
- [x] Formularios de registro para pacientes y nutricionistas
- [x] Dashboard básico con navegación
- [x] Diseño responsivo con Tailwind CSS
- [x] Tema de colores y tipografía definidos

### AI Chat System
- [x] API endpoint `/api/chat` con integración OpenAI
- [x] Sistema de prompts personalizados según el tipo de usuario
- [x] Chat component funcional con UI mejorada
- [x] Integración de reglas de IA del nutricionista en las respuestas
- [x] Manejo de errores y estados de carga

---

## 🚧 EN PROGRESO

### Testing & Debugging
- [ ] **ALTA PRIORIDAD**: Probar registro completo de usuarios
- [ ] **ALTA PRIORIDAD**: Verificar que las claves de paciente funcionan
- [ ] **ALTA PRIORIDAD**: Probar chat de IA con diferentes tipos de usuario
- [ ] **ALTA PRIORIDAD**: Verificar variables de entorno (OPENAI_API_KEY)

---

## 📋 PENDIENTE - ALTA PRIORIDAD

### 1. Core Functionality Testing (ESTA SEMANA)
- [ ] **Pruebas de registro**:
  - [ ] Registro de nutricionista → genera AI rules
  - [ ] Generación de clave de paciente
  - [ ] Registro de paciente con clave válida
  - [ ] Verificar conexión automática paciente-nutricionista

- [ ] **Pruebas de chat**:
  - [ ] Chat funciona para pacientes sin nutricionista
  - [ ] Chat funciona para pacientes CON nutricionista (usa sus reglas)
  - [ ] Chat funciona para nutricionistas
  - [ ] Respuestas son coherentes y en español

### 2. Environment Setup & Deployment (ESTA SEMANA)
- [ ] **Variables de entorno**:
  - [ ] Verificar OPENAI_API_KEY está configurada
  - [ ] Documentar todas las variables necesarias
  - [ ] Crear archivo .env.example

- [ ] **Deployment básico**:
  - [ ] Deploy en Vercel o similar
  - [ ] Configurar variables de entorno en producción
  - [ ] Probar funcionalidad en producción

### 3. Error Handling & UX (ESTA SEMANA)
- [ ] **Manejo de errores**:
  - [ ] Mensajes de error claros en registro
  - [ ] Fallbacks cuando OpenAI falla
  - [ ] Validación de formularios mejorada

- [ ] **UX Improvements**:
  - [ ] Loading states en todas las operaciones
  - [ ] Feedback visual cuando se envían mensajes
  - [ ] Mensajes de éxito/error más informativos

---

## 📋 PENDIENTE - PRIORIDAD MEDIA

### 4. Dashboard Improvements (PRÓXIMA SEMANA)
- [ ] **Dashboard del Paciente**:
  - [ ] Panel con información básica del nutricionista asignado
  - [ ] Historial de conversaciones del chat
  - [ ] Estado de conexión con nutricionista

- [ ] **Dashboard del Nutricionista**:
  - [ ] Lista de claves generadas y su estado
  - [ ] Lista básica de pacientes conectados
  - [ ] Botón para generar nuevas claves
  - [ ] Configuración básica de AI rules

### 5. Profile Management (PRÓXIMA SEMANA)
- [ ] **Perfiles básicos**:
  - [ ] Página para editar información personal
  - [ ] Actualización de objetivos nutricionales
  - [ ] Gestión de alergias y restricciones
  - [ ] Configuración básica del chat (estilo de respuestas)

---

## 📋 PENDIENTE - PRIORIDAD BAJA (POST-MVP)

### 6. Features Avanzadas (FUTURO)
- [ ] Sistema de notificaciones
- [ ] Historial persistente de conversaciones
- [ ] Exportar conversaciones
- [ ] Sistema de citas básico
- [ ] Métricas básicas de uso
- [ ] Compartir claves por email/WhatsApp

### 7. Pages Comentadas (REACTIVAR DESPUÉS)
- [ ] Re-activar `/dashboard/meal-plans`
- [ ] Re-activar `/dashboard/nutrition`
- [ ] Re-activar `/dashboard/patients`
- [ ] Re-activar `/dashboard/settings`

---

## 🔧 CONFIGURACIÓN NECESARIA

### Variables de Entorno Requeridas
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# NextAuth (si se usa)
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### Dependencias Nuevas
- [ ] Verificar que todas las dependencias están instaladas
- [ ] Considerar agregar: react-hot-toast para notificaciones

---

## 🎯 CRITERIOS DE ÉXITO DEL MVP

1. ✅ **Usuario puede registrarse** como paciente o nutricionista
2. ✅ **Nutricionista puede generar claves** para nuevos pacientes
3. ✅ **Paciente puede registrarse con clave** y quedar conectado
4. 🚧 **Chat de IA funciona** para ambos tipos de usuario
5. 🚧 **Respuestas del chat son personalizadas** según el nutricionista
6. ⏳ **Aplicación desplegada** y funcionando en producción

---

## 📚 DOCUMENTACIÓN PENDIENTE

- [ ] README actualizado con instrucciones de setup
- [ ] Guía de uso para nutricionistas
- [ ] Guía de uso para pacientes
- [ ] Documentación de API endpoints
- [ ] Troubleshooting guide

---

## 🐛 BUGS CONOCIDOS

- [ ] Revisar si las reglas de IA se crean correctamente en el registro
- [ ] Verificar que el sistema de claves maneja casos edge (clave ya usada, etc.)
- [ ] Probar navegación entre páginas comentadas

---

**Próximos pasos inmediatos:**
1. Configurar OPENAI_API_KEY en el entorno
2. Probar el flujo completo de registro
3. Verificar que el chat funciona end-to-end
4. Deploy MVP funcional 