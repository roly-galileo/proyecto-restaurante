function toggleChat() {
  const box = document.getElementById("chat-box");
  const visible = getComputedStyle(box).display !== "none";
  box.style.display = visible ? "none" : "flex";
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("msg");
  const chat = document.getElementById("chat-messages");

  function enviar() {
    const text = input.value.trim();
    if (!text) return;

    const liUser = document.createElement("li");
    liUser.classList.add("msg","user");
    liUser.textContent = text;
    chat.appendChild(liUser);

    fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ mensaje: text })
    })
    .then(r => r.json())
    .then(data => {
      const liBot = document.createElement("li");
      liBot.classList.add("msg","bot");
      liBot.textContent = data.respuesta;
      chat.appendChild(liBot);
      chat.scrollTop = chat.scrollHeight;
    });

    input.value = "";
  }

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") enviar();
  });

  document.getElementById("send-btn").onclick = enviar;
});
