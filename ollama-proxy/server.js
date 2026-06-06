const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 11434;

// API key untuk Ollama cloud
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '43f189ff4cb74195b3104a02cf1af25f.16j3wT6nc2RUtcgfgI8iW3_J';
const OLLAMA_BASE_URL = 'https://ollama.com';

// Proxy all requests to Ollama cloud with Authorization header
app.use('/', createProxyMiddleware({
  target: OLLAMA_BASE_URL,
  changeOrigin: true,
  selfHandleResponse: false,
  router: {
    'host': OLLAMA_BASE_URL
  },
  onProxyReq: (proxyReq, req, res) => {
    // Tambahkan Authorization header
    proxyReq.setHeader('Authorization', `Bearer ${OLLAMA_API_KEY}`);
    proxyReq.setHeader('Content-Type', 'application/json');
    
    // Log request
    console.log(`[PROXY] ${req.method} ${req.url} -> ${OLLAMA_BASE_URL}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('[ERROR]', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Ollama Cloud Proxy',
    version: '1.0.0',
    target: OLLAMA_BASE_URL
  });
});

app.listen(PORT, () => {
  console.log(`Ollama Cloud Proxy running on port ${PORT}`);
  console.log(`Target: ${OLLAMA_BASE_URL}`);
});
