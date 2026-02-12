const form = document.getElementById("formReserva");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const fecha = document.getElementById("fecha");
const inicio = document.getElementById("inicio");
const final = document.getElementById("final");
const contenedorMesas = document.getElementById("contenedorMesas");

const API = "http://127.0.0.1:3000/reservas";

/* ===== FECHA MÍNIMA Y MÁXIMA ===== */

const hoy = new Date();
const hoyISO = hoy.toISOString().split("T")[0];

const maxFecha = new Date();
maxFecha.setMonth(maxFecha.getMonth() + 1);
const maxISO = maxFecha.toISOString().split("T")[0];

fecha.min = hoyISO;
fecha.max = maxISO;

/* ===== VALIDAR NOMBRE ===== */

function validarNombre() {
    const valor = nombre.value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!regex.test(valor) || valor === "") {
        nombre.classList.add("is-invalid");
        nombre.classList.remove("is-valid");
        return false;
    } else {
        nombre.classList.remove("is-invalid");
        nombre.classList.add("is-valid");
        return true;
    }
}

/* ===== VALIDAR TELÉFONO ===== */

function validarTelefono() {
    const valor = telefono.value;
    const regex = /^9\d{8}$/;

    if (!regex.test(valor)) {
        telefono.classList.add("is-invalid");
        telefono.classList.remove("is-valid");
        return false;
    } else {
        telefono.classList.remove("is-invalid");
        telefono.classList.add("is-valid");
        return true;
    }
}

/* ===== VALIDAR FECHA Y HORA ===== */

function validarFechaHora() {

    const fechaValor = fecha.value;
    const horaInicio = inicio.value;
    const horaFinal = final.value;

    if (!fechaValor || !horaInicio || !horaFinal) return false;

    const ahora = new Date();
    const reservaInicio = new Date(`${fechaValor}T${horaInicio}`);
    const reservaFinal = new Date(`${fechaValor}T${horaFinal}`);
    const minimo = new Date(ahora.getTime() + 60000);

    /* Rango permitido 9:00 - 20:00 */
    if (horaInicio < "09:00" || horaFinal > "20:00") {
        inicio.classList.add("is-invalid");
        final.classList.add("is-invalid");
        return false;
    }

    if (reservaInicio < minimo) {
        inicio.classList.add("is-invalid");
        inicio.classList.remove("is-valid");
        return false;
    } else {
        inicio.classList.remove("is-invalid");
        inicio.classList.add("is-valid");
    }

    if (reservaFinal <= reservaInicio) {
        final.classList.add("is-invalid");
        final.classList.remove("is-valid");
        return false;
    } else {
        final.classList.remove("is-invalid");
        final.classList.add("is-valid");
    }

    return true;
}

/* ===== BACKEND ===== */

async function obtenerMesas(datos) {
    try {
        const res = await fetch(API + "/disponibles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        return await res.json();
    } catch {
        alert("Error conectando con backend ❌");
        return null;
    }
}

async function crearReserva(datos) {
    try {
        const res = await fetch(API + "/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        return await res.json();
    } catch {
        alert("Error al crear reserva ❌");
        return null;
    }
}

/* ===== MOSTRAR MESAS ===== */

function mostrarMesas(lista, datosBase) {

    contenedorMesas.innerHTML = "<h5>Mesas disponibles:</h5>";

    lista.slice(0, 20).forEach(mesa => {

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-success m-1";
        btn.textContent = "Mesa " + mesa;

        btn.onclick = async () => {
            datosBase.mesa = mesa;
            const r = await crearReserva(datosBase);

            if (r && r.ok) {
                alert("Reserva confirmada en Mesa " + mesa + " ✅");
                contenedorMesas.innerHTML = "";
            }
        };

        contenedorMesas.appendChild(btn);
    });
}

/* ===== EVENTOS ===== */

nombre.addEventListener("input", validarNombre);
telefono.addEventListener("input", validarTelefono);
inicio.addEventListener("change", validarFechaHora);
final.addEventListener("change", validarFechaHora);
fecha.addEventListener("change", validarFechaHora);

/* ===== SUBMIT ===== */

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    let ok = true;

    if (!validarNombre()) ok = false;
    if (!validarTelefono()) ok = false;
    if (!validarFechaHora()) ok = false;

    if (!ok) {
        form.classList.add("was-validated");
        return;
    }

    const boton = e.submitter.value;

    const datos = {
        nombre: nombre.value,
        telefono: telefono.value,
        fecha: fecha.value,
        inicio: inicio.value,
        final: final.value
    };

    if (boton === "azar") {

        const res = await obtenerMesas(datos);

        if (!res || !res.disponibles || res.disponibles.length === 0) {
            alert("No hay mesas disponibles ❌");
            return;
        }

        const random = res.disponibles[
            Math.floor(Math.random() * res.disponibles.length)
        ];

        datos.mesa = random;

        const r = await crearReserva(datos);

        if (r && r.ok) {
            alert("Reserva al azar confirmada en Mesa " + random + " ✅");
        }
    }

    if (boton === "elegir") {

        const res = await obtenerMesas(datos);

        if (!res || !res.disponibles || res.disponibles.length === 0) {
            alert("No hay mesas disponibles ❌");
            return;
        }

        mostrarMesas(res.disponibles, datos);
    }

});
