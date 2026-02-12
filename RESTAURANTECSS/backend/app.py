from flask import Flask, request, jsonify
from flask_cors import CORS
import json, random, re, os

app = Flask(__name__)
CORS(app)  # PERMITE PETICIONES DESDE OTRO PUERTO

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

@app.route("/")
def status():
    return jsonify({"status": "API funcionando 🚀"})

if __name__ == "__main__":
    app.run(debug=True)
