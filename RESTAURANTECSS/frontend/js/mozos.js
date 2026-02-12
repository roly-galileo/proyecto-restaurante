let pedidos = [];

function agregarPedido(tipo) {
    const plato = document.getElementById("plato").value;
    const bebida = document.getElementById("bebida").value;
    const cantidad = document.getElementById("cantidad").value;
    const observaciones = document.getElementById("observaciones").value;

    if (!plato && !bebida) {
        alert("Debe ingresar al menos un plato o bebida");
        return;
    }

    let mesa = null;
    if (tipo === 'mesa') {
        mesa = document.getElementById("mesa").value;
        if (!mesa) {
            alert("Seleccione una mesa");
            return;
        }
    }

    const item = {
        plato,
        bebida,
        cantidad,
        observaciones,
        tipo: tipo,
        mesa: mesa
    };

    pedidos.push(item);

    mostrarPedidos();
    limpiarCampos();
}

function mostrarPedidos() {
    const lista = document.getElementById("listaPedidos");
    lista.innerHTML = "";

    pedidos.forEach((p, index) => {
        let text = `${p.plato || ""} + ${p.bebida || ""} x${p.cantidad}`;
        if (p.tipo === 'mesa') text += ` (Mesa: ${p.mesa})`;
        else text += ` (Para llevar)`;

        const li = document.createElement("li");
        li.textContent = text;
        lista.appendChild(li);
    });
}

function limpiarCampos() {
    document.getElementById("plato").value = "";
    document.getElementById("bebida").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("observaciones").value = "";
    document.getElementById("mesa").value = "";
}

async function enviarPedido() {
    if (pedidos.length === 0) {
        alert("No hay pedidos agregados");
        return;
    }

    const clienteInput = document.getElementById("usuario").value;
    const ocasional = document.getElementById("ocasional").checked;

    const cliente = ocasional ? "Cliente ocasional" : clienteInput;

    const pedidoFinal = {
        cliente,
        pedidos
    };

    try {
        await fetch("http://localhost:3000/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pedidoFinal)
        });

        alert("Pedido enviado a cocina");
        pedidos = [];
        mostrarPedidos();

    } catch (error) {
        alert("Error al enviar pedido");
    }
}
