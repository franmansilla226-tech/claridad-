// Función serverless de Vercel. Corre en el servidor, así que acá sí es seguro
// usar la API key (vive en la variable de entorno ANTHROPIC_API_KEY, nunca en el navegador).

const SYSTEM_PROMPTS = {
  classify: `Sos un clasificador para un segundo cerebro personal. Vas a recibir líneas sueltas de pensamientos en español.
Devolvé SOLO un JSON (sin texto extra, sin markdown, sin \`\`\`) con esta forma exacta:
{"ideas":[{"title":"..."}],"tasks":[{"title":"...","priority":"alta|media|baja"}],"notes":[{"title":"...","content":"..."}],"goals":[{"title":"..."}]}
Clasificá cada línea en la categoría más adecuada. Si una línea no aporta nada útil, ignorala. Títulos cortos y claros, en español.`,

  ask: `Sos el asistente de un segundo cerebro personal en español. Respondé breve, directo y accionable (máximo 4-5 líneas), basándote en el contexto real del usuario que te paso.
Devolvé SOLO un JSON (sin markdown) con esta forma exacta: {"answer":"tu respuesta acá"}`,

  review: `Sos un asistente de revisión semanal para un segundo cerebro personal, en español. A partir de estos datos reales, devolvé SOLO un JSON (sin markdown) con esta forma exacta:
{"achieved":"resumen breve de logros","pending":"lo que quedó pendiente","eliminate":"sugerencia de qué eliminar o dejar de hacer","advance":"sugerencia de qué proyecto conviene avanzar"}
Cada valor debe ser 1-2 frases, concreto y directo.`,
};

function cleanJson(text) {
  return text.replace(/```json|```/g, '').trim();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel' });
    return;
  }

  try {
    const { type, lines, question, context } = req.body || {};
    const systemPrompt = SYSTEM_PROMPTS[type];
    if (!systemPrompt) {
      res.status(400).json({ error: 'type inválido' });
      return;
    }

    let userText = '';
    if (type === 'classify') userText = (lines || []).join('\n');
    if (type === 'ask') userText = `Pregunta: ${question}\n\nContexto del usuario:\n${context}`;
    if (type === 'review') userText = context;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userText }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      res.status(502).json({ error: 'Error llamando a la IA', detail: errText });
      return;
    }

    const data = await anthropicRes.json();
    const block = (data.content || []).find((c) => c.type === 'text');
    const raw = block ? block.text : '{}';
    const parsed = JSON.parse(cleanJson(raw));

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Fallo interno', detail: String(err) });
  }
};
