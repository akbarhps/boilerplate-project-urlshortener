require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var validUrl = require('valid-url');
const Url = require('./models/url.model');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to Database"));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/new', async function (req, res) {
    const url = new Url();
    const originalUrl = req.body.url;
    if (!validUrl.isWebUri(originalUrl)) {
        return res.send({ error: 'invalid url' });
    }
    try {
        url.original_url = originalUrl;
        url.short_url = randomString(7);
        await url.save();
        res.json(url);
    } catch (e) {
        res.send({ error: 'invalid url' });
    }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
    const short_url = req.params.short_url;
    try {
        const result = await Url.findOne({ short_url });
        if (!result) {
            res.json({ error: "invalid url" });
        }
        res.redirect(result.original_url);
    } catch (e) {
        res.json({ error: e.message });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});

const randomString = (n) => {
    return [...Array(n)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
}