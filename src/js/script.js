document.getElementById("generateBtn").addEventListener("click", async () => {
  const userPrompt = document.getElementById("prompt").value;

  const model = document.getElementById("model").value;
  const warna = document.getElementById("warna").value;
  const bentuk = document.getElementById("bentuk").value;
  const toping = document.getElementById("toping").value;
  const tingkatan = document.getElementById("tingkatan").value;
  const latar = document.getElementById("latar").value;

  const prompt = `Buatkan saya kue ulang tahun dengan ${userPrompt} dan tambahan tingkatan ${tingkatan} tingkat, dengan model gambar ${model} dimensi, warna ${warna}, bentuk ${bentuk}, toping ${toping}, dan latar ${latar}.`;

  // Tampilkan modal loading
  const modal = document.getElementById("loadingModal");
  modal.classList.remove("hidden");

  const imgElement = document.getElementById("generatedImage");
  const placeholder = document.getElementById("placeholderText");
  const downloadBtn = document.getElementById("downloadBtn");

  // Sembunyikan gambar & tombol download sementara
  imgElement.classList.add("hidden");
  downloadBtn.classList.add("hidden");
  placeholder.classList.remove("hidden");

  try {
    // Gunakan URL yang benar untuk Vercel
    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    // Tambahkan logging untuk debug
    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", errorData);
      alert(`Error: ${errorData.error || "Unknown error"}`);
      return;
    }

    const data = await res.json();
    console.log("Response data received:", !!data.image);

    if (data.image) {
      imgElement.src = `data:image/png;base64,${data.image}`;
      imgElement.classList.remove("hidden");
      placeholder.classList.add("hidden");

      // Set data URL untuk tombol download
      downloadBtn.href = `data:image/png;base64,${data.image}`;
      downloadBtn.download = `kue-ulang-tahun-${Date.now()}.png`;
      downloadBtn.classList.remove("hidden");
    } else {
      console.error("No image in response");
      alert("Gagal menghasilkan gambar: Tidak ada gambar yang diterima.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert(`Terjadi kesalahan: ${err.message}`);
  } finally {
    modal.classList.add("hidden");
  }
});

console.log("Script loaded");