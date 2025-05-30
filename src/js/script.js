document.getElementById("generateBtn").addEventListener("click", async () => {
  // Dapatkan nilai dari inputan
  const userPrompt = document.getElementById("prompt").value;
  const model = document.getElementById("model").value;
  const warna = document.getElementById("warna").value;
  const bentuk = document.getElementById("bentuk").value;
  const toping = document.getElementById("toping").value;
  const tingkatan = document.getElementById("tingkatan").value;
  const latar = document.getElementById("latar").value;

  // Buat prompt
  const prompt = `Buatkan saya kue ulang tahun dengan tingkatan ${tingkatan} tingkat, dengan model gambar ${model} dimensi, warna ${warna}, bentuk ${bentuk}, toping ${toping}, dan latar ${latar} dan tambahan ${userPrompt}.`;

  // Tampilkan modal loading
  const modal = document.getElementById("loadingModal");
  modal.classList.remove("hidden");

  // Dapatkan elemen gambar
  const imgElement = document.getElementById("generatedImage");
  const placeholder = document.getElementById("placeholderText");
  const downloadBtn = document.getElementById("downloadBtn");

  // Sembunyikan gambar & tombol download sementara
  imgElement.classList.add("hidden");
  downloadBtn.classList.add("hidden");
  placeholder.classList.remove("hidden");

  // Kirim prompt ke server
  try {
    const res = await fetch("/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (data.image) {
      imgElement.src = `data:image/png;base64,${data.image}`;
      imgElement.classList.remove("hidden");
      placeholder.classList.add("hidden");

      // Set data URL untuk tombol download
      downloadBtn.href = `data:image/png;base64,${data.image}`;
      downloadBtn.classList.remove("hidden");
    } else {
      alert("Gagal menghasilkan gambar.");
    }
  } catch (err) {
    alert("Terjadi kesalahan.");
    console.error(err);
  } finally {
    modal.classList.add("hidden");
  }
});
