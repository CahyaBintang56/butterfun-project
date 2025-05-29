import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Check if response exists and has candidates
    if (!response.candidates || response.candidates.length === 0) {
      return res.status(400).json({ error: "No response generated" });
    }

    // Look for image in response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.status(200).json({ 
          success: true,
          image: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png'
        });
      }
    }

    res.status(400).json({ error: "No image generated" });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message 
    });
  }
}