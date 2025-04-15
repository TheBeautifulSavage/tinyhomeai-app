import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState('generate');
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-job?id=${jobId}`);
        const data = await res.json();

        if (data.job?.status === 'done') {
          setImageUrl(data.job.image_url);
          setStatus('done');
          clearInterval(interval);
        } else if (data.job?.status === 'failed') {
          setStatus('failed');
          clearInterval(interval);
        } else {
          setStatus(data.job?.status || 'pending');
        }
      } catch (err) {
        console.error("Error checking job status:", err);
        setStatus('error');
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl('');
    setStatus('');
    setJobId(null);

    try {
      const res = await fetch('/api/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!data.job?.id) throw new Error("No job returned");

      setJobId(data.job.id);
      setStatus('pending');
    } catch (err) {
      console.error("❌ Job creation failed:", err);
      alert("Job creation failed: " + err.message);
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

  const fetchGallery = async () => {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    setGalleryImages(data.images);
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      padding: 30,
      maxWidth: 800,
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 10 }}>🏡 TinyHomeAI</h1>
      <p style={{ color: '#555', marginBottom: 30 }}>
        Describe your dream tiny home. We'll generate an image + PDF blueprint using AI.
      </p>

      <div style={{ marginBottom: 30 }}>
        <button onClick={() => setView('generate')} style={{ marginRight: 10 }}>
          🧠 Generate
        </button>
        <button onClick={() => {
          setView('gallery');
          fetchGallery();
        }}>
          📸 Gallery
        </button>
      </div>

      {view === 'generate' && (
        <>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: A modern tiny cabin in the Alaskan wilderness"
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ccc',
              marginBottom: 10
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: 16,
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: 8
            }}
          >
            {loading ? 'Submitting...' : 'Generate Image'}
          </button>

          {status && <p style={{ marginTop: 20 }}>Status: {status}</p>}

          {imageUrl && (
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <img
                src={imageUrl}
                alt="Generated"
                style={{ maxWidth: '100%', borderRadius: 12 }}
              />
              <button
                onClick={downloadPDF}
                style={{
                  marginTop: 20,
                  padding: '10px 20px',
                  backgroundColor: '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8
                }}
              >
                Download PDF Blueprint
              </button>
            </div>
          )}
        </>
      )}

      {view === 'gallery' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 20
        }}>
          {galleryImages.map(img => (
            <div key={img.id} style={{
              background: '#fff',
              padding: 10,
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <img src={img.image_url} alt={img.prompt} style={{ width: '100%', borderRadius: 8 }} />
              <p style={{ fontSize: 14, marginTop: 10 }}>{img.prompt}</p>
              <a href={img.image_url} target="_blank" rel="noopener noreferrer">Open Full Image</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
