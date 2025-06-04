# 📦 Configuración de Productos en Stripe

## 1. Crear Productos en Stripe Dashboard

### Para Pacientes:
1. **Producto: "NutriGuide Patient Plan"**
   - Precio: $12.99 USD/mes
   - Trial: 15 días
   - Descripción: "Acceso completo + Chat IA personalizado"

### Para Nutricionistas:
1. **Producto: "NutriGuide Professional"**
   - Precio: $29.99 USD/mes
   - Descripción: "Pacientes ilimitados + IA avanzada"

2. **Producto: "NutriGuide Clinic"**
   - Precio: $99.99 USD/mes  
   - Descripción: "Múltiples nutricionistas + Dashboard"

## 2. Pasos en Stripe Dashboard:
1. Ve a **Products** > **Create Product**
2. Nombre del producto y descripción
3. **Pricing Model**: Recurring
4. **Price**: Agregar precio mensual
5. **Free Trial**: 15 días (solo para pacientes)
6. **Save Product**

## 3. Copiar Price IDs:
Después de crear cada producto, copia el `price_id` (empieza con `price_`).
Estos IDs se usarán en la base de datos.

## 4. Insertar en Supabase:
```sql
-- Precio para pacientes
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, trial_period_days, metadata) VALUES
('price_patient_monthly', 'prod_patient', 'patient', true, 'usd', 1299, 'month', 15, '{"name": "Plan Mensual", "description": "Acceso completo + Chat IA personalizado", "popular": true}');

-- Precio para nutricionistas profesional
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, metadata) VALUES
('price_nutritionist_pro', 'prod_nutritionist_pro', 'nutritionist', true, 'usd', 2999, 'month', '{"name": "Plan Profesional", "description": "Pacientes ilimitados + IA avanzada", "popular": true}');

-- Precio para nutricionistas clínica
INSERT INTO prices (id, product_id, user_type, active, currency, unit_amount, interval, metadata) VALUES
('price_nutritionist_clinic', 'prod_nutritionist_clinic', 'nutritionist', true, 'usd', 9999, 'month', '{"name": "Plan Clínica", "description": "Múltiples nutricionistas + Dashboard"}');
``` 