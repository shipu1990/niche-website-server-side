const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require ('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8s3t0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//console.log(uri);
async function run (){
    try{
        await client.connect();
        const database = client.db('watch_portal');
        const watchCollection = database.collection('watches');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');
        const bookingCollection = database.collection('booking');

        app.get('/watches', async(req, res) =>{
          const query = watchCollection.find({});
          const watches = await query.toArray();
          res.send(watches);
        })
        app.get('/watches/:id', async (req, res) =>{
          const id = req.params.id;
          const query = {_id : ObjectId(id)};
          const watch = await watchCollection.findOne(query);
          res.json(watch);
        })
        
        app.post('/addWatch', async (req, res) => {
          const watch = req.body;
          const result = await watchCollection.insertOne(watch);
          console.log(result);
          res.json(result)
        });

        app.post('/addBooking', async (req, res) => {
          const booking = req.body;
          const result = await bookingCollection.insertOne(booking);
          console.log(result);
          res.json(result)
        });
        app.get('/orders', async(req, res) =>{
          const query = bookingCollection.find({});
          const orders = await query.toArray();
          res.send(orders);
        })
        app.get("/orders/:email", async (req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const result = await bookingCollection.find(query).toArray();
          res.send(result);
        });
        app.delete("/ordersDelete/:id", async (req, res) => {
          const id = req.params.id
          const query = {_id : ObjectId(id)};
          const result = await bookingCollection.deleteOne(query);
          console.log(result);
          res.send(result);
        });

        app.put("/updateStatus/:id", (req, res) => {
        const id = req.params.id;
        const updatedStatus = req.body.status;
        const filter = { _id: ObjectId(id) };
        console.log(updatedStatus);
        bookingsCollection
          .updateOne(filter, {
            $set: { status: updatedStatus },
          })
          .then((result) => {
            res.send(result);
          });
      });

        app.get('/review', async(req, res) =>{
          const query = reviewCollection.find({});
          const reviews = await query.toArray();
          res.send(reviews);
        })

        app.post('/addReview', async (req, res) => {
          const review = req.body;
          const result = await reviewCollection.insertOne(review);
          console.log(result);
          res.json(result)
        });

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
      })

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

  app.put('/users/admin', async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = { $set: { role: 'admin' } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json(result);

})
    }
    finally{

    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})