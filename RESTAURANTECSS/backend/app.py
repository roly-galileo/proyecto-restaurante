from flask import Flask, request, jsonify
from flask_cors import CORS
import json, random, re, os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # PERMITE PETICIONES DESDE OTRO PUERTO

# Base de datos simulada de promociones
PROMOS_PUBLICAS = [
    {
        "id": 1,
        "titulo": "Combo Familia",
        "descripcion": "2 litros de chicha + 4 causas + 1 pollo a la brasa",
        "precioOriginal": 120.00,
        "precioDescuento": 89.90,
        "descuento": 25,
        "badge": "popular",
        "vigencia": "Hasta el 28 de febrero",
        "imagen": "promos1.png"
    },
    {
        "id": 2,
        "titulo": "Almuerzo Ejecutivo",
        "descripcion": "Entrada + Segundo + Refresco + Postre",
        "precioOriginal": 45.00,
        "precioDescuento": 32.00,
        "descuento": 29,
        "badge": "oferta",
        "vigencia": "Lunes a viernes",
        "imagen": "promos2.jpg"
    },
    {
        "id": 3,
        "titulo": "Ceviche Tradicional",
        "descripcion": "El mejor ceviche de Sicuani con chirimoya",
        "precioOriginal": 55.00,
        "precioDescuento": 42.00,
        "descuento": 24,
        "badge": "especial",
        "vigencia": "Disponible siempre",
        "imagen": "promos3.png"
    },
    {
        "id": 4,
        "titulo": "Parrillada Norteña",
        "descripcion": "Carne asada, chorizo, chicharrón, anticuchos y salsas",
        "precioOriginal": 95.00,
        "precioDescuento": 75.00,
        "descuento": 21,
        "badge": "oferta",
        "vigencia": "Fines de semana",
        "imagen": "promos1.png"
    },
    {
        "id": 5,
        "titulo": "Chicha Morada XL",
        "descripcion": "1.5L de chicha morada + 2 pastelones",
        "precioOriginal": 35.00,
        "precioDescuento": 25.00,
        "descuento": 29,
        "badge": "popular",
        "vigencia": "Todo el día",
        "imagen": "promos2.jpg"
    }
]

# Promociones personalizadas para usuarios registrados
PROMOS_PERSONALIZADAS = [
    {
        "id": 101,
        "titulo": "¡Feliz Cumpleaños! 🎂",
        "descripcion": "20% de descuento en tu plato favorito",
        "precioOriginal": None,
        "precioDescuento": None,
        "descuento": 20,
        "badge": "vip",
        "esPersonalizada": True,
        "vigencia": "Este mes",
        "imagen": "promos3.png",
        "tipo": "cumpleanos"
    },
    {
        "id": 102,
        "titulo": "Cliente Frecuente",
        "descripcion": "2x1 en todas las causas todos los miércoles",
        "precioOriginal": None,
        "precioDescuento": None,
        "descuento": 50,
        "badge": "exclusive",
        "esPersonalizada": True,
        "vigencia": "Miércoles",
        "imagen": "promos1.png",
        "tipo": "frecuente"
    },
    {
        "id": 103,
        "titulo": "Descuento por Puntos",
        "descripcion": "Canjea 100 puntos por S/20 de descuento",
        "precioOriginal": 20.00,
        "precioDescuento": 0,
        "descuento": 100,
        "badge": "vip",
        "esPersonalizada": True,
        "vigencia": "Canjeable ahora",
        "imagen": "promos2.jpg",
        "tipo": "puntos"
    },
    {
        "id": 104,
        "titulo": "Combo VIP",
        "descripcion": "Lomo saltado + Ceviche + Chicha morada (para 2)",
        "precioOriginal": 85.00,
        "precioDescuento": 65.00,
        "descuento": 24,
        "badge": "exclusive",
        "esPersonalizada": True,
        "vigencia": "Exclusivo para ti",
        "imagen": "promos3.png",
        "tipo": "vip"
    },
    {
        "id": 105,
        "titulo": "Bienvenido de Vuelta",
        "descripcion": "15% de descuento en tu primera reserva del mes",
        "precioOriginal": None,
        "precioDescuento": None,
        "descuento": 15,
        "badge": "vip",
        "esPersonalizada": True,
        "vigencia": "Este mes",
        "imagen": "promos1.png",
        "tipo": "bienvenida"
    }
]

def limpiar(texto):
    texto = texto.lower()
    return re.sub(r"[^a-záéíóúñ ]", "", texto)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "intents.json"), encoding="utf-8") as f:
    data = json.load(f)

def responder(mensaje):
    mensaje = limpiar(mensaje)
    for intent in data["intents"]:
        for p in intent["patterns"]:
            if p in mensaje:
                return random.choice(intent["responses"])
    return "No entendí 🤔"

@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("mensaje", "")
    respuesta = responder(user_msg)
    return jsonify({"respuesta": respuesta})

# ============================================
# ENDPOINTS DE PROMOCIONES
# ============================================

@app.route("/api/promos/publicas", methods=["GET"])
def get_promos_publicas():
    """
    Obtiene todas las promociones públicas disponibles
    para usuarios no registrados
    """
    return jsonify({
        "success": True,
        "promociones": PROMOS_PUBLICAS,
        "total": len(PROMOS_PUBLICAS)
    })

@app.route("/api/promos/personalizadas", methods=["GET"])
def get_promos_personalizadas():
    """
    Obtiene promociones personalizadas para usuarios logueados
    Requiere token de autorización en el header
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        # Si no hay token, devolver las públicas con algunas personalizadas
        return jsonify({
            "success": True,
            "promociones": PROMOS_PUBLICAS + PROMOS_PERSONALIZADAS[:2],
            "total": len(PROMOS_PUBLICAS) + 2,
            "mensaje": "Inicia sesión para ver todas las ofertas exclusivas"
        })
    
    # Usuario logueado - devolver todas las promociones
    return jsonify({
        "success": True,
        "promociones": PROMOS_PERSONALIZADAS + PROMOS_PUBLICAS,
        "total": len(PROMOS_PERSONALIZADAS) + len(PROMOS_PUBLICAS),
        "mensaje": "Tienes ofertas exclusivas esperándote"
    })

@app.route("/api/promos/<int:promo_id>", methods=["GET"])
def get_promo_detalle(promo_id):
    """
    Obtiene el detalle de una promoción específica
    """
    # Buscar en públicas
    for promo in PROMOS_PUBLICAS:
        if promo['id'] == promo_id:
            return jsonify({
                "success": True,
                "promocion": promo
            })
    
    # Buscar en personalizadas
    for promo in PROMOS_PERSONALIZADAS:
        if promo['id'] == promo_id:
            return jsonify({
                "success": True,
                "promocion": promo
            })
    
    return jsonify({
        "success": False,
        "message": "Promoción no encontrada"
    }), 404

@app.route("/api/clientes/puntos", methods=["GET"])
def get_cliente_puntos():
    """
    Obtiene los puntos del cliente logueado
    Requiere token de autorización
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            "success": False,
            "message": "Unauthorized - Token requerido"
        }), 401
    
    # Simular puntos del cliente (en una app real, esto vendría de la DB)
    puntos = random.randint(50, 500)
    
    return jsonify({
        "success": True,
        "puntos": puntos,
        "nivel": "Bronce" if puntos < 200 else ("Plata" if puntos < 400 else "Oro"),
        "proximoNivel": "Plata" if puntos < 200 else ("Oro" if puntos < 400 else "Diamante"),
        "puntosParaSiguiente": 200 - puntos if puntos < 200 else (400 - puntos if puntos < 400 else 600 - puntos)
    })

@app.route("/")
def status():
    return jsonify({"status": "API funcionando 🚀"})

if __name__ == "__main__":
    app.run(debug=True)
