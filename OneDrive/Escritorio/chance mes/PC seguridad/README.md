# 🔐 Trivia Infinita - Backend Seguro

Sistema de trivia educativo sobre ciberseguridad con Gemini AI, con **API Key protegida en el backend**.

## 📋 Cambios Principales

✅ **API Key protegida** - Ya NO está en el HTML  
✅ **Backend Express** - Maneja todas las llamadas a Gemini  
✅ **CORS habilitado** - Frontend puede comunicarse con el servidor  
✅ **Variables de entorno** - Archivo `.env` para credenciales seguras  

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar .env (ya está listo)
El archivo `.env` ya contiene:
```
GEMINI_API_KEY=tu_clave_aqui
PORT=3000
NODE_ENV=development
```

### 3. Iniciar el servidor
```bash
npm start
```

Deberías ver:
```
✅ Servidor Trivia Infinita ejecutándose en http://localhost:3000
🔐 API Key protegida y segura en el servidor
📡 Frontend disponible en http://localhost:3000/trivia_infinite.html
```

### 4. Acceder a la app
Abre en tu navegador:
```
http://localhost:3000/trivia_infinite.html
```

## 🔒 Seguridad

**ANTES (Vulnerable):**
- API Key visible en HTML cliente
- Cualquiera podía ver la clave en el navegador (F12)

**AHORA (Seguro):**
- API Key almacenada en servidor (`.env`)
- Frontend nunca conoce la clave
- Todas las llamadas a Gemini van por el backend
- `.gitignore` protege credenciales

## 📁 Estructura de Carpetas

```
PC seguridad/
├── server.js                 # Backend Express (NUEVO)
├── trivia_infinite.html      # Frontend (modificado)
├── package.json              # Dependencias (NUEVO)
├── .env                       # Credenciales (NUEVO - NO SUBIR)
├── .gitignore                # Protección (NUEVO)
└── README.md                 # Este archivo
```

## 🔧 Endpoints del Backend

### POST `/api/trivia`
Genera una pregunta de trivia nueva.

**Request:**
```json
{
  "prompt": "ROL: Eres un instructor...",
  "modelIndex": 0
}
```

**Response (éxito):**
```json
{
  "success": true,
  "data": {
    "topic": "Contraseñas",
    "lesson": "La contraseña es como...",
    "question": "¿Qué haces?",
    "options": ["A", "B", "C"],
    "correctIndex": 0,
    "explanation": "Porque..."
  }
}
```

**Response (reintentar modelo):**
```json
{
  "retry": true,
  "nextModelIndex": 1,
  "error": "Modelo gemini-3-pro-preview no disponible"
}
```

## 🎮 Características del Juego

- ❤️ **5 vidas** - Pierdes una cada respuesta incorrecta
- 🔥 **Sistema de racha** - 5 respuestas correctas = sube de nivel
- ⚔️ **Dificultad progresiva** - Preguntas se vuelven más difíciles
- 🤖 **Gemini AI** - Genera preguntas únicas y educativas
- 📚 **Analogías claras** - Explica conceptos de seguridad de forma sencilla

## ⚠️ Notas Importantes

1. **No subir `.env` a GitHub** - Ya está en `.gitignore`
2. **Puerto 3000 debe estar disponible** - Cambiar en `.env` si es necesario
3. **Requiere conexión a Internet** - Para acceder a Gemini API
4. **Node.js v14+** - Instalar desde https://nodejs.org

## 🐛 Troubleshooting

**Error: "Cannot find module 'express'"**
```bash
npm install
```

**Error: "EADDRINUSE: address already in use :::3000"**
Cambiar puerto en `.env`:
```
PORT=3001
```

**Error: "Failed to fetch"**
Asegurate de que el servidor está ejecutándose:
```bash
npm start
```

---

✅ **API Key segura, backend listo, trivia en marcha!** 🎯
