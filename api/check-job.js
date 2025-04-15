import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Job ID is required" });

  const { data, error } = await supabase
    .from("image_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Job not found" });

  res.status(200).json({ job: data });
}
