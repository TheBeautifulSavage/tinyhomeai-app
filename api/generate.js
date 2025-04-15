// File: pages/api/generate-image.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get prompt from request body
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Enhanced prompt for better tiny home results
  const enhancedPrompt = `A photorealistic architectural visualization of a tiny home: ${prompt}. Include details of structure, materials, and surroundings. Make it look like a professional architectural render suitable for a blueprint.`;

  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OpenAI API key");
      return res.status(500).json({ error: "Server configuration error (missing API key)" });
    }

    console.log("Sending request to OpenAI API...");
    
    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024"
      })
    });

    // Get response as text first to avoid JSON parsing errors
    const responseText = await response.text();
    
    console.log("OpenAI response status:", response.status);
    console.log("Response content type:", response.headers.get("content-type"));
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.error("Raw response:", responseText.substring(0, 200) + "...");
      
      return res.status(502).json({
        error: "Invalid response from image service",
        details: responseText.substring(0, 200) // Only send part of the response to avoid large payloads
      });
    }

    // Check for error in the parsed response
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return res.status(502).json({
        error: data.error.message || "Error from image service",
        code: data.error.code || "unknown_error"
      });
    }

    // Check for valid image URL in response
    if (data.data && data.data[0] && data.data[0].url) {
      // Success - return the image URL
      return res.status(200).json({ imageUrl: data.data[0].url });
    } else {
      console.error("Unexpected OpenAI response structure:", data);
      return res.status(502).json({
        error: "Invalid response format from image service",
        details: "Response did not contain expected image URL"
      });
    }
  } catch (error) {
    // Handle any other errors
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Server error processing image request",
      message: error.message
    });
  }
}
