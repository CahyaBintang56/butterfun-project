import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req, res) {
  // Atur header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Tangani permintaan preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    const permintaan = req.body.prompt;
    console.log("Prompt diterima:", permintaan);

    if (!permintaan) {
      return res.status(400).json({ error: "Prompt harus diisi" });
    }

    // Periksa apakah API key tersedia
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(
      "Semua variabel lingkungan:",
      Object.keys(process.env).filter((key) => key.includes("GEMINI"))
    );
    console.log("API Key tersedia:", !!apiKey);
    console.log("Panjang API Key:", apiKey ? apiKey.length : 0);
    console.log(
      "10 karakter pertama API Key:",
      apiKey ? apiKey.substring(0, 10) + "..." : "tidak ada"
    );

    if (!apiKey) {
      return res.status(500).json({
        error: "API key belum dikonfigurasi",
        message: "Variabel lingkungan GEMINI_API_KEY belum disetel",
        debug: {
          variabelLingkunganTersedia: Object.keys(process.env).filter((key) =>
            key.includes("GEMINI")
          ),
        },
      });
    }

    // Inisialisasi Google GenAI (Gemini)
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    console.log("Memanggil API Gemini...");

    // Kirim permintaan ke model Gemini
    const respons = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: permintaan,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    console.log("Respons diterima dari Gemini");

    // Periksa apakah respons memiliki kandidat
    if (!respons.candidates || respons.candidates.length === 0) {
      console.log("Tidak ada kandidat dalam respons");
      return res.status(400).json({ error: "Tidak ada respons dari AI" });
    }

    const kandidat = respons.candidates[0];

    if (!kandidat.content || !kandidat.content.parts) {
      console.log("Struktur respons tidak valid");
      return res.status(400).json({ error: "Struktur respons tidak valid" });
    }

    console.log(
      "Memproses bagian dari respons:",
      kandidat.content.parts.length
    );

    // Cari bagian yang berisi data gambar
    for (const bagian of kandidat.content.parts) {
      if (bagian.inlineData) {
        console.log(
          "Ditemukan data gambar, ukuran:",
          bagian.inlineData.data.length
        );

        return res.status(200).json({
          image: bagian.inlineData.data,
        });
      }
    }

    // Jika tidak ditemukan data gambar
    console.log("Tidak ditemukan data gambar dalam respons");
    return res.status(400).json({ error: "Tidak ada gambar yang dihasilkan" });
  } catch (error) {
    console.error("Detail error:", {
      pesan: error.message,
      jejak: error.stack,
      nama: error.name,
    });

    // Tangani error spesifik dari API Gemini
    if (error.message?.includes("API key")) {
      return res.status(401).json({
        error: "API key tidak valid",
        message: "Silakan periksa konfigurasi API key Gemini Anda",
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return res.status(429).json({
        error: "Kuota API habis",
        message: "Kuota atau batas penggunaan API Gemini telah terlampaui",
      });
    }

    if (error.message?.includes("timeout")) {
      return res.status(408).json({
        error: "Permintaan melebihi batas waktu",
        message: "Permintaan ke API melebihi waktu tunggu",
      });
    }

    // Error umum lainnya
    return res.status(500).json({
      error: "Kesalahan Server",
      message: error.message,
    });
  }
}
