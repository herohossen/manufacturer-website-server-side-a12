const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8888;

// middleware
app.use(cors());
app.use(express.json());



//Server Connection String
//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@inventory-management-p1.mpnfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p3znk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// console.log(uri);
//Funtion for api call
async function run() {
  try {
    await client.connect();
    //database name and colletion
    const itemCollection = client
      .db("inventory-management-p11")
      .collection("products");

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
