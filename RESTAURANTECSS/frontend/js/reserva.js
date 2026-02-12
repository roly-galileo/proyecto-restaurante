const form = document.getElementById("formReserva");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const fecha = document.getElementById("fecha");
const inicio = document.getElementById("inicio");
const final = document.getElementById("final");


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


    /* Validar inicio */

    if (reservaInicio < minimo) {

        inicio.classList.add("is-invalid");
        inicio.classList.remove("is-valid");
        return false;

    } else {

        inicio.classList.remove("is-invalid");
        inicio.classList.add("is-valid");

    }


    /* Validar final */

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


/* ===== EVENTOS ===== */

nombre.addEventListener("input", validarNombre);
telefono.addEventListener("input", validarTelefono);
inicio.addEventListener("change", validarFechaHora);
final.addEventListener("change", validarFechaHora);
fecha.addEventListener("change", validarFechaHora);


/* ===== AL ENVIAR ===== */

form.addEventListener("submit", function (e) {

    e.preventDefault();

    let ok = true;

    if (!validarNombre()) ok = false;
    if (!validarTelefono()) ok = false;
    if (!validarFechaHora()) ok = false;

    if (!ok) {
        form.classList.add("was-validated");
        return;
    }

    /* Detectar qué botón se presionó */
    const boton = e.submitter.value;

    if (boton === "azar") {
        alert("Reserva al azar realizada ✅");
    }

    if (boton === "elegir") {
        alert("Elegir mesa seleccionado ✅");
    }

});


