# 🔗 Integración Login + Registro - Guía Completa

## 📑 Sistema de Autenticación Completo

Tu aplicación ahora tiene un **sistema de autenticación profesional** con dos flujos:

### 1️⃣ **LOGIN** → `login.html`
- Email + Contraseña
- Genera: `token`, `refreshToken`, `tokenDispositivo`
- Redirige a: `admin.html` (panel interno)

### 2️⃣ **REGISTRO** → `reg.html`
- Step 1: Email + Código de verificación
- Step 2: Datos personales + Contraseña
- Redirige a: `login.html` (para ingreso)

---

## 🔐 Flujo Completo de Usuario

```
┌─────────────────────┐
│   Usuario Nuevo     │
└────────────┬────────┘
             │
    ┌────────▼─────────┐
    │ ¿Tienes cuenta?  │
    └────┬──────────┬──┘
        NO          SÍ
         │           │
    ┌────▼────┐  ┌──▼──────┐
    │ reg.html│  │login.html│
    └─────────┘  └──────────┘
         │
    ┌────▼──────────────────┐
    │ Registrarse con API:  │
    │ 1. Solicitar código   │
    │ 2. Ingresar datos     │
    │ 3. Registrarse        │
    └────┬──────────────────┘
         │
    ┌────▼──────────┐
    │ Redirige a    │
    │ login.html    │
    └────┬──────────┘
         │
    ┌────▼──────────────────┐
    │ Login con API:        │
    │ Email + Contraseña    │
    │ Recibe tokens         │
    └────┬──────────────────┘
         │
    ┌────▼──────────┐
    │ Redirige a    │
    │ admin.html    │
    │ (Panel Interno)       │
    └───────────────┘
```

---

## 📁 Archivos del Sistema

### HTML (3 archivos)
```
frontend/html/
├── login.html        ← Login (Email + Contraseña)
├── reg.html          ← Registro (2 pasos)
└── admin.html        ← Panel interno (protegido)
```

### JavaScript (4 archivos)
```
frontend/js/
├── login.js          ← Lógica de login con API
├── register.js       ← Lógica de registro con API
├── api-config.js     ← Configuración centralizada
└── api-integration-examples.js ← Ejemplos de uso
```

### CSS (Compartidos)
```
frontend/css/
└── login.css         ← Estilos para login + registro
```

### Documentación
```
frontend/docs/
├── LOGIN_API_INTEGRATION.md
├── REGISTER_SYSTEM.md
└── README.md
```

---

## 🌐 Endpoints API Usados

### Authentication
```
POST /auth/request-email-code    ← Solicitar código (registro)
POST /auth/register              ← Registrarse
POST /auth/login                 ← Iniciar sesión
POST /auth/refresh-token         ← Renovar token
POST /auth/logout                ← Cerrar sesión
GET  /health                     ← Verificar API
```

---

## 🧪 Testing Completo

### 1. Test Registro
```
1. Abre: http://localhost:5500/frontend/html/reg.html
2. Email: nuevo@email.com
3. Solicita código → Revisa correo
4. Ingresa código
5. Completa datos
6. Registrarse
   ✅ Debe redirigir a login.html
```

### 2. Test Login
```
1. En login.html
2. Email: nuevo@email.com
3. Pass: Tu contraseña
4. Inicia sesión
   ✅ Debe redirigir a admin.html
   ✅ localStorage debe tener tokens
```

### 3. Test Sesión Activa
```
1. Siendo logueado, abre login.html
   ✅ Debe redirigir directamente a admin.html
```

---

## 💾 Datos Guardados en localStorage

### Después del Registro (reg.html)
```javascript
// NO se guarda nada en localStorage
// Solo se crea la cuenta en la BD
// Usuario es redirigido a login.html para ingresar
```

### Después del Login (login.html)
```javascript
localStorage.getItem('sc_token')            // Access Token (15 min)
localStorage.getItem('sc_refresh_token')    // Refresh Token (7 días)
localStorage.getItem('sc_device_token')     // Device ID
localStorage.getItem('sc_session')          // Datos usuario + metadata
```

### Estructura de sc_session
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenDispositivo": "a1b2c3d4e5f6...",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "rolId": 2
  },
  "expiresInMs": 900000,
  "timestamp": 1708116000000
}
```

---

## ✨ Features

### Login
- ✅ Email + Contraseña
- ✅ Validación en tiempo real
- ✅ Manejo de errores (400, 401, 404, 500)
- ✅ Sesión automática con tokens
- ✅ Auto-redireccionamiento si hay sesión activa
- ✅ Cuentas de prueba (opcional)

### Registro
- ✅ Verificación por email (código 6 dígitos)
- ✅ Dos pasos (email → datos)
- ✅ Temporizador de código (10 minutos)
- ✅ Indicador de fortaleza de contraseña
- ✅ Validación de coincidencia de contraseñas
- ✅ Barra de progreso visual
- ✅ Reenvío de código

---

## 🔑 Configuración

### URL de API
**En `login.js` (línea 11):**
```javascript
const API_BASE_URL = 'http://192.168.1.37:3000/api';
```

**En `register.js` (línea 5):**
```javascript
const API_BASE_URL = 'http://192.168.1.37:3000/api';
```

**En `api-config.js` (línea 10):**
```javascript
const API_BASE_URL = 'http://192.168.1.37:3000/api';
```

Cambiar si tu servidor está en diferente IP/puerto.

---

## 🚀 Flujo de Tokens

### 1. Registro → Login
```
[reg.html] → POST /auth/register
              ↓
         Cuenta creada en BD
              ↓
           [login.html]
```

### 2. Login → admin.html
```
[login.html] → POST /auth/login
                ↓
           Recibe tokens
                ↓
         Guarda en localStorage
                ↓
           [admin.html]
```

### 3. Requests Autenticados
```
[admin.html] → GET /clientes/me
               Header: Authorization: Bearer <token>
                ↓
            Respuesta con datos
```

### 4. Token Expirado
```
Token expira (15 min)
       ↓
POST /auth/refresh-token
       ↓
Nuevos tokens en localStorage
       ↓
Reintentar request anterior
```

### 5. Logout
```
[admin.html] → POST /auth/logout
                ↓
         Invalidar sesión
                ↓
    localStorage.clear()
                ↓
           [login.html]
```

---

## 📲 Links de Navegación

### Desde index.html
```html
<!-- Para clientes nuevos -->
<a href="frontend/html/reg.html">Crear Cuenta</a>

<!-- Para clientes existentes -->
<a href="frontend/html/login.html">Iniciar Sesión</a>
```

### Desde login.html → Registro
```html
<p>¿No tienes cuenta? <a href="reg.html">Crea una aquí</a></p>
```

### Desde reg.html → Login
```html
<p>¿Ya tienes cuenta? <a href="login.html">Inicia sesión</a></p>
```

### Desde admin.html → Logout
```html
<button onclick="cerrarSesion()">Logout</button>
```

Ver `api-integration-examples.js` para la función `cerrarSesion()`.

---

## 🎯 Checklist para Finalización

### Backend (Tu API)
- [ ] Validar email único
- [ ] Validar DNI único (o requerido)
- [ ] Generar y enviar código por email ✉️
- [ ] Validar código antes de registrar
- [ ] Hash de contraseña (bcrypt, argon2, etc)
- [ ] JWT con expiración
- [ ] Refresh token en BD
- [ ] Rate limiting en endpoints
- [ ] CORS configurado correctamente

### Frontend (Ya implementado ✅)
- [x] HTML registro (2 pasos)
- [x] HTML login (email + pass)
- [x] API integration
- [x] Validación cliente
- [x] Manejo de errores
- [x] UI responsiva
- [x] Tokens en localStorage
- [x] Auto-redirect

### Deployment
- [ ] HTTPS en producción
- [ ] Backend en servidor
- [ ] Frontend en servidor
- [ ] CORS habilitado
- [ ] Variables de entorno
- [ ] Email service configurado
- [ ] Backups de BD

---

## 🐛 Debugging

### Error: "No se pudo conectar al servidor"
```
❌ Backend no está corriendo
✅ Inicia backend: npm start
✅ Verifica puerto: 3000
```

### Error: "El código es inválido"
```
❌ Código expirado (> 10 minutos)
❌ Código erróneo
✅ Solicita código nuevo
✅ Copia exactamente del email
```

### El token no se guarda
```
❌ localStorage deshabilitado
✅ Verifica en DevTools → Application
✅ Revisa permisos del navegador
```

### No se redirige a admin.html
```
❌ admin.html no existe
❌ Hay error en consola
✅ Abre F12 → Console
✅ Busca mensajes de error
✅ Verifica archivo exista
```

---

## 📞 Soporte

### DevTools (F12)
```javascript
// Ver sesión
JSON.parse(localStorage.getItem('sc_session'))

// Ver token
localStorage.getItem('sc_token')

// Ver request (Network tab)
// POST /auth/register

// Ver respuesta
// Console mostrará la respuesta
```

### Logs
```javascript
// Agregar en register.js o login.js
console.log('Email:', email);
console.log('Response:', respuesta);
console.log('Error:', error);
```

---

## 📚 Referencias

- **Documentación API:** Ver `/API_DOCUMENTATION.md`
- **Login Integration:** Ver `/docs/LOGIN_API_INTEGRATION.md`
- **Register System:** Ver `/docs/REGISTER_SYSTEM.md`
- **API Examples:** Ver `/js/api-integration-examples.js`

---

**¡Tu sistema de autenticación está listo! 🎉**
