// API Route: proxy ke SiliconFlow atau Local Stable Diffusion
// Dipanggil dari prototype-ai.html untuk menghindari CORS

export async function POST(request) {
  try {
    const { imageBase64, style, customPrompt, provider, apiKey, localSdUrl } = await request.json();

    // Prompt per style
    const prompts = {
      studio: 'professional product photography, clean white studio background, soft box lighting, sharp focus, commercial photography, 8k, high resolution, no shadow distraction',
      lifestyle: 'product lifestyle photography, warm wooden table surface, soft morning sunlight through window, cozy atmosphere, bokeh background, natural tones, Instagram aesthetic',
      flatlay: 'flat lay product photography, top down bird eye view, minimalist pastel background, neat symmetrical arrangement, clean composition, fashion magazine style, soft shadows',
    };

    const basePrompt = prompts[style] || prompts.studio;
    const prompt = customPrompt ? `${customPrompt}, ${basePrompt}` : basePrompt;

    if (provider === 'local-sd') {
      return handleLocalSD(imageBase64, prompt, localSdUrl);
    } else if (provider === 'huggingface') {
      if (!apiKey) return Response.json({ error: 'HuggingFace token tidak ada' }, { status: 400 });
      return handleHuggingFace(imageBase64, prompt, apiKey);
    } else {
      // Default: SiliconFlow
      if (!apiKey) {
        return Response.json({ error: 'API key tidak ada' }, { status: 400 });
      }
      return handleSiliconFlow(imageBase64, prompt, apiKey);
    }

  } catch (e) {
    console.error('[ai-kreatif] exception:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function handleHuggingFace(imageBase64, prompt, apiKey) {
  // Model: stabilityai/stable-diffusion-xl-base-1.0 untuk txt2img
  // Untuk img2img, gunakan model yang support image input
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'x-wait-for-model': 'true',
  };

  // Generate 3 variasi secara parallel dengan seed berbeda
  const seeds = [42, 123, 777];

  if (imageBase64) {
    // img2img: gunakan model SDXL dengan image input via Inference API
    // Convert base64 ke binary
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const requests = seeds.map(seed =>
      fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'x-wait-for-model': 'true' },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { seed, num_inference_steps: 30, guidance_scale: 7.5 }
        }),
      })
    );

    const responses = await Promise.all(requests);
    const imageUrls = [];

    for (const resp of responses) {
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[hf] error:', resp.status, errText);
        // Coba parse error message
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error?.includes('loading')) {
            return Response.json({ error: 'Model sedang loading, coba lagi dalam 30 detik.' }, { status: 503 });
          }
        } catch(e) {}
        return Response.json({ error: `HuggingFace error ${resp.status}. Cek token dan coba lagi.` }, { status: resp.status });
      }
      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageUrls.push(`data:image/jpeg;base64,${base64}`);
    }

    return Response.json({ images: imageUrls });

  } else {
    // txt2img: SDXL Lightning (lebih cepat, gratis)
    const requests = seeds.map(seed =>
      fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: { seed, num_inference_steps: 30, guidance_scale: 7 }
        }),
      })
    );

    const responses = await Promise.all(requests);
    const imageUrls = [];

    for (const resp of responses) {
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[hf] txt2img error:', resp.status, errText);
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error?.includes('loading')) {
            return Response.json({ error: 'Model sedang loading, tunggu 30 detik dan coba lagi.' }, { status: 503 });
          }
        } catch(e) {}
        return Response.json({ error: `HuggingFace error ${resp.status}.` }, { status: resp.status });
      }
      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageUrls.push(`data:image/jpeg;base64,${base64}`);
    }

    return Response.json({ images: imageUrls });
  }
}

async function handleSiliconFlow(imageBase64, prompt, apiKey) {
  const body = {
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt,
    batch_size: 3,
    image_size: '1024x1024',
    num_inference_steps: 4,
  };

  if (imageBase64) {
    body.image = imageBase64;
  }

  const sfResp = await fetch('https://api.siliconflow.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!sfResp.ok) {
    const errText = await sfResp.text();
    console.error('[ai-kreatif] SiliconFlow error:', sfResp.status, errText);
    return Response.json(
      { error: `SiliconFlow error ${sfResp.status}: ${errText}` },
      { status: sfResp.status }
    );
  }

  const data = await sfResp.json();
  const imageUrls = (data.images || []).map(img => img.url);
  return Response.json({ images: imageUrls, seed: data.seed });
}

async function handleLocalSD(imageBase64, prompt, localSdUrl) {
  const url = localSdUrl || 'http://localhost:7860';

  // Payload untuk Local Stable Diffusion
  const body = {
    prompt,
    negative_prompt: 'blurry, low quality, distorted',
    steps: 20,
    cfg_scale: 7,
    denoising_strength: 0.75, // untuk img2img: how much to transform original
    n_iter: 3, // generate 3 images
    batch_size: 1,
    width: 1024,
    height: 1024,
  };

  let sdResp;

  if (imageBase64) {
    // Image-to-image: gunakan /api/img2img
    body.init_images = [imageBase64];
    sdResp = await fetch(`${url}/api/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } else {
    // Text-to-image: gunakan /api/txt2img
    sdResp = await fetch(`${url}/api/txt2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  if (!sdResp.ok) {
    const errText = await sdResp.text();
    console.error('[ai-kreatif] Local SD error:', sdResp.status, errText);
    return Response.json(
      { error: `Local SD error (${url}). Pastikan Stable Diffusion WebUI sedang jalan dan accessible. Status: ${sdResp.status}` },
      { status: sdResp.status }
    );
  }

  const data = await sdResp.json();
  // Local SD return images dalam format base64 di data.images array
  const imageUrls = (data.images || []).map(img => `data:image/png;base64,${img}`);

  if (imageUrls.length === 0) {
    return Response.json({ error: 'Tidak ada gambar yang dihasilkan dari Local SD' }, { status: 500 });
  }

  return Response.json({ images: imageUrls, seed: data.seed });
}
