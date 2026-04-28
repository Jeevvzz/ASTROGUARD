export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { score, flares, instrument } = req.body;

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: "Missing OpenAI API Key" });
        }

        const prompt = `
You are a space weather expert.

Score: ${score}
Instrument: ${instrument}
Flares: ${JSON.stringify(flares)}

Explain clearly:
1. Why the score is this
2. How it affects the instrument
3. What the researcher should do
`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful space weather assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        // Handle API errors safely
        if (!data.choices || !data.choices[0]) {
            return res.status(500).json({
                error: "OpenAI API error",
                details: data
            });
        }

        res.status(200).json({
            explanation: data.choices[0].message.content
        });

    } catch (err) {
        res.status(500).json({
            error: "Server error",
            message: err.message
        });
    }
}
