// File: pages/api/generate-image-alt.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const enhancedPrompt = `A photorealistic architectural visualization of a tiny home: ${prompt}. Include details of structure, materials, and surroundings. Make it look like a professional architectural render suitable for a blueprint.`;

  try {
    // Create a new OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("Making request to OpenAI API...");

    // Generate the image
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
    });

    console.log("OpenAI request successful");

    // Return the generated image URL
    return res.status(200).json({
      imageUrl: result.data[0].url
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Handle different error types
    if (error.response) {
      // OpenAI API error
      console.error("OpenAI API response error:", error.response.data);
      return res.status(error.response.status || 500).json({
        error: error.response.data?.error?.message || "Error from image service"
      });
    } else {
      // Network error or other issue
      return res.status(500).json({
        error: error.message || "Failed to generate image"
      });
    }
  }
}
