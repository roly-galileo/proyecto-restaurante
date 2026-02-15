// ============================================
// PANEL INTEGRADO - SABOR CASERO
// Control de acceso por roles en un solo archivo
// ============================================

// Variables globales
let sesionActual = null;
let cocineroActivo = null;
let pedidos = [];
let mesas = [];
let carta = [];
let asistencia = [];

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    verificarYConfigu rarAcceso();
});

function verificarYConfigurarAcceso() {
    const sesionStr = localStorage.getItem('sesionSaborCasero');
    
    if (!sesionStr) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        sesionActual = JSON.parse(sesionStr);
        
        // Verificar tiempo de sesión (8 horas)
        const tiempoActual = new Date().getTime();
        const tiempoTranscurrido = tiempoActual - sesionActual.timestamp;
        
        if (tiempoTranscurrido > 28800000) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            cerrarSesion();
            return;
        }
        
        // Configurar interfaz según rol
        configurarInterfazPorRol();
        
        // Inicializar panel
        inicializarPanel();
        
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        window.location.href = 'login.html';
    }
}

function configurarInterfazPorRol() {
    const { rol, nombre, permisos } = sesionActual;
    
    // Actualizar información de usuario
    document.getElementById('userName').textContent = nombre;
    document.getElementById('userRole').textContent = obtenerNombreRol(rol);
    document.getElementById('userAvatar').textContent = nombre.charAt(0).toUpperCase();
    
    // Mostrar/ocultar elementos del menú según permisos
    if (permisos.includes('dashboard')) {
        document.getElementById('nav-dashboard').style.display = 'block';
    }
    if (permisos.includes('cocineros')) {
        document.getElementById('nav-cocineros').style.display = 'block';
    }
    if (permisos.includes('mozos')) {
        document.getElementById('nav-mozos').style.display = 'block';
    }
    if (permisos.includes('administracion')) {
        document.getElementById('nav-administracion').style.display = 'block';
    }
    
    // Mostrar primera sección disponible
    mostrarPrimeraSeccionDisponible();
}

function obtenerNombreRol(rol) {
    const nombres = {
        'administrador': 'Super Admin',
        'cocinero': 'Cocina',
        'mozo': 'Sala'
    };
    return nombres[rol] || 'Usuario';
}

function mostrarPrimeraSeccionDisponible() {
    const { permisos } = sesionActual;
    
    // Orden de prioridad
    const orden = ['dashboard', 'cocineros', 'mozos', 'administracion'];
    
    for (let seccion of orden) {
        if (permisos.includes(seccion)) {
            navegarASeccion(seccion);
            break;
        }
    }
}

// ============================================
// NAVEGACIÓN
// ============================================

function navegarASeccion(seccion) {
    // Verificar permisos
    if (!sesionActual.permisos.includes(seccion)) {
        mostrarToast('⚠️ No tienes permiso para acceder a esta sección', 'error');
        return;
    }
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionElement = document.getElementById(`section-${seccion}`);
    if (seccionElement) {
        seccionElement.style.display = 'block';
        seccionElement.classList.add('active');
    }
    
    // Actualizar menú activo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === seccion) {
            item.classList.add('active');
        }
    });
    
    // Actualizar títulos
    const titulos = {
        'dashboard': 'Dashboard General',
        'cocineros': 'Cola de Pedidos – Cocina',
        'mozos': 'Panel de Sala',
        'administracion': 'Panel de Administración'
    };
    
    const breadcrumbs = {
        'dashboard': 'Sabor Casero / Dashboard',
        'cocineros': 'Sabor Casero / Cocineros',
        'mozos': 'Sabor Casero / Mozos',
        'administracion': 'Sabor Casero / Administración'
    };
    
    document.getElementById('pageTitle').textContent = titulos[seccion];
    document.getElementById('pageBreadcrumb').textContent = breadcrumbs[seccion];
    
    // Cargar datos de la sección
    cargarDatosSeccion(seccion);
}

function goTo(seccion) {
    navegarASeccion(seccion);
}

// ============================================
// INICIALIZACIÓN DEL PANEL
// ============================================

function inicializarPanel() {
    // Actualizar fecha y hora
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Event listeners
    configurarEventListeners();
}

function actualizarFechaHora() {
    const ahora = new Date();
    
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = ahora.toLocaleDateString('es-PE', opcionesFecha);
    document.getElementById('currentDate').textContent = fecha;
    
    const hora = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('currentTime').textContent = hora;
    
    // Fecha de asistencia
    const fechaAsist = document.getElementById('fechaAsistencia');
    if (fechaAsist) {
        fechaAsist.textContent = ahora.toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

function cargarDatosIniciales() {
    // Cargar pedidos
    const pedidosGuardados = localStorage.getItem('pedidosSaborCasero');
    pedidos = pedidosGuardados ? JSON.parse(pedidosGuardados) : generarPedidosEjemplo();
    
    // Cargar mesas
    const mesasGuardadas = localStorage.getItem('mesasSaborCasero');
    mesas = mesasGuardadas ? JSON.parse(mesasGuardadas) : generarMesasEjemplo();
    
    // Cargar carta
    const cartaGuardada = localStorage.getItem('cartaSaborCasero');
    carta = cartaGuardada ? JSON.parse(cartaGuardada) : generarCartaEjemplo();
    
    // Cargar asistencia
    const asistenciaGuardada = localStorage.getItem('asistenciaSaborCasero');
    asistencia = asistenciaGuardada ? JSON.parse(asistenciaGuardada) : generarAsistenciaEjemplo();
    
    guardarTodosDatos();
}

function cargarDatosSeccion(seccion) {
    switch(seccion) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'cocineros':
            inicializarCocineros();
            renderizarPedidos();
            break;
        case 'mozos':
            renderizarMesas();
            renderizarCarta();
            renderizarAsistencia();
            break;
        case 'administracion':
            // Cargar datos de administración
            break;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function configurarEventListeners() {
    // Navegación del sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                e.preventDefault();
                const seccion = this.dataset.section;
                if (seccion) {
                    navegarASeccion(seccion);
                }
            }
        });
    });
    
    // Cerrar sesión
    document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
    
    // Toggle sidebar
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    
    // Subtabs
    document.querySelectorAll('.subtab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tab;
            
            // Actualizar tabs
            this.closest('.subtabs').querySelectorAll('.subtab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Actualizar contenido
            const parent = this.closest('.content-section');
            parent.querySelectorAll('.subtab-content').forEach(c => {
                c.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Filtros de pedidos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderizarPedidos();
        });
    });
    
    // Búsqueda de platos
    const searchPlato = document.getElementById('searchPlato');
    const filtroCategoria = document.getElementById('filtroCategoria');
    
    if (searchPlato) searchPlato.addEventListener('input', renderizarCarta);
    if (filtroCategoria) filtroCategoria.addEventListener('change', renderizarCarta);
}

// ============================================
// CERRAR SESIÓN
// ============================================

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('sesionSaborCasero');
        window.location.href = 'login.html';
    }
}

// ============================================
// SECCIÓN DASHBOARD
// ============================================

function cargarDashboard() {
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada').length;
    const ingresosDia = Math.random() * 5000 + 2000;
    const personalActivo = asistencia.filter(p => p.estado === 'presente').length;
    
    document.getElementById('dashPedidosPend').textContent = pedidosPendientes;
    document.getElementById('dashMesasOcup').textContent = mesasOcupadas;
    document.getElementById('dashIngresos').textContent = `S/. ${ingresosDia.toFixed(2)}`;
    document.getElementById('dashPersonal').textContent = personalActivo;
    
    // Actualizar badge
    document.getElementById('badgePedidos').textContent = pedidosPendientes;
}

// ============================================
// SECCIÓN COCINEROS
// ============================================

const cocineros = [
    { id: 1, nombre: 'Juan Chef', avatar: '👨‍🍳' },
    { id: 2, nombre: 'Pedro Cocinero', avatar: '👨‍🍳' },
    { id: 3, nombre: 'María Cocina', avatar: '👩‍🍳' },
    { id: 4, nombre: 'Luis Chef', avatar: '👨‍🍳' }
];

function inicializarCocineros() {
    const container = document.getElementById('cocineroChips');
    if (!container) return;
    
    container.innerHTML = cocineros.map(cocinero => `
        <div class="cocinero-chip" onclick="seleccionarCocinero(${cocinero.id})">
            <span class="chip-avatar">${cocinero.avatar}</span>
            <span class="chip-name">${cocinero.nombre}</span>
        </div>
    `).join('');
}

function seleccionarCocinero(id) {
    document.querySelectorAll('.cocinero-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    cocineroActivo = cocineros.find(c => c.id === id);
    mostrarToast(`👋 Hola, ${cocineroActivo.nombre}!`, 'success');
}

function renderizarPedidos() {
    const container = document.getElementById('colaPedidos');
    if (!container) return;
    
    const filtroActivo = document.querySelector('.filtro-btn.active')?.dataset.filtro || 'todos';
    
    let pedidosFiltrados = filtroActivo === 'todos' 
        ? pedidos 
        : pedidos.filter(p => p.estado === filtroActivo);
    
    // Actualizar contadores
    actualizarContadores();
    
    if (pedidosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span style="font-size: 4rem;">📋</span>
                <p>No hay pedidos ${filtroActivo !== 'todos' ? 'en ' + filtroActivo : ''}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pedidosFiltrados.map(crearCardPedido).join('');
}

function crearCardPedido(pedido) {
    const estadoClass = {
        'pendiente': 'pedido-pendiente',
        'tomado': 'pedido-tomado',
        'listo': 'pedido-listo',
        'despachado': 'pedido-despachado'
    }[pedido.estado];
    
    const estadoTexto = {
        'pendiente': '🕐 Pendiente',
        'tomado': '👨‍🍳 En Proceso',
        'listo': '✅ Listo',
        'despachado': '🚀 Despachado'
    }[pedido.estado];
    
    const acciones = generarAccionesPedido(pedido);
    
    return `
        <div class="pedido-card ${estadoClass}">
            <div class="pedido-header">
                <div class="pedido-mesa">Mesa ${pedido.mesa}</div>
                <div class="pedido-hora">${pedido.hora}</div>
            </div>
            <div class="pedido-estado">${estadoTexto}</div>
            <div class="pedido-platos">
                ${pedido.platos.map(plato => `<div class="plato-item">• ${plato}</div>`).join('')}
            </div>
            ${pedido.cocinero ? `<div class="pedido-cocinero">👨‍🍳 ${pedido.cocinero.nombre}</div>` : ''}
            <div class="pedido-acciones">${acciones}</div>
        </div>
    `;
}

function generarAccionesPedido(pedido) {
    switch(pedido.estado) {
        case 'pendiente':
            return `<button class="btn-accion btn-tomar" onclick="tomarPedido(${pedido.id})">Tomar Pedido</button>`;
        case 'tomado':
            return `<button class="btn-accion btn-listo" onclick="marcarListo(${pedido.id})">Marcar Listo</button>`;
        case 'listo':
            return `<button class="btn-accion btn-despachar" onclick="despacharPedido(${pedido.id})">Despachar</button>`;
        case 'despachado':
            return `<button class="btn-accion btn-eliminar" onclick="eliminarPedido(${pedido.id})">Eliminar</button>`;
        default:
            return '';
    }
}

function tomarPedido(id) {
    if (!cocineroActivo) {
        mostrarToast('⚠️ Primero selecciona tu nombre arriba', 'warning');
        return;
    }
    
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estado = 'tomado';
        pedido.cocinero = cocineroActivo;
        guardarTodosDatos();
        renderizarPedidos();
        cargarDashboard();
        mostrarToast(`✅ Pedido tomado por ${cocineroActivo.nombre}`, 'success');
    }
}

function marcarListo(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estado = 'listo';
        guardarTodosDatos();
        renderizarPedidos();
        cargarDashboard();
        mostrarToast('✅ Pedido marcado como listo', 'success');
    }
}

function despacharPedido(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estado = 'despachado';
        guardarTodosDatos();
        renderizarPedidos();
        cargarDashboard();
        mostrarToast('🚀 Pedido despachado', 'success');
    }
}

function eliminarPedido(id) {
    if (confirm('¿Eliminar este pedido del historial?')) {
        pedidos = pedidos.filter(p => p.id !== id);
        guardarTodosDatos();
        renderizarPedidos();
        cargarDashboard();
        mostrarToast('🗑️ Pedido eliminado', 'info');
    }
}

function simularNuevoPedido() {
    const platosDisponibles = [
        'Lomo Saltado', 'Ají de Gallina', 'Ceviche', 'Arroz con Pollo',
        'Anticuchos', 'Papa a la Huancaína', 'Causa Limeña', 'Tacu Tacu'
    ];
    
    const nuevoPedido = {
        id: Date.now(),
        mesa: Math.floor(Math.random() * 15) + 1,
        platos: [
            platosDisponibles[Math.floor(Math.random() * platosDisponibles.length)],
            platosDisponibles[Math.floor(Math.random() * platosDisponibles.length)]
        ],
        estado: 'pendiente',
        hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        cocinero: null
    };
    
    pedidos.unshift(nuevoPedido);
    guardarTodosDatos();
    renderizarPedidos();
    cargarDashboard();
    mostrarToast('🔔 Nuevo pedido recibido', 'info');
}

function actualizarContadores() {
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const proceso = pedidos.filter(p => p.estado === 'tomado').length;
    const listos = pedidos.filter(p => p.estado === 'listo').length;
    
    const countPend = document.getElementById('countPend');
    const countProc = document.getElementById('countProc');
    const countList = document.getElementById('countList');
    const badgePedidos = document.getElementById('badgePedidos');
    
    if (countPend) countPend.textContent = pendientes;
    if (countProc) countProc.textContent = proceso;
    if (countList) countList.textContent = listos;
    if (badgePedidos) badgePedidos.textContent = pendientes;
}

// ============================================
// SECCIÓN MOZOS
// ============================================

function renderizarMesas() {
    const container = document.getElementById('mesasLayout');
    if (!container) return;
    
    container.innerHTML = mesas.map(mesa => `
        <div class="mesa-card mesa-${mesa.estado}" onclick="verDetalleMesa(${mesa.numero})">
            <div class="mesa-numero">Mesa ${mesa.numero}</div>
            <div class="mesa-capacidad">${mesa.capacidad} personas</div>
            <div class="mesa-estado-badge">${obtenerIconoEstadoMesa(mesa.estado)} ${mesa.estado}</div>
        </div>
    `).join('');
    
    actualizarSelectMesas();
}

function obtenerIconoEstadoMesa(estado) {
    return {
        'libre': '✓',
        'ocupada': '👥',
        'reservada': '🔒'
    }[estado] || '';
}

function verDetalleMesa(numero) {
    const mesa = mesas.find(m => m.numero === numero);
    if (!mesa) return;
    
    const modal = document.getElementById('mesaModalOverlay');
    const titulo = document.getElementById('mesaModalTitle');
    const body = document.getElementById('mesaModalBody');
    
    titulo.textContent = `Mesa ${mesa.numero}`;
    
    body.innerHTML = `
        <div class="mesa-detalle">
            <div class="detalle-info">
                <p><strong>Capacidad:</strong> ${mesa.capacidad} personas</p>
                <p><strong>Estado:</strong> ${mesa.estado}</p>
                ${mesa.mozo ? `<p><strong>Mozo asignado:</strong> ${mesa.mozo}</p>` : ''}
            </div>
            
            <div class="detalle-acciones">
                <button class="btn-primary" onclick="cambiarEstadoMesa(${mesa.numero}, 'ocupada')">Ocupar</button>
                <button class="btn-secondary" onclick="cambiarEstadoMesa(${mesa.numero}, 'reservada')">Reservar</button>
                <button class="btn-outline" onclick="cambiarEstadoMesa(${mesa.numero}, 'libre')">Liberar</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function cambiarEstadoMesa(numero, nuevoEstado) {
    const mesa = mesas.find(m => m.numero === numero);
    if (mesa) {
        mesa.estado = nuevoEstado;
        guardarTodosDatos();
        renderizarMesas();
        cerrarMesaModal();
        cargarDashboard();
        mostrarToast(`Mesa ${numero} marcada como ${nuevoEstado}`, 'success');
    }
}

function cerrarMesaModal() {
    document.getElementById('mesaModalOverlay').style.display = 'none';
}

function actualizarSelectMesas() {
    const select = document.getElementById('selectMesaPedido');
    if (!select) return;
    
    const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada');
    
    select.innerHTML = '<option value="">— Elegir mesa ocupada —</option>' +
        mesasOcupadas.map(m => `<option value="${m.numero}">Mesa ${m.numero}</option>`).join('');
}

function renderPedidoMesa() {
    const select = document.getElementById('selectMesaPedido');
    const numero = parseInt(select.value);
    const area = document.getElementById('pedidoMesaArea');
    
    if (!numero || !area) return;
    
    const mesa = mesas.find(m => m.numero === numero);
    
    if (!mesa || !mesa.pedidos || mesa.pedidos.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <span>🍽️</span>
                <p>Esta mesa no tiene pedidos aún</p>
                <button class="btn-primary" onclick="mostrarToast('Función en desarrollo', 'info')">Tomar Pedido</button>
            </div>
        `;
        return;
    }
    
    const total = mesa.pedidos.reduce((sum, p) => sum + p.precio, 0);
    
    area.innerHTML = `
        <div class="pedidos-mesa">
            <div class="pedidos-header">
                <h3>Pedidos de Mesa ${numero}</h3>
                <button class="btn-primary btn-sm" onclick="mostrarToast('Función en desarrollo', 'info')">+ Nuevo Pedido</button>
            </div>
            <div class="pedidos-lista">
                ${mesa.pedidos.map((pedido, index) => `
                    <div class="pedido-item">
                        <div class="pedido-plato">${pedido.plato}</div>
                        <div class="pedido-precio">S/. ${pedido.precio.toFixed(2)}</div>
                        <button class="btn-eliminar" onclick="eliminarPedidoMesa(${numero}, ${index})">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="pedidos-total">
                <strong>Total:</strong> S/. ${total.toFixed(2)}
            </div>
        </div>
    `;
}

function eliminarPedidoMesa(numero, index) {
    const mesa = mesas.find(m => m.numero === numero);
    if (mesa && mesa.pedidos) {
        mesa.pedidos.splice(index, 1);
        guardarTodosDatos();
        renderPedidoMesa();
        mostrarToast('Pedido eliminado', 'success');
    }
}

function renderizarCarta() {
    const container = document.getElementById('cartaGrid');
    if (!container) return;
    
    const searchPlato = document.getElementById('searchPlato');
    const filtroCategoria = document.getElementById('filtroCategoria');
    
    const filtro = filtroCategoria ? filtroCategoria.value : 'todos';
    const busqueda = searchPlato ? searchPlato.value.toLowerCase() : '';
    
    let cartaFiltrada = carta;
    
    if (filtro !== 'todos') {
        cartaFiltrada = cartaFiltrada.filter(p => p.categoria === filtro);
    }
    
    if (busqueda) {
        cartaFiltrada = cartaFiltrada.filter(p => p.nombre.toLowerCase().includes(busqueda));
    }
    
    container.innerHTML = cartaFiltrada.map(plato => `
        <div class="plato-card ${!plato.disponible ? 'no-disponible' : ''}">
            <div class="plato-nombre">${plato.nombre}</div>
            <div class="plato-categoria">${plato.categoria}</div>
            <div class="plato-precio">S/. ${plato.precio.toFixed(2)}</div>
            <div class="plato-estado">
                ${plato.disponible ? '✓ Disponible' : '✗ No disponible'}
            </div>
        </div>
    `).join('');
}

function renderizarAsistencia() {
    const tbody = document.getElementById('bodyAsistencia');
    if (!tbody) return;
    
    tbody.innerHTML = asistencia.map(persona => `
        <tr>
            <td>${persona.nombre}</td>
            <td>${persona.cargo}</td>
            <td>${persona.entrada || '—'}</td>
            <td>${persona.salida || '—'}</td>
            <td><span class="badge badge-${persona.estado}">${persona.estado}</span></td>
            <td>
                <button class="btn-table" onclick="marcarEntrada(${persona.id})">Entrada</button>
                <button class="btn-table" onclick="marcarSalida(${persona.id})">Salida</button>
            </td>
        </tr>
    `).join('');
}

function marcarEntrada(id) {
    const persona = asistencia.find(p => p.id === id);
    if (persona) {
        const ahora = new Date();
        persona.entrada = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        persona.estado = 'presente';
        guardarTodosDatos();
        renderizarAsistencia();
        cargarDashboard();
        mostrarToast(`Entrada registrada para ${persona.nombre}`, 'success');
    }
}

function marcarSalida(id) {
    const persona = asistencia.find(p => p.id === id);
    if (persona && persona.entrada) {
        const ahora = new Date();
        persona.salida = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        guardarTodosDatos();
        renderizarAsistencia();
        cargarDashboard();
        mostrarToast(`Salida registrada para ${persona.nombre}`, 'success');
    } else {
        mostrarToast('Primero debe marcar la entrada', 'warning');
    }
}

// ============================================
// MODALES
// ============================================

function abrirModal(tipo) {
    mostrarToast('Función en desarrollo', 'info');
}

function cerrarModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// ============================================
// DATOS DE EJEMPLO
// ============================================

function generarPedidosEjemplo() {
    return [
        {
            id: 1,
            mesa: 5,
            platos: ['Lomo Saltado', 'Ají de Gallina'],
            estado: 'pendiente',
            hora: '12:30',
            cocinero: null
        },
        {
            id: 2,
            mesa: 8,
            platos: ['Ceviche', 'Arroz con Pollo'],
            estado: 'pendiente',
            hora: '12:35',
            cocinero: null
        },
        {
            id: 3,
            mesa: 3,
            platos: ['Anticuchos', 'Papa a la Huancaína'],
            estado: 'tomado',
            hora: '12:25',
            cocinero: cocineros[0]
        }
    ];
}

function generarMesasEjemplo() {
    const estados = ['libre', 'ocupada', 'reservada'];
    const mesasEjemplo = [];
    
    for (let i = 1; i <= 15; i++) {
        mesasEjemplo.push({
            numero: i,
            capacidad: i <= 8 ? 4 : 6,
            estado: estados[Math.floor(Math.random() * estados.length)],
            mozo: null,
            pedidos: []
        });
    }
    
    return mesasEjemplo;
}

function generarCartaEjemplo() {
    return [
        { id: 1, nombre: 'Lomo Saltado', categoria: 'Fondos', precio: 25.00, disponible: true },
        { id: 2, nombre: 'Ají de Gallina', categoria: 'Fondos', precio: 22.00, disponible: true },
        { id: 3, nombre: 'Ceviche', categoria: 'Entradas', precio: 28.00, disponible: true },
        { id: 4, nombre: 'Papa a la Huancaína', categoria: 'Entradas', precio: 12.00, disponible: true },
        { id: 5, nombre: 'Suspiro Limeño', categoria: 'Postres', precio: 10.00, disponible: true },
        { id: 6, nombre: 'Chicha Morada', categoria: 'Bebidas', precio: 6.00, disponible: true }
    ];
}

function generarAsistenciaEjemplo() {
    return [
        { id: 1, nombre: 'Juan Chef', cargo: 'Cocinero', entrada: '08:00', salida: null, estado: 'presente' },
        { id: 2, nombre: 'Ana Mesera', cargo: 'Mozo', entrada: '09:00', salida: null, estado: 'presente' },
        { id: 3, nombre: 'Luis Mozo', cargo: 'Mozo', entrada: null, salida: null, estado: 'ausente' }
    ];
}

// ============================================
// GUARDAR DATOS
// ============================================

function guardarTodosDatos() {
    localStorage.setItem('pedidosSaborCasero', JSON.stringify(pedidos));
    localStorage.setItem('mesasSaborCasero', JSON.stringify(mesas));
    localStorage.setItem('cartaSaborCasero', JSON.stringify(carta));
    localStorage.setItem('asistenciaSaborCasero', JSON.stringify(asistencia));
}

// ============================================
// UTILIDADES
// ============================================

function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = mensaje;
        toast.className = `toast toast-${tipo} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ============================================
// EXPONER FUNCIONES GLOBALES
// ============================================

window.navegarASeccion = navegarASeccion;
window.goTo = goTo;
window.cerrarSesion = cerrarSesion;
window.seleccionarCocinero = seleccionarCocinero;
window.tomarPedido = tomarPedido;
window.marcarListo = marcarListo;
window.despacharPedido = despacharPedido;
window.eliminarPedido = eliminarPedido;
window.simularNuevoPedido = simularNuevoPedido;
window.verDetalleMesa = verDetalleMesa;
window.cambiarEstadoMesa = cambiarEstadoMesa;
window.cerrarMesaModal = cerrarMesaModal;
window.renderPedidoMesa = renderPedidoMesa;
window.eliminarPedidoMesa = eliminarPedidoMesa;
window.marcarEntrada = marcarEntrada;
window.marcarSalida = marcarSalida;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;