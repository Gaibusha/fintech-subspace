const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const HASURA_URL = process.env.HASURA_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Route to create a user
app.post('/create-user', async (req, res) => {
    const { username, email } = req.body;
    try {
        const response = await axios.post(HASURA_URL, {
            query: `
                mutation ($username: String!, $email: String!) {
                    insert_users_one(object: {username: $username, email: $email}) {
                        id
                    }
                }
            `,
            variables: { username, email }
        }, {
            headers: {
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET
            }
        });
        res.json(response.data.data.insert_users_one);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to create a transaction
app.post('/transaction', async (req, res) => {
  const { user_id, amount, type } = req.body;
  try {
      const response = await axios.post(HASURA_URL, {
          query: `
              mutation ($user_id: String!, $amount: numeric!, $type: String!) {
                  insert_transactions_one(object: {user_id: $user_id, amount: $amount, type: $type}) {
                      id
                  }
              }
          `,
          variables: { user_id: String(user_id), amount: parseFloat(amount), type }
      }, {
          headers: {
              'x-hasura-admin-secret': HASURA_ADMIN_SECRET
          }
      });
      console.log('Hasura Response:', response.data); // Log response from Hasura
      res.json(response.data.data.insert_transactions_one);
  } catch (error) {
      console.error('Error during transaction:', error.response ? error.response.data : error.message); // Log detailed error
      res.status(500).json({ error: error.message });
  }
});


// Route to get transactions for a specific user
app.get('/transactions/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const response = await axios.post(HASURA_URL, {
            query: `
                query ($user_id: Int!) {
                    transactions(where: {user_id: {_eq: $user_id}}) {
                        id
                        amount
                        type
                        created_at
                    }
                }
            `,
            variables: { user_id }
        }, {
            headers: {
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET
            }
        });
        res.json(response.data.data.transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get all transactions
app.get('/transactions', async (req, res) => {
    try {
        const response = await axios.post(HASURA_URL, {
            query: `
                query {
                    transactions {
                        id
                        user_id
                        amount
                        type
                        created_at
                    }
                }
            `,
        }, {
            headers: {
                'x-hasura-admin-secret': HASURA_ADMIN_SECRET
            }
        });
        res.json(response.data.data.transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

