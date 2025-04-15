import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Poll for job status every 5 seconds
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

  // Submit prompt and create job
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

  // Generate PDF blueprint
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
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 600, margin: 'auto' }}>
      <h1>Tiny Home AI</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your dream tiny home..."
        style={{ width: '100%', padding: 10, fontSize: 16 }}
      />
      <button onClick={handleGenerate} style={{ marginTop: 10, padding: 10 }}>
        Generate Image
      </button>

      {loading && <p>Submitting prompt...</p>}
      {status && <p>Status: {status}</p>}

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
