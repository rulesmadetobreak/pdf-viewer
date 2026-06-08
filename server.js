const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend HTML file
app.use(express.static(path.join(__dirname, 'public')));

// PROXY endpoint — fetches any URL and returns it to the browser
app.get('/proxy', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch: ' + response.statusText });
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the file directly to the browser
    response.body.pipe(res);

  } catch (err) {
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log('PDF Proxy Server running on port ' + PORT);
});
