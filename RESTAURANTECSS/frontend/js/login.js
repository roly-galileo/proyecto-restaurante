/* ============================================
   SABOR CASERO – LOGIN.JS
   Sistema de autenticación por roles
   ============================================ */
'use strict';

/* ====================================================
   CUENTAS POR DEFECTO (temporal – sin backend)
   Formato: { dni, password, nombre, rol, panel }
   rol: 'admin' | 'cocinero' | 'mozo'
   panel: sección a mostrar en admin.html
   ====================================================
   ⚠ NOTA: Al integrar backend, reemplazar este objeto
   por una llamada a la API de validación.
==================================================== */
const USUARIOS = [
    {
        dni:      '10000001',
        password: 'admin123',
        nombre:   'Administrador General',
        cargo:    'Administrador',
        rol:      'admin',
        panel:    'dashboard'         // ve todo
    },
    {
        dni:      '20000001',
        password: 'cocina123',
        nombre:   'Mario Quispe Huanca',
        cargo:    'Cocinero',
        rol:      'cocinero',
        panel:    'cocineros'         // solo sección cocineros
    },
    {
        dni:      '20000002',
        password: 'cocina456',
        nombre:   'Rosa Mamani Ccori',
        cargo:    'Cocinera',
        rol:      'cocinero',
        panel:    'cocineros'
    },
    {
        dni:      '30000001',
        password: 'mozo123',
        nombre:   'Carlos Soto Puma',
        cargo:    'Mozo',
        rol:      'mozo',
        panel:    'mozos'            // solo sección mozos
    },
    {
        dni:      '30000002',
        password: 'mozo456',
        nombre:   'Ana Lima Ramos',
        cargo:    'Mozza',
        rol:      'mozo',
        panel:    'mozos'
    },
];

/* ====================================================
   CLAVE DE SESIÓN EN localStorage
   Se guarda: { dni, nombre, rol, panel, fecha, aprobado }
   'aprobado' solo importa para admin (único acceso por día)
==================================================== */
const SESSION_KEY = 'sc_session';
const APPROVAL_KEY = 'sc_admin_approved'; // guarda la fecha de aprobación admin

/* ====================================================
   VARIABLES GLOBALES
==================================================== */
let usuarioPendiente = null;   // usuario esperando aprobación admin
let aprobacionResolver = null; // resolve de la promesa de aprobación

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
    ['alertPendiente','alertError','alertSuccess'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    if (tipo === 'error') {
        document.getElementById('alertErrorMsg').innerHTML = msg;
        document.getElementById('alertError').style.display = 'flex';
    } else if (tipo === 'success') {
        document.getElementById('alertSuccessMsg').innerHTML = msg;
        document.getElementById('alertSuccess').style.display = 'flex';
    } else if (tipo === 'pendiente') {
        document.getElementById('alertPendiente').style.display = 'flex';
    } else {
        // ocultar todas (ya hecho arriba)
    }
}

function hideAlerts() { showAlert('none'); }

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
function llenarCuenta(dni, pass) {
    document.getElementById('inputDNI').value  = dni;
    document.getElementById('inputPass').value = pass;
    hideAlerts();
    // Cerrar panel
    document.getElementById('cuentasLista').classList.remove('open');
    document.getElementById('cuentasArrow').classList.remove('open');
    // Focus en el botón
    document.getElementById('btnLogin').focus();
}

/* ====================================================
   TOGGLE CUENTAS DE PRUEBA
==================================================== */
function toggleCuentas() {
    const lista  = document.getElementById('cuentasLista');
    const arrow  = document.getElementById('cuentasArrow');
    lista.classList.toggle('open');
    arrow.classList.toggle('open');
}

/* ====================================================
   LÓGICA DE SESIÓN
==================================================== */
function fechaHoy() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function guardarSesion(usuario, aprobado = true) {
    const sesion = {
        dni:       usuario.dni,
        nombre:    usuario.nombre,
        cargo:     usuario.cargo,
        rol:       usuario.rol,
        panel:     usuario.panel,
        fecha:     fechaHoy(),
        aprobado,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return sesion;
}

function leerSesion() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        // Sesión válida si es del mismo día
        if (s.fecha !== fechaHoy()) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return s;
    } catch { return null; }
}

function cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
}

/* ====================================================
   APROBACIÓN DE ADMIN (modal)
   Simula que el admin ve la solicitud y aprueba/deniega.
   En producción esto sería una llamada WebSocket o polling.
==================================================== */
function mostrarAprobacionAdmin(usuario) {
    return new Promise((resolve) => {
        aprobacionResolver = resolve;
        document.getElementById('approvalUser').textContent = `${usuario.nombre} (DNI: ${usuario.dni})`;
        document.getElementById('approvalInfo').innerHTML = `
            <div>👤 <strong>Nombre:</strong> ${usuario.nombre}</div>
            <div>🪪 <strong>DNI:</strong> ${usuario.dni}</div>
            <div>💼 <strong>Cargo:</strong> ${usuario.cargo}</div>
            <div>📅 <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
            <div>🕒 <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-PE')}</div>
        `;
        document.getElementById('approvalOverlay').classList.add('open');
    });
}

function resolverAprobacion(aprobado) {
    document.getElementById('approvalOverlay').classList.remove('open');
    if (aprobacionResolver) {
        aprobacionResolver(aprobado);
        aprobacionResolver = null;
    }
}

/* ====================================================
   VERIFICAR SI EL ADMIN YA FUE APROBADO HOY
==================================================== */
function adminAprobadoHoy() {
    try {
        const raw = localStorage.getItem(APPROVAL_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        return data.fecha === fechaHoy();
    } catch { return false; }
}

function guardarAprobacionAdmin() {
    localStorage.setItem(APPROVAL_KEY, JSON.stringify({ fecha: fechaHoy() }));
}

/* ====================================================
   PROCESO DE LOGIN PRINCIPAL
==================================================== */
async function procesarLogin(dni, password) {
    hideAlerts();
    setLoading(true);

    // Simular latencia de red
    await delay(700);

    // Buscar usuario
    const usuario = USUARIOS.find(u => u.dni === dni && u.password === password);

    if (!usuario) {
        setLoading(false);
        sacudirFormulario();
        showAlert('error', '⚠ DNI o contraseña incorrectos. Verifica tus datos.');
        document.getElementById('inputPass').value = '';
        return;
    }

    /* ---------- ROL: ADMIN ---------- */
    if (usuario.rol === 'admin') {
        // ¿Ya fue aprobado hoy?
        if (adminAprobadoHoy()) {
            // Acceso directo (aprobación única por día ya consumida)
            setLoading(false);
            guardarSesion(usuario, true);
            showAlert('success', `✅ Bienvenido, <strong>${usuario.nombre}</strong>. Redirigiendo...`);
            await delay(1200);
            redirigirAlPanel(usuario);
        } else {
            // Necesita aprobación
            setLoading(false);
            showAlert('pendiente');

            // Mostrar modal de aprobación (en demo, el mismo usuario lo aprueba)
            const aprobado = await mostrarAprobacionAdmin(usuario);

            if (aprobado) {
                guardarAprobacionAdmin();
                guardarSesion(usuario, true);
                showAlert('success', `✅ Acceso aprobado. Bienvenido, <strong>${usuario.nombre}</strong>.`);
                await delay(1200);
                redirigirAlPanel(usuario);
            } else {
                showAlert('error', '🚫 Ingreso denegado por el administrador.');
            }
        }
        return;
    }

    /* ---------- ROL: COCINERO / MOZO ---------- */
    guardarSesion(usuario, true);
    setLoading(false);
    showAlert('success', `✅ Bienvenido, <strong>${usuario.nombre}</strong>. Redirigiendo...`);
    await delay(1100);
    redirigirAlPanel(usuario);
}

function redirigirAlPanel(usuario) {
    // Guardar el panel objetivo en sessionStorage para que admin.js lo lea
    sessionStorage.setItem('sc_target_panel', usuario.panel);
    window.location.href = 'admin.html';
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ====================================================
   SUBMIT DEL FORMULARIO
==================================================== */
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const dni  = document.getElementById('inputDNI').value.trim();
    const pass = document.getElementById('inputPass').value;

    // Validaciones básicas
    if (!dni) {
        showAlert('error', 'Por favor ingresa tu DNI.');
        document.getElementById('inputDNI').focus();
        return;
    }
    if (dni.length < 8) {
        showAlert('error', 'El DNI debe tener 8 dígitos.');
        sacudirFormulario();
        return;
    }
    if (!pass) {
        showAlert('error', 'Por favor ingresa tu contraseña.');
        document.getElementById('inputPass').focus();
        return;
    }

    procesarLogin(dni, pass);
});

// Solo números en DNI
document.getElementById('inputDNI').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 8);
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
    if (sesion && sesion.aprobado) {
        // Ya tiene sesión: ir directo al panel
        sessionStorage.setItem('sc_target_panel', sesion.panel);
        window.location.href = 'admin.html';
    }
}

/* ====================================================
   INIT
==================================================== */
document.addEventListener('DOMContentLoaded', () => {
    crearParticulas();
    verificarSesionExistente();
});