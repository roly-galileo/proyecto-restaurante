# 🔐 Login Restaurante - Guía de Integración API

## ✅ Estado Actual

Tu login **está completamente integrado con la API**. Ya no usa validación local, sino que hace llamadas directas a `POST /auth/login`.

## 🚀 Pasos para Usar

### 1. **Configurar la URL de la API**

En `frontend/js/login.js`, línea ~22:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
// Cambiar a tu servidor:
// const API_BASE_URL = 'http://tu-servidor.com/api';
```

### 2. **Asegurarse que el Backend está corriendo**

```bash
# En tu servidor backend
npm start
# Debe estar escuchando en http://localhost:3000
```

### 3. **Abre el login**

```
http://localhost:5500/frontend/html/login.html
(o donde tengas tu servidor frontend)
```

### 4. **Prueba con una cuenta existente**

```
Email: admin@saborasero.com
Pass: admin123
```

O usa el botón "📋 Cuentas de prueba" para rellenar automáticamente.

## 📊 Flujo de Login Ahora

```
┌─────────────────────────────────────────────────────┐
│  Usuario ingresa email + password                   │
│  Click en "Ingresar al Panel"                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ Validar formato      │
          │ email + password OK? │
          └────────┬─────────────┘
                   │
              SI   │
                   ▼
    ┌───────────────────────────────┐
    │ POST /auth/login              │
    │ { email, password }           │
    │ → API ←                       │
    └────────────┬──────────────────┘
                 │
            ┌────┴────────────────────────────┐
            │                                 │
        200 OK                            4xx/5xx Error
            │                                 │
            ▼                                 ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │ Guardar tokens      │    │ Mostrar error       │
    │ localStorage        │    │ - Email inválido    │
    │ - token             │    │ - Usuario no existe │
    │ - refreshToken      │    │ - Usuario inactivo  │
    │ - sessionData       │    │ - Error servidor    │
    └────────┬────────────┘    └─────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Redirigir a         │
    │ admin.html          │
    └─────────────────────┘
```

## 📁 Archivos Importantes

### **Modificados:**
- ✅ `frontend/html/login.html` - Campo DNI → Email
- ✅ `frontend/js/login.js` - Lógica de login con API

### **Nuevos:**
- 📄 `frontend/js/api-config.js` - Configuración centralizada (reutilizable)
- 📄 `frontend/js/api-integration-examples.js` - Ejemplos de uso en otras páginas
- 📄 `frontend/docs/LOGIN_API_INTEGRATION.md` - Documentación técnica

## 🔑 Tokens Guardados en localStorage

```javascript
// Estos se guardan automáticamente después del login:

localStorage.getItem('sc_token')           // Access Token (15 min)
localStorage.getItem('sc_refresh_token')   // Refresh Token (7 días)
localStorage.getItem('sc_device_token')    // Device ID
localStorage.getItem('sc_session')         // Datos de usuario + metadata
```

## 📌 Usar Tokens en Otras Páginas

Para que `admin.js`, `cocineros.js`, etc. también usen la API:

### Opción 1: Usar el helper centralizado

```javascript
// En admin.html, agregar:
<script src="../js/api-config.js"></script>

// En admin.js:
async function cargarDatos() {
    try {
        const perfil = await callAPI('/clientes/me', {
            method: 'GET',
            auth: true  // Incluye token automáticamente
        });
        console.log(perfil);
    } catch (error) {
        console.error(error);
    }
}
```

### Opción 2: Manual

```javascript
// En admin.js:
const token = localStorage.getItem('sc_token');

fetch('/api/clientes/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

## ⚠️ Manejo de Errores

El login ahora maneja estos errores:

| Código | Mensaje Mostrado |
|--------|-----------------|
| 400 | Credenciales incompletas |
| 401 | Email o contraseña incorrectos |
| 401 | Usuario inactivo |
| 404 | Usuario no encontrado |
| Network | No se pudo conectar al servidor |

## 🔄 Flujo de Refresh Token

Si el token de acceso expira (15 minutos), el sistema debería:

1. Intentar renovar con `POST /auth/refresh-token`
2. Guardar nuevos tokens
3. Reintentar la operación original

**Esto debe implementarse en cada página que use la API** (ver ejemplos en `api-integration-examples.js`).

## 🧪 Testing

### En Development:
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (VS Code Live Server o similar)
http://localhost:5500/frontend/html/login.html
```

### En DevTools (F12):
```javascript
// Verificar que el login guardó los tokens
console.log(localStorage.getItem('sc_token'))
console.log(localStorage.getItem('sc_session'))

// Verificar estructura
const session = JSON.parse(localStorage.getItem('sc_session'))
console.log(session.usuario) // {id, nombre, rolId}
```

## 🚨 Problemas Comunes

### "No se pudo conectar al servidor"
- ❌ Backend no está corriendo
- ✅ Inicia: `npm start` en la carpeta backend
- ✅ Verifica que esté en `http://localhost:3000`

### "Email o contraseña incorrectos"
- ❌ El usuario no existe en tu BD
- ✅ Crea el usuario en tu base de datos
- ✅ O usa un email que sepas que existe

### El login no va a admin.html
- ❌ Hay error en la consola
- ✅ Abre DevTools (F12) → Console
- ✅ Busca mensajes de error
- ✅ Verifica que `admin.html` exista

## 🔐 Seguridad

> ⚠️ **Importante para Producción:**
> 
> 1. **HTTPS obligatorio** - Nunca uses HTTP en producción
> 2. **CORS correcto** - Backend debe solo permitir tu dominio frontend
> 3. **SameSite Cookies** - Si usas cookies en lugar de localStorage
> 4. **Rate limiting** - Backend debe limitar intentos de login (5-10/minuto)
> 5. **2FA** - Considera agregar autenticación de dos factores
> 6. **OWASP** - Sigue las mejores prácticas de OWASP

## 📚 Siguiente Paso

Una vez que el login funcione:

1. **Integra API en admin.js** - Usa `api-config.js` para hacer requests
2. **Implementa logout** - Botón que call `POST /auth/logout`
3. **Auto-refresh de tokens** - Renueva antes de que expire
4. **Manejo de sesión expirada** - Redirige al login si se necesita

Ver ejemplos en: `frontend/js/api-integration-examples.js`

## 📞 Support

Si algo no funciona:

1. Revisa la consola (F12 → Console)
2. Verifica Network (F12 → Network) - ¿Se envía la petición POST?
3. Verifica que el backend responda correctamente
4. Confirma que localStorage tiene los tokens
5. Mira los archivos de documentación incluidos

---

**Hecho ✅** - Tu login está listo para producción (con los ajustes de seguridad necesarios)
