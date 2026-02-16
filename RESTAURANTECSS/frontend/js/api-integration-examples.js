/* ============================================
   EJEMPLO DE INTEGRACIÓN CON API
   Muestra cómo usar tokens en otros archivos
   ============================================ */

// =====================================
// 1. OBTENER TOKEN DE LA SESIÓN
// =====================================
function obtenerTokenDelStorage() {
    const token = localStorage.getItem('sc_token');
    const refreshToken = localStorage.getItem('sc_refresh_token');
    const session = JSON.parse(localStorage.getItem('sc_session') || '{}');
    
    return {
        token,
        refreshToken,
        usuario: session.usuario,
        expiresInMs: session.expiresInMs
    };
}

// =====================================
// 2. HACER REQUESTS CON TOKEN
// =====================================
async function hacerRequestConToken(endpoint, opciones = {}) {
    const { token, refreshToken } = obtenerTokenDelStorage();
    
    if (!token) {
        console.error('No hay token. Redirigiendo al login...');
        window.location.href = 'login.html';
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/api${endpoint}`, {
            method: opciones.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...opciones.headers
            },
            body: opciones.body ? JSON.stringify(opciones.body) : undefined
        });

        // Si token expiró
        if (respuesta.status === 401) {
            console.log('Token expirado, renovando...');
            
            // Intentar renovar el token
            const renovada = await renovarToken(refreshToken);
            
            if (renovada) {
                // Reintentar la solicitud con el nuevo token
                const nuevoToken = localStorage.getItem('sc_token');
                return fetch(`http://localhost:3000/api${endpoint}`, {
                    method: opciones.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nuevoToken}`,
                        ...opciones.headers
                    },
                    body: opciones.body ? JSON.stringify(opciones.body) : undefined
                });
            } else {
                // No se pudo renovar, ir al login
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
        }

        if (!respuesta.ok) {
            const error = await respuesta.json();
            throw error;
        }

        return await respuesta.json();

    } catch (error) {
        console.error('Error en request:', error);
        throw error;
    }
}

// =====================================
// 3. RENOVAR TOKEN
// =====================================
async function renovarToken(refreshToken) {
    try {
        const respuesta = await fetch('http://localhost:3000/api/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (!respuesta.ok) {
            return false;
        }

        const datos = await respuesta.json();
        
        // Actualizar tokens
        localStorage.setItem('sc_token', datos.token);
        localStorage.setItem('sc_refresh_token', datos.refreshToken);
        
        // Actualizar sesión
        const session = JSON.parse(localStorage.getItem('sc_session') || '{}');
        session.token = datos.token;
        session.refreshToken = datos.refreshToken;
        session.timestamp = Date.now();
        localStorage.setItem('sc_session', JSON.stringify(session));
        
        return true;

    } catch (error) {
        console.error('Error renovando token:', error);
        return false;
    }
}

// =====================================
// 4. EJEMPLOS DE USO EN ADMIN.JS
// =====================================

// Obtener perfil del cliente
async function obtenerPerfilCliente() {
    try {
        const perfil = await hacerRequestConToken('/clientes/me', {
            method: 'GET'
        });
        console.log('Perfil:', perfil);
        return perfil;
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
    }
}

// Actualizar perfil
async function actualizarPerfilCliente(datos) {
    try {
        const respuesta = await hacerRequestConToken('/clientes/me', {
            method: 'PUT',
            body: {
                fecha_nacimiento: datos.fecha_nacimiento,
                preferencias_alergicas: datos.preferencias_alergicas,
                canal_preferido: datos.canal_preferido
            }
        });
        console.log('Perfil actualizado:', respuesta);
        return respuesta;
    } catch (error) {
        console.error('Error actualizando perfil:', error);
    }
}

// Obtener direcciones del cliente
async function obtenerDirecciones() {
    try {
        const direcciones = await hacerRequestConToken('/clientes/direcciones', {
            method: 'GET'
        });
        console.log('Direcciones:', direcciones);
        return direcciones;
    } catch (error) {
        console.error('Error obteniendo direcciones:', error);
    }
}

// Crear nueva dirección
async function crearDireccion(datosDir) {
    try {
        const respuesta = await hacerRequestConToken('/clientes/direcciones', {
            method: 'POST',
            body: {
                etiqueta: datosDir.etiqueta,
                direccion_completa: datosDir.direccion,
                coordenadas_latitud: datosDir.lat,
                coordenadas_longitud: datosDir.lng
            }
        });
        console.log('Dirección creada:', respuesta);
        return respuesta;
    } catch (error) {
        console.error('Error creando dirección:', error);
    }
}

// Obtener puntos de lealtad
async function obtenerPuntos() {
    try {
        const puntos = await hacerRequestConToken('/clientes/puntos', {
            method: 'GET'
        });
        console.log('Puntos:', puntos);
        return puntos;
    } catch (error) {
        console.error('Error obteniendo puntos:', error);
    }
}

// Obtener historial de puntos
async function obtenerHistorialPuntos() {
    try {
        const historial = await hacerRequestConToken('/clientes/puntos/movimientos', {
            method: 'GET'
        });
        console.log('Historial:', historial);
        return historial;
    } catch (error) {
        console.error('Error obteniendo historial:', error);
    }
}

// Obtener tags del cliente
async function obtenerTags() {
    try {
        const tags = await hacerRequestConToken('/clientes/tags', {
            method: 'GET'
        });
        console.log('Tags:', tags);
        return tags;
    } catch (error) {
        console.error('Error obteniendo tags:', error);
    }
}

// Agregar tag
async function agregarTag(nuevoTag) {
    try {
        const respuesta = await hacerRequestConToken('/clientes/tags', {
            method: 'POST',
            body: { tag: nuevoTag }
        });
        console.log('Tag agregado:', respuesta);
        return respuesta;
    } catch (error) {
        console.error('Error agregando tag:', error);
    }
}

// Eliminar tag
async function eliminarTag(tag) {
    try {
        const respuesta = await hacerRequestConToken(`/clientes/tags/${tag}`, {
            method: 'DELETE'
        });
        console.log('Tag eliminado:', respuesta);
        return respuesta;
    } catch (error) {
        console.error('Error eliminando tag:', error);
    }
}

// Logout
async function cerrarSesion() {
    try {
        const refreshToken = localStorage.getItem('sc_refresh_token');
        
        // Informar al servidor
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
    } catch (error) {
        console.error('Error en logout:', error);
    } finally {
        // Limpiar localStorage de todas formas
        localStorage.removeItem('sc_session');
        localStorage.removeItem('sc_token');
        localStorage.removeItem('sc_refresh_token');
        localStorage.removeItem('sc_device_token');
        
        // Ir al login
        window.location.href = 'login.html';
    }
}

// =====================================
// 5. INTEGRACIÓN EN admin.html
// =====================================
/*
En admin.html, agrega este script antes de cerrar body:

<script src="../js/api-integration-examples.js"></script>
<script>
    // Cuando se carga la página
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Obtener datos del usuario
            const perfil = await obtenerPerfilCliente();
            
            // Llenar tabla de direcciones
            const direcciones = await obtenerDirecciones();
            renderizarDirecciones(direcciones);
            
            // Mostrar puntos
            const datos = await obtenerPuntos();
            document.getElementById('puntosDisplay').textContent = datos.puntos_lealtad;
            
        } catch (error) {
            console.error('Error en init:', error);
        }
    });
    
    // Evento para crear dirección
    document.getElementById('btnCrearDir').addEventListener('click', async () => {
        const direccion = {
            etiqueta: document.getElementById('inputEtiqueta').value,
            direccion: document.getElementById('inputDir').value,
            lat: parseFloat(document.getElementById('inputLat').value),
            lng: parseFloat(document.getElementById('inputLng').value)
        };
        await crearDireccion(direccion);
        alert('Dirección creada');
    });
    
    // Evento para logout
    document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
</script>
*/

// =====================================
// 6. USAR api-config.js (ALTERNATIVA recomendada)
// =====================================
/*
Si quieres una solución más limpia, usa el archivo api-config.js:

<script src="../js/api-config.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Usando la función centralizada
            const perfil = await callAPI('/clientes/me', {
                method: 'GET',
                auth: true // Incluye token automáticamente
            });
            console.log('Perfil:', perfil);
        } catch (error) {
            console.error('Error:', error);
        }
    });
</script>
*/
