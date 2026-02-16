/* ============================================
   SABOR CASERO – REGISTER.JS
   Sistema de registro de cuentas
   ============================================ */
'use strict';

/* ====================================================
   CONFIGURACIÓN
==================================================== */
// API_BASE_URL se define en login.js y es compartida
const REGISTER_ENDPOINTS = {
    REQUEST_CODE: '/auth/request-email-code',
    REGISTER: '/auth/register'
};

const CODE_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutos en ms
const CODE_WARNING_TIME = 2 * 60 * 1000; // Alerta a 2 minutos

/* ====================================================
   VARIABLES DE ESTADO
==================================================== */
let currentEmail = null;
let codeRequestTime = null;
let codeTimerInterval = null;
let codeSolicited = false;

/* ====================================================
   PARTÍCULAS DE FONDO
==================================================== */
function crearParticulas() {
    const cont = document.getElementById('bgParticles');
    const N = 18;
    for (let i = 0; i < N; i++) {
        const p = document.createElement('div');
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
    // Alertas del registro
    ['alertErrorReg', 'alertSuccessReg'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'none';
    });

    if (tipo === 'error') {
        const alertError = document.getElementById('alertErrorReg');
        if (alertError) {
            document.getElementById('alertErrorMsgReg').innerHTML = msg;
            alertError.style.display = 'flex';
        }
    } else if (tipo === 'success') {
        const alertSuccess = document.getElementById('alertSuccessReg');
        if (alertSuccess) {
            document.getElementById('alertSuccessMsgReg').innerHTML = msg;
            alertSuccess.style.display = 'flex';
        }
    }
}

function hideAlerts() {
    ['alertErrorReg', 'alertSuccessReg'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.style.display = 'none';
    });
}

function setLoading(buttonId, loading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const text = btn.querySelector('.btn-login-text');
    const icon = btn.querySelector('.btn-login-icon');
    const spinner = btn.querySelector('.btn-spinner');

    btn.disabled = loading;
    if (text) text.style.opacity = loading ? '.5' : '1';
    if (icon) icon.style.display = loading ? 'none' : 'inline';
    if (spinner) spinner.className = loading ? 'btn-spinner visible' : 'btn-spinner';
}

function sacudirFormulario() {
    const card = document.querySelector('.form-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
}

/* ====================================================
   NAVEGACIÓN ENTRE PASOS
==================================================== */
function mostrarPaso(paso) {
    // Ocultar todas las secciones
    document.querySelectorAll('.form-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Mostrar sección activa
    if (paso === 1) {
        document.getElementById('step1Form').classList.add('active');
        document.getElementById('step1Indicator').classList.add('active');
        document.getElementById('step1Indicator').classList.remove('completed');
        document.getElementById('step2Indicator').classList.remove('active');
    } else if (paso === 2) {
        document.getElementById('step2Form').classList.add('active');
        document.getElementById('step1Indicator').classList.add('completed');
        document.getElementById('step1Indicator').classList.remove('active');
        document.getElementById('step2Indicator').classList.add('active');
    }
}

function volverAlPaso1() {
    mostrarPaso(1);
    limpiarPaso2();
}

function irAlLogin() {
    window.location.href = 'login.html';
}

/* ====================================================
   MANEJO DEL CÓDIGO
==================================================== */
function actualizarTimerCodigo() {
    if (!codeRequestTime) return;

    const ahora = Date.now();
    const tiempoTranscurrido = ahora - codeRequestTime;
    const tiempoRestante = CODE_EXPIRY_TIME - tiempoTranscurrido;

    if (tiempoRestante <= 0) {
        // Código expirado
        clearInterval(codeTimerInterval);
        document.getElementById('codeTimer').style.display = 'none';
        document.getElementById('inputCode').style.display = 'none';
        document.getElementById('inputCode').value = '';
        document.getElementById('btnResendCode').style.display = 'inline';
        document.getElementById('btnRequestCode').style.display = 'block';
        document.getElementById('btnStep1Next').style.display = 'none';
        codeSolicited = false;
        showAlert('error', '⏰ El código expiró. Solicita uno nuevo.');
        return;
    }

    const minutos = Math.floor(tiempoRestante / 60000);
    const segundos = Math.floor((tiempoRestante % 60000) / 1000);
    const timerDisplay = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = timerDisplay;

    // Cambiar color a naranja si queda menos de 2 minutos
    const timerElement = document.getElementById('codeTimer');
    if (tiempoRestante < CODE_WARNING_TIME) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
}

function iniciarTimerCodigo() {
    codeRequestTime = Date.now();
    document.getElementById('codeTimer').style.display = 'block';

    if (codeTimerInterval) clearInterval(codeTimerInterval);
    codeTimerInterval = setInterval(actualizarTimerCodigo, 1000);
    actualizarTimerCodigo();
}

function limpiarTimerCodigo() {
    if (codeTimerInterval) clearInterval(codeTimerInterval);
    codeRequestTime = null;
}

/* ====================================================
   SOLICITAR CÓDIGO
==================================================== */
async function solicitarCodigo() {
    const email = document.getElementById('inputEmailReg').value.trim();

    // Validar email
    if (!email) {
        showAlert('error', '📧 Por favor ingresa un email.');
        document.getElementById('inputEmailReg').focus();
        return;
    }

    if (!email.includes('@')) {
        showAlert('error', '📧 El email no es válido.');
        return;
    }

    hideAlerts();
    setLoading('btnRequestCode', true);

    try {
        await delay(300);

        // Llamar a la API
        const respuesta = await llamarAPI(REGISTER_ENDPOINTS.REQUEST_CODE, 'POST', {
            email: email
        });

        setLoading('btnRequestCode', false);

        // Email existente
        if (respuesta.status === 409 || respuesta.message?.includes('ya está registrado')) {
            showAlert('error', '⚠ Este email ya está registrado. <a href="login.html">Inicia sesión</a>');
            return;
        }

        // Éxito
        currentEmail = email;
        codeSolicited = true;

        // Mostrar campo de código
        document.getElementById('inputCode').style.display = 'block';
        document.getElementById('btnRequestCode').style.display = 'none';
        document.getElementById('btnStep1Next').style.display = 'flex';
        document.getElementById('btnResendCode').style.display = 'none';

        // Iniciar timer
        iniciarTimerCodigo();

        showAlert('success', '✅ Código enviado a ' + email + '. Revisa tu correo.');

    } catch (error) {
        setLoading('btnRequestCode', false);
        sacudirFormulario();

        let mensajeError = '❌ Error al solicitar el código.';

        if (error.status === 400) {
            mensajeError = '⚠ Email inválido o requerido.';
        } else if (error.status === 409) {
            mensajeError = '⚠ Este email ya está registrado.';
        } else if (error.message?.includes('Failed to fetch')) {
            mensajeError = '❌ No se pudo conectar al servidor.';
        }

        showAlert('error', mensajeError);
    }
}

async function reenviarCodigo() {
    if (!currentEmail) return;

    setLoading('btnResendCode', true);
    try {
        await solicitarCodigo();
        setLoading('btnResendCode', false);
    } catch (error) {
        setLoading('btnResendCode', false);
        showAlert('error', '❌ Error al reenviar el código.');
    }
}

/* ====================================================
   VALIDACIÓN Y TRANSICIÓN A PASO 2
==================================================== */
function inicializarFormListeners() {
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    const inputDNIReg = document.getElementById('inputDNIReg');
    const inputCode = document.getElementById('inputCode');
    const inputEmailReg = document.getElementById('inputEmailReg');

    if (step1Form) {
        step1Form.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('inputEmailReg').value.trim();
            const code = document.getElementById('inputCode').value.trim();

            if (!email) {
                showAlert('error', '📧 Por favor ingresa un email.');
                return;
            }

            if (!code) {
                showAlert('error', '🔐 Por favor ingresa el código.');
                document.getElementById('inputCode').focus();
                return;
            }

            if (code.length !== 6) {
                showAlert('error', '🔐 El código debe tener 6 dígitos.');
                return;
            }

            hideAlerts();

            // Guardar código temporal
            window.codigoVerificacion = code;

            // Ir a paso 2
            mostrarPaso(2);
            document.getElementById('inputNombre').focus();
        });
    }

    if (step2Form) {
        step2Form.addEventListener('submit', function (e) {
            e.preventDefault();
            procesarRegistro();
        });
    }

    if (inputDNIReg) {
        inputDNIReg.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 8);
        });
    }

    if (inputCode) {
        inputCode.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });

        // Enter en código = continuar
        inputCode.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && codeSolicited) {
                if (step1Form) {
                    step1Form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    if (inputEmailReg) {
        // Enter en email = solicitar código
        inputEmailReg.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !codeSolicited) {
                solicitarCodigo();
            }
        });
    }
}

// Llamar a inicializar listeners cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormListeners);
} else {
    // Si el script se carga después de DOMContentLoaded
    inicializarFormListeners();
}

/* ====================================================
   VALIDACIÓN DE CONTRASEÑA
==================================================== */
function verificarFortalezaContraseña(password) {
    const strengthElement = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');

    if (!password) {
        strengthElement.classList.remove('show');
        return;
    }

    strengthElement.classList.add('show');

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
        strengthElement.classList.remove('medium', 'strong');
        strengthElement.classList.add('weak');
        strengthText.textContent = '⚠ Contraseña débil';
    } else if (strength <= 3) {
        strengthElement.classList.remove('weak', 'strong');
        strengthElement.classList.add('medium');
        strengthText.textContent = '⚡ Contraseña media';
    } else {
        strengthElement.classList.remove('weak', 'medium');
        strengthElement.classList.add('strong');
        strengthText.textContent = '✅ Contraseña fuerte';
    }
}

function verificarContraseñasCoinciden() {
    const passInput = document.getElementById('inputPasswordReg');
    const confirmInput = document.getElementById('inputPasswordConfirm');
    const icon = document.getElementById('confirmIcon');

    // Si los elementos no existen, salir
    if (!passInput || !confirmInput || !icon) return;

    const pass = passInput.value;
    const confirm = confirmInput.value;

    if (!confirm) {
        icon.textContent = '';
        return;
    }

    if (pass === confirm && pass.length >= 8) {
        icon.textContent = '✅';
        icon.style.color = '#4caf50';
    } else if (pass !== confirm) {
        icon.textContent = '❌';
        icon.style.color = '#f44336';
    } else {
        icon.textContent = '⚠';
        icon.style.color = '#ff9800';
    }
}

// Event listeners para validación de contraseña (solo si los elementos existen)
// Estos se configuran con DOMContentLoaded para asegurar que los elementos existan
document.addEventListener('DOMContentLoaded', function() {
    const inputPasswordReg = document.getElementById('inputPasswordReg');
    const inputPasswordConfirm = document.getElementById('inputPasswordConfirm');
    const togglePassReg = document.getElementById('togglePassReg');

    if (inputPasswordReg) {
        inputPasswordReg.addEventListener('input', function () {
            verificarFortalezaContraseña(this.value);
            verificarContraseñasCoinciden();
        });
    }

    if (inputPasswordConfirm) {
        inputPasswordConfirm.addEventListener('input', function () {
            verificarContraseñasCoinciden();
        });
    }

    // Toggle mostrar/ocultar contraseña
    if (togglePassReg) {
        togglePassReg.addEventListener('click', function () {
            const input = document.getElementById('inputPasswordReg');
            if (!input) return;
            const esPassword = input.type === 'password';
            input.type = esPassword ? 'text' : 'password';
            this.textContent = esPassword ? '🙈' : '👁';
        });
    }
}, { once: true });

/* ====================================================
   LIMPIEZA DE PASO 2
==================================================== */
function limpiarPaso2() {
    document.getElementById('inputNombre').value = '';
    document.getElementById('inputApellido').value = '';
    document.getElementById('inputDNIReg').value = '';
    document.getElementById('inputTelefono').value = '';
    document.getElementById('inputPasswordReg').value = '';
    document.getElementById('inputPasswordConfirm').value = '';
    document.getElementById('passwordStrength').classList.remove('show');
    document.getElementById('confirmIcon').textContent = '';
}

/* ====================================================
   REGISTRO FINAL
==================================================== */
async function procesarRegistro() {
    const email = currentEmail;
    const codigo = window.codigoVerificacion;
    const nombre = document.getElementById('inputNombre').value.trim();
    const apellido = document.getElementById('inputApellido').value.trim();
    const dni = document.getElementById('inputDNIReg').value.trim();
    const telefono = document.getElementById('inputTelefono').value.trim();
    const password = document.getElementById('inputPasswordReg').value;
    const passwordConfirm = document.getElementById('inputPasswordConfirm').value;

    // Validaciones
    if (!nombre) {
        showAlert('error', '👤 Por favor ingresa tu nombre.');
        document.getElementById('inputNombre').focus();
        return;
    }

    if (!apellido) {
        showAlert('error', '👤 Por favor ingresa tu apellido.');
        document.getElementById('inputApellido').focus();
        return;
    }

    if (!dni || dni.length !== 8) {
        showAlert('error', '🪪 El DNI debe tener 8 dígitos.');
        document.getElementById('inputDNIReg').focus();
        return;
    }

    if (!telefono) {
        showAlert('error', '📞 Por favor ingresa un teléfono.');
        document.getElementById('inputTelefono').focus();
        return;
    }

    if (!password || password.length < 8) {
        showAlert('error', '🔒 La contraseña debe tener mínimo 8 caracteres.');
        document.getElementById('inputPasswordReg').focus();
        return;
    }

    if (password !== passwordConfirm) {
        showAlert('error', '🔒 Las contraseñas no coinciden.');
        document.getElementById('inputPasswordConfirm').focus();
        return;
    }

    hideAlerts();
    setLoading('btnRegister', true);

    try {
        await delay(300);

        // Llamar a la API de registro
        const respuesta = await llamarAPI(REGISTER_ENDPOINTS.REGISTER, 'POST', {
            email: email,
            password: password,
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            dni: dni,
            codigo: codigo
        });

        setLoading('btnRegister', false);

        // Éxito - mostrar mensaje
        showAlert('success', '✅ ¡Cuenta creada exitosamente! Cambiando a login...');
        await delay(2000);
        
        // Cambiar al tab de login
        document.getElementById('step1Form').reset();
        document.getElementById('step2Form').reset();
        document.getElementById('inputCode').style.display = 'none';
        document.getElementById('btnStep1Next').style.display = 'none';
        document.getElementById('btnRequestCode').style.display = 'block';
        codeSolicited = false;
        limpiarPaso2();
        cambiarTab('login');
        return;

    } catch (error) {
        setLoading('btnRegister', false);
        sacudirFormulario();

        let mensajeError = '❌ Error en el registro.';

        if (error.status === 400) {
            if (error.message?.includes('código')) {
                mensajeError = '⚠ El código es inválido o expirado. Solicita uno nuevo.';
            } else if (error.message?.includes('datos')) {
                mensajeError = '⚠ Datos incompletos. Verifica todos los campos.';
            } else {
                mensajeError = '⚠ ' + error.message;
            }
        } else if (error.status === 409) {
            mensajeError = '⚠ El email ya está registrado.';
        } else if (error.message?.includes('Failed to fetch')) {
            mensajeError = '❌ No se pudo conectar al servidor.';
        }

        showAlert('error', mensajeError);
    }
}

/* ====================================================
   LLAMADAS A API
==================================================== */
async function llamarAPI(endpoint, metodo = 'POST', body = null) {
    try {
        const opciones = {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
            },
        };

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
   UTILIDADES
==================================================== */
function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/* ====================================================
   EVENT LISTENERS
==================================================== */
const btnRequestCode = document.getElementById('btnRequestCode');
const btnResendCode = document.getElementById('btnResendCode');
const inputEmailReg = document.getElementById('inputEmailReg');
const inputCode = document.getElementById('inputCode');
const step1Form = document.getElementById('step1Form');
const step2Form = document.getElementById('step2Form');

if (btnRequestCode) {
    btnRequestCode.addEventListener('click', solicitarCodigo);
}

if (btnResendCode) {
    btnResendCode.addEventListener('click', reenviarCodigo);
}

/* ====================================================
   INIT
==================================================== */
// No llamar crearParticulas() aquí porque ya se llama en login.js
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar cuando register.js se carga
    if (document.getElementById('step1Form')) {
        mostrarPaso(1);
    }
});
