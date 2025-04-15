import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    setImageUrl('');

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("Image not returned. Check server logs.");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      alert("Image generation failed: " + err.message);
      console.error("Backend error:", err);
    }

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
