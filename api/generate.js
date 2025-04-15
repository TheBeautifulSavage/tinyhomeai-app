export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }
  
  // Enhanced prompt for tiny homes
  const enhancedPrompt = `A photorealistic architectural visualization of a tiny home: ${prompt}. Include details of structure, materials, and surroundings. Make it look like a professional architectural render.`;
  
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key is not configured" });
    }
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024"
      })
    });
    
    const contentType = response.headers.get("content-type") || "";
    
    // Check if response is JSON
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Non-JSON OpenAI response:", text);
      return res.status(502).json({
        message: "OpenAI returned invalid format (not JSON)",
        raw: text
      });
    }
    
    const data = await response.json();
    
    // Handle OpenAI error responses
    if (data.error) {
      console.error("🛑 OpenAI error response:", data);
      return res.status(502).json({
        message: data.error.message || "OpenAI returned an error",
        error: data.error
      });
    }
    
    // Success path - return the image URL
    if (data?.data?.[0]?.url) {
      return res.status(200).json({ imageUrl: data.data[0].url });
    }
    
    // Fallback for unexpected response format
    console.error("⚠️ Unexpected response format:", data);
    return res.status(500).json({
      message: "No image returned from OpenAI",
      fullResponse: data
    });
    
  } catch (error) {
    console.error("🔥 Server Crash:", error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
}
