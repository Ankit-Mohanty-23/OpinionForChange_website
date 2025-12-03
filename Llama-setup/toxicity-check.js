import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const BASE_PROMPT = `
You are a strict toxicity classifier.

Categories to consider:
- hate speech
- threats
- harassment
- slurs
- bullying
- profanity
- sexual aggression
- discrimination
- self-harm encouragement

Return JSON only:
{ "score": 0-100, "label": "safe" | "toxic", "reason": "..." }
`;

const HATE_PROMPT = `
You classify ONLY hate speech and discrimination.

Return JSON only:
{ "score": 0-100, "label": "safe" | "toxic", "reason": "..." }
`;

const PROFANITY_PROMPT = `
You classify profanity, slurs, and obscene language. Context does not matter.

Return JSON only:
{ "score": 0-100, "label": "safe" | "toxic", "reason": "..." }
`;

const HARASSMENT_PROMPT = `
You classify ONLY harassment, bullying, insults, and personal attacks.

Return JSON only:
{ "score": 0-100, "label": "safe" | "toxic", "reason": "..." }
`;

const client = new Groq({ apikey: process.env.Groq_API_KEY });

async function classify(prompt, text) {
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: text },
    ],
    temperature: 0,
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function checkToxicity(text) {
    const general = await classify(BASE_PROMPT, text);
    const hate = await classify(HATE_PROMPT, text);
    const harass = await classify(HARASSMENT_PROMPT, text);
    const profanity = await classify(PROFANITY_PROMPT, text);
  
    const finalScore =
      general.score * 0.5 +
      hate.score * 0.2 +
      harass.score * 0.2 +
      profanity.score * 0.1;
  
    const finalLabel = finalScore > 60 ? "toxic" : "safe";
  
    return {
      score: Math.round(finalScore),
      label: finalLabel,
      reasons: {
        general: general.reason,
        hate: hate.reason,
        harassment: harass.reason,
        profanity: profanity.reason,
      }
    };
  }
  