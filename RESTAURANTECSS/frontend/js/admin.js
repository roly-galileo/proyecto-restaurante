/* ============================================
   SABOR CASERO – ADMIN.JS
   ============================================ */
'use strict';

// ============ DATOS BASE ============
const COCINEROS = [
    { id: 1, nombre: 'Mario Quispe',    emoji: '👨‍🍳' },
    { id: 2, nombre: 'Rosa Mamani',     emoji: '👩‍🍳' },
    { id: 3, nombre: 'Jesús Condori',   emoji: '👨‍🍳' },
    { id: 4, nombre: 'Pedro Ttito',     emoji: '👨‍🍳' },
    { id: 5, nombre: 'Carmen Inca',     emoji: '👩‍🍳' },
];

let cocineroActivo = null;  // id del cocinero seleccionado

// ---- Pedidos en cola ----
let pedidos = [
    { id: 'P001', mesa: 'Mesa 1',  mozo: 'Carlos S.',  items: [{ plato: 'Lomo Saltado', cant: 2, nota: '' }, { plato: 'Inca Kola', cant: 2, nota: '' }],  estado: 'pendiente',  cocineros: [],       inicio: minutosAtras(3)  },
    { id: 'P002', mesa: 'Mesa 4',  mozo: 'José H.',    items: [{ plato: 'Ají de Gallina', cant: 1, nota: 'sin pimienta' }, { plato: 'Chicha', cant: 1, nota: '' }], estado: 'tomado',     cocineros: [2],      inicio: minutosAtras(8)  },
    { id: 'P003', mesa: 'Mesa 6',  mozo: 'José H.',    items: [{ plato: 'Caldo de Cordero', cant: 3, nota: '' }],         estado: 'listo',      cocineros: [1, 3],   inicio: minutosAtras(15) },
    { id: 'P004', mesa: 'Mesa 9',  mozo: 'Edwin P.',   items: [{ plato: 'Causa Rellena', cant: 2, nota: '' }, { plato: 'Agua', cant: 2, nota: '' }],          estado: 'tomado',     cocineros: [1],      inicio: minutosAtras(6)  },
    { id: 'P005', mesa: 'Mesa 11', mozo: 'Ana L.',     items: [{ plato: 'Sopa de Maní', cant: 2, nota: '' }],            estado: 'pendiente',  cocineros: [],       inicio: minutosAtras(1)  },
    { id: 'P006', mesa: 'Mesa 15', mozo: 'Milagros C.',items: [{ plato: 'Arroz con Leche', cant: 3, nota: '' }],         estado: 'despachado', cocineros: [2, 5],   inicio: minutosAtras(22) },
    { id: 'P007', mesa: 'Mesa 17', mozo: 'Edwin P.',   items: [{ plato: 'Chicharrón', cant: 2, nota: 'bien crocante' }], estado: 'tomado',     cocineros: [3],      inicio: minutosAtras(11) },
];

let filtroActivo = 'todos';
let pedidoCounter = 8;

// ---- Mesas ----
let mesas = [
    { num: 1,  estado: 'ocupada',  personas: 4, mozo: 'Carlos S.',  reservaHora: null },
    { num: 2,  estado: 'libre',    personas: 0, mozo: 'Carlos S.',  reservaHora: null },
    { num: 3,  estado: 'reservada',personas: 2, mozo: 'Carlos S.',  reservaHora: '13:00' },
    { num: 4,  estado: 'ocupada',  personas: 3, mozo: 'José H.',    reservaHora: null },
    { num: 5,  estado: 'libre',    personas: 0, mozo: 'José H.',    reservaHora: null },
    { num: 6,  estado: 'ocupada',  personas: 6, mozo: 'José H.',    reservaHora: null },
    { num: 7,  estado: 'libre',    personas: 0, mozo: 'Edwin P.',   reservaHora: null },
    { num: 8,  estado: 'reservada',personas: 4, mozo: 'Edwin P.',   reservaHora: '14:00' },
    { num: 9,  estado: 'ocupada',  personas: 2, mozo: 'Edwin P.',   reservaHora: null },
    { num: 10, estado: 'libre',    personas: 0, mozo: 'Luis M.',    reservaHora: null },
    { num: 11, estado: 'ocupada',  personas: 5, mozo: 'Ana L.',     reservaHora: null },
    { num: 12, estado: 'libre',    personas: 0, mozo: 'Ana L.',     reservaHora: null },
    { num: 13, estado: 'libre',    personas: 0, mozo: 'Sandra C.',  reservaHora: null },
    { num: 14, estado: 'reservada',personas: 8, mozo: 'Sandra C.',  reservaHora: '13:30' },
    { num: 15, estado: 'ocupada',  personas: 3, mozo: 'Milagros C.',reservaHora: null },
    { num: 16, estado: 'libre',    personas: 0, mozo: 'Milagros C.',reservaHora: null },
    { num: 17, estado: 'ocupada',  personas: 2, mozo: 'Milagros C.',reservaHora: null },
    { num: 18, estado: 'libre',    personas: 0, mozo: 'Fátima C.',  reservaHora: null },
    { num: 19, estado: 'reservada',personas: 6, mozo: 'Fátima C.',  reservaHora: '14:30' },
    { num: 20, estado: 'libre',    personas: 0, mozo: 'Fátima C.',  reservaHora: null },
];

// pedidos por mesa (para mozos)
let pedidosPorMesa = {
    1:  [{ plato: 'Lomo Saltado', cant: 2, precio: 28.00 }, { plato: 'Inca Kola', cant: 2, precio: 5.00 }],
    4:  [{ plato: 'Ají de Gallina', cant: 1, precio: 24.00 }, { plato: 'Chicha', cant: 1, precio: 4.50 }],
    6:  [{ plato: 'Caldo de Cordero', cant: 3, precio: 22.00 }, { plato: 'Chicha Morada', cant: 3, precio: 5.00 }],
    9:  [{ plato: 'Causa Rellena', cant: 2, precio: 18.00 }, { plato: 'Agua', cant: 2, precio: 3.00 }],
    11: [{ plato: 'Sopa de Maní', cant: 2, precio: 20.00 }, { plato: 'Trucha a la Plancha', cant: 2, precio: 30.00 }],
    15: [{ plato: 'Chicharrón', cant: 3, precio: 26.00 }, { plato: 'Chicha', cant: 3, precio: 4.50 }],
    17: [{ plato: 'Arroz con Leche', cant: 2, precio: 12.00 }, { plato: 'Café', cant: 2, precio: 6.00 }],
};

// ---- Carta ----
let carta = [
    { id: 1, nombre: 'Caldo de Cordero',      categoria: 'Sopas',    precio: 22.00, desc: 'Caldo tradicional con papa y hierbas andinas', disponible: true  },
    { id: 2, nombre: 'Sopa de Maní',           categoria: 'Sopas',    precio: 20.00, desc: 'Sopa cremosa de maní con pollo y verduras',   disponible: true  },
    { id: 3, nombre: 'Lomo Saltado',           categoria: 'Fondos',   precio: 28.00, desc: 'Lomo de res salteado con tomate y papas fritas', disponible: true  },
    { id: 4, nombre: 'Ají de Gallina',         categoria: 'Fondos',   precio: 24.00, desc: 'Pollo en salsa de ají amarillo y nueces',     disponible: true  },
    { id: 5, nombre: 'Chicharrón de Cerdo',    categoria: 'Fondos',   precio: 26.00, desc: 'Trozos de cerdo fritos y crocantes',          disponible: true  },
    { id: 6, nombre: 'Trucha a la Plancha',    categoria: 'Fondos',   precio: 30.00, desc: 'Trucha fresca con arroz y ensalada',          disponible: true  },
    { id: 7, nombre: 'Causa Rellena',          categoria: 'Entradas', precio: 18.00, desc: 'Causa limeña rellena de pollo y mayonesa',   disponible: true  },
    { id: 8, nombre: 'Ceviche de Trucha',      categoria: 'Entradas', precio: 22.00, desc: 'Trucha marinada en limón con choclo y cancha',disponible: false },
    { id: 9, nombre: 'Arroz con Leche',        categoria: 'Postres',  precio: 10.00, desc: 'Postre tradicional con canela y leche evaporada', disponible: true },
    { id: 10, nombre: 'Mazamorra Morada',      categoria: 'Postres',  precio: 10.00, desc: 'Mazamorra de maíz morado con fruta',         disponible: true  },
    { id: 11, nombre: 'Chicha Morada',         categoria: 'Bebidas',  precio: 5.00,  desc: 'Bebida de maíz morado natural',               disponible: true  },
    { id: 12, nombre: 'Inca Kola',             categoria: 'Bebidas',  precio: 5.00,  desc: 'Bebida gaseosa',                              disponible: true  },
    { id: 13, nombre: 'Agua Mineral',          categoria: 'Bebidas',  precio: 3.00,  desc: 'Agua en botella 500ml',                       disponible: true  },
    { id: 14, nombre: 'Café Americano',        categoria: 'Bebidas',  precio: 6.00,  desc: 'Café de grano preparado al momento',          disponible: true  },
];

// ---- Asistencia ----
let asistencia = [
    { nombre: 'Mario Quispe',     cargo: 'Cocinero', entrada: '07:00', salida: '—',    estado: 'presente' },
    { nombre: 'Rosa Mamani',      cargo: 'Cocinera', entrada: '12:00', salida: '—',    estado: 'presente' },
    { nombre: 'Jesús Condori',    cargo: 'Cocinero', entrada: '07:18', salida: '—',    estado: 'tarde'    },
    { nombre: 'Carmen Inca',      cargo: 'Cocinera', entrada: '—',     salida: '—',    estado: 'ausente'  },
    { nombre: 'Carlos Soto',      cargo: 'Mozo',     entrada: '07:00', salida: '—',    estado: 'presente' },
    { nombre: 'Ana Lima',         cargo: 'Mozza',    entrada: '07:05', salida: '—',    estado: 'presente' },
    { nombre: 'José Huallpa',     cargo: 'Mozo',     entrada: '12:00', salida: '—',    estado: 'presente' },
    { nombre: 'Milagros Cutipa',  cargo: 'Mozza',    entrada: '12:02', salida: '—',    estado: 'presente' },
    { nombre: 'Edwin Pari',       cargo: 'Mozo',     entrada: '—',     salida: '—',    estado: 'ausente'  },
    { nombre: 'Lucía Huanca',     cargo: 'Cocinera', entrada: '—',     salida: '—',    estado: 'ausente'  },
];

// ---- Empleados ----
let empleados = [
    { nombre: 'Mario Quispe Huanca',   cargo: 'Cocinero', turno: 'Mañana', sueldo: 'S/. 1,400', estado: 'activo'   },
    { nombre: 'Rosa Mamani Ccori',     cargo: 'Cocinera', turno: 'Tarde',  sueldo: 'S/. 1,350', estado: 'activo'   },
    { nombre: 'Jesús Condori Apaza',   cargo: 'Cocinero', turno: 'Mañana', sueldo: 'S/. 1,300', estado: 'activo'   },
    { nombre: 'Lucía Huanca Flores',   cargo: 'Cocinera', turno: 'Tarde',  sueldo: 'S/. 1,300', estado: 'permiso'  },
    { nombre: 'Pedro Ttito Quispe',    cargo: 'Cocinero', turno: 'Mañana', sueldo: 'S/. 1,250', estado: 'activo'   },
    { nombre: 'Carmen Inca Molina',    cargo: 'Cocinera', turno: 'Noche',  sueldo: 'S/. 1,200', estado: 'activo'   },
    { nombre: 'Carlos Soto Puma',      cargo: 'Mozo',     turno: 'Mañana', sueldo: 'S/. 1,000', estado: 'activo'   },
    { nombre: 'Ana Lima Ramos',        cargo: 'Mozza',    turno: 'Mañana', sueldo: 'S/. 1,000', estado: 'activo'   },
    { nombre: 'José Huallpa Torres',   cargo: 'Mozo',     turno: 'Tarde',  sueldo: 'S/. 1,000', estado: 'activo'   },
    { nombre: 'Milagros Cutipa Chura', cargo: 'Mozza',    turno: 'Tarde',  sueldo: 'S/. 1,050', estado: 'activo'   },
    { nombre: 'Edwin Pari Callo',      cargo: 'Mozo',     turno: 'Noche',  sueldo: 'S/. 1,000', estado: 'activo'   },
    { nombre: 'Fátima Ccoa Velásquez', cargo: 'Mozza',    turno: 'Mañana', sueldo: 'S/. 1,050', estado: 'activo'   },
];

// ---- Reservas ----
let reservas = [
    { cliente: 'Sofía Merma Pinto',   fecha: '13/02/2026', hora: '13:00', personas: 2,  mesa: 3,  estado: 'confirmada' },
    { cliente: 'Familia Quispe',      fecha: '13/02/2026', hora: '13:30', personas: 8,  mesa: 14, estado: 'confirmada' },
    { cliente: 'Roberto Cárdenas',    fecha: '13/02/2026', hora: '14:00', personas: 4,  mesa: 8,  estado: 'pendiente'  },
    { cliente: 'Empresa Comercial',   fecha: '13/02/2026', hora: '14:30', personas: 6,  mesa: 19, estado: 'confirmada' },
    { cliente: 'Jorge Mamani López',  fecha: '14/02/2026', hora: '12:00', personas: 3,  mesa: 5,  estado: 'pendiente'  },
    { cliente: 'María Ramos Torres',  fecha: '14/02/2026', hora: '20:00', personas: 2,  mesa: 2,  estado: 'confirmada' },
    { cliente: 'Grupo Universitario', fecha: '15/02/2026', hora: '13:00', personas: 10, mesa: 6,  estado: 'cancelada'  },
];

let transacciones = [
    { hora: '11:15', mesa: 'Mesa 2',  mozo: 'Carlos S.',   total: 68.00,  metodo: 'Efectivo', estado: 'pagado'   },
    { hora: '11:42', mesa: 'Mesa 7',  mozo: 'Edwin P.',    total: 42.50,  metodo: 'Yape',     estado: 'pagado'   },
    { hora: '12:05', mesa: 'Mesa 10', mozo: 'Luis M.',     total: 115.00, metodo: 'Tarjeta',  estado: 'pagado'   },
    { hora: '12:20', mesa: 'Mesa 3',  mozo: 'Carlos S.',   total: 31.00,  metodo: 'Efectivo', estado: 'pagado'   },
    { hora: '12:35', mesa: 'Mesa 12', mozo: 'Ana L.',      total: 88.50,  metodo: 'Yape',     estado: 'pagado'   },
    { hora: '12:50', mesa: 'Mesa 16', mozo: 'Milagros C.', total: 54.00,  metodo: 'Efectivo', estado: 'pendiente'},
];

const actividadData = [
    { icon: '✅', texto: 'Mesa 2 pagada – S/. 68.00',          tiempo: 'Hace 5 min'  },
    { icon: '🆕', texto: 'Nueva reserva – Familia Quispe',      tiempo: 'Hace 12 min' },
    { icon: '🔥', texto: 'Pedido listo – Mesa 6',              tiempo: 'Hace 18 min' },
    { icon: '👨‍🍳', texto: 'Mario Quispe – Entrada registrada',  tiempo: 'Hace 1h'     },
    { icon: '📅', texto: 'Reserva confirmada – 14:00',          tiempo: 'Hace 1h 20m' },
];

const reporteData = {
    hoy:    { total: 'S/. 2,480', platos: 127, clientes: 48, ticket: 'S/. 51.67', chart: [320,410,590,680,750,490,240], labels: ['10am','11am','12pm','1pm','2pm','3pm','4pm'] },
    semana: { total: 'S/. 14,320', platos: 847, clientes: 312, ticket: 'S/. 45.90', chart: [1850,2100,1700,2400,2900,3200,2800], labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'] },
    mes:    { total: 'S/. 58,900', platos: 3480, clientes: 1290, ticket: 'S/. 45.66', chart: [18000,22000,19500,21000,24000,26000,19000,23000], labels: ['S1','S2','S3','S4','S5','S6','S7','S8'] },
};

// ============ HELPERS ============
function minutosAtras(min) { return Date.now() - min * 60 * 1000; }

function tiempoTranscurrido(ts) {
    const min = Math.floor((Date.now() - ts) / 60000);
    if (min < 1) return '< 1 min';
    return min + ' min';
}

function badge(estado) {
    const m = {
        activo: 'badge-activo', inactivo: 'badge-inactivo', permiso: 'badge-permiso',
        confirmada: 'badge-confirmada', pendiente: 'badge-pendiente', cancelada: 'badge-cancelada',
        pagado: 'badge-pagado',
    };
    return `<span class="status-badge ${m[estado] || ''}">${estado}</span>`;
}

function accionBtns(tipo, idx) {
    return `<button class="btn-icon-sm btn-edit" onclick="editarReg('${tipo}',${idx})">✏ Editar</button>
            <button class="btn-icon-sm btn-delete" onclick="eliminarReg('${tipo}',${idx})">🗑 Eliminar</button>`;
}

// ============ RELOJ ============
function updateDateTime() {
    const now  = new Date();
    const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('es-PE', opts);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${h}:${m}:${s}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ============ NAVEGACIÓN PRINCIPAL ============
const navItems  = document.querySelectorAll('.nav-item[data-section]');
const sections  = document.querySelectorAll('.content-section');

const sectionTitles = {
    dashboard:      { title: 'Dashboard General',      bc: 'Sabor Casero / Dashboard' },
    cocineros:      { title: 'Cola de Pedidos – Cocina', bc: 'Sabor Casero / Cocineros' },
    mozos:          { title: 'Panel de Sala',            bc: 'Sabor Casero / Mozos' },
    administracion: { title: 'Administración',          bc: 'Sabor Casero / Admin' },
};

function showSection(name) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(i => i.classList.remove('active'));
    const target = document.getElementById('section-' + name);
    if (target) target.classList.add('active');
    navItems.forEach(i => { if (i.dataset.section === name) i.classList.add('active'); });
    const info = sectionTitles[name] || { title: name, bc: '' };
    document.getElementById('pageTitle').textContent = info.title;
    document.getElementById('pageBreadcrumb').textContent = info.bc;
    closeSidebarMobile();
}

navItems.forEach(item => item.addEventListener('click', e => { e.preventDefault(); showSection(item.dataset.section); }));
function goTo(s) { showSection(s); }

// Sidebar toggle mobile
const sidebar       = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
function closeSidebarMobile() { if (window.innerWidth <= 920) sidebar.classList.remove('open'); }

// ============ SUBTABS ============
document.querySelectorAll('.subtabs').forEach(group => {
    group.querySelectorAll('.subtab').forEach(tab => {
        tab.addEventListener('click', () => {
            group.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const parent = tab.closest('.content-section');
            parent.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
            const target = parent.querySelector('#' + tab.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
});

// ============ DASHBOARD ============
function renderDashboard() {
    const pend = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'tomado').length;
    const ocup = mesas.filter(m => m.estado === 'ocupada').length;
    const total = transacciones.reduce((s, t) => s + t.total, 0);
    const activos = asistencia.filter(a => a.estado === 'presente' || a.estado === 'tarde').length;

    document.getElementById('dashPedidosPend').textContent = pend;
    document.getElementById('dashMesasOcup').textContent   = ocup;
    document.getElementById('dashIngresos').textContent    = 'S/. ' + total.toFixed(2);
    document.getElementById('dashPersonal').textContent    = activos;

    // Badge sidebar
    document.getElementById('badgePedidos').textContent = pedidos.filter(p => p.estado === 'pendiente').length;

    // Mesas mini
    const grid = document.getElementById('dashMesas');
    grid.innerHTML = mesas.map(m => `<div class="mesa-mini ${m.estado}" title="Mesa ${m.num}">${m.num}</div>`).join('');

    // Orders live
    const live = document.getElementById('dashOrdersLive');
    const activos2 = pedidos.filter(p => p.estado !== 'despachado');
    if (activos2.length === 0) {
        live.innerHTML = '<div class="empty-state" style="padding:1.5rem"><span style="font-size:2rem">🎉</span><p>¡Sin pedidos pendientes!</p></div>';
    } else {
        live.innerHTML = activos2.map(p => {
            const mins = Math.floor((Date.now() - p.inicio) / 60000);
            return `<div class="order-live-card">
                <div class="order-live-top">
                    <span class="order-live-mesa">🪑 ${p.mesa}</span>
                    <span class="order-status status-${p.estado}">${p.estado}</span>
                </div>
                <div class="order-live-items">${p.items.map(i => `${i.cant}× ${i.plato}`).join(', ')}</div>
                <div class="order-live-footer">
                    <span class="order-live-time">⏱ ${mins} min</span>
                    <span style="font-size:.72rem;color:var(--text-light)">${p.mozo}</span>
                </div>
            </div>`;
        }).join('');
    }

    // Actividad
    const list = document.getElementById('activityList');
    list.innerHTML = actividadData.map(a => `
        <li><span>${a.icon}</span><span style="flex:1">${a.texto}</span><span class="act-time">${a.tiempo}</span></li>
    `).join('');
}

// ============ COCINEROS – COLA ============
function renderChipsCocineros() {
    const cont = document.getElementById('cocineroChips');
    cont.innerHTML = COCINEROS.map(c => `
        <div class="coc-chip ${cocineroActivo === c.id ? 'selected' : ''}" onclick="seleccionarCocinero(${c.id})">
            ${c.emoji} ${c.nombre}
        </div>
    `).join('');
}

function seleccionarCocinero(id) {
    cocineroActivo = (cocineroActivo === id) ? null : id;
    renderChipsCocineros();
    showToast(cocineroActivo ? `✅ Eres: ${COCINEROS.find(c=>c.id===id).nombre}` : 'Selección cancelada');
}

function renderCola() {
    const cont = document.getElementById('colaPedidos');
    const filtrados = filtroActivo === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtroActivo);

    document.getElementById('countPend').textContent = pedidos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('countProc').textContent = pedidos.filter(p => p.estado === 'tomado').length;
    document.getElementById('countList').textContent = pedidos.filter(p => p.estado === 'listo').length;
    document.getElementById('badgePedidos').textContent = pedidos.filter(p => p.estado === 'pendiente').length;

    if (filtrados.length === 0) {
        cont.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><p>No hay pedidos en este estado</p></div>`;
        return;
    }

    cont.innerHTML = filtrados.map(p => {
        const mins   = Math.floor((Date.now() - p.inicio) / 60000);
        const urgente = mins >= 15 && p.estado !== 'despachado';
        const cocNombres = p.cocineros.map(id => COCINEROS.find(c=>c.id===id)?.nombre || '').filter(Boolean);
        const yaTome = cocineroActivo && p.cocineros.includes(cocineroActivo);

        // ---- BOTONES según estado ----
        let botones = '';
        if (p.estado === 'pendiente') {
            botones = `<button class="btn-accion btn-tomar" onclick="tomarPedido('${p.id}')">👨‍🍳 Tomar Pedido</button>`;
        } else if (p.estado === 'tomado') {
            if (!yaTome) {
                botones += `<button class="btn-accion btn-tomar" onclick="unirseAPedido('${p.id}')">🤝 Unirse al Pedido</button>`;
            }
            botones += `<button class="btn-accion btn-listo" onclick="marcarListo('${p.id}')">✅ Marcar Listo</button>`;
        } else if (p.estado === 'listo') {
            botones += `<button class="btn-accion btn-despachar" onclick="despacharPedido('${p.id}')">🚀 Despachar</button>`;
        } else if (p.estado === 'despachado') {
            botones = `<span class="pedido-msg">✅ Despachado</span>`;
        }

        return `<div class="pedido-card estado-${p.estado}">
            <div class="pedido-card-header">
                <div class="pedido-info">
                    <div class="pedido-mesa">🪑 ${p.mesa}</div>
                    <div class="pedido-id">#${p.id} · Mozo: ${p.mozo}</div>
                </div>
                <div class="pedido-timer ${urgente ? 'urgente' : ''}">⏱ ${mins} min</div>
            </div>
            <div class="pedido-items">
                ${p.items.map(i => `
                    <div class="pedido-item-row">
                        <span class="pi-cant">${i.cant}×</span>
                        <span>${i.plato}</span>
                        ${i.nota ? `<span class="pi-nota">· ${i.nota}</span>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="pedido-cocineros">
                <div class="cocineros-label">${cocNombres.length ? 'Cocinando:' : 'Sin asignar'}</div>
                <div class="cocineros-asignados">
                    ${cocNombres.map(n => `<span class="cocinero-tag">👨‍🍳 ${n}</span>`).join('')}
                    ${!cocNombres.length ? '<span style="font-size:.75rem;color:var(--text-light)">Nadie ha tomado este pedido aún</span>' : ''}
                </div>
            </div>
            <div class="pedido-acciones">
                ${botones}
                <span class="order-status status-${p.estado}" style="margin-left:auto">${p.estado}</span>
            </div>
        </div>`;
    }).join('');
}

function tomarPedido(id) {
    if (!cocineroActivo) { showToast('⚠ Primero selecciona tu nombre arriba'); return; }
    const p = pedidos.find(x => x.id === id);
    if (!p || p.estado !== 'pendiente') return;
    p.estado = 'tomado';
    if (!p.cocineros.includes(cocineroActivo)) p.cocineros.push(cocineroActivo);
    const nombre = COCINEROS.find(c=>c.id===cocineroActivo).nombre;
    showToast(`🔥 ${nombre} tomó ${p.id}`);
    actividadData.unshift({ icon: '👨‍🍳', texto: `${nombre} tomó ${p.mesa}`, tiempo: 'Ahora' });
    renderCola();
    renderDashboard();
}

function unirseAPedido(id) {
    if (!cocineroActivo) { showToast('⚠ Selecciona tu nombre primero'); return; }
    const p = pedidos.find(x => x.id === id);
    if (!p || p.cocineros.includes(cocineroActivo)) { showToast('⚠ Ya estás en este pedido'); return; }
    p.cocineros.push(cocineroActivo);
    const nombre = COCINEROS.find(c=>c.id===cocineroActivo).nombre;
    showToast(`🤝 ${nombre} se unió a ${p.id}`);
    renderCola();
}

function marcarListo(id) {
    const p = pedidos.find(x => x.id === id);
    if (!p) return;
    p.estado = 'listo';
    showToast(`✅ ${p.mesa} – pedido listo para despachar`);
    actividadData.unshift({ icon: '✅', texto: `Pedido listo – ${p.mesa}`, tiempo: 'Ahora' });
    renderCola();
    renderDashboard();
}

function despacharPedido(id) {
    const p = pedidos.find(x => x.id === id);
    if (!p) return;
    p.estado = 'despachado';
    showToast(`🚀 ${p.mesa} – pedido despachado al mozo`);
    actividadData.unshift({ icon: '🚀', texto: `Despachado – ${p.mesa}`, tiempo: 'Ahora' });
    renderCola();
    renderDashboard();
}

function simularNuevoPedido() {
    const mesasOcup = mesas.filter(m => m.estado === 'ocupada');
    const mesa = mesasOcup[Math.floor(Math.random() * mesasOcup.length)];
    const platosAleatorios = carta.filter(c=>c.disponible && c.categoria !== 'Bebidas');
    const plato1 = platosAleatorios[Math.floor(Math.random() * platosAleatorios.length)];
    const plato2 = platosAleatorios[Math.floor(Math.random() * platosAleatorios.length)];
    const id = 'P' + String(pedidoCounter++).padStart(3,'0');
    pedidos.unshift({
        id, mesa: mesa ? `Mesa ${mesa.num}` : 'Mesa 1',
        mozo: mesa?.mozo || 'Mozo',
        items: [{ plato: plato1.nombre, cant: 1, nota: '' }, { plato: plato2.nombre, cant: 1, nota: '' }],
        estado: 'pendiente', cocineros: [], inicio: Date.now(),
    });
    showToast(`🆕 Nuevo pedido: ${id}`);
    actividadData.unshift({ icon: '🆕', texto: `Nuevo pedido ${id} – ${mesa ? 'Mesa '+mesa.num : ''}`, tiempo: 'Ahora' });
    renderCola();
    renderDashboard();
}

// Filtros de cola
document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroActivo = btn.dataset.filtro;
        renderCola();
    });
});

// ============ MOZOS – MESAS ============
function renderMesas() {
    const layout = document.getElementById('mesasLayout');
    layout.innerHTML = mesas.map(m => {
        const extra = m.estado === 'ocupada'   ? `${m.personas} personas`  :
                      m.estado === 'reservada' ? `Res. ${m.reservaHora}`  : 'Libre';
        let bts = '';
        if (m.estado === 'libre')    bts = `<button class="btn-mesa-sm btn-mesa-abrir"  onclick="abrirMesa(${m.num})">Abrir</button>`;
        if (m.estado === 'ocupada')  bts = `<button class="btn-mesa-sm btn-mesa-cerrar" onclick="cerrarMesa(${m.num})">Cerrar</button>
                                            <button class="btn-mesa-sm btn-mesa-ver"   onclick="verPedidoMesa(${m.num})">Ver</button>`;
        if (m.estado === 'reservada') bts = `<button class="btn-mesa-sm btn-mesa-abrir" onclick="abrirMesa(${m.num})">Recibir</button>`;
        return `<div class="mesa-card ${m.estado}">
            <div class="mesa-num">M${m.num}</div>
            <div class="mesa-info">${extra}</div>
            <div class="mesa-mozo">${m.mozo}</div>
            <div class="mesa-actions">${bts}</div>
        </div>`;
    }).join('');
}

function abrirMesa(num) {
    abrirModal('abrirMesa', num);
}

function cerrarMesa(num) {
    if (!confirm(`¿Cerrar Mesa ${num} y generar cuenta?`)) return;
    const mesa = mesas.find(m=>m.num===num);
    mesa.estado = 'libre';
    mesa.personas = 0;
    // Registrar transacción
    const items = pedidosPorMesa[num] || [];
    const total = items.reduce((s,i) => s + i.precio * i.cant, 0);
    if (total > 0) {
        const now = new Date();
        transacciones.unshift({ hora: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`, mesa: `Mesa ${num}`, mozo: mesa.mozo, total, metodo: 'Efectivo', estado: 'pagado' });
    }
    delete pedidosPorMesa[num];
    showToast(`✅ Mesa ${num} cerrada – S/. ${total.toFixed(2)}`);
    actividadData.unshift({ icon: '💰', texto: `Mesa ${num} cerrada – S/. ${total.toFixed(2)}`, tiempo: 'Ahora' });
    renderMesas();
    renderDashboard();
    poblarSelectMesa();
}

function verPedidoMesa(num) {
    showSection('mozos');
    // Activar sub-tab de pedidos
    document.querySelectorAll('#section-mozos .subtab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('#section-mozos .subtab-content').forEach(c=>c.classList.remove('active'));
    document.querySelector('#section-mozos .subtab[data-tab="moz-pedidos"]').classList.add('active');
    document.getElementById('moz-pedidos').classList.add('active');
    document.getElementById('selectMesaPedido').value = num;
    renderPedidoMesa();
}

// ============ MOZOS – PEDIDOS POR MESA ============
function poblarSelectMesa() {
    const sel = document.getElementById('selectMesaPedido');
    const ocupadas = mesas.filter(m => m.estado === 'ocupada');
    sel.innerHTML = '<option value="">— Elegir mesa ocupada —</option>' +
        ocupadas.map(m => `<option value="${m.num}">Mesa ${m.num} (${m.personas} pers.) – ${m.mozo}</option>`).join('');
}

function renderPedidoMesa() {
    const area = document.getElementById('pedidoMesaArea');
    const numStr = document.getElementById('selectMesaPedido').value;
    if (!numStr) { area.innerHTML = '<div class="empty-state"><span>🪑</span><p>Selecciona una mesa para ver sus pedidos</p></div>'; return; }
    const num = parseInt(numStr);
    if (!pedidosPorMesa[num]) pedidosPorMesa[num] = [];
    const items = pedidosPorMesa[num];
    const total = items.reduce((s,i) => s + i.precio * i.cant, 0);

    const listaRows = items.length ? items.map((it, idx) => `
        <div class="pedido-lista-row">
            <span class="pl-qty">${it.cant}×</span>
            <span class="pl-name">${it.plato}</span>
            <span class="pl-price">S/. ${(it.precio * it.cant).toFixed(2)}</span>
            <button class="pl-del" onclick="quitarItemMesa(${num},${idx})">🗑</button>
        </div>
    `).join('') : '<p style="color:var(--text-light);font-size:.85rem;text-align:center;padding:1rem">Sin ítems aún</p>';

    const cartaMini = carta.filter(c=>c.disponible).map(c => `
        <div class="carta-mini-item" onclick="agregarItemMesa(${num}, '${c.nombre}', ${c.precio})">
            <span class="cmi-name">${c.nombre}</span>
            <span class="cmi-price">S/. ${c.precio.toFixed(2)}</span>
            <button class="cmi-add">+</button>
        </div>
    `).join('');

    area.innerHTML = `
        <div class="pedido-mesa-wrapper">
            <div class="pedido-lista-card">
                <div class="pedido-lista-title">🍽 Pedido – Mesa ${num}</div>
                ${listaRows}
                <div class="pedido-total-row">
                    <span>Total</span>
                    <span>S/. ${total.toFixed(2)}</span>
                </div>
                <div class="pedido-acciones-row">
                    <button class="btn-primary btn-sm" onclick="enviarACocina(${num})">🔥 Enviar a Cocina</button>
                    <button class="btn-secondary" onclick="cerrarMesa(${num})">💰 Cerrar y Cobrar</button>
                </div>
            </div>
            <div class="agregar-plato-card">
                <div class="agregar-plato-title">📋 Agregar de la Carta</div>
                <div class="carta-mini-list">${cartaMini}</div>
            </div>
        </div>
    `;
}

function agregarItemMesa(num, nombre, precio) {
    if (!pedidosPorMesa[num]) pedidosPorMesa[num] = [];
    const exist = pedidosPorMesa[num].find(i => i.plato === nombre);
    if (exist) { exist.cant++; }
    else { pedidosPorMesa[num].push({ plato: nombre, cant: 1, precio }); }
    showToast(`✅ Agregado: ${nombre}`);
    renderPedidoMesa();
}

function quitarItemMesa(num, idx) {
    pedidosPorMesa[num].splice(idx, 1);
    renderPedidoMesa();
}

function enviarACocina(num) {
    const items = pedidosPorMesa[num] || [];
    if (!items.length) { showToast('⚠ No hay ítems en el pedido'); return; }
    const id = 'P' + String(pedidoCounter++).padStart(3,'0');
    const mesa = mesas.find(m=>m.num===num);
    pedidos.unshift({
        id, mesa: `Mesa ${num}`, mozo: mesa?.mozo || 'Mozo',
        items: items.map(i => ({ plato: i.plato, cant: i.cant, nota: '' })),
        estado: 'pendiente', cocineros: [], inicio: Date.now(),
    });
    showToast(`🔥 Pedido ${id} enviado a cocina`);
    actividadData.unshift({ icon: '🔥', texto: `Pedido enviado – Mesa ${num}`, tiempo: 'Ahora' });
    renderCola();
    renderDashboard();
}

// ============ MOZOS – CARTA ============
function renderCarta(data) {
    const grid = document.getElementById('cartaGrid');
    if (!data.length) { grid.innerHTML = '<div class="empty-state"><span>🍽</span><p>No hay platos para mostrar</p></div>'; return; }
    grid.innerHTML = data.map(c => `
        <div class="carta-card">
            <span class="carta-badge-disponible ${c.disponible ? 'disponible-si' : 'disponible-no'}">${c.disponible ? 'Disponible' : 'Agotado'}</span>
            <div class="carta-categoria">${c.categoria}</div>
            <div class="carta-nombre">${c.nombre}</div>
            <div class="carta-desc">${c.desc}</div>
            <div class="carta-precio">S/. ${c.precio.toFixed(2)}</div>
            <div class="carta-acciones">
                <button class="btn-icon-sm btn-edit" onclick="editarPlato(${c.id})">✏ Editar</button>
                <button class="btn-icon-sm ${c.disponible ? 'btn-delete' : 'btn-edit'}" onclick="toggleDisponible(${c.id})">${c.disponible ? '🚫 Agotar' : '✅ Activar'}</button>
            </div>
        </div>
    `).join('');
}

function filtrarCarta() {
    const q    = document.getElementById('searchPlato').value.toLowerCase();
    const cat  = document.getElementById('filtroCategoria').value;
    let data   = carta;
    if (cat !== 'todos') data = data.filter(c => c.categoria === cat);
    if (q) data = data.filter(c => c.nombre.toLowerCase().includes(q));
    renderCarta(data);
}
document.getElementById('searchPlato').addEventListener('input', filtrarCarta);
document.getElementById('filtroCategoria').addEventListener('change', filtrarCarta);

function toggleDisponible(id) {
    const plato = carta.find(c=>c.id===id);
    if (!plato) return;
    plato.disponible = !plato.disponible;
    showToast(`${plato.disponible ? '✅ Activado' : '🚫 Agotado'}: ${plato.nombre}`);
    filtrarCarta();
}

function editarPlato(id) {
    const p = carta.find(c=>c.id===id);
    if (!p) return;
    document.getElementById('modalTitle').textContent = '✏ Editar Plato';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-row">
            <div class="form-group"><label>Nombre</label><input type="text" id="ep_nombre" value="${p.nombre}"></div>
            <div class="form-group"><label>Categoría</label>
            <select id="ep_cat">${['Entradas','Sopas','Fondos','Postres','Bebidas'].map(c=>`<option ${c===p.categoria?'selected':''}>${c}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label>Descripción</label><textarea id="ep_desc" rows="2">${p.desc}</textarea></div>
        <div class="form-row">
            <div class="form-group"><label>Precio (S/.)</label><input type="number" id="ep_precio" value="${p.precio}" step="0.50"></div>
            <div class="form-group"><label>Disponible</label>
            <select id="ep_disp"><option value="1" ${p.disponible?'selected':''}>Sí</option><option value="0" ${!p.disponible?'selected':''}>No</option></select></div>
        </div>
        <div class="modal-actions">
            <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn-primary" onclick="guardarPlato(${id})">Guardar Cambios</button>
        </div>
    `;
    document.getElementById('modalOverlay').classList.add('open');
}

function guardarPlato(id) {
    const p = carta.find(c=>c.id===id);
    if (!p) return;
    p.nombre      = document.getElementById('ep_nombre').value;
    p.categoria   = document.getElementById('ep_cat').value;
    p.desc        = document.getElementById('ep_desc').value;
    p.precio      = parseFloat(document.getElementById('ep_precio').value);
    p.disponible  = document.getElementById('ep_disp').value === '1';
    cerrarModal();
    filtrarCarta();
    showToast(`✅ Plato "${p.nombre}" actualizado`);
}

// ============ MOZOS – ASISTENCIA ============
function renderAsistencia() {
    document.getElementById('fechaAsistencia').textContent = new Date().toLocaleDateString('es-PE', { weekday:'long', year:'numeric', month:'long', day:'numeric'});
    const body = document.getElementById('bodyAsistencia');
    body.innerHTML = asistencia.map((a, i) => {
        const cls  = { presente:'badge-activo', ausente:'badge-inactivo', tarde:'badge-permiso' }[a.estado];
        const hora = () => `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2,'0')}`;
        let btns = '';
        if (a.entrada === '—') {
            btns = `<button class="btn-registrar btn-entrada" onclick="registrarEntrada(${i})">Registrar Entrada</button>`;
        } else if (a.salida === '—') {
            btns = `<button class="btn-registrar btn-salida"  onclick="registrarSalida(${i})">Registrar Salida</button>`;
        } else {
            btns = '<span style="font-size:.75rem;color:var(--text-light)">Completo</span>';
        }
        return `<tr>
            <td><strong>${a.nombre}</strong></td>
            <td>${a.cargo}</td>
            <td>${a.entrada}</td>
            <td>${a.salida}</td>
            <td><span class="status-badge ${cls}">${a.estado}</span></td>
            <td>${btns}</td>
        </tr>`;
    }).join('');
}

function registrarEntrada(idx) {
    const hora = new Date().toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });
    asistencia[idx].entrada = hora;
    asistencia[idx].estado  = 'presente';
    showToast(`✅ Entrada registrada: ${asistencia[idx].nombre} – ${hora}`);
    renderAsistencia();
    renderDashboard();
}

function registrarSalida(idx) {
    const hora = new Date().toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' });
    asistencia[idx].salida = hora;
    showToast(`👋 Salida registrada: ${asistencia[idx].nombre} – ${hora}`);
    renderAsistencia();
}

// ============ ADMIN – REPORTES ============
function actualizarReporte() {
    const periodo = document.getElementById('periodoReporte').value;
    const d = reporteData[periodo];
    document.getElementById('repTotal').textContent    = d.total;
    document.getElementById('repPlatos').textContent   = d.platos;
    document.getElementById('repClientes').textContent = d.clientes;
    document.getElementById('repTicket').textContent   = d.ticket;
    document.getElementById('repTotalTrend').textContent    = '↑ vs período anterior';
    document.getElementById('repTotalTrend').className      = 'reporte-trend trend-up';
    document.getElementById('repPlatosTrend').textContent   = '↑ vs período anterior';
    document.getElementById('repPlatosTrend').className     = 'reporte-trend trend-up';
    document.getElementById('repClientesTrend').textContent = '↑ vs período anterior';
    document.getElementById('repClientesTrend').className   = 'reporte-trend trend-up';
    document.getElementById('repTicketTrend').textContent   = '↑ vs período anterior';
    document.getElementById('repTicketTrend').className     = 'reporte-trend trend-up';
    const max = Math.max(...d.chart);
    document.getElementById('barChart').innerHTML = d.chart.map((v, i) => `
        <div class="bar-item">
            <div class="bar-val">${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}</div>
            <div class="bar" style="height:${(v/max)*100}%" title="${v}"></div>
            <div class="bar-label">${d.labels[i]}</div>
        </div>
    `).join('');
    document.getElementById('platosRanking').innerHTML = [
        { nombre: 'Lomo Saltado', pct: 100, cnt: 84 },
        { nombre: 'Caldo de Cordero', pct: 85, cnt: 71 },
        { nombre: 'Ají de Gallina', pct: 75, cnt: 63 },
        { nombre: 'Chicharrón', pct: 68, cnt: 57 },
        { nombre: 'Causa Rellena', pct: 58, cnt: 49 },
    ].map((p, i) => `
        <div class="plato-rank-row">
            <div class="rank-num ${i===0?'gold-rank':''}">${i+1}</div>
            <div class="plato-rank-name">${p.nombre}</div>
            <div class="plato-rank-bar-wrap"><div class="plato-rank-bar" style="width:${p.pct}%"></div></div>
            <div class="plato-rank-count">${p.cnt} uds</div>
        </div>
    `).join('');
}

// ============ ADMIN – EMPLEADOS ============
function renderEmpleados(data) {
    document.getElementById('bodyEmpleados').innerHTML = data.map((e,i) => `
        <tr>
            <td><strong>${e.nombre}</strong></td>
            <td>${e.cargo}</td>
            <td>${e.turno}</td>
            <td>${e.sueldo}</td>
            <td>${badge(e.estado)}</td>
            <td>${accionBtns('empleado',i)}</td>
        </tr>
    `).join('');
}

document.getElementById('searchEmpleado').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    const cat = document.getElementById('filtroCargoEmp').value;
    let d = empleados;
    if (cat !== 'todos') d = d.filter(e => e.cargo.includes(cat));
    if (q) d = d.filter(e => e.nombre.toLowerCase().includes(q));
    renderEmpleados(d);
});
document.getElementById('filtroCargoEmp').addEventListener('change', function() {
    const cat = this.value;
    const q = document.getElementById('searchEmpleado').value.toLowerCase();
    let d = empleados;
    if (cat !== 'todos') d = d.filter(e => e.cargo.includes(cat));
    if (q) d = d.filter(e => e.nombre.toLowerCase().includes(q));
    renderEmpleados(d);
});

// ============ ADMIN – CAJA ============
function renderCaja() {
    const totalEf   = transacciones.filter(t=>t.metodo==='Efectivo').reduce((s,t)=>s+t.total,0);
    const totalYape = transacciones.filter(t=>t.metodo==='Yape').reduce((s,t)=>s+t.total,0);
    const totalTarj = transacciones.filter(t=>t.metodo==='Tarjeta').reduce((s,t)=>s+t.total,0);
    const totalGen  = totalEf + totalYape + totalTarj;
    document.getElementById('cajaResumen').innerHTML = `
        <div class="caja-card"><div class="caja-card-icon">💵</div><div class="caja-card-val">S/. ${totalEf.toFixed(2)}</div><div class="caja-card-label">Efectivo</div></div>
        <div class="caja-card"><div class="caja-card-icon">📱</div><div class="caja-card-val">S/. ${totalYape.toFixed(2)}</div><div class="caja-card-label">Yape / Plin</div></div>
        <div class="caja-card"><div class="caja-card-icon">💳</div><div class="caja-card-val">S/. ${totalTarj.toFixed(2)}</div><div class="caja-card-label">Tarjeta</div></div>
        <div class="caja-card" style="border:2px solid var(--gold)"><div class="caja-card-icon">🏆</div><div class="caja-card-val" style="color:var(--gold-dark)">S/. ${totalGen.toFixed(2)}</div><div class="caja-card-label">Total General</div></div>
    `;
    document.getElementById('bodyTransacciones').innerHTML = transacciones.map(t => `
        <tr>
            <td>${t.hora}</td>
            <td>${t.mesa}</td>
            <td>${t.mozo}</td>
            <td><strong>S/. ${t.total.toFixed(2)}</strong></td>
            <td>${t.metodo}</td>
            <td>${badge(t.estado)}</td>
        </tr>
    `).join('');
    // Update dashboard
    document.getElementById('dashIngresos').textContent = 'S/. ' + totalGen.toFixed(2);
}

function cerrarCaja() {
    const total = transacciones.reduce((s,t)=>s+t.total,0);
    showToast(`✅ Caja cerrada exitosamente – S/. ${total.toFixed(2)}`);
}

// ============ ADMIN – RESERVAS ============
function renderReservas() {
    document.getElementById('bodyReservas').innerHTML = reservas.map((r,i) => `
        <tr>
            <td><strong>${r.cliente}</strong></td>
            <td>${r.fecha}</td>
            <td>${r.hora}</td>
            <td>${r.personas}</td>
            <td>Mesa ${r.mesa}</td>
            <td>${badge(r.estado)}</td>
            <td>${accionBtns('reserva',i)}</td>
        </tr>
    `).join('');
}

// ============ MODAL GENÉRICO ============
const modalForms = {
    plato: {
        titulo: '🍽 Nuevo Plato',
        body: `
            <div class="form-row">
                <div class="form-group"><label>Nombre</label><input type="text" placeholder="Nombre del plato"></div>
                <div class="form-group"><label>Categoría</label>
                <select><option>Entradas</option><option>Sopas</option><option>Fondos</option><option>Postres</option><option>Bebidas</option></select></div>
            </div>
            <div class="form-group"><label>Descripción</label><textarea rows="2" placeholder="Descripción corta del plato"></textarea></div>
            <div class="form-row">
                <div class="form-group"><label>Precio (S/.)</label><input type="number" step="0.50" placeholder="0.00"></div>
                <div class="form-group"><label>Disponible</label><select><option>Sí</option><option>No</option></select></div>
            </div>
        `
    },
    mesa: {
        titulo: '🪑 Abrir Mesa',
        body: `
            <div class="form-row">
                <div class="form-group"><label>N° de Personas</label><input type="number" min="1" placeholder="1"></div>
                <div class="form-group"><label>Mozo Asignado</label>
                <select>${['Carlos Soto','Ana Lima','José Huallpa','Milagros Cutipa','Edwin Pari','Fátima Ccoa'].map(n=>`<option>${n}</option>`).join('')}</select></div>
            </div>
        `
    },
    empleado: {
        titulo: '👥 Nuevo Empleado',
        body: `
            <div class="form-row">
                <div class="form-group"><label>Nombre Completo</label><input type="text" placeholder="Nombre y apellidos"></div>
                <div class="form-group"><label>Cargo</label>
                <select><option>Cocinero</option><option>Mozza</option><option>Mozo</option><option>Administrador</option></select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Turno</label>
                <select><option>Mañana</option><option>Tarde</option><option>Noche</option></select></div>
                <div class="form-group"><label>Sueldo (S/.)</label><input type="number" placeholder="0.00"></div>
            </div>
            <div class="form-group"><label>DNI</label><input type="text" placeholder="Número de DNI"></div>
        `
    },
    reserva: {
        titulo: '📅 Nueva Reserva',
        body: `
            <div class="form-row">
                <div class="form-group"><label>Cliente</label><input type="text" placeholder="Nombre del cliente"></div>
                <div class="form-group"><label>Teléfono</label><input type="tel" placeholder="+51 999 000 000"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Fecha</label><input type="date"></div>
                <div class="form-group"><label>Hora</label><input type="time"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>N° Personas</label><input type="number" min="1" placeholder="1"></div>
                <div class="form-group"><label>Mesa</label>
                <select>${mesas.filter(m=>m.estado==='libre').map(m=>`<option value="${m.num}">Mesa ${m.num}</option>`).join('')}</select></div>
            </div>
        `
    },
    abrirMesa: {
        titulo: '🪑 Abrir Mesa',
        body: `
            <div class="form-row">
                <div class="form-group"><label>N° de Personas</label><input type="number" min="1" id="am_personas" placeholder="1"></div>
                <div class="form-group"><label>Mozo Asignado</label>
                <select id="am_mozo">${['Carlos Soto','Ana Lima','José Huallpa','Milagros Cutipa','Edwin Pari','Fátima Ccoa'].map(n=>`<option>${n}</option>`).join('')}</select></div>
            </div>
        `
    }
};

function abrirModal(tipo, param) {
    const cfg = modalForms[tipo];
    if (!cfg) return;
    document.getElementById('modalTitle').textContent = cfg.titulo;
    document.getElementById('modalBody').innerHTML = cfg.body + `
        <div class="modal-actions">
            <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
            <button class="btn-primary" onclick="guardarModal('${tipo}',${param||'null'})">Guardar</button>
        </div>
    `;
    document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() { document.getElementById('modalOverlay').classList.remove('open'); }
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === document.getElementById('modalOverlay')) cerrarModal(); });

function guardarModal(tipo, param) {
    if (tipo === 'abrirMesa' && param) {
        const num = param;
        const pers = parseInt(document.getElementById('am_personas')?.value) || 1;
        const mozo = document.getElementById('am_mozo')?.value || '';
        const mesa = mesas.find(m=>m.num===num);
        if (mesa) { mesa.estado = 'ocupada'; mesa.personas = pers; mesa.mozo = mozo; }
        if (!pedidosPorMesa[num]) pedidosPorMesa[num] = [];
        cerrarModal();
        showToast(`✅ Mesa ${num} abierta – ${pers} pers. – ${mozo}`);
        renderMesas();
        poblarSelectMesa();
        renderDashboard();
        return;
    }
    cerrarModal();
    const msgs = { plato:'✅ Plato agregado a la carta', mesa:'✅ Mesa actualizada', empleado:'✅ Empleado registrado', reserva:'✅ Reserva creada' };
    showToast(msgs[tipo] || '✅ Guardado correctamente');
    if (tipo === 'reserva') { renderReservas(); }
    if (tipo === 'empleado') { renderEmpleados(empleados); }
    if (tipo === 'plato') { filtrarCarta(); }
}

function cerrarMesaModal() { document.getElementById('mesaModalOverlay').classList.remove('open'); }

function editarReg(tipo, idx) { showToast(`✏ Editando registro ${idx+1} de ${tipo}`); }
function eliminarReg(tipo, idx) { if (confirm(`¿Eliminar este registro?`)) showToast(`🗑 Registro eliminado`); }

// ============ TOAST ============
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ============ INIT ============
function init() {
    renderChipsCocineros();
    renderCola();
    renderMesas();
    poblarSelectMesa();
    renderCarta(carta);
    renderAsistencia();
    renderEmpleados(empleados);
    renderReservas();
    renderCaja();
    actualizarReporte();
    renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);