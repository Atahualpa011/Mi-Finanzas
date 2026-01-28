/**
 * Servicio para interactuar con modelos de IA (LLM)
 * Soporta: OpenAI (GPT), Anthropic (Claude), Google (Gemini)
 */

const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS) || 5000;
const AI_MODEL_DEFAULT = process.env.AI_MODEL_DEFAULT || 'gpt-4o-mini';

// Custom error para fallos de IA
class AIServiceError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = 'AIServiceError';
    this.reason = reason;
  }
}

/**
 * Genera recomendaciones usando IA
 * @param {object} metrics - Métricas calculadas
 * @param {array} findings - Hallazgos generados por reglas
 * @param {string} model - Modelo a usar (opcional)
 * @returns {object} - { recommendations, model, generationTimeMs }
 */
async function generateRecommendations(metrics, findings, model = AI_MODEL_DEFAULT) {
  const startTime = Date.now();
  
  // Verificar que AI_API_KEY esté configurada
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new AIServiceError('API Key de IA no configurada', 'missing_api_key');
  }
  
  // Construir prompt estructurado
  const prompt = buildPrompt(metrics, findings);
  
  // Determinar provider según el modelo
  const provider = detectProvider(model);
  
  try {
    let response;
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(prompt, model, apiKey);
        break;
      case 'anthropic':
        response = await callAnthropic(prompt, model, apiKey);
        break;
      case 'google':
        response = await callGoogleAI(prompt, model, apiKey);
        break;
      default:
        throw new AIServiceError(`Provider desconocido para modelo: ${model}`, 'unknown_provider');
    }
    
    const generationTimeMs = Date.now() - startTime;
    
    // Validar estructura de respuesta
    if (!response.recommendations || !Array.isArray(response.recommendations)) {
      throw new AIServiceError('Respuesta de IA inválida: falta campo recommendations', 'invalid_response');
    }
    
    return {
      recommendations: response.recommendations,
      disclaimer: response.disclaimer || generateDefaultDisclaimer(),
      model,
      generationTimeMs
    };
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    
    // Error genérico (timeout, network, etc.)
    throw new AIServiceError(
      `Error al llamar a la IA: ${error.message}`,
      error.name === 'AbortError' ? 'timeout' : 'network_error'
    );
  }
}

/**
 * Construye el prompt para el LLM
 */
function buildPrompt(metrics, findings) {
  // Preparar resumen de métricas para el LLM
  const metricsummary = {
    periodo: metrics.period.label,
    ingresos: {
      total: metrics.income.total,
      cambio: metrics.income.change,
      cambioPorcentaje: metrics.income.changePercentage
    },
    gastos: {
      total: metrics.expenses.total,
      cambio: metrics.expenses.change,
      cambioPorcentaje: metrics.expenses.changePercentage
    },
    balance: metrics.balance.current,
    presupuestos: {
      total: metrics.budgets.total,
      excedidos: metrics.budgets.exceeded,
      enAlerta: metrics.budgets.warning
    },
    emociones: {
      totalConEmocion: metrics.emotions.totalWithEmotion,
      positivo: metrics.emotions.positiveVsNegative.positive,
      negativo: metrics.emotions.positiveVsNegative.negative,
      neutral: metrics.emotions.positiveVsNegative.neutral
    }
  };
  
  // Preparar hallazgos para el LLM
  const findingsSummary = findings.findings.map(f => ({
    categoria: f.category,
    severidad: f.severity,
    titulo: f.title,
    observacion: f.observation
  }));
  
  return {
    system: `Eres un asistente financiero experto que ayuda a las personas a mejorar su salud financiera. 
Debes generar recomendaciones personalizadas basadas EXCLUSIVAMENTE en las métricas y hallazgos proporcionados.

REGLAS ESTRICTAS:
1. NO inventes números ni datos que no estén en las métricas
2. Separa claramente "Observación" (lo que ves en los datos) de "Sugerencia" (qué hacer al respecto)
3. Usa un tono neutral, claro y accionable
4. Prioriza las recomendaciones por impacto (high, medium, low)
5. Genera EXACTAMENTE 3 recomendaciones (las más importantes)
6. Incluye un disclaimer corto de que no es asesoramiento financiero profesional
7. Responde en español
8. Si no hay datos suficientes, enfócate en motivar al usuario a registrar más información
9. Sé CONCISO - cada recomendación debe ser clara y directa`,
    
    user: `Analiza estos datos financieros y genera recomendaciones:

MÉTRICAS:
${JSON.stringify(metricsummary, null, 2)}

HALLAZGOS DETECTADOS:
${JSON.stringify(findingsSummary, null, 2)}

Genera un JSON con esta estructura exacta:
{
  "recommendations": [
    {
      "id": 1,
      "priority": "high|medium|low",
      "category": "spending_control|budgets|emotional_health|savings|income",
      "title": "Título corto",
      "observation": "Qué observaste en los datos (basado en métricas reales)",
      "suggestion": "Qué hacer al respecto (acción concreta)",
      "actionable": true
    }
  ],
  "disclaimer": "Texto breve explicando que no es asesoramiento profesional"
}`
  };
}

/**
 * Detecta el provider según el nombre del modelo
 */
function detectProvider(model) {
  if (model.startsWith('gpt-')) return 'openai';
  if (model.startsWith('claude-')) return 'anthropic';
  if (model.startsWith('gemini-')) return 'google';
  return 'openai'; // Default
}

/**
 * Llama a la API de OpenAI
 */
async function callOpenAI(prompt, model, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Respuesta de OpenAI vacía');
    }
    
    return JSON.parse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Llama a la API de Anthropic (Claude)
 */
async function callAnthropic(prompt, model, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2048,
        system: prompt.system,
        messages: [
          { role: 'user', content: prompt.user }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('Respuesta de Anthropic vacía');
    }
    
    return JSON.parse(content);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Llama a la API de Google Gemini
 */
async function callGoogleAI(prompt, model, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt.system}\n\n${prompt.user}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topP: 0.95,
            topK: 40
          }
        }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!content) {
      throw new Error('Respuesta de Google AI vacía');
    }
    
    // Limpiar markdown si existe (```json ... ```)
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Genera disclaimer por defecto
 */
function generateDefaultDisclaimer() {
  return 'Estas recomendaciones son generadas automáticamente con base en tus datos financieros y no constituyen asesoramiento financiero profesional. Para decisiones importantes, consulta con un experto.';
}

module.exports = {
  generateRecommendations,
  AIServiceError
};
