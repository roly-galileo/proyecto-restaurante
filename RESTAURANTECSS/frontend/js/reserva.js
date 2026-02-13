const form = document.getElementById("formReserva");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const fecha = document.getElementById("fecha");
const inicio = document.getElementById("inicio");
const final = document.getElementById("final");
const contenedorMesas = document.getElementById("contenedorMesas");

const API = "http://127.0.0.1:3000/reservas";

/* ===== CONFIGURACIÓN INICIAL ===== */

/**
 * Inicializa las fechas mínima y máxima permitidas para reservas
 */
function inicializarFechas() {
    const hoy = new Date();
    const hoyISO = hoy.toISOString().split("T")[0];

    const maxFecha = new Date();
    maxFecha.setMonth(maxFecha.getMonth() + 1);
    const maxISO = maxFecha.toISOString().split("T")[0];

    fecha.min = hoyISO;
    fecha.max = maxISO;
    fecha.value = hoyISO; // Establece hoy como fecha por defecto
}

inicializarFechas();

/* ===== UTILIDADES ===== */

/**
 * Muestra un mensaje al usuario
 */
function mostrarMensaje(texto, tipo = 'info') {
    // Si tienes un sistema de notificaciones, úsalo aquí
    // Por ahora usamos alert mejorado
    const iconos = {
        'exito': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'advertencia': '⚠️'
    };
    
    alert(`${iconos[tipo] || ''} ${texto}`);
}

/**
 * Deshabilita/habilita el formulario durante operaciones asíncronas
 */
function toggleFormulario(habilitado) {
    const elementos = form.querySelectorAll('input, button, select, textarea');
    elementos.forEach(el => {
        el.disabled = !habilitado;
    });
}

/* ===== VALIDACIONES ===== */

/**
 * Valida que el nombre contenga solo letras y espacios
 * @returns {boolean} true si es válido
 */
function validarNombre() {
    const valor = nombre.value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const esValido = regex.test(valor) && valor.length >= 3;

    if (!esValido) {
        nombre.classList.add("is-invalid");
        nombre.classList.remove("is-valid");
        nombre.setCustomValidity("Ingrese un nombre válido (solo letras, mínimo 3 caracteres)");
        return false;
    } else {
        nombre.classList.remove("is-invalid");
        nombre.classList.add("is-valid");
        nombre.setCustomValidity("");
        return true;
    }
}

/**
 * Valida el formato de teléfono peruano (9 dígitos empezando en 9)
 * @returns {boolean} true si es válido
 */
function validarTelefono() {
    const valor = telefono.value.trim();
    const regex = /^9\d{8}$/;
    const esValido = regex.test(valor);

    if (!esValido) {
        telefono.classList.add("is-invalid");
        telefono.classList.remove("is-valid");
        telefono.setCustomValidity("Ingrese un número válido (9 dígitos, inicia con 9)");
        return false;
    } else {
        telefono.classList.remove("is-invalid");
        telefono.classList.add("is-valid");
        telefono.setCustomValidity("");
        return true;
    }
}

/**
 * Valida la fecha y horario de la reserva
 * @returns {boolean} true si es válido
 */
function validarFechaHora() {
    const fechaValor = fecha.value;
    const horaInicio = inicio.value;
    const horaFinal = final.value;

    // Validar que todos los campos estén completos
    if (!fechaValor || !horaInicio || !horaFinal) {
        return false;
    }

    const ahora = new Date();
    const reservaInicio = new Date(`${fechaValor}T${horaInicio}`);
    const reservaFinal = new Date(`${fechaValor}T${horaFinal}`);
    const minimoPermitido = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora de anticipación

    // Validar horario de atención (9:00 - 20:00)
    if (horaInicio < "09:00" || horaFinal > "20:00") {
        inicio.classList.add("is-invalid");
        final.classList.add("is-invalid");
        inicio.setCustomValidity("El horario de atención es de 9:00 a 20:00");
        final.setCustomValidity("El horario de atención es de 9:00 a 20:00");
        return false;
    }

    // Validar que la reserva sea con al menos 1 hora de anticipación
    if (reservaInicio < minimoPermitido) {
        inicio.classList.add("is-invalid");
        inicio.classList.remove("is-valid");
        inicio.setCustomValidity("La reserva debe hacerse con al menos 1 hora de anticipación");
        return false;
    } else {
        inicio.classList.remove("is-invalid");
        inicio.classList.add("is-valid");
        inicio.setCustomValidity("");
    }

    // Validar que la hora final sea posterior a la inicial
    const diferenciaMinutos = (reservaFinal - reservaInicio) / (1000 * 60);
    
    if (diferenciaMinutos <= 0) {
        final.classList.add("is-invalid");
        final.classList.remove("is-valid");
        final.setCustomValidity("La hora final debe ser posterior a la hora de inicio");
        return false;
    } else if (diferenciaMinutos < 30) {
        final.classList.add("is-invalid");
        final.classList.remove("is-valid");
        final.setCustomValidity("La reserva debe ser de al menos 30 minutos");
        return false;
    } else if (diferenciaMinutos > 180) {
        final.classList.add("is-invalid");
        final.classList.remove("is-valid");
        final.setCustomValidity("La reserva no puede exceder 3 horas");
        return false;
    } else {
        final.classList.remove("is-invalid");
        final.classList.add("is-valid");
        final.setCustomValidity("");
    }

    return true;
}

/**
 * Valida todo el formulario
 * @returns {boolean} true si todo es válido
 */
function validarFormulario() {
    const nombreValido = validarNombre();
    const telefonoValido = validarTelefono();
    const fechaHoraValida = validarFechaHora();

    return nombreValido && telefonoValido && fechaHoraValida;
}

/* ===== COMUNICACIÓN CON BACKEND ===== */

/**
 * Obtiene las mesas disponibles para una reserva
 * @param {Object} datos - Datos de la reserva
 * @returns {Promise<Object|null>} Respuesta del servidor o null si hay error
 */
async function obtenerMesas(datos) {
    try {
        const res = await fetch(`${API}/disponibles`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener mesas:", error);
        mostrarMensaje("No se pudo conectar con el servidor. Verifica tu conexión.", "error");
        return null;
    }
}

/**
 * Crea una nueva reserva en el sistema
 * @param {Object} datos - Datos completos de la reserva
 * @returns {Promise<Object|null>} Respuesta del servidor o null si hay error
 */
async function crearReserva(datos) {
    try {
        const res = await fetch(`${API}/crear`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Error al crear reserva:", error);
        mostrarMensaje("No se pudo crear la reserva. Intenta nuevamente.", "error");
        return null;
    }
}

/* ===== INTERFAZ DE USUARIO ===== */

/**
 * Muestra las mesas disponibles para que el usuario elija
 * @param {Array} lista - Array de números de mesa
 * @param {Object} datosBase - Datos base de la reserva
 */
function mostrarMesas(lista, datosBase) {
    if (!lista || lista.length === 0) {
        contenedorMesas.innerHTML = `
            <div class="alert alert-warning mt-3">
                No hay mesas disponibles para el horario seleccionado
            </div>
        `;
        return;
    }

    contenedorMesas.innerHTML = `
        <div class="mt-4">
            <h5 class="mb-3">Mesas disponibles (${lista.length}):</h5>
            <div class="d-flex flex-wrap gap-2" id="listaMesas"></div>
        </div>
    `;

    const listaMesas = document.getElementById("listaMesas");

    // Mostrar máximo 20 mesas
    lista.slice(0, 20).forEach(mesa => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-success";
        btn.textContent = `Mesa ${mesa}`;
        btn.style.minWidth = "80px";

        btn.onclick = async () => {
            // Deshabilitar todos los botones
            listaMesas.querySelectorAll("button").forEach(b => b.disabled = true);
            btn.classList.add("btn-success");
            btn.classList.remove("btn-outline-success");
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Reservando...';

            datosBase.mesa = mesa;
            const resultado = await crearReserva(datosBase);

            if (resultado && resultado.ok) {
                mostrarMensaje(`Reserva confirmada en Mesa ${mesa}`, "exito");
                contenedorMesas.innerHTML = `
                    <div class="alert alert-success mt-3">
                        ✅ <strong>¡Reserva exitosa!</strong><br>
                        Mesa: ${mesa}<br>
                        Fecha: ${datosBase.fecha}<br>
                        Horario: ${datosBase.inicio} - ${datosBase.final}<br>
                        A nombre de: ${datosBase.nombre}
                    </div>
                `;
                form.reset();
                inicializarFechas();
            } else {
                // Rehabilitar botones si falla
                listaMesas.querySelectorAll("button").forEach(b => {
                    b.disabled = false;
                    b.classList.remove("btn-success");
                    b.classList.add("btn-outline-success");
                    b.textContent = `Mesa ${b.textContent.match(/\d+/)[0]}`;
                });
            }
        };

        listaMesas.appendChild(btn);
    });

    if (lista.length > 20) {
        contenedorMesas.innerHTML += `
            <p class="text-muted mt-2">
                <small>Mostrando las primeras 20 mesas de ${lista.length} disponibles</small>
            </p>
        `;
    }
}

/**
 * Limpia el contenedor de mesas
 */
function limpiarMesas() {
    contenedorMesas.innerHTML = "";
}

/* ===== EVENTOS ===== */

// Validación en tiempo real
nombre.addEventListener("input", validarNombre);
telefono.addEventListener("input", validarTelefono);
inicio.addEventListener("change", () => {
    validarFechaHora();
    limpiarMesas();
});
final.addEventListener("change", () => {
    validarFechaHora();
    limpiarMesas();
});
fecha.addEventListener("change", () => {
    validarFechaHora();
    limpiarMesas();
});

// Formateo automático del teléfono
telefono.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 9);
});

/* ===== SUBMIT DEL FORMULARIO ===== */

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validar formulario
    if (!validarFormulario()) {
        form.classList.add("was-validated");
        mostrarMensaje("Por favor completa correctamente todos los campos", "advertencia");
        return;
    }

    const boton = e.submitter?.value;

    if (!boton) {
        mostrarMensaje("Error al procesar la solicitud", "error");
        return;
    }

    // Preparar datos
    const datos = {
        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        fecha: fecha.value,
        inicio: inicio.value,
        final: final.value
    };

    // Deshabilitar formulario durante la operación
    toggleFormulario(false);

    try {
        if (boton === "azar") {
            await procesarReservaAzar(datos);
        } else if (boton === "elegir") {
            await procesarReservaElegir(datos);
        }
    } finally {
        toggleFormulario(true);
    }
});

/* ===== PROCESAMIENTO DE RESERVAS ===== */

/**
 * Procesa una reserva con mesa asignada al azar
 */
async function procesarReservaAzar(datos) {
    const respuesta = await obtenerMesas(datos);

    if (!respuesta || !respuesta.disponibles || respuesta.disponibles.length === 0) {
        mostrarMensaje("No hay mesas disponibles para el horario seleccionado", "error");
        return;
    }

    // Seleccionar mesa al azar
    const mesaAleatoria = respuesta.disponibles[
        Math.floor(Math.random() * respuesta.disponibles.length)
    ];

    datos.mesa = mesaAleatoria;

    const resultado = await crearReserva(datos);

    if (resultado && resultado.ok) {
        mostrarMensaje(`Reserva confirmada en Mesa ${mesaAleatoria}`, "exito");
        contenedorMesas.innerHTML = `
            <div class="alert alert-success mt-3">
                ✅ <strong>¡Reserva exitosa!</strong><br>
                Mesa asignada: ${mesaAleatoria}<br>
                Fecha: ${datos.fecha}<br>
                Horario: ${datos.inicio} - ${datos.final}<br>
                A nombre de: ${datos.nombre}
            </div>
        `;
        form.reset();
        inicializarFechas();
    }
}

/**
 * Procesa una reserva mostrando mesas disponibles para elegir
 */
async function procesarReservaElegir(datos) {
    const respuesta = await obtenerMesas(datos);

    if (!respuesta || !respuesta.disponibles || respuesta.disponibles.length === 0) {
        mostrarMensaje("No hay mesas disponibles para el horario seleccionado", "error");
        limpiarMesas();
        return;
    }

    mostrarMesas(respuesta.disponibles, datos);
}

/* ===== INICIALIZACIÓN ===== */

// Limpiar validaciones al cargar
document.addEventListener("DOMContentLoaded", () => {
    form.classList.remove("was-validated");
    limpiarMesas();
});