/* ============================================
   PROMOS.JS - Sistema de Promociones
   Muestra ofertas según estado de sesión
   ============================================ */
'use strict';

/* ====================================================
   CONFIGURACIÓN DE API
   ==================================================== */
const API_BASE_URL = 'http://192.168.1.37:3000/api';
const ENDPOINTS = {
    PROMOS_PUBLICAS: '/promos/publicas',
    PROMOS_PERSONALIZADAS: '/promos/personalizadas',
    CLIENTE_PUNTOS: '/clientes/puntos'
};

/* ====================================================
   CLAVES DE SESIÓN
   ==================================================== */
const SESSION_KEY = 'sc_session';
const TOKEN_KEY = 'sc_token';

/* ====================================================
   VERIFICAR SI HAY SESIÓN ACTIVA
   ==================================================== */
function haySesionActiva() {
    try {
        const sessionRaw = localStorage.getItem(SESSION_KEY);
        if (!sessionRaw) return false;
        
        const session = JSON.parse(sessionRaw);
        
        // Verificar si el token aún es válido
        const ahora = Date.now();
        const tiempoZonaMuerta = 60000; // 1 minuto de margen
        
        if (session && session.token && session.timestamp) {
            if (ahora - session.timestamp < (session.expiresInMs - tiempoZonaMuerta)) {
                return true;
            }
        }
        
        return false;
    } catch (e) {
        console.error('Error al verificar sesión:', e);
        return false;
    }
}

function obtenerUsuario() {
    try {
        const sessionRaw = localStorage.getItem(SESSION_KEY);
        if (!sessionRaw) return null;
        
        const session = JSON.parse(sessionRaw);
        return session.usuario || null;
    } catch (e) {
        return null;
    }
}

function obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/* ====================================================
   OBTENER PROMOCIONES DESDE LA API
   ==================================================== */
async function obtenerPromociones(esPersonalizada = false) {
    const endpoint = esPersonalizada ? ENDPOINTS.PROMOS_PERSONALIZADAS : ENDPOINTS.PROMOS_PUBLICAS;
    
    try {
        const opciones = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Si es personalizada, añadir el token de autorización
        if (esPersonalizada) {
            const token = obtenerToken();
            if (token) {
                opciones.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const respuesta = await fetch(`${API_BASE_URL}${endpoint}`, opciones);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error('Error al obtener promociones:', error);
        // Si falla la API, devolver promociones de respaldo
        return esPersonalizada ? obtenerPromosPersonalizadasRespaldo() : obtenerPromosPublicasRespaldo();
    }
}

/* ====================================================
   OBTENER PUNTOS DEL CLIENTE
   ==================================================== */
async function obtenerPuntosCliente() {
    try {
        const token = obtenerToken();
        if (!token) return null;

        const respuesta = await fetch(`${API_BASE_URL}${ENDPOINTS.CLIENTE_PUNTOS}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        return datos.puntos || 0;
    } catch (error) {
        console.error('Error al obtener puntos:', error);
        return 0;
    }
}

/* ====================================================
   DATOS DE RESPALDO (Cuando no hay API)
   ==================================================== */
function obtenerPromosPublicasRespaldo() {
    return [
        {
            id: 1,
            titulo: "Combo Familia",
            descripcion: "2 litros de chicha + 4 causas + 1 polling a la brasa",
            precioOriginal: 120,
            precioDescuento: 89.90,
            descuento: 25,
            badge: "popular",
            vigencia: "Hasta el 28 de febrero"
        },
        {
            id: 2,
            titulo: "Almuerzo Ejecutivo",
            descripcion: "Entrada + Segundo + Refresco + Postre",
            precioOriginal: 45,
            precioDescuento: 32.00,
            descuento: 29,
            badge: "oferta",
            vigencia: "Lunes a viernes"
        },
        {
            id: 3,
            titulo: "Ceviche Tradicional",
            descripcion: "El mejor ceviche de Sicuani con chirimoya",
            precioOriginal: 55,
            precioDescuento: 42.00,
            descuento: 24,
            badge: "especial",
            vigencia: "Disponible siempre"
        },
        {
            id: 4,
            titulo: "Parrillada Norteña",
            descripcion: "Carne asada, chorizo, chicharrón, anticuchos y salsas",
            precioOriginal: 95,
            precioDescuento: 75.00,
            descuento: 21,
            badge: "oferta",
            vigencia: "Fines de semana"
        }
    ];
}

function obtenerPromosPersonalizadasRespaldo() {
    return [
        {
            id: 5,
            titulo: "¡Feliz Cumpleaños! 🎂",
            descripcion: "20% de descuento en tu plato favorito",
            precioOriginal: null,
            precioDescuento: null,
            descuento: 20,
            badge: "vip",
            esPersonalizada: true,
            vigencia: "Este mes"
        },
        {
            id: 6,
            titulo: "Cliente Frecuente",
            descripcion: "2x1 en todas las causas todos los miércoles",
            precioOriginal: null,
            precioDescuento: null,
            descuento: 50,
            badge: "exclusive",
            esPersonalizada: true,
            vigencia: "Miércoles"
        },
        {
            id: 7,
            titulo: "Descuento por Puntos",
            descripcion: "Canjea 100 puntos por S/20 de descuento",
            precioOriginal: 20,
            precioDescuento: 0,
            descuento: 100,
            badge: "vip",
            esPersonalizada: true,
            vigencia: "Canjeable ahora"
        },
        {
            id: 8,
            titulo: "Combo VIP",
            descripcion: "Lomo saltado + Ceviche + Chicha morada (para 2)",
            precioOriginal: 85,
            precioDescuento: 65.00,
            descuento: 24,
            badge: "exclusive",
            esPersonalizada: true,
            vigencia: "Exclusivo para ti"
        },
        {
            id: 1,
            titulo: "Combo Familia",
            descripcion: "2 litros de chicha + 4 causas + 1 polling a la brasa",
            precioOriginal: 120,
            precioDescuento: 89.90,
            descuento: 25,
            badge: "popular",
            vigencia: "Hasta el 28 de febrero"
        }
    ];
}

/* ====================================================
   RENDERIZAR PROMOCIONES
   ==================================================== */
function renderizarPromociones(promos, esPersonalizada = false) {
    const container = document.getElementById('promosList');
    
    if (!promos || promos.length === 0) {
        container.innerHTML = `
            <div class="no-promos">
                <h3>🎉 No hay promociones disponibles</h3>
                <p>Próximamente tendremos nuevas ofertas para ti</p>
            </div>
        `;
        return;
    }

    const html = promos.map(promo => {
        // Determinar el badge
        let badgeClass = '';
        let badgeText = '';
        
        if (promo.badge === 'vip' || promo.esPersonalizada) {
            badgeClass = 'vip';
            badgeText = esPersonalizada ? '⭐ Exclusivo' : 'VIP';
        } else if (promo.badge === 'exclusive') {
            badgeClass = 'exclusive';
            badgeText = 'Exclusivo';
        } else if (promo.badge === 'popular') {
            badgeClass = '';
            badgeText = 'Más popular';
        } else if (promo.badge === 'oferta') {
            badgeClass = '';
            badgeText = 'Oferta';
        } else if (promo.badge === 'especial') {
            badgeClass = '';
            badgeText = 'Especial';
        }

        // Calcular precio
        let priceHtml = '';
        if (promo.precioOriginal && promo.precioDescuento) {
            priceHtml = `
                <div class="promo-price">
                    <span class="original">S/ ${promo.precioOriginal.toFixed(2)}</span>
                    <span class="discount">S/ ${promo.precioDescuento.toFixed(2)}</span>
                </div>
            `;
        } else if (promo.descuento && !promo.precioOriginal) {
            priceHtml = `
                <div class="promo-price">
                    <span class="discount">${promo.descuento}% DSCTO</span>
                </div>
            `;
        }

        return `
            <div class="promo-card">
                ${badgeText ? `<span class="promo-badge ${badgeClass}">${badgeText}</span>` : ''}
                <div class="promo-content">
                    <h3 class="promo-title">${promo.titulo}</h3>
                    <p class="promo-description">${promo.descripcion}</p>
                    <div class="promo-details">
                        ${priceHtml}
                        <button class="promo-btn" onclick="reservarPromo(${promo.id})">
                            ${esPersonalizada ? '🛒 Reservar' : 'Ver más'}
                        </button>
                    </div>
                    ${promo.vigencia ? `<p class="promo-expiry">⏰ ${promo.vigencia}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/* ====================================================
   MOSTRAR INTERFAZ SEGÚN ESTADO DE SESIÓN
   ==================================================== */
async function inicializarPromos() {
    const sesionActiva = haySesionActiva();
    const usuario = obtenerUsuario();
    
    const userInfo = document.getElementById('userInfo');
    const loginPrompt = document.getElementById('loginPrompt');
    const promosSubtitle = document.getElementById('promos-subtitle');

    if (sesionActiva && usuario) {
        // Usuario logueado - mostrar info personalizada
        userInfo.style.display = 'flex';
        loginPrompt.style.display = 'none';
        
        document.getElementById('userName').textContent = `Hola, ${usuario.nombre || 'Cliente'}`;
        
        // Obtener puntos del cliente
        const puntos = await obtenerPuntosCliente();
        document.getElementById('userPoints').textContent = `⭐ Puntos: ${puntos}`;
        
        // Actualizar subtítulo
        promosSubtitle.textContent = 'Promociones exclusivas para ti';
        
        // Obtener promociones personalizadas
        const promos = await obtenerPromociones(true);
        renderizarPromociones(promos, true);
        
    } else {
        // Usuario no logueado - mostrar promos generales
        userInfo.style.display = 'none';
        loginPrompt.style.display = 'block';
        
        // Actualizar subtítulo
        promosSubtitle.textContent = 'Las mejores ofertas de Sabor Casero';
        
        // Obtener promociones públicas
        const promos = await obtenerPromociones(false);
        renderizarPromociones(promos, false);
    }
}

/* ====================================================
   CERRAR SESIÓN
   ==================================================== */
function cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(DEVICE_TOKEN_KEY);
    
    // Recargar la página para actualizar la vista
    window.location.reload();
}

// Hacer la función disponible globalmente
window.cerrarSesion = cerrarSesion;

/* ====================================================
   RESERVAR PROMOCIÓN
   ==================================================== */
function reservarPromo(idPromo) {
    const sesionActiva = haySesionActiva();
    
    if (!sesionActiva) {
        // Si no está logueado, redirigir al login
        window.location.href = 'login.html';
        return;
    }
    
    // Si está logueado, redirigir a reservas con la promo
    window.location.href = `reservas.html?promo=${idPromo}`;
}

// Hacer la función disponible globalmente
window.reservarPromo = reservarPromo;

/* ====================================================
   INICIALIZAR AL CARGAR LA PÁGINA
   ==================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarPromos();
});
