// pages/api/openai-response.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Eres una IA bromista que responde con frases sarcásticas, absurdas o divertidas para gastar bromas telefónicas. Tu respuesta debe sonar natural como si improvisaras.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.95,
    });

    const respuestaIA = completion.choices[0].message.content;
    res.status(200).json({ respuestaIA });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ error: "Fallo al generar la respuesta" });
  }
}
