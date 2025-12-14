const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Sirve archivos estáticos (HTML, CSS, JS)

// Lista de modelos (Prioridad: Gemini 3 Preview -> Flash -> Pro)
const MODELS = ['gemini-3-pro-preview', 'gemini-1.5-flash', 'gemini-pro'];

// Endpoint seguro para generar trivia
app.post('/api/trivia', async (req, res) => {
    const { prompt, modelIndex = 0 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt requerido' });
    }

    try {
        const model = MODELS[modelIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        // Configurar request body
        let requestBody = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        // Agregar thinking si es gemini-3-pro-preview
        if (model === 'gemini-3-pro-preview') {
            requestBody.systemInstruction = {
                parts: [{ text: 'Responde SIEMPRE en formato JSON válido. Sé educativo, usa analogías claras, y explica consecuencias reales de los riesgos de seguridad.' }]
            };
            requestBody.generationConfig = {
                temperature: 1, // Requerido para thinking
                thinkingConfig: {
                    thinkingLevel: "MEDIUM"
                }
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            
            // Si falla, enviar indicador para que el cliente intente con siguiente modelo
            if (response.status === 404 && modelIndex < MODELS.length - 1) {
                return res.status(200).json({ 
                    retry: true, 
                    nextModelIndex: modelIndex + 1,
                    error: `Modelo ${model} no disponible`
                });
            }
            
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("Respuesta vacía de la IA");
        }

        let text = data.candidates[0].content.parts[0].text;

        // Limpieza JSON
        text = text.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        try {
            const jsonData = JSON.parse(text);
            res.json({ success: true, data: jsonData });
        } catch (e) {
            throw new Error("Error de formato JSON en respuesta");
        }

    } catch (error) {
        console.error('Error en /api/trivia:', error);
        res.status(500).json({ 
            error: error.message,
            success: false
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server running', port: PORT });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor Trivia Infinita ejecutándose en http://localhost:${PORT}`);
    console.log(`🔐 API Key protegida y segura en el servidor`);
    console.log(`📡 Frontend disponible en http://localhost:${PORT}/trivia_infinite.html`);
});
