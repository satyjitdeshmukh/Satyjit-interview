const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const GEMINI_API_KEY = 'AIzaSyCTA6MXE7vFdAX5583a9y5aWxB1nkSwn-8';
const PORT = 8080;

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Gemini API Backend');
});

app.get('/bot/chat', async (req, res) => {
    const prompt = req.query.prompt;
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/engines/davinci-codex/completions`, 
            {
                prompt,
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${GEMINI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data.choices[0].text);
    } catch (error) {
        console.error("Error making request to Gemini API:", error.message);
        res.status(500).send("An error occurred while fetching feedback.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
