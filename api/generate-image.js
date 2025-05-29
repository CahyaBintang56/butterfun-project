import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Set CORS headers (sama seperti cors() middleware)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST method (sesuai dengan kode lokal)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt); // Log seperti di kode lokal

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Panggil Gemini AI dengan konfigurasi yang sama seperti lokal
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Check response seperti di kode lokal
    if (!response.candidates || response.candidates.length === 0) {
      return res.status(400).json({ error: "No response from AI" });
    }

    // Loop untuk mencari image data (sama seperti kode lokal)
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // Return format yang sama seperti kode lokal
        return res.json({ image: part.inlineData.data });
      }
    }

    // Error handling sama seperti kode lokal
    res.status(400).json({ error: "No image generated" });
  } catch (error) {
    console.error(error); // Log error seperti di kode lokal
    res.status(500).json({ error: "Internal Server Error" });
  }
}
