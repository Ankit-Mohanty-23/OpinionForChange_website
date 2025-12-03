import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function summarize(text) {
    const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "system",
                content: "You summarize long social media posts into short, clear summaries."
            },
            {
                role: "user",
                content: `Summarize this: ${text}`
            }
        ],
        temperature: 0.3
    });

    return response.choices[0].message.content;
}
