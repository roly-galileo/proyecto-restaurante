/* ============================================
   SABOR CASERO – LOGIN.JS
   Sistema de autenticación por API
   ============================================ */
'use strict';

/* ====================================================
   CONFIGURACIÓN DE API
==================================================== */
const API_BASE_URL = 'http://192.168.1.37:3000/api';
const ENDPOINTS = {
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout'
};

/* ====================================================
   CLAVES DE SESIÓN EN localStorage
   Se guarda: { token, refreshToken, tokenDispositivo, usuario: { id, nombre, rolId }, fecha }
==================================================== */
const SESSION_KEY = 'sc_session';
const TOKEN_KEY = 'sc_token';
const REFRESH_TOKEN_KEY = 'sc_refresh_token';
const DEVICE_TOKEN_KEY = 'sc_device_token';

/* ====================================================
   PARTÍCULAS DE FONDO
==================================================== */
function crearParticulas() {
    const cont = document.getElementById('bgParticles');
    const N = 18;
    for (let i = 0; i < N; i++) {
        const p  = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random() * 100}%;
            bottom:${Math.random() * -20}%;
            animation-duration:${8 + Math.random() * 14}s;
            animation-delay:${Math.random() * 10}s;
        `;
        cont.appendChild(p);
    }
}

/* ====================================================
   UI HELPERS
==================================================== */
function showAlert(tipo, msg) {
    // Ocultar todas
    ['alertError','alertSuccess'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'none';
    });
    if (tipo === 'error') {
        const alertError = document.getElementById('alertError');
        if (alertError) {
            document.getElementById('alertErrorMsg').innerHTML = msg;
            alertError.style.display = 'flex';
        }
    } else if (tipo === 'success') {
        const alertSuccess = document.getElementById('alertSuccess');
        if (alertSuccess) {
            document.getElementById('alertSuccessMsg').innerHTML = msg;
            alertSuccess.style.display = 'flex';
        }
    }
}

function hideAlerts() { 
    ['alertError','alertSuccess'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'none';
    });
}

function setLoading(loading) {
    const btn    = document.getElementById('btnLogin');
    const text   = btn.querySelector('.btn-login-text');
    const icon   = btn.querySelector('.btn-login-icon');
    const spinner = document.getElementById('btnSpinner');
    btn.disabled = loading;
    text.style.opacity  = loading ? '.5' : '1';
    icon.style.display  = loading ? 'none' : 'inline';
    spinner.className   = loading ? 'btn-spinner visible' : 'btn-spinner';
}

function sacudirFormulario() {
    const card = document.querySelector('.form-card');
    card.classList.remove('shake');
    void card.offsetWidth; // reflow
    card.classList.add('shake');
}

/* ====================================================
   MOSTRAR/OCULTAR CONTRASEÑA
==================================================== */
document.getElementById('togglePass').addEventListener('click', function () {
    const inp = document.getElementById('inputPass');
    const esPass = inp.type === 'password';
    inp.type = esPass ? 'text' : 'password';
    this.textContent = esPass ? '🙈' : '👁';
});

/* ====================================================
   LLENAR CUENTA DE PRUEBA
==================================================== */
function llenarCuenta(email, pass) {
    document.getElementById('inputEmail').value = email;
    document.getElementById('inputPass').value = pass;
    hideAlerts();
    // Cerrar panel
    const lista = document.getElementById('cuentasLista');
    const arrow = document.getElementById('cuentasArrow');
    if (lista) lista.classList.remove('open');
    if (arrow) arrow.classList.remove('open');
    // Focus en el botón
    document.getElementById('btnLogin').focus();
}

/* ====================================================
   TOGGLE CUENTAS DE PRUEBA
==================================================== */
function toggleCuentas() {
    const lista  = document.getElementById('cuentasLista');
    const arrow  = document.getElementById('cuentasArrow');
    if (lista) lista.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open');
}

/* ====================================================
   LÓGICA DE SESIÓN CON TOKENS
==================================================== */
function guardarSesion(authResponse) {
    const sesion = {
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        tokenDispositivo: authResponse.tokenDispositivo,
        usuario: authResponse.usuario,
        expiresInMs: authResponse.expiresInMs,
        timestamp: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(DEVICE_TOKEN_KEY, authResponse.tokenDispositivo);
    return sesion;
}

function leerSesion() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        
        // Validar si el token aún es válido (no ha pasado su tiempo de expiración)
        const ahora = Date.now();
        const tiempoZonaMuerta = 60000; // 1 minuto de margen
        if (ahora - s.timestamp > (s.expiresInMs - tiempoZonaMuerta)) {
            // Token expirado
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    } catch { 
        return null; 
    }
}

function obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function obtenerRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(DEVICE_TOKEN_KEY);
}

/* ====================================================
   FUNCIONES DE API
==================================================== */
async function llamarAPI(endpoint, metodo = 'POST', body = null, requiereToken = false) {
    try {
        const opciones = {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (requiereToken) {
            const token = obtenerToken();
            if (!token) {
                throw new Error('No hay token disponible');
            }
            opciones.headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            opciones.body = JSON.stringify(body);
        }

        const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, opciones);
        
        if (!respuesta.ok) {
            const data = await respuesta.json();
            throw {
                status: respuesta.status,
                message: data.message || 'Error desconocido',
                data: data
            };
        }

        return await respuesta.json();
    } catch (error) {
        console.error('Error en llamada API:', error);
        throw error;
    }
}

/* ====================================================
   LOGIN CON API
==================================================== */
async function procesarLogin(email, password) {
    hideAlerts();
    setLoading(true);

    try {
        // Simular latencia mínima de UI
        await delay(300);

        // Llamar a la API de login
        const respuesta = await llamarAPI(ENDPOINTS.LOGIN, 'POST', {
            email: email,
            password: password
        });

        // Validar respuesta
        if (!respuesta.token || !respuesta.refreshToken) {
            throw new Error('Respuesta de servidor inválida: tokens no recibidos');
        }

        // Guardar sesión con los tokens
        guardarSesion(respuesta);

        setLoading(false);
        showAlert('success', `✅ Bienvenido, <strong>${respuesta.usuario.nombre}</strong>. Redirigiendo...`);
        await delay(1200);
        redirigirAlPanel(respuesta.usuario);

    } catch (error) {
        setLoading(false);
        sacudirFormulario();

        let mensajeError = 'Error en la autenticación. Intenta nuevamente.';

        if (error.status === 400) {
            mensajeError = '⚠ Credenciales incompletas. Verifica email y contraseña.';
        } else if (error.status === 401) {
            if (error.message.includes('inactivo')) {
                mensajeError = '🚫 El usuario está inactivo. Contacta al administrador.';
            } else {
                mensajeError = '⚠ Email o contraseña incorrectos.';
            }
        } else if (error.status === 404) {
            mensajeError = '⚠ Usuario no encontrado.';
        } else if (error.message && error.message.includes('Failed to fetch')) {
            mensajeError = '❌ No se pudo conectar al servidor. Verifica tu conexión.';
        }

        showAlert('error', mensajeError);
        document.getElementById('inputPass').value = '';
    }
}

function redirigirAlPanel(usuario) {
    // Guardar el rol y ID en sessionStorage
    sessionStorage.setItem('sc_user_role', usuario.rolId);
    sessionStorage.setItem('sc_user_id', usuario.id);
    sessionStorage.setItem('sc_user_name', usuario.nombre);
    
    // Redirigir según el rol
    // rolId 1 = Admin, 2 = Empleados, 3 = Clientes
    switch(usuario.rolId) {
        case 1:
            window.location.href = 'admin.html';
            break;
        case 2:
            window.location.href = 'cocineros.html';
            break;
        case 3:
            window.location.href = 'usuario.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

function delay(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}

/* ====================================================
   SUBMIT DEL FORMULARIO
==================================================== */
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('inputEmail').value.trim();
    const pass  = document.getElementById('inputPass').value;

    // Validaciones básicas
    if (!email) {
        showAlert('error', 'Por favor ingresa tu email.');
        document.getElementById('inputEmail').focus();
        return;
    }
    if (!email.includes('@')) {
        showAlert('error', 'El email no es válido.');
        sacudirFormulario();
        return;
    }
    if (!pass) {
        showAlert('error', 'Por favor ingresa tu contraseña.');
        document.getElementById('inputPass').focus();
        return;
    }

    procesarLogin(email, pass);
});

// Enter en password = submit
document.getElementById('inputPass').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

/* ====================================================
   REDIRIGIR SI YA HAY SESIÓN ACTIVA
==================================================== */
function verificarSesionExistente() {
    const sesion = leerSesion();
    if (sesion && sesion.token) {
        // Ya tiene sesión: ir directo al panel según su rol
        sessionStorage.setItem('sc_user_role', sesion.usuario.rolId);
        sessionStorage.setItem('sc_user_id', sesion.usuario.id);
        sessionStorage.setItem('sc_user_name', sesion.usuario.nombre);
        
        // Redirigir según el rol
        switch(sesion.usuario.rolId) {
            case 1:
                window.location.href = 'admin.html';
                break;
            case 2:
                window.location.href = 'cocineros.html';
                break;
            case 3:
                window.location.href = 'usuario.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }
}

/* ====================================================
   INIT
==================================================== */
document.addEventListener('DOMContentLoaded', () => {
    crearParticulas();
    verificarSesionExistente();
});