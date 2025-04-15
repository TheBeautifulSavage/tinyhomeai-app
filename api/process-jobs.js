import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { data: jobs, error } = await supabase
    .from("image_jobs")
    .select("*")
    .eq("status", "pending")
    .limit(1);

  if (error || !jobs.length) {
    return res.status(200).json({ message: "No pending jobs" });
  }

  const job = jobs[0];

  await supabase.from("image_jobs").update({ status: "processing" }).eq("id", job.id);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: job.prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const result = await response.json();
    const imageUrl = result?.data?.[0]?.url;

    if (imageUrl) {
      await supabase
        .from("image_jobs")
        .update({ status: "done", image_url: imageUrl })
        .eq("id", job.id);
    } else {
      throw new Error("Image generation failed");
    }

  } catch (e) {
    await supabase
      .from("image_jobs")
      .update({ status: "failed" })
      .eq("id", job.id);
  }

  res.status(200).json({ message: "Job processed" });
}
