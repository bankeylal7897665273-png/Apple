const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Frontend folder

// Storage for installed apps
const appsDir = path.join(__dirname, 'installed_apps');
if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir);
}

// ==========================================
// 🚀 SUPER BROWSER PROXY (Bypasses Iframe Blocks)
// ==========================================
app.use('/proxy', (req, res, next) => {
    let targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).send("URL is required");
    }
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,
        ignorePath: true, // Ignore path so it doesn't append /proxy to the target
        onProxyRes: function (proxyRes, req, res) {
            // Yeh 2 line ka code Google/YouTube ko lagta hai ki aap real browser use kar rahe ho
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        }
    })(req, res, next);
});

// App Install API
app.post('/install', (req, res) => {
    const { id, name, icon, url } = req.body;
    fs.writeFileSync(path.join(appsDir, `${id}.json`), JSON.stringify({ id, name, icon, url }));
    res.json({ success: true, message: `${name} installed securely!` });
});

// Get Apps API
app.get('/get_apps', (req, res) => {
    let installedApps = [];
    const files = fs.readdirSync(appsDir);
    files.forEach(file => {
        installedApps.push(JSON.parse(fs.readFileSync(path.join(appsDir, file))));
    });
    res.json(installedApps);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Proxy Phone Server running on port ${PORT}`);
});
