/* ===================================================
   SABOR CASERO – reservas.js
   Lógica de la página de reservas
=================================================== */

'use strict';

/* ===================================================
   CONSTANTES Y CONFIG
=================================================== */
const CONFIG = {
    HORA_APERTURA:  '11:00',
    HORA_CIERRE:    '22:30',
    MIN_DURACION:   30,   // minutos
    MAX_DURACION:   180,  // minutos
    MAX_PERSONAS:   20,
    API_URL:        'http://192.168.1.80:3000/api/reservas',  // ajusta a tu ruta real
};

/* ===================================================
   REFERENCIAS AL DOM
=================================================== */
const form            = document.getElementById('formReserva');
const loadingOverlay  = document.getElementById('loadingOverlay');
const toastEl         = document.getElementById('mensaje');
const respuestaEl     = document.getElementById('respuestaBackend');
const detalleEl       = document.getElementById('detalleReserva');
const contenedorMesas = document.getElementById('contenedorMesas');
const progressFill    = document.getElementById('progressFill');
const progressSteps   = document.querySelectorAll('.progress-step');

const campos = {
    nombre:   document.getElementById('nombre'),
    telefono: document.getElementById('telefono'),
    fecha:    document.getElementById('fecha'),
    inicio:   document.getElementById('inicio'),
    final:    document.getElementById('final'),
    personas: document.getElementById('personas'),
};

/* ===================================================
   1. INICIALIZACIÓN
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
    setFechaMinima();
    bindValidaciones();
    bindForm();
    bindBotonesFlotantes();
});

/** Establece la fecha mínima como hoy */
function setFechaMinima() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd   = String(hoy.getDate()).padStart(2, '0');
    campos.fecha.min = `${yyyy}-${mm}-${dd}`;
}

/* ===================================================
   2. VALIDACIÓN EN TIEMPO REAL
=================================================== */

/** Reglas de validación por campo */
const REGLAS = {
    nombre:   (v) => /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]{2,60}$/.test(v.trim()),
    telefono: (v) => /^9\d{8}$/.test(v.trim()),
    fecha:    (v) => {
        if (!v) return false;
        const sel = new Date(v + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return sel >= hoy;
    },
    inicio:   (v) => {
        if (!v) return false;
        return v >= CONFIG.HORA_APERTURA && v <= CONFIG.HORA_CIERRE;
    },
    final:    (v) => {
        if (!v || !campos.inicio.value) return false;
        const [h1, m1] = campos.inicio.value.split(':').map(Number);
        const [h2, m2] = v.split(':').map(Number);
        const diffMin  = (h2 * 60 + m2) - (h1 * 60 + m1);
        return diffMin >= CONFIG.MIN_DURACION && diffMin <= CONFIG.MAX_DURACION && v <= CONFIG.HORA_CIERRE;
    },
    personas: (v) => {
        const n = parseInt(v, 10);
        return !isNaN(n) && n >= 1 && n <= CONFIG.MAX_PERSONAS;
    },
};

/** Vincula eventos de validación a cada campo */
function bindValidaciones() {
    Object.keys(campos).forEach(key => {
        const input = campos[key];
        if (!input) return;

        input.addEventListener('input',  () => validarCampo(key));
        input.addEventListener('blur',   () => validarCampo(key));
        input.addEventListener('change', () => {
            validarCampo(key);
            // Revalida "final" cuando cambia "inicio"
            if (key === 'inicio') validarCampo('final');
            actualizarProgreso();
        });
        input.addEventListener('input',  actualizarProgreso);
    });
}

/**
 * Valida un campo individual y actualiza clases CSS.
 * @param {string} key - clave del campo en `campos`
 * @returns {boolean}
 */
function validarCampo(key) {
    const input  = campos[key];
    const regla  = REGLAS[key];
    const grupo  = document.getElementById(`fg-${key}`);
    if (!input || !regla || !grupo) return true;

    const valor = input.value;
    const ok    = valor !== '' && regla(valor);
    const tocado = valor !== '';

    input.classList.toggle('is-valid',   ok);
    input.classList.toggle('is-invalid', tocado && !ok);
    grupo.classList.toggle('invalid',    tocado && !ok);

    return ok;
}

/** Valida todos los campos y devuelve true si el formulario es válido */
function validarTodo() {
    return Object.keys(campos).every(key => {
        const ok = validarCampo(key);
        // Forzar feedback visual en todos los campos
        if (!ok) {
            const grupo = document.getElementById(`fg-${key}`);
            if (grupo && campos[key].value !== '') {
                grupo.classList.add('invalid');
            } else if (grupo) {
                // Campo vacío: mostrar también
                grupo.classList.add('invalid');
                campos[key].classList.add('is-invalid');
            }
        }
        return ok;
    });
}

/* ===================================================
   3. INDICADOR DE PROGRESO
=================================================== */
function actualizarProgreso() {
    const claves = Object.keys(campos);
    const completados = claves.filter(k => {
        const v = campos[k].value;
        return v !== '' && REGLAS[k] && REGLAS[k](v);
    }).length;

    const total = claves.length;
    const ratio = completados / total;

    // Paso activo (1-4)
    const paso  = Math.min(Math.ceil(ratio * 4), 4);
    // Ancho de la línea de relleno
    const fillW = Math.min(ratio * 100, 100);

    if (progressFill) {
        progressFill.style.width = `${fillW}%`;
    }

    progressSteps.forEach((step, i) => {
        const stepNum = i + 1;
        step.classList.remove('active', 'completed');
        step.removeAttribute('aria-current');

        if (stepNum < paso) {
            step.classList.add('completed');
        } else if (stepNum === paso) {
            step.classList.add('active');
            step.setAttribute('aria-current', 'step');
        }
    });
}

/* ===================================================
   4. TOAST / NOTIFICACIONES
=================================================== */
let toastTimer = null;

/**
 * Muestra un mensaje toast.
 * @param {string} msg
 * @param {'success'|'error'} tipo
 * @param {number} duracion  milisegundos
 */
function mostrarToast(msg, tipo = 'success', duracion = 4000) {
    clearTimeout(toastTimer);
    const icon = tipo === 'success'
        ? '<i class="bi bi-check-circle-fill"></i>'
        : '<i class="bi bi-exclamation-triangle-fill"></i>';

    toastEl.innerHTML   = `${icon} ${msg}`;
    toastEl.className   = `toast-msg ${tipo}`;

    toastTimer = setTimeout(() => {
        toastEl.classList.add('hidden');
    }, duracion);
}

/* ===================================================
   5. LOADING OVERLAY
=================================================== */
function mostrarLoading(visible) {
    if (!loadingOverlay) return;
    loadingOverlay.setAttribute('aria-hidden', String(!visible));
    if (visible) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

/* ===================================================
   6. CONFETTI DE CELEBRACIÓN
=================================================== */
function lanzarConfetti() {
    if (typeof confetti !== 'function') return;

    const colors = ['#6B3A2A', '#C8922A', '#E8B86D', '#FAF3E8', '#A0522D'];

    confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors,
    });

    setTimeout(() => {
        confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors,
        });
    }, 250);

    setTimeout(() => {
        confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors,
        });
    }, 400);
}

/* ===================================================
   7. RENDERIZAR CONFIRMACIÓN
=================================================== */
/**
 * Muestra el panel de confirmación con los datos de la reserva.
 * @param {{ nombre, telefono, fecha, inicio, final, personas, mesa }} datos
 */
function mostrarConfirmacion(datos) {
    if (!respuestaEl || !detalleEl) return;

    const fechaFormateada = formatearFecha(datos.fecha);
    const items = [
        { icon: 'bi-person-fill',      texto: datos.nombre },
        { icon: 'bi-telephone-fill',   texto: datos.telefono },
        { icon: 'bi-calendar-event',   texto: fechaFormateada },
        { icon: 'bi-clock',            texto: `${datos.inicio} – ${datos.final}` },
        { icon: 'bi-people-fill',      texto: `${datos.personas} persona${datos.personas > 1 ? 's' : ''}` },
        { icon: 'bi-table',            texto: datos.mesa ? `Mesa ${datos.mesa}` : 'Mesa asignada al llegar' },
    ];

    detalleEl.innerHTML = items.map(({ icon, texto }) => `
        <div class="detalle-item">
            <i class="bi ${icon}"></i>
            <span>${texto}</span>
        </div>
    `).join('');

    respuestaEl.classList.remove('hidden');
    respuestaEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    lanzarConfetti();
    mostrarToast('¡Reserva realizada con éxito! 🎉', 'success', 5000);
}

/** Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español */
function formatearFecha(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    const fecha = new Date(y, m - 1, d);
    return fecha.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/* ===================================================
   8. MESAS DISPONIBLES (UI dinámica)
=================================================== */
/**
 * Renderiza el selector de mesas en el formulario.
 * @param {Array<{id: number, nombre: string, capacidad: number, disponible: boolean}>} mesas
 */
function renderizarMesas(mesas) {
    if (!contenedorMesas) return;

    if (!mesas || mesas.length === 0) {
        contenedorMesas.innerHTML = `
            <div class="info-banner" style="margin-top:16px;">
                <i class="bi bi-info-circle info-banner-icon"></i>
                <span>No hay mesas disponibles para el horario seleccionado.</span>
            </div>`;
        return;
    }

    contenedorMesas.innerHTML = `
        <p style="font-size:.8rem;font-weight:700;text-transform:uppercase;
                  letter-spacing:.1em;color:var(--color-texto-suave);
                  margin-bottom:12px;">
            Selecciona tu mesa:
        </p>
        <div class="mesas-grid" id="mesasGrid">
            ${mesas.map(m => `
                <button type="button"
                    class="mesa-item${m.disponible ? '' : ' ocupada'}"
                    data-id="${m.id}"
                    ${!m.disponible ? 'disabled' : ''}
                    title="${m.nombre} – cap. ${m.capacidad}">
                    <i class="bi bi-table"></i>
                    <span class="mesa-nombre">${m.nombre}</span>
                    <span class="mesa-cap">${m.capacidad} pers.</span>
                    ${!m.disponible ? '<span class="mesa-badge-ocu">Ocupada</span>' : ''}
                </button>
            `).join('')}
        </div>
        <input type="hidden" id="mesaSeleccionada" name="mesa" value="">
    `;

    // Evento de selección
    const grid = document.getElementById('mesasGrid');
    grid?.querySelectorAll('.mesa-item:not(.ocupada)').forEach(btn => {
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.mesa-item').forEach(b => b.classList.remove('seleccionada'));
            btn.classList.add('seleccionada');
            const hidden = document.getElementById('mesaSeleccionada');
            if (hidden) hidden.value = btn.dataset.id;
        });
    });
}

/* ===================================================
   9. ENVÍO DEL FORMULARIO
=================================================== */
function bindForm() {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarTodo()) {
            mostrarToast('Por favor, corrige los errores antes de continuar.', 'error');
            // Hacer scroll al primer campo inválido
            const primerInvalido = form.querySelector('.is-invalid');
            primerInvalido?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const accion = e.submitter?.value || 'azar';
        const datos  = recopilarDatos();
        datos.accion = accion;

        mostrarLoading(true);

        try {
            const respuesta = await enviarReserva(datos);
            procesarRespuesta(respuesta, datos);
        } catch (err) {
            console.error('Error al enviar reserva:', err);
            mostrarToast('Error de conexión. Inténtalo de nuevo o llámanos al 449 135.', 'error', 6000);
        } finally {
            mostrarLoading(false);
        }
    });
}

/** Recopila los valores del formulario en un objeto */
function recopilarDatos() {
    return {
        nombre:   campos.nombre.value.trim(),
        telefono: campos.telefono.value.trim(),
        fecha:    campos.fecha.value,
        inicio:   campos.inicio.value,
        final:    campos.final.value,
        personas: parseInt(campos.personas.value, 10),
        mesa:     document.getElementById('mesaSeleccionada')?.value || '',
    };
}

/**
 * Simula/hace la petición al backend.
 * Reemplaza esta función con tu lógica real de fetch.
 */
async function enviarReserva(datos) {
    /* ── Simulación (quita esto cuando tengas backend real) ── */
    await new Promise(r => setTimeout(r, 1400));

    if (datos.accion === 'elegir') {
        // Simula mesas disponibles
        return {
            tipo:  'mesas',
            mesas: [
                { id: 1, nombre: 'Mesa 1', capacidad: 2, disponible: true  },
                { id: 2, nombre: 'Mesa 2', capacidad: 4, disponible: false },
                { id: 3, nombre: 'Mesa 3', capacidad: 4, disponible: true  },
                { id: 4, nombre: 'Mesa 4', capacidad: 6, disponible: true  },
                { id: 5, nombre: 'Mesa 5', capacidad: 8, disponible: false },
                { id: 6, nombre: 'Mesa 6', capacidad: 2, disponible: true  },
            ],
        };
    }

    // Simula confirmación directa
    return {
        tipo:  'confirmacion',
        mesa:  'Asignada al llegar',
        datos,
    };

    /* ── Con backend real, usa esto: ──────────────────────────
    const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
    ── ─────────────────────────────────────────────────────── */
}

/** Procesa la respuesta del backend */
function procesarRespuesta(respuesta, datosOriginales) {
    if (!respuesta) return;

    if (respuesta.tipo === 'mesas') {
        renderizarMesas(respuesta.mesas);
        contenedorMesas?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        mostrarToast('Selecciona tu mesa y confirma la reserva.', 'success', 4000);
        return;
    }

    if (respuesta.tipo === 'confirmacion') {
        const datos = respuesta.datos || datosOriginales;
        datos.mesa  = respuesta.mesa || '';
        mostrarConfirmacion(datos);
        form.reset();
        Object.values(campos).forEach(inp => {
            inp.classList.remove('is-valid', 'is-invalid');
        });
        document.querySelectorAll('.field-group').forEach(g => g.classList.remove('invalid'));
        actualizarProgreso();
        return;
    }

    // Respuesta desconocida
    mostrarToast('Respuesta inesperada del servidor. Contáctanos al 449 135.', 'error');
}

/* ===================================================
   10. BOTONES FLOTANTES (promos / mapa / chat heredados)
=================================================== */
function bindBotonesFlotantes() {
    // Si esta página incluye los botones flotantes del sitio principal,
    // se puede reutilizar la lógica del index.js. Por ahora se deja como stub.
}

/* ===================================================
   ESTILOS DINÁMICOS PARA MESAS (inyectados por JS)
   — Evita tener que añadir CSS extra al archivo —
=================================================== */
(function inyectarEstilosMesas() {
    const style = document.createElement('style');
    style.textContent = `
        .mesas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 10px;
            margin-bottom: 16px;
        }

        .mesa-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 14px 8px;
            background: var(--color-crema);
            border: 2px solid var(--color-crema-osc);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-family: var(--font-body);
            font-size: 0.8rem;
            color: var(--color-texto);
            transition: all 0.25s ease;
            position: relative;
        }

        .mesa-item i {
            font-size: 1.5rem;
            color: var(--color-dorado);
            margin-bottom: 2px;
        }

        .mesa-nombre { font-weight: 700; }

        .mesa-cap {
            font-size: 0.7rem;
            color: var(--color-texto-suave);
            opacity: 0.7;
        }

        .mesa-item:hover:not(.ocupada):not(.seleccionada) {
            border-color: var(--color-tierra);
            background: var(--color-crema-osc);
            transform: translateY(-2px);
            box-shadow: 0 4px 14px rgba(107,58,42,0.15);
        }

        .mesa-item.seleccionada {
            border-color: var(--color-tierra);
            background: var(--color-tierra);
            color: var(--color-blanco);
        }

        .mesa-item.seleccionada i  { color: var(--color-dorado-claro); }
        .mesa-item.seleccionada .mesa-cap { opacity: 0.8; color: var(--color-crema); }

        .mesa-item.ocupada {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .mesa-badge-ocu {
            position: absolute;
            top: 5px; right: 5px;
            font-size: 0.6rem;
            font-weight: 700;
            background: var(--color-error);
            color: white;
            padding: 1px 5px;
            border-radius: 99px;
        }
    `;
    document.head.appendChild(style);
})();