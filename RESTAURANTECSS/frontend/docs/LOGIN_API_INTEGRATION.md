# Login API Integration - Documentación

## Cambios Realizados

El login ha sido actualizado para ser **100% compatible con la API REST** documentada.

### 1. **Cambio de Autenticación**
- **Antes:** DNI + Contraseña (validación local con array hardcodeado)
- **Ahora:** Email + Contraseña (llamada directa a `POST /auth/login`)

### 2. **Tokens y Sesiones**
El sistema ahora almacena en `localStorage`:
- `sc_token` - Access Token (válido por 15 minutos)
- `sc_refresh_token` - Refresh Token (válido por 7 días)
- `sc_device_token` - Device Token para identificar el dispositivo
- `sc_session` - Datos completos de sesión con metadatos

### 3. **Ciclo de Vida del Token**

```
1. Usuario ingresa email + contraseña
   ↓
2. POST /auth/login → Respuesta con tokens
   ↓
3. Tokens se guardan en localStorage
   ↓
4. Usuario hace requests autenticadas con Authorization: Bearer <token>
   ↓
5. Si token expira (15 min), se usa refreshToken
   ↓
6. POST /auth/refresh-token → Nuevos tokens
   ↓
7. Al logout: POST /auth/logout
```

## Endpoints Utilizados

### Login
```
POST /auth/login
Body: {
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
Response: {
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenDispositivo": "a1b2...",
  "expiresIn": "15m",
  "expiresInMs": 900000,
  "usuario": { "id": 1, "nombre": "Juan", "rolId": 2 }
}
```

### Errores Manejados
- `400` - Credenciales incompletas
- `401` - Credenciales inválidas / Usuario inactivo
- `404` - Usuario no encontrado
- Se valida también si no hay conexión al servidor

## Configuración de API

### URL Base
Por defecto se conecta a:
- **Desarrollo local:** `http://localhost:3000/api`
- **Producción:** `{origin}/api`

Se puede modificar en `js/login.js`:
```javascript
const API_BASE_URL = 'http://tu-servidor:3000/api';
```

## Archivos Modificados

### `/frontend/html/login.html`
- ✅ Campo `inputDNI` → `inputEmail` (type="email")
- ✅ Icono cambiado de 🪪 a 📧
- ✅ Remover modal de aprobación de admin
- ✅ Actualizar cuentas de prueba (ahora con emails)

### `/frontend/js/login.js`
- ✅ Remover array `USUARIOS` local
- ✅ Función `procesarLogin()` → Llamada a API
- ✅ Manejo de tokens en localStorage
- ✅ Validación de email en lugar de DNI
- ✅ Manejo de errores de API
- ✅ En lugar de guardar 'panel', se guarda 'rolId' del usuario

### Nuevo: `/frontend/js/api-config.js`
- 📄 Archivo de configuración centralizada
- 📄 Funciones reutilizables para llamadas a API
- 📄 Manejo de refresh token automático
- 📄 Logout con opción de todos los dispositivos

## Cuentas de Prueba

```
🏢 Admin
Email: admin@saborasero.com
Pass: admin123

👨‍🍳 Cocinero
Email: cocinero@saborasero.com
Pass: cocina123

🤵 Mozo
Email: mozo@saborasero.com
Pass: mozo123
```

> **Nota:** Estas son solo referencias. Debes crear estos usuarios en tu base de datos.

## Próximas Integraciones

Para completar la integración con la API, también necesitarás:

### 1. En `admin.js`:
```javascript
// Leer token del login
const token = localStorage.getItem('sc_token');

// Usar en headers de requests protegidas
headers: {
    'Authorization': `Bearer ${token}`
}

// Si la API retorna 401, renovar token
```

### 2. Implementar logout:
```javascript
async function logout() {
    const refreshToken = localStorage.getItem('sc_refresh_token');
    await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });
    localStorage.clear();
    window.location.href = 'login.html';
}
```

### 3. Auto-refresh de token:
Implementar interceptor global que renueve el token cuando esté próximo a expirar:
```javascript
const session = JSON.parse(localStorage.getItem('sc_session'));
const ahora = Date.now();
const tiempoCritico = 5 * 60 * 1000; // 5 minutos

if (ahora - session.timestamp > (session.expiresInMs - tiempoCritico)) {
    // Renovar token
}
```

## Validaciones Implementadas

### En Cliente (Frontend)
- ✅ Email requerido y válido
- ✅ Contraseña requerida (no vacía)
- ✅ Mensajes de error específicos
- ✅ Loading state durante request
- ✅ Animación de error (shake)
- ✅ Auto-redireccionamiento si hay sesión activa

### En Servidor (API)
- ✅ Validación de formato email
- ✅ Validación de contraseña
- ✅ Verificación de usuario activo
- ✅ Generación de tokens seguros
- ✅ Expiración de tokens

## Flujo de Seguridad

```
1. Frontend envía email + password por HTTPS (POST /auth/login)
2. Backend valida credenciales contra BD
3. Backend genera JWT (token) con expiración
4. Backend genera refresh token con expiración larga
5. Frontend almacena tokens en localStorage (considerar sessionStorage para production)
6. Frontend incluye token en header Authorization para requests protegidas
7. Backend valida token en cada request
8. Si token expira, frontend usa refresh token para renovar
9. Al logout, backend invalida refresh token en BD
```

## Consideraciones de Seguridad

> ⚠️ **localStorage vs sessionStorage:**
> - **localStorage:** Persiste entre tabs/recargas, pero vulnerable a XSS
> - **sessionStorage:** Solo activo en la pestaña actual
> 
> Para **producción**, considera:
> - Guardar tokens en sessionStorage
> - Usar cookies HttpOnly para refresh token (si es posible)
> - Implementar rate limiting en login
> - CORS configurado correctamente en backend

## Soporte Multi-dispositivo

El `tokenDispositivo` permite:
- Identificar sesiones por dispositivo
- Logout selectivo de dispositivos específicos
- Historial de dispositivos conectados

Ejemplo: Admin cierra sesión de todos los móviles pero mantiene la sesión en desktop:
```javascript
// Cerrar solo dispositivo actual
await logout({ refreshToken: token });

// Cerrar todos los dispositivos
await logout({ allDevices: true });
```

## Testing

### Test Local
1. Asegúrate que el backend esté corriendo en `http://localhost:3000`
2. Abre `frontend/html/login.html` en el navegador
3. Usa las cuentas de prueba
4. Verifica en DevTools → Network que se envíe la petición POST

### Errores Comunes
- "No se pudo conectar al servidor" → Backend no está corriendo
- "Email o contraseña incorrectos" → Usuarios no existen en BD
- "Usuario inactivo" → Usuario tiene `active: false` en BD

## Referencias

- Documentación API: Ver archivo `/API_DOCUMENTATION.md`
- Especificación JWT: https://jwt.io/
- Endpoints MÁS detalles: Consultar documentación proporcionada
