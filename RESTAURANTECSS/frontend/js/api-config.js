/* ============================================
   API CONFIGURATION
   Configuración centralizada de endpoints y headers
   ============================================ */
'use strict';

// URL base de la API - Configurada para 192.168.1.37:3000
const API_BASE_URL = 'http://192.168.1.37:3000/api';

const API_ENDPOINTS = {
    // Autenticación
    AUTH: {
        REQUEST_EMAIL_CODE: '/auth/request-email-code',
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGOUT: '/auth/logout'
    },
    // Cliente
    CLIENT: {
        GET_PROFILE: '/clientes/me',
        UPDATE_PROFILE: '/clientes/me',
        GET_ADDRESSES: '/clientes/direcciones',
        CREATE_ADDRESS: '/clientes/direcciones',
        SET_MAIN_ADDRESS: '/clientes/direcciones/:id/principal',
        DELETE_ADDRESS: '/clientes/direcciones/:id',
        GET_POINTS: '/clientes/puntos',
        GET_POINTS_HISTORY: '/clientes/puntos/movimientos',
        GET_TAGS: '/clientes/tags',
        ADD_TAG: '/clientes/tags',
        DELETE_TAG: '/clientes/tags/:tag'
    },
    // Health
    HEALTH: '/health'
};

/* ====================================================
   FUNCIONES AUXILIARES DE API
==================================================== */

/**
 * Obtener headers por defecto para las llamadas a la API
 * @param {boolean} includeAuth - Si debe incluir el header de Authorization
 * @returns {Object} Headers configurados
 */
function getAPIHeaders(includeAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = localStorage.getItem('sc_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

/**
 * Hacer una llamada a la API
 * @param {string} endpoint - El endpoint a llamar (ej: '/auth/login')
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} La respuesta JSON
 */
async function callAPI(endpoint, options = {}) {
    const defaults = {
        method: 'GET',
        headers: getAPIHeaders(options.auth || false),
    };

    const config = {
        ...defaults,
        ...options,
        headers: {
            ...defaults.headers,
            ...(options.headers || {})
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: response.statusText };
            }
            
            const error = new Error(errorData.message || 'Error en la API');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Renovar el token de acceso usando el refresh token
 * @returns {Promise} La respuesta con el nuevo token
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('sc_refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await callAPI(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });

        // Actualizar los tokens en localStorage
        localStorage.setItem('sc_token', response.token);
        localStorage.setItem('sc_refresh_token', response.refreshToken);

        // Actualizar la sesión
        const session = JSON.parse(localStorage.getItem('sc_session') || '{}');
        session.token = response.token;
        session.refreshToken = response.refreshToken;
        localStorage.setItem('sc_session', JSON.stringify(session));

        return response;
    } catch (error) {
        // Si el refresh token es inválido, limpiar sesión
        if (error.status === 401) {
            localStorage.removeItem('sc_session');
            localStorage.removeItem('sc_token');
            localStorage.removeItem('sc_refresh_token');
            window.location.href = 'login.html';
        }
        throw error;
    }
}

/**
 * Cerrar sesión
 * @param {Object} options - { allDevices: boolean }
 * @returns {Promise} La respuesta del server
 */
async function logout(options = {}) {
    try {
        const refreshToken = localStorage.getItem('sc_refresh_token');
        const body = options.allDevices 
            ? { allDevices: true }
            : { refreshToken };

        await callAPI(API_ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
            headers: getAPIHeaders(true),
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        // Limpiar sesión local de todas formas
        localStorage.removeItem('sc_session');
        localStorage.removeItem('sc_token');
        localStorage.removeItem('sc_refresh_token');
        localStorage.removeItem('sc_device_token');
    }
}

/**
 * Verificar si la API está disponible
 * @returns {Promise<boolean>}
 */
async function checkAPIHealth() {
    try {
        const response = await callAPI(API_ENDPOINTS.HEALTH, { method: 'GET' });
        return response && response.ok === true;
    } catch (error) {
        console.error('API Health Check failed:', error);
        return false;
    }
}
