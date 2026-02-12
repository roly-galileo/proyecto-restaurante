document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const contenido = document.getElementById("contenido");

  if (!splash || !contenido) {
    console.error("Splash o contenido no encontrado");
    return;
  }

  setTimeout(() => {
    splash.style.opacity = "0";

    setTimeout(() => {
      splash.style.display = "none";
      contenido.style.display = "block";
    }, 600);
  }, 1000); // tiempo del splash
});