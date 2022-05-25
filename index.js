const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8888;

// middleware
// app.use(cors());
const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(express.json());



//Server Connection String
//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@inventory-management-p1.mpnfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p3znk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// client.connect((err) => {
//   const collection = client.db('test').collection('devices');
//   console.log('mongo is running');
//   // perform actions on the collection object
//   client.close();
// });


// console.log(uri);
//Funtion for api call
async function run() {
  try {
    await client.connect();
    //database name and colletion
    const toolsCollection = client
      .db("inventory-management-p11")
      .collection("tools");

    //User data
    const userCollection = client
      .db("inventory-management-p11")
      .collection("users");

    //User data
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2h" }
      );
      res.send({ result, token });
    });

    //Tools Section Start

 

    // post oreder data
    app.post("/tools", async (req, res) => {
      const newTools = req.body;
      console.log("adding new Tools", newTools);
      const result = await toolsCollection.insertOne(newTools);
      console.log("Add New Tools Result", result);
      res.send(result);
    });

    //Tools Section End

    //get item
    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
  } finally {
    // await client.close();
  }
}
//Exicute funtion
run().catch(console.dir);
//Server Running ok
app.get("/", (req, res) => {
  res.send("Srever is running......!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
