const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors(
    {
        origin: ['http://localhost:5173'],
        optionsSuccessStatus: 200,
        credentials: true
    }
));
app.use(express.json());

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oldlbnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

// Collection
const usersCollection = client.db('gadgetShop').collection('users');
const proDuctCollection = client.db('gadgetShop').collection('products');



const dbConnect = async () => {
    try {
        await client.connect();
        console.log("Database Connected");

        // get users
        app.get('/user/:email', async (req, res) => {
            const query = {email: req.params.email};
            const user = await usersCollection.findOne(query);
            // if (user) {
            //     return res.send({ message: 'No User Found' });
            // }
            res.send(user);
        });

        // users post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists' });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
      

    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect();

// api

app.get('/', (req, res) => {
    res.send('Server Is Running!')
  });
  // JWT 
  app.post('/jwt', (req, res) => {
    const userEmail = req.body;
    const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d'
    });
    res.send({token});
  });

  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });