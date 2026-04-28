export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { score, flares, instrument } = req.body;

        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Missing Gemini API Key" });
        }

        // 🔥 Prompt (clean + strong)
        const prompt = `
You are an expert in space weather analysis.

A researcher is using a ${instrument}.

Current research score: ${score}/100
Recent solar activity: ${JSON.stringify(flares)}

Explain in simple language:
- What this score means
- How space weather affects the instrument
- Whether it's safe to proceed
Keep it clear and professional.
`;

        // 🔗 Gemini API call
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // ❌ Handle API errors properly
        if (!response.ok) {
            return res.status(500).json({
                error: "Gemini API failed",
                details: data
            });
        }

        // ⚠️ Safe extraction
        let text = "No explanation generated.";

        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            text = data.candidates[0].content.parts[0].text;
        }

        // ✅ Send result
        return res.status(200).json({
            explanation: text
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            message: err.message
        });
    }
}
