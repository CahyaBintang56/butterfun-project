import express from "express";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServerlessExpress } from "@vendia/serverless-express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.status(200).json({ image: part.inlineData.data });
      }
    }

    res.status(400).json({ error: "No image generated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Export Express as a Serverless Function
export default createServerlessExpress({ app });
