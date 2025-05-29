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
    // Deteksi environment untuk endpoint yang tepat
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const endpoint = isLocal ? "/generate-image" : "/api/generate-image";

    console.log("Calling endpoint:", endpoint); // Debug log
    console.log("Prompt:", prompt); // Debug log

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    console.log("Response status:", res.status); // Debug log

    const data = await res.json();
    console.log("Response data:", data); // Debug log

    if (data.image) {
      imgElement.src = `data:image/png;base64,${data.image}`;
      imgElement.classList.remove("hidden");
      placeholder.classList.add("hidden");

      // Set data URL untuk tombol download
      downloadBtn.href = `data:image/png;base64,${data.image}`;
      downloadBtn.download = "generated-cake.png"; // Tambah nama file
      downloadBtn.classList.remove("hidden");
    } else {
      // Tampilkan error yang lebih detail
      console.error("API Error:", data);
      alert(`Gagal menghasilkan gambar: ${data.error || "Unknown error"}`);

      // Jika ada debug info, tampilkan di console
      if (data.debug) {
        console.log("Debug info:", data.debug);
      }
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert(`Terjadi kesalahan: ${err.message}`);
  } finally {
    modal.classList.add("hidden");
  }
});

// Tambahan: Function untuk test endpoint
async function testEndpoint() {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const endpoint = isLocal ? "/generate-image" : "/api/generate-image";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "test simple cake" }),
    });

    const data = await res.json();
    console.log("Test result:", data);
    return data;
  } catch (err) {
    console.error("Test failed:", err);
    return null;
  }
}

// Auto-test saat halaman load (untuk debugging)
window.addEventListener("load", () => {
  console.log("Environment:", window.location.hostname);
  console.log(
    "Is local:",
    window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
  );

  // Uncomment line berikut untuk auto-test endpoint saat halaman load
  // testEndpoint();
});
