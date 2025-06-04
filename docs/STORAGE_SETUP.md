# 🖼️ Configuración de Storage para Upload de Avatares

## 📋 Instrucciones de Configuración

Para habilitar el upload de fotos de perfil, necesitas configurar Supabase Storage:

### 1. 🗄️ Ejecutar la Migración

1. Ve a tu **Panel de Supabase** → **SQL Editor**
2. Ejecuta el archivo `supabase/migrations/create_storage_bucket.sql`
3. O copia y pega este código SQL:

```sql
-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Set up RLS policies for the storage bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '-%')
);

CREATE POLICY "Users can view all avatars"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '-%')
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE (auth.uid()::text || '-%')
);
```

### 2. ✅ Verificar Configuración

1. Ve a **Storage** en tu panel de Supabase
2. Deberías ver un bucket llamado `user-uploads`
3. Verifica que esté configurado como **público**

## ⚠️ Si ya ejecutaste la migración con error

Si ya intentaste ejecutar la migración y obtuviste el error de operador, ejecuta esto primero para limpiar:

```sql
-- Limpiar policies con error
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Luego ejecuta el SQL corregido de arriba
```

## 🚀 Funcionalidades Implementadas

### ✨ **Upload de Avatares**
- **Drag & Drop**: Solo haz clic en el botón de cámara o "Subir nueva foto"
- **Validación automática**: Solo acepta JPEG, PNG, WebP
- **Límite de tamaño**: Máximo 5MB por archivo
- **Nombres únicos**: Cada archivo se guarda con ID de usuario + timestamp

### 🔒 **Seguridad**
- **RLS habilitado**: Solo puedes subir/editar/borrar tus propias fotos
- **Validación de tipos**: Solo formatos de imagen permitidos
- **Límites de tamaño**: Protección contra archivos muy grandes

### 🎨 **UX Mejorado**
- **Vista previa instantánea**: La foto se actualiza inmediatamente
- **Estados de carga**: Indicadores visuales durante el upload
- **Mensajes de error/éxito**: Feedback claro para el usuario
- **Fallback elegante**: Iniciales del usuario si no hay foto

## 🔧 Cómo Funciona

1. **Usuario selecciona archivo** → Validación de tipo y tamaño
2. **Upload a Supabase Storage** → Se guarda en `avatars/usuario-id-timestamp.ext`
3. **URL pública generada** → Se obtiene la URL de acceso público
4. **Base de datos actualizada** → Se guarda la URL en el perfil del usuario
5. **UI actualizada** → La nueva foto aparece inmediatamente

## 🐛 Solución de Problemas

### Error: "operator does not exist: text = boolean"
- Este error se debe a una sintaxis incorrecta en las políticas RLS
- Usa la versión corregida del SQL de arriba
- Si ya creaste las políticas con error, elimínalas primero con el comando de limpieza

### Error: "Failed to upload file"
- Verifica que el bucket `user-uploads` existe
- Asegúrate de que las políticas RLS están configuradas correctamente
- Revisa que el archivo no exceda 5MB

### Error: "Invalid file type"
- Solo se permiten: JPEG, PNG, WebP
- Verifica la extensión del archivo

### Error: "Database update failed"
- Verifica que la tabla `users` tiene el campo `image`
- Asegúrate de que el usuario está autenticado

## 📁 Estructura de Archivos

```
user-uploads/
└── avatars/
    ├── user-id-1-1673000000000.jpg
    ├── user-id-2-1673000001000.png
    └── user-id-3-1673000002000.webp
```

¡Listo! Ahora los usuarios pueden subir sus fotos de perfil fácilmente. 🎉 