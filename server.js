const express = require('express');
const fs = require('fs');
const path = require('path');
// Node 18+ me fetch built-in hota hai, agar purana node ho toh npm install node-fetch karna padega
const app = express();

app.use(express.static('public'));
app.use(express.json());

const appsDir = path.join(__dirname, 'installed_apps');
if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir);
}

// 100% Real Browser Proxy Route
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        // Target website ka data fetch kar rahe hain server-side se
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'text/html');

        // Agar HTML hai, toh relative links ko absolute me badalna hoga taaki css/images load ho sakein
        if (contentType && contentType.includes('text/html')) {
            let html = await response.text();
            const urlObj = new URL(targetUrl);
            
            // Injecting base URL taaki site ke assets load ho sakein
            const baseTag = `<base href="${urlObj.origin}/">`;
            html = html.replace('<head>', `<head>${baseTag}`);
            
            res.send(html);
        } else {
            // Baaki assets (images/js) ke liye direct buffer send karenge
            const arrayBuffer = await response.arrayBuffer();
            res.send(Buffer.from(arrayBuffer));
        }
    } catch (error) {
        res.status(500).send('Proxy Error: Website content nahi la paya. URL sahi check karein.');
    }
});

// App Installer API (Render Storage)
app.post('/install', (req, res) => {
    const { id, name, icon, url } = req.body;
    const appData = { id, name, icon, url };
    fs.writeFileSync(path.join(appsDir, `${id}.json`), JSON.stringify(appData));
    res.json({ success: true, message: `${name} Virtual Phone me install ho gaya!` });
});

app.get('/get_apps', (req, res) => {
    let installedApps = [];
    if (fs.existsSync(appsDir)) {
        const files = fs.readdirSync(appsDir);
        files.forEach(file => {
            const data = fs.readFileSync(path.join(appsDir, file));
            installedApps.push(JSON.parse(data));
        });
    }
    res.json(installedApps);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Real Web-Phone OS running on port ${PORT}`);
});
