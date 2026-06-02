# Setup Local Stable Diffusion untuk AI Kreatif

Panduan setup Stable Diffusion WebUI lokal untuk menggunakan opsi "Local SD" di prototype AI Kreatif.

## Prerequisites

Pastikan sudah install:
- **Docker** — https://docs.docker.com/get-docker/
- **GPU** (optional tapi recommended):
  - NVIDIA: driver CUDA sudah install
  - AMD/Mac: bisa pakai CPU tapi lambat (30–120 detik per gambar)

## Quick Start (Recommended)

### 1. Download Official Image
```bash
docker pull ghcr.io/automatic1111/stable-diffusion-webui:latest
```

### 2. Jalankan Container
```bash
docker run --gpus all --name sd-webui -p 7860:7860 \
  -v $(pwd)/sd-data:/workspace \
  ghcr.io/automatic1111/stable-diffusion-webui:latest
```

**Untuk Mac (CPU only):**
```bash
docker run --name sd-webui -p 7860:7860 \
  -v $(pwd)/sd-data:/workspace \
  ghcr.io/automatic1111/stable-diffusion-webui:latest
```

### 3. Tunggu sampai Ready
Terminal akan muncul:
```
Running on local URL: http://127.0.0.1:7860
```

### 4. Buka di Browser
- WebUI: http://localhost:7860
- API sudah available di: `http://localhost:7860/api/`

## API Endpoints (untuk AI Kreatif)

### Image-to-Image (Burger → 3 Variasi)
```
POST http://localhost:7860/api/img2img
```

Payload:
```json
{
  "init_images": ["data:image/jpeg;base64,..."],
  "prompt": "professional product photography, ...",
  "negative_prompt": "blurry, low quality",
  "steps": 20,
  "cfg_scale": 7,
  "denoising_strength": 0.75,
  "n_iter": 3,
  "batch_size": 1,
  "width": 1024,
  "height": 1024
}
```

Response:
```json
{
  "images": ["base64_string_1", "base64_string_2", "base64_string_3"],
  "seed": 12345
}
```

### Text-to-Image
```
POST http://localhost:7860/api/txt2img
```

(Sama seperti img2img, tapi tanpa `init_images`)

## Settings untuk AI Kreatif

Di WebUI, untuk hasil terbaik:
1. Model: Gunakan **Realistic** atau **SDXL** model (bukan anime)
2. Sampler: DPM++ 2M Karras atau Euler
3. Steps: 20–30 (lebih tinggi = lebih baik tapi lebih lambat)
4. CFG Scale: 7–10 (kontrol kesesuaian prompt)
5. Denoising Strength: 0.7–0.8 (untuk img2img, preserve original)

## Troubleshooting

### "Local SD error (http://localhost:7860). Pastikan Stable Diffusion WebUI sedang jalan"

**Solusi:**
1. Cek apakah container masih jalan:
   ```bash
   docker ps | grep sd-webui
   ```

2. Jika tidak ada, jalankan ulang:
   ```bash
   docker start sd-webui
   ```

3. Cek logs:
   ```bash
   docker logs sd-webui
   ```

### GPU tidak terdeteksi
```bash
# Pastikan nvidia-docker install
docker --gpus all run --rm nvidia/cuda:11.8.0-runtime-ubuntu22.04 nvidia-smi

# Kalau tidak ada, coba setup ulang atau pakai CPU
```

### Gambar hasil jelek / tidak sesuai produk
1. Turunkan `denoising_strength` ke 0.6 (lebih preserve original)
2. Naik `steps` ke 30+
3. Ubah model ke yang lebih realistik (SDXL)
4. Improve prompt dengan detail spesifik produk

### Container error saat startup
```bash
# Hapus container lama
docker rm sd-webui

# Jalankan ulang dengan verbose
docker run --gpus all --name sd-webui -p 7860:7860 \
  -v $(pwd)/sd-data:/workspace \
  ghcr.io/automatic1111/stable-diffusion-webui:latest \
  --verbose
```

## Stopping & Cleanup

```bash
# Stop container
docker stop sd-webui

# Remove container (tapi keep data di sd-data folder)
docker rm sd-webui

# Delete semua (termasuk data)
docker rm -v sd-webui
```

## Next Steps

Setelah setup selesai:

1. Buka prototype AI Kreatif di browser: http://localhost:3000/prototype-ai.html
2. Switch dari "SiliconFlow" ke "Local SD"
3. Masukkan URL: `http://localhost:7860` (default)
4. Upload burger foto → klik "Generate 3 Variasi"
5. Tunggu hasil (30–120 detik tergantung GPU)

---

**Tips:**
- Pertama kali jalankan container akan download model (~4–7 GB), sabar!
- Buat folder `sd-data` di project root biar data persist setelah container stop
- Untuk faster iteration, keep container jalan dan test di WebUI dulu sebelum call dari app

