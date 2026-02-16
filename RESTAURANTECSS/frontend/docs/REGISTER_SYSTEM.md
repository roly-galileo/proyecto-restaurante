# 📝 Sistema de Registro - Documentación

## ✅ Componentes Creados

### 1. **HTML** ([reg.html](frontend/html/reg.html))
Sistema de registro en **2 pasos** con interfaz intuitiva:

```
PASO 1: Solicitar Email
├── Ingresar email
├── Solicitar código (POST /auth/request-email-code)
├── Temporizador de código (10 min)
└── Opción de reenviar código

PASO 2: Completar Registro
├── Nombre y Apellido
├── DNI (8 dígitos)
├── Teléfono
├── Contraseña (con indicador de fortaleza)
├── Confirmar contraseña
└── Registrarse (POST /auth/register)
```

### 2. **JavaScript** ([register.js](frontend/js/register.js))
Lógica completa de registro:
- ✅ Solicitud de código con temporizador
- ✅ Validación en tiempo real
- ✅ Indicador de fortaleza de contraseña
- ✅ Verificación de contraseñas coincidentes
- ✅ Manejo de errores de API
- ✅ Transición fluida entre pasos

## 🔄 Flujo de Registro

```
┌─────────────────────────────────┐
│ Usuario abre reg.html           │
│ Ingresa email                   │
│ Click "Solicitar código"        │
└──────────────┬──────────────────┘
               │
               ▼ (POST /auth/request-email-code)
        ┌──────────────────────┐
        │ Servidor envía       │
        │ código por email     │
        └──────────┬───────────┘
                   │
               200 OK
                   │
        ┌──────────▼───────────┐
        │ Mostrar campo código │
        │ Iniciar timer (10m)  │
        │ Mostrar "Reenviar"   │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Usuario ingresa:     │
        │ - Código (6 dígitos) │
        │ Click "Continuar"    │
        └──────────┬───────────┘
                   │
               Validación OK
                   │
        ┌──────────▼───────────┐
        │ PASO 2 ACTIVADO      │
        │ Mostrar formulario   │
        │ de datos personales  │
        └──────────┬───────────┘
                   │
        ┌──────────▼────────────────────┐
        │ Usuario completa:             │
        │ - Nombre, Apellido            │
        │ - DNI, Teléfono               │
        │ - Contraseña (con validación) │
        │ Click "Registrarse"           │
        └──────────┬────────────────────┘
                   │
      ┌────────────▼─────────────────┐
      │ Validación de todos los datos│
      │ Contraseñas coinciden? ✅    │
      │ Código todavía válido? ✅    │
      └────────────┬────────────────┘
                   │
    ┌──────────────▼──────────────────┐
    │ POST /auth/register              │
    │ Enviar: email, password, nombre, │
    │         apellido, dni, teléfono, │
    │         codigo                   │
    │ API ↔                            │
    └────────┬─────────────────────────┘
             │
         201 Created
             │
    ┌────────▼─────────────────────┐
    │ Mostrar "¡Éxito!"            │
    │ Redirigir a login.html       │
    │ en 1.5 segundos              │
    └──────────────────────────────┘
```

## 📊 Endpoints Utilizados

### 1. Solicitar Código
```
POST /auth/request-email-code
Body: {
  "email": "usuario@ejemplo.com"
}

Response 200:
{
  "message": "Código enviado exitosamente"
}

Errores:
- 400: Email requerido
- 409: El email ya está registrado
```

### 2. Registrarse
```
POST /auth/register
Body: {
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+51999999999",
  "dni": "12345678",
  "codigo": "123456"
}

Response 201:
{
  "id": 1,
  "usuario_id": 1,
  "email": "usuario@ejemplo.com",
  "nombre": "Juan"
}

Errores:
- 400: Datos incompletos/código inválido
- 409: Email ya registrado
```

## 🎯 Características

### ✨ Paso 1: Email y Código
- 📧 Campo de email con validación
- 🔐 Botón "Solicitar código" que:
  - Valida email
  - Llama a `/auth/request-email-code`
  - Muestra campo de código
  - Inicia temporizador de 10 minutos
- ⏱️ Temporizador visible con:
  - Cuenta regresiva MM:SS
  - Cambio a naranja cuando faltan < 2 minutos
  - Auto-oculta cuando expira
- 🔄 Botón "Reenviar código" (solo cuando expira)

### ✨ Paso 2: Datos Personales
- 👤 Campos de nombre y apellido
- 🪪 Campo DNI (solo números, máx 8)
- 📞 Campo teléfono
- 🔒 Contraseña con indicador de fortaleza:
  - Roja: Débil (< 8 caracteres)
  - Naranja: Media (8-12 caracteres)
  - Verde: Fuerte (12+ caracteres con variedad)
- ✅ Campo de confirmación de contraseña:
  - ❌ Rojo si no coinciden
  - ✅ Verde si coinciden
  - ⚠️ Amarillo si aún no alcanza 8 caracteres

### 🛡️ Validaciones
- Email válido (debe incluir @)
- Código 6 dígitos exactos
- Nombre y apellido no vacíos
- DNI 8 dígitos exactos
- Teléfono no vacío
- Contraseña mínimo 8 caracteres
- Contraseñas coincidentes
- Código no expirado

### 🎨 UI/UX
- Barra de progreso que muestra:
  - Paso actual (número + texto)
  - Pasos completados (con checkmark)
- Animaciones suaves en transiciones
- Alertas claras de error y éxito
- Botones contextuales (Cancelar, Atrás, Continuar, Registrarse)
- Indicadores visuales de validación

## 🔧 Configuración

URL de API (en `register.js`):
```javascript
const API_BASE_URL = 'http://192.168.1.37:3000/api';
```

Cambiar si es necesario.

## 📱 Responsivo
- ✅ Desktop (2 columnas)
- ✅ Tablet
- ✅ Mobile (1 columna)

Se adapta automáticamente con media queries.

## 🧪 Testing

### Caso de Éxito
1. Abre `reg.html`
2. Ingresa: `test@ejemplo.com`
3. Click "Solicitar código"
4. Revisa email por el código
5. Ingresa el código de 6 dígitos
6. Click "Continuar"
7. Completa los datos:
   - Nombre: Juan
   - Apellido: Pérez
   - DNI: 12345678
   - Teléfono: +51999999999
   - Password: Password123!
   - Confirmar: Password123!
8. Click "Registrarse"
9. Debe redirigir a login.html

### Casos de Error
- Email sin @: Muestra error
- Email ya registrado: Error 409
- Código inválido: Error 400
- Código expirado: Botón reenviar
- Contraseña débil: Indicador rojo
- Contraseñas no coinciden: Icono ❌

## 📝 Integración en index.html

En tu página principal, agrega un enlace al registro:

```html
<a href="frontend/html/reg.html" class="btn-register">
    Crear Cuenta
</a>
```

O para móviles:
```html
<a href="reg.html">Registro</a> | <a href="login.html">Login</a>
```

## 🔐 Seguridad

### En el Frontend (ya implementado):
- ✅ Validación antes de enviar
- ✅ Indicador de fortaleza de contraseña
- ✅ Masking de contraseña
- ✅ Toggle para ver/ocultar contraseña
- ✅ Verificación de coincidencia

### En el Backend (a verificar):
- 🔐 HTTPS en producción
- 🔐 Validación server-side (muy importante!)
- 🔐 Rate limiting en solicitud de códigos
- 🔐 Expiración de códigos (10 minutos)
- 🔐 Hashing de contraseña (bcrypt, scrypt, etc)
- 🔐 Prevención de ataques (SQL injection, etc)

## 📚 Archivos del Sistema

```
frontend/
├── html/
│   ├── login.html      ← Login existente
│   ├── reg.html        ← NEW: Registro
│   └── index.html
├── js/
│   ├── login.js        ← Login API
│   ├── register.js     ← NEW: Registro API
│   ├── api-config.js   ← Config compartida
│   └── ...
└── css/
    ├── login.css       ← Estilos compartidos
    └── ...
```

## 🚀 Próximos Pasos

1. **Email real:** Configura tu servicio de email (SendGrid, Mailgun, AWS SES)
2. **Validación backend:** Asegúrate que el servidor valide:
   - Email único
   - DNI único o válido
   - Código correcto y no expirado
3. **2FA opcional:** Agregar autenticación de dos factores
4. **Social login:** Integrar Google, Facebook (opcional)
5. **Verificación email:** Doble verificación después de registrarse
6. **CAPTCHA:** Proteger contra bots (reCAPTCHA)

## 💡 Tips

- El código expira en **10 minutos** (configurable en register.js)
- Los timers se actualizan cada segundo
- Las validaciones ocurren en tiempo real
- Toda la lógica es reutilizable (similar a login.js)
- Compatible con Bootstrap, Tailwind, CMS, etc.

---

**¡Listo!** Tu sistema de registro está integrado y listo para usar. 🎉
