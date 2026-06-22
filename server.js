const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Render ke server par folder create karna (512MB storage space use karne ke liye)
const appsDir = path.join(__dirname, 'installed_apps');
if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir);
}

// App Install API - Server par file save karega
app.post('/install', (req, res) => {
    const { id, name, icon, url } = req.body;
    const appData = { id, name, icon, url };
    
    // App ka data server ki hard drive (Render storage) par save kar rahe hain
    fs.writeFileSync(path.join(appsDir, `${id}.json`), JSON.stringify(appData));
    
    res.json({ success: true, message: `${name} phone me install ho gaya!` });
});

// Get Installed Apps API - Phone load hone par apps fetch karega
app.get('/get_apps', (req, res) => {
    let installedApps = [];
    const files = fs.readdirSync(appsDir);
    
    files.forEach(file => {
        const data = fs.readFileSync(path.join(appsDir, file));
        installedApps.push(JSON.parse(data));
    });
    
    res.json(installedApps);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Phone OS Backend running on port ${PORT}`);
});
