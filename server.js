const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Groundx } = require('groundx-typescript-sdk');
const OpenAI = require('openai');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/buckets', async (req, res) => {
    
    const groundx = new Groundx({
        apiKey: process.env.GROUNDX_API_KEY,
    });
    
    try {
        const response = await groundx.buckets.list();
        res.json(response.data.buckets);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching buckets');
    }
});

app.get('/api/documents/:bucketId', async (req, res) => {
    const groundX = new Groundx({
        apiKey: process.env.GROUNDX_API_KEY,
    });

    try {
        const getAllDocs = await groundX.documents.lookup({
            id: req.params.bucketId,
        });

        res.json(getAllDocs.data.documents);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/search', async (req, res) => {
    const groundx = new Groundx({
        apiKey: process.env.GROUNDX_API_KEY,
    });
    
    const stringQuery = req.body.query;
    const bucketId = req.body.bucketId;

    const result = await groundx.search.content({
        id: bucketId,
        n: 5,
        query: stringQuery
    });

    res.json(result.data.search.text);
});

app.post('/complete', async (req, res) => {   
    const llmText = req.body.llmText;
    const queryString = req.body.queryString;

    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": `Use the data below to generate a response. Indicate the sources you've been given, if any. If the provided content is inadequate, answer 'I don't have sufficent information to answer the question'.
            ===
            ${llmText}
            ===
            `
            },
            { "role": "user", "content": queryString },
        ],
    });

    res.json(gptResponse.choices[0].message.content);
});

app.listen(3000, () => console.log('Server running on port 3000'));