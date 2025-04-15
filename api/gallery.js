import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from("image_jobs")
    .select("id, prompt, image_url, created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(100); // adjust as needed

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ images: data });
}
