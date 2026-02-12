/* =====================================================
   SISTEMA DE RESERVAS
   Controla la captura de datos del formulario, validación,
   asignación de mesa y envío al backend.
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // Selección de elementos clave
  const form = document.getElementById("formReserva"); // Formulario de reservas
  const mensaje = document.getElementById("mensaje");  // Elemento para mostrar mensajes

  // Si no existe el formulario, no hacer nada
  if (!form) return;

  /* =====================================================
     ENVÍO DEL FORMULARIO
     Escucha el evento 'submit' y procesa la reserva
  ===================================================== */
  form.addEventListener("submit", async (e) => {

    e.preventDefault(); // Evita que la página se recargue al enviar

    // ===================== DATOS DEL FORMULARIO =====================
    const nombreCliente = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const fecha = document.getElementById("fecha").value;
    const inicio = document.getElementById("inicio").value;
    const final = document.getElementById("final").value;
    const personas = document.getElementById("personas").value;

    // ===================== VALIDACIÓN BÁSICA =====================
    if (!inicio) {
      mensaje.textContent = "Selecciona una hora";
      mensaje.style.color = "red";
      return;
    }

    // ===================== ASIGNACIÓN DE MESA =====================
    // Detecta qué botón fue pulsado: "azar" o "elegir"
    const botonPulsado = e.submitter.value;
    let idMesa = 1; // Valor por defecto

    if (botonPulsado === "azar") {
      // Selección aleatoria de mesa (1 a 10)
      idMesa = Math.floor(Math.random() * 10) + 1;

    } else {
      // Selección manual de mesa
      idMesa = Number(prompt("Ingresa el número de mesa (1-10):"));

      // Validación del número ingresado
      if (isNaN(idMesa) || idMesa < 1 || idMesa > 10) {
        mensaje.textContent = "Número de mesa inválido";
        mensaje.style.color = "red";
        return;
      }
    }

    // ===================== CREACIÓN DEL OBJETO DE RESERVA =====================
    const reserva = {
      restauranteId: 1,             // ID del restaurante (fijo)
      idMesa: idMesa,               // Número de mesa
      nombreCliente: nombreCliente, // Nombre del cliente
      fecha: fecha,                 // Fecha de reserva
      inicio: inicio,               // Hora de inicio
      final: final,                 // Hora de finalización
      personas: Number(personas),   // Número de personas
      telefonoCliente: telefono     // Teléfono (opcional si backend lo soporta)
    };

    // ===================== MENSAJE DE ENVÍO =====================
    mensaje.textContent = "⏳ Enviando reserva...";
    mensaje.style.color = "black";

    /* =====================================================
       ENVÍO AL BACKEND
       Se utiliza fetch para hacer una petición POST
       con los datos en formato JSON.
    ===================================================== */
    try {
      const response = await fetch(
        "http://192.168.1.80:3000/api/reservaciones",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reserva)
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Mensaje de éxito con detalles de la reserva
        mensaje.textContent = 
          `✅ Mesa #${data.mesa_id} reservada para ${data.personas} personas
el ${data.fecha.split("T")[0]} de ${data.hora_inicio} a ${data.hora_final}`;
        mensaje.style.color = "green";

        // ===================== EFECTO CONFETTI =====================
        if (typeof confetti === "function") {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        form.reset(); // Limpiar formulario tras reserva exitosa

      } else {
        // Mostrar error devuelto por backend
        mensaje.textContent = data.error || "Error al crear la reserva";
        mensaje.style.color = "red";
      }

    } catch (err) {
      // Manejo de errores de conexión
      console.error(err);
      mensaje.textContent = "No se pudo conectar al servidor";
      mensaje.style.color = "red";
    }

  });

});


/* =====================================================
   UTILIDAD: SUMAR HORAS
   Función auxiliar para calcular hora final sumando
   horas a una hora dada (formato HH:MM)
===================================================== */
function sumarHoras(hora, duracion) {
  let [h, m] = hora.split(":").map(Number); // Separar horas y minutos
  h += duracion; // Sumar duración en horas
  if (h >= 24) h -= 24; // Ajuste si supera las 24 horas
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; // Formatear HH:MM
}
