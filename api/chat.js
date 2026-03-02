module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '无效的请求格式' });
  }

  const SYSTEM_PROMPT = `你是一位专业的个人财务规划顾问AI助理，名字叫"财智"。请用专业、友善、易懂的中文方式回答。提供建议时要考虑风险因素。对于具体投资决策，提醒用户咨询持牌专业顾问。回答简洁有力，配合数字和具体建议。`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10)
        ]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回答。';
    return res.status(200).json({ content: [{ text: reply }] });
  } catch (error) {
    return res.status(500).json({ error: '服务器错误：' + error.message });
  }
}
