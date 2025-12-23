const https = require('https');
const url = require('url');

exports.handler = async function (event, context) {
    const API_BASE = 'https://bulletproofuniverse-281506149568.europe-west1.run.app';

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    // Parse path (remove /api prefix if present)
    const path = event.path.replace(/^\/\.netlify\/functions\/proxy/, '').replace(/^\/api/, '');
    const targetUrl = `${API_BASE}${path}`;

    console.log(`Proxying ${event.httpMethod} request to: ${targetUrl}`);

    return new Promise((resolve, reject) => {
        const options = {
            method: event.httpMethod,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(targetUrl, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            console.error('API Request Error:', error);
            resolve({
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Proxy error', details: error.message })
            });
        });

        if (event.body) {
            req.write(event.body);
        }

        req.end();
    });
};
