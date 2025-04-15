import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImageUrl('');
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });
    const data = await response.json();
    setImageUrl(data.data[0].url);
    setLoading(false);
  };

  const downloadPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>Tiny Home AI Blueprint</h1>
      <p><strong>Prompt:</strong> ${prompt}</p>
      <img src="${imageUrl}" width="500"/>
    `;
    html2pdf().from(element).save("tiny-home-blueprint.pdf");
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Tiny Home AI</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your dream tiny home..."
        style={{ width: '100%', padding: 10, fontSize: 16 }}
      />
      <button onClick={generateImage} style={{ marginTop: 10, padding: 10 }}>
        Generate Image
      </button>
      {loading && <p>Loading...</p>}
      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
          <button onClick={downloadPDF} style={{ marginTop: 10, padding: 10 }}>
            Download PDF Blueprint
          </button>
        </div>
      )}
    </div>
  );
};

export default App;