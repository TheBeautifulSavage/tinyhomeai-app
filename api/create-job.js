import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const { data, error } = await supabase
    .from("image_jobs")
    .insert([{ prompt, status: "pending" }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ job: data });
}
