/* =====================================================
   SABOR CASERO – index.js
   Lógica principal del sitio
===================================================== */

'use strict';

/* ===================================================
   1. SPLASH SCREEN
=================================================== */
(function initSplash() {
    const splash = document.getElementById('splash');
    if (!splash) return;

    // Oculta el splash tras la animación de la barra de carga (≈1.9 s)
    window.addEventListener('load', () => {
        setTimeout(() => {
            splash.classList.add('hidden');
            // Elimina del DOM después de la transición para no afectar accesibilidad
            splash.addEventListener('transitionend', () => splash.remove(), { once: true });
        }, 1900);
    });
})();


/* ===================================================
   2. NAVEGACIÓN STICKY (clase .scrolled)
=================================================== */
(function initStickyNav() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    const SCROLL_THRESHOLD = 10;

    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
})();


/* ===================================================
   3. MENÚ RESPONSIVO (hamburguesa)
=================================================== */
(function initResponsiveMenu() {
    const toggleBtn = document.getElementById('menuToggle');
    const menuNav   = document.getElementById('menuNav');
    const overlay   = document.getElementById('menuOverlay');
    if (!toggleBtn || !menuNav || !overlay) return;

    const open  = () => {
        menuNav.classList.add('open');
        overlay.classList.add('visible');
        toggleBtn.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        menuNav.classList.remove('open');
        overlay.classList.remove('visible');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', () => {
        menuNav.classList.contains('open') ? close() : open();
    });

    overlay.addEventListener('click', close);

    // Cierra al hacer clic en un enlace del menú (mobile)
    menuNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 900) close();
        });
    });

    // Cierra con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });
})();


/* ===================================================
   4. CARRUSELES
=================================================== */
(function initCarruseles() {
    /**
     * @typedef {{ id: string, dotsId: string }} CarruselConfig
     */

    /** @type {CarruselConfig[]} */
    const configs = [
        { id: 'promos-carrusel', dotsId: 'dotsPromos' },
        { id: 'platos-carrusel', dotsId: 'dotsPlatos' },
        { id: 'trab-carrusel',   dotsId: 'dotsTrab'   },
    ];

    configs.forEach(({ id, dotsId }) => {
        const carrusel  = document.getElementById(id);
        const dotsWrap  = document.getElementById(dotsId);
        if (!carrusel || !dotsWrap) return;

        const slides = Array.from(carrusel.querySelectorAll('.slide'));
        if (slides.length === 0) return;

        let current   = 0;
        let timer     = null;
        const INTERVAL = 4500;

        // Crear dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });

        const getDots = () => Array.from(dotsWrap.querySelectorAll('.dot'));

        function goTo(index) {
            slides[current].classList.remove('active');
            getDots()[current].classList.remove('active');

            current = (index + slides.length) % slides.length;

            slides[current].classList.add('active');
            getDots()[current].classList.add('active');

            resetTimer();
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function startTimer() {
            timer = setInterval(next, INTERVAL);
        }

        function resetTimer() {
            clearInterval(timer);
            startTimer();
        }

        // Botones prev/next (fuera del carrusel, hermanos en el DOM)
        const container = carrusel.parentElement;
        const prevBtn   = container?.querySelector(`.carrusel-btn.prev[data-target="${id}"]`);
        const nextBtn   = container?.querySelector(`.carrusel-btn.next[data-target="${id}"]`);

        prevBtn?.addEventListener('click', prev);
        nextBtn?.addEventListener('click', next);

        // Swipe táctil
        let touchStartX = 0;
        carrusel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carrusel.addEventListener('touchend', e => {
            const delta = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(delta) > 40) {
                delta < 0 ? next() : prev();
            }
        }, { passive: true });

        // Pausa al hacer hover
        carrusel.addEventListener('mouseenter', () => clearInterval(timer));
        carrusel.addEventListener('mouseleave', startTimer);

        // Arranque
        startTimer();
    });
})();


/* ===================================================
   5. BOTONES FLOTANTES (Promos & Mapa)
=================================================== */
(function initFloatingWindows() {
    const pairs = [
        { btnId: 'promociones-boton', winId: 'promociones-ventana', closeId: 'closePromos' },
        { btnId: 'mapa-boton',        winId: 'mapa-ventana',        closeId: 'closeMapa'   },
    ];

    pairs.forEach(({ btnId, winId, closeId }) => {
        const btn    = document.getElementById(btnId);
        const win    = document.getElementById(winId);
        const closeB = document.getElementById(closeId);
        if (!btn || !win) return;

        const toggle = () => win.classList.toggle('oculto');
        const hide   = () => win.classList.add('oculto');

        btn.addEventListener('click', toggle);
        btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
        closeB?.addEventListener('click', hide);
    });

    // Cerrar ventanas al hacer clic fuera
    document.addEventListener('click', e => {
        pairs.forEach(({ btnId, winId }) => {
            const btn = document.getElementById(btnId);
            const win = document.getElementById(winId);
            if (!win || win.classList.contains('oculto')) return;
            if (!win.contains(e.target) && !btn.contains(e.target)) {
                win.classList.add('oculto');
            }
        });
    });
})();


/* ===================================================
   6. CHATBOT
=================================================== */
(function initChat() {
    const chatBox  = document.getElementById('chat-box');
    const chatIcon = document.getElementById('chat-icon');
    const msgList  = document.getElementById('chat-messages');
    const input    = document.getElementById('msg');
    const sendBtn  = document.getElementById('send-btn');
    if (!chatBox || !msgList || !input || !sendBtn) return;

    let isOpen = false;

    /* ---- Respuestas automáticas del bot ---- */
    const BOT_RESPONSES = {
        defaults: [
            '¡Hola! 😊 ¿En qué te puedo ayudar hoy?',
            'Estamos aquí para atenderte. ¿Tienes alguna consulta sobre nuestra carta o reservas?',
        ],
        keywords: [
            { words: ['hola', 'buenos', 'buenas', 'saludos'],
              reply: '¡Hola! Bienvenido/a a Sabor Casero. ¿Qué deseas saber? 🍽️' },
            { words: ['horario', 'hora', 'abierto', 'cierra', 'abre'],
              reply: '🕒 Estamos abiertos de **Lunes a Domingo de 11:00 am a 10:30 pm**. ¡Te esperamos!' },
            { words: ['reserva', 'mesa', 'reservar'],
              reply: '📅 Puedes hacer tu reserva en nuestra sección "Reservaciones" o llamarnos al 449 135.' },
            { words: ['carta', 'menu', 'menú', 'plato', 'platillo', 'comida'],
              reply: '🍽️ ¡Tenemos una variedad deliciosa de platos tradicionales! Consulta nuestra carta en el enlace del menú principal.' },
            { words: ['precio', 'costo', 'cuánto', 'cuanto', 'cobran'],
              reply: '💰 Los precios varían según el plato. Visita nuestra carta para ver los detalles. ¡Tenemos opciones para todos!' },
            { words: ['delivery', 'domicilio', 'envío', 'envio', 'pedido'],
              reply: '🚚 Sí, tenemos servicio de delivery en Sicuani. Llama al **+51 973 555 214** para hacer tu pedido.' },
            { words: ['dirección', 'direccion', 'ubicación', 'ubicacion', 'donde', 'dónde'],
              reply: '📍 Nos encontramos en **Av. Garcilaso 325, Sicuani, Cusco, Perú**. ¡Usa el botón de mapa para guiarte!' },
            { words: ['evento', 'eventos', 'reunion', 'reunión', 'celebración', 'celebracion'],
              reply: '🎉 ¡Organizamos eventos y reuniones! Escríbenos a eventos@saborcasero.pe o llama al +51 973 555 214.' },
            { words: ['gracias', 'thanks', 'ok', 'listo', 'perfecto'],
              reply: '😊 ¡Con mucho gusto! Si tienes otra consulta, aquí estoy. ¡Que tengas un gran día!' },
        ],
    };

    function getBotReply(text) {
        const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const { words, reply } of BOT_RESPONSES.keywords) {
            if (words.some(w => lower.includes(w))) return reply;
        }
        const idx = Math.floor(Math.random() * BOT_RESPONSES.defaults.length);
        return BOT_RESPONSES.defaults[idx];
    }

    function appendMsg(text, role) {
        const li = document.createElement('li');
        li.className = role;
        // Renderizado simple de **negrita**
        li.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgList.appendChild(li);
        msgList.scrollTop = msgList.scrollHeight;
        return li;
    }

    function showTyping() {
        const li = document.createElement('li');
        li.className = 'bot typing-bubble';
        li.innerHTML = '<span></span><span></span><span></span>';
        msgList.appendChild(li);
        msgList.scrollTop = msgList.scrollHeight;
        return li;
    }

    function botReply(userText) {
        const typingEl = showTyping();
        const delay    = 700 + Math.random() * 500;

        setTimeout(() => {
            typingEl.remove();
            appendMsg(getBotReply(userText), 'bot');
        }, delay);
    }

    function send() {
        const text = input.value.trim();
        if (!text) return;

        appendMsg(text, 'user');
        input.value = '';
        input.focus();
        botReply(text);
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });

    /* ---- Toggle del chat ---- */
    window.toggleChat = function () {
        isOpen = !isOpen;
        chatBox.classList.toggle('open', isOpen);
        chatBox.setAttribute('aria-hidden', String(!isOpen));
        chatIcon?.setAttribute('aria-expanded', String(isOpen));

        if (isOpen && msgList.children.length === 0) {
            // Mensaje de bienvenida
            setTimeout(() => {
                appendMsg('¡Hola! 👋 Bienvenido a **Sabor Casero**. ¿En qué te podemos ayudar hoy?', 'bot');
            }, 300);
        }

        if (isOpen) input.focus();
    };
})();


/* ===================================================
   7. REVEAL DE SECCIONES AL HACER SCROLL
=================================================== */
(function initScrollReveal() {
    const els = document.querySelectorAll('.section-reveal');
    if (!els.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        els.forEach(el => observer.observe(el));
    } else {
        // Fallback para navegadores sin soporte
        els.forEach(el => el.classList.add('visible'));
    }
})();