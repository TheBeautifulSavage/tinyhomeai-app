export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const contentType = response.headers.get("content-type") || "";

    // Handle non-JSON errors gracefully
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("❌ Non-JSON response from OpenAI:", text);
      return res.status(502).json({ message: "Invalid response from OpenAI", raw: text });
    }

    const data = await response.json();

    if (!data?.data?.[0]?.url) {
      return res.status(500).json({
        message: "Image not returned from OpenAI",
        details: data,
      });
    }

    return res.status(200).json({ imageUrl: data.data[0].url });

  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
