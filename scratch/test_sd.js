const url = 'https://dreaded-cornbread-enjoyer.ngrok-free.dev';

async function test() {
  const payload = {
    prompt: 'professional product photography, clean white studio background, soft box lighting, sharp focus, commercial photography, 8k, high resolution, no shadow distraction',
    negative_prompt: 'blurry, low quality, distorted',
    steps: 20,
    cfg_scale: 7,
    denoising_strength: 0.75,
    n_iter: 1,
    batch_size: 1,
    width: 512,
    height: 512,
    init_images: ['iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='] // 1x1 transparent png
  };

  try {
    const res = await fetch(`${url}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
