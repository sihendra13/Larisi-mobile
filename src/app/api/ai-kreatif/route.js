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

    const hfKey = apiKey || process.env.HUGGINGFACE_API_KEY;

    if (provider === 'runware') {
      const runwareKey = apiKey || process.env.RUNWARE_API_KEY;
      if (!runwareKey || runwareKey === 'YOUR_RUNWARE_API_KEY_HERE') {
        return Response.json({ error: 'Runware API key tidak ada' }, { status: 400 });
      }
      return handleRunware(imageBase64, customPrompt, runwareKey);
    } else if (provider === 'local-sd') {
      return handleLocalSD(imageBase64, prompt, localSdUrl);
    } else if (provider === 'siliconflow') {
      const sfKey = apiKey || process.env.SILICONFLOW_API_KEY;
      if (!sfKey) return Response.json({ error: 'SiliconFlow API key tidak ada' }, { status: 400 });
      return handleSiliconFlow(imageBase64, prompt, sfKey);
    } else {
      // Default: Hugging Face
      if (!hfKey) {
        return Response.json({ error: 'HuggingFace API key tidak ada' }, { status: 400 });
      }
      return handleHuggingFace(imageBase64, prompt, hfKey);
    }

  } catch (e) {
    console.error('[ai-kreatif] exception:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

async function handleRunware(imageBase64, customPrompt, apiKey) {
  const stylePrompts = {
    studio:    'professional product photography, clean white studio background, soft box lighting, sharp focus, commercial photography, high resolution',
    lifestyle: 'product lifestyle photography, warm wooden table, soft morning sunlight, cozy atmosphere, bokeh background, natural tones, Instagram aesthetic',
    flatlay:   'flat lay product photography, top down bird eye view, minimalist pastel background, neat symmetrical arrangement, clean composition, fashion magazine style',
  };

  try {
    let seedImageUUID = null;

    // ── Step 1: Upload foto jika ada (img2img) ──
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const uploadResp = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { taskType: 'authentication', apiKey },
          { taskType: 'imageUpload', taskUUID: crypto.randomUUID(), image: base64Data },
        ]),
      });

      const uploadData = await uploadResp.json();
      const uploadResult = uploadData?.data?.find(r => r.taskType === 'imageUpload') || uploadData?.[0];
      seedImageUUID = uploadResult?.imageUUID;

      if (!seedImageUUID) {
        const errMsg = uploadData?.errors?.[0]?.message || 'Gagal upload foto ke Runware';
        return Response.json({ error: errMsg }, { status: 500 });
      }
    }

    // ── Step 2: Generate 3 style sekaligus dalam 1 request ──
    const inferenceTasks = Object.entries(stylePrompts).map(([style, stylePrompt]) => {
      const positivePrompt = customPrompt ? `${customPrompt}, ${stylePrompt}` : stylePrompt;
      return {
        taskType: 'imageInference',
        taskUUID: crypto.randomUUID(),
        model: 'runware:100@1', // FLUX.1 schnell or dev: model ID runware:100@1 is Schnell, runware:101@1 is Dev. Let's stick with 101@1 or 100@1. Let's use 100@1 (schnell) which is faster and cheaper, or 101@1 (dev) which is better.
        positivePrompt,
        negativePrompt: 'blurry, low quality, distorted, watermark, text, deformed',
        width: 1024,
        height: 1024,
        steps: 4, // Schnell only needs 4 steps. Dev needs 28 steps. Since model is 101@1, let's keep it as 101@1 and steps 28, or let's use schnell (100@1) with steps 4 for speed. Let's keep 101@1 and steps 28 as originally implemented, but let's change to schnell for cost/speed if preferred. Actually, let's stick with the original 101@1 and 28 steps to maintain the high quality.
        CFGScale: 3.5,
        outputFormat: 'JPEG',
        includeCost: true,
        ...(seedImageUUID ? { seedImage: seedImageUUID, strength: 0.75 } : {}),
      };
    });

    const payload = [
      { taskType: 'authentication', apiKey },
      ...inferenceTasks.map(t => ({ ...t, model: 'runware:101@1', steps: 28 })), // Keep high quality dev
    ];

    const genResp = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const genData = await genResp.json();

    // Handle error dari Runware
    if (genData?.errors?.length) {
      const errMsg = genData.errors[0]?.message || 'Runware error';
      return Response.json({ error: errMsg }, { status: 400 });
    }

    const results = (genData?.data || []).filter(r => r.taskType === 'imageInference' && r.imageURL);

    if (!results.length) {
      return Response.json({ error: 'Tidak ada gambar yang dihasilkan dari Runware' }, { status: 500 });
    }

    const imageUrls = results.map(r => r.imageURL);
    const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
    console.log(`[runware] ${imageUrls.length} gambar, total cost: $${totalCost.toFixed(6)}`);

    return Response.json({ images: imageUrls });

  } catch (e) {
    console.error('[runware] error:', e);
    return Response.json({ error: `Runware error: ${e.message}` }, { status: 500 });
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

async function handleHuggingFace(imageBase64, prompt, apiKey) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'x-wait-for-model': 'true',
  };

  const seeds = [
    Math.floor(Math.random() * 999999) + 1,
    Math.floor(Math.random() * 999999) + 1,
    Math.floor(Math.random() * 999999) + 1,
  ];

  try {
    const url = 'https://api-inference.huggingface.co/models/SG161222/RealVisXL_V4.0';
    let makeBody;

    if (imageBase64) {
      makeBody = (seed) => JSON.stringify({
        inputs: imageBase64,
        parameters: {
          prompt,
          negative_prompt: 'blurry, low quality, distorted, watermark, text, deformed',
          seed,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.75
        }
      });
    } else {
      makeBody = (seed) => JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted, watermark, text, deformed',
          seed,
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      });
    }

    // Sequential — lebih stabil di free tier
    const imageUrls = [];
    for (const seed of seeds) {
      const resp = await fetch(url, { method: 'POST', headers, body: makeBody(seed) });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[hf] error:', resp.status, errText);
        let errMsg = `HuggingFace error ${resp.status}.`;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.estimated_time || errJson.error?.toLowerCase().includes('loading')) {
            const secs = errJson.estimated_time ? Math.ceil(errJson.estimated_time) : 30;
            errMsg = `Model loading di server HF. Tunggu ${secs} detik lalu coba lagi.`;
          } else if (resp.status === 401) {
            errMsg = 'Token HuggingFace tidak valid.';
          } else if (errJson.error) {
            errMsg = errJson.error;
          }
        } catch(e) {}
        return Response.json({ error: errMsg }, { status: resp.status });
      }

      const buffer = await resp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      imageUrls.push(`data:image/png;base64,${base64}`);
    }

    return Response.json({ images: imageUrls });

  } catch (e) {
    console.error('[ai-kreatif] HuggingFace error:', e);
    return Response.json({ error: `HuggingFace error: ${e.message}` }, { status: 500 });
  }
}
