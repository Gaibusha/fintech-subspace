const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Environment variables
const HASURA_GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Fetch user data
app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.post(
            HASURA_GRAPHQL_URL,
            {
                query: `
                    query {
                        users {
                            id
                            name
                            balance
                        }
                    }
                `,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
                },
            }
        );
        res.json(response.data.data.users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle transactions
app.post('/api/transactions', async (req, res) => {
    const { user_id, amount, type } = req.body;
    try {
        const response = await axios.post(
            HASURA_GRAPHQL_URL,
            {
                query: `
                    mutation insertTransaction($user_id: uuid!, $amount: numeric!, $type: String!) {
                        insert_transactions_one(object: {
                            user_id: $user_id,
                            amount: $amount,
                            type: $type,
                            created_at: "now()"
                        }) {
                            id
                        }
                    }
                `,
                variables: { user_id, amount, type },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
                },
            }
        );
        res.json(response.data.data.insert_transactions_one);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


