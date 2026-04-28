export default async function handler(req, res) {

    const { score, flares, instrument } = req.body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const prompt = `Explain space weather impact:
Score: ${score}
Instrument: ${instrument}
Flares: ${JSON.stringify(flares)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        })
    });

    const data = await response.json();

    res.status(200).json({
        explanation: data.choices[0].message.content
    });
}
