const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Validar API Key
if (!API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY no configurada en .env');
    process.exit(1);
}

console.log('✅ API Key cargada correctamente');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir SOLO trivia_infinite.html
app.use(express.static('.')); // Base estática
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/trivia_infinite.html');
});
app.get('/trivia_infinite.html', (req, res) => {
    res.sendFile(__dirname + '/trivia_infinite.html');
});

// Usar SOLO gemini-3-pro-preview (el más potente)
const MODELS = ['gemini-3-pro-preview'];

// Endpoint seguro para generar trivia
app.post('/api/trivia', async (req, res) => {
    const { prompt, modelIndex = 0 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt requerido', success: false });
    }

    try {
        const model = MODELS[modelIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

        console.log(`📤 Llamando a ${model}...`);

        // Configurar request body para gemini-3-pro-preview
        let requestBody = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        // Configuración optimizada para gemini-3-pro-preview
        requestBody.generationConfig = {
            temperature: 1,
            maxOutputTokens: 2048
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            timeout: 30000
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error(`❌ API Error ${response.status}:`, responseText);
            
            // Si falla, reintentar con siguiente modelo
            if ((response.status === 404 || response.status === 400) && modelIndex < MODELS.length - 1) {
                return res.status(200).json({ 
                    retry: true, 
                    nextModelIndex: modelIndex + 1,
                    error: `Modelo ${model} no disponible`,
                    success: false
                });
            }
            
            throw new Error(`API Error ${response.status}: ${responseText.substring(0, 200)}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Error parsing JSON:', responseText);
            throw new Error("Respuesta inválida de la API");
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error('❌ Respuesta vacía:', data);
            throw new Error("Respuesta vacía de la IA");
        }

        let text = data.candidates[0].content.parts[0].text;
        console.log('✅ Respuesta recibida');

        // Limpieza JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        try {
            const jsonData = JSON.parse(text);
            console.log('✅ JSON válido, enviando respuesta');
            res.json({ success: true, data: jsonData });
        } catch (e) {
            console.error('❌ Error de parseo JSON:', text.substring(0, 200));
            throw new Error("La respuesta no es JSON válido");
        }

    } catch (error) {
        console.error('❌ Error en /api/trivia:', error.message);
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
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Servidor Trivia Infinita en http://localhost:${PORT}`);
    console.log(`📡 Frontend: http://localhost:${PORT}/trivia_infinite.html`);
    console.log(`🚀 API Endpoint: POST http://localhost:${PORT}/api/trivia`);
    console.log(`🔐 API Key: ${API_KEY.substring(0, 10)}...`);
    console.log(`${'='.repeat(50)}\n`);
});
