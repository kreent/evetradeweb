const http = require('http');
const https = require('https');
const url = require('url');

const API_BASE = 'https://bulletproofuniverse-281506149568.europe-west1.run.app';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse the request path
    const parsedUrl = url.parse(req.url);
    const targetUrl = `${API_BASE}${parsedUrl.path}`;

    console.log(`[${req.method}] ${req.url} -> ${targetUrl}`);

    // Collect request body for POST requests
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const options = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Forward the request to the actual API
        const apiReq = https.request(targetUrl, options, (apiRes) => {
            // Set response headers
            res.writeHead(apiRes.statusCode, {
                'Content-Type': apiRes.headers['content-type'] || 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            // Pipe the API response to the client
            apiRes.pipe(res);
        });

        apiReq.on('error', (error) => {
            console.error('API Request Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy server error', details: error.message }));
        });

        // Send the body for POST requests
        if (req.method === 'POST' && body) {
            apiReq.write(body);
        }

        apiReq.end();
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`\n🚀 Proxy server running on port ${PORT}`);
    console.log(`📡 Forwarding requests to: ${API_BASE}`);
    console.log(`\n💡 CORS enabled for all origins\n`);
});
