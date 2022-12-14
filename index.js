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

//jwt
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    const ordersCollection = client
      .db("inventory-management-p11")
      .collection("orders");

    const userInfoUpdateCollection = client
      .db("inventory-management-p11")
      .collection("userInfoUpdate");

    const reviewsCollection = client
      .db("inventory-management-p11")
      .collection("reviews");

    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    };

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

    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolsCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });

    //Tools By Id
    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const tool = await toolsCollection.findOne(query);
      res.send(tool);
    });

    // // post oreder data
    // app.post("/tools", async (req, res) => {
    //   const newTools = req.body;
    //   console.log("adding new Tools", newTools);
    //   const result = await toolsCollection.insertOne(newTools);
    //   console.log("Add New Tools Result", result);
    //   res.send(result);
    // });
    //

    ///////////////////////////////////////////////////////////////////////////////////////////////
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

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
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });
    //////////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////////////////////////
    app.get("/order", verifyJWT, async (req, res) => {
      const email = req.query.email;
      // const authorization = req.headers.authorization;
      // console.log(authorization);
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email };
        // const cursor = ordersCollection.find(query);
        // const orders = await cursor.toArray();
        const orders = await ordersCollection.find(query).toArray();
        console.log(orders);
        return res.send(orders);
  
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    app.get("/allorder", async (req, res) => {
  
      const authorization = req.headers.authorization;
      console.log(authorization);
        const query = { };
        // const cursor = ordersCollection.find(query);
        // const orders = await cursor.toArray();
        const orders = await ordersCollection.find(query).toArray();
        console.log(orders);
        return res.send(orders);

    });

    app.get("/order/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await ordersCollection.findOne(query);
      res.send(order);
    });

    // post order data
    app.post("/order", async (req, res) => {
      const newOrder = req.body;
      console.log("adding new Tools", newOrder);
      const result = await ordersCollection.insertOne(newOrder);
      console.log("Add New order Result", result);
      res.send(result);
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // user info update section start
    // change

    app.get("/userinfo", async (req, res) => {
      const query = {};
      console.log("user info query", query);
      const cursor = userInfoUpdateCollection.find(query);
      const userInfo = await cursor.toArray();
      console.log("user info reviews", userInfo);
      res.send(userInfo);
    });

    app.post("/userinfo", async (req, res) => {
      const userInfoUpdate = req.body;
      console.log("adding user Info Update", userInfoUpdate);
      const result = await userInfoUpdateCollection.insertOne(userInfoUpdate);
      console.log("user Info Update Result", result);
      res.send(result);
    });
    // user info update section end
    // users reviews sections start
    // all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      // console.log('query', query);
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      // console.log('reviews', reviews);
      res.send(reviews);
    });
    // post review data
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      console.log("adding new review", newReview);
      const result = await reviewsCollection.insertOne(newReview);
      console.log("Add New review Result", result);
      res.send(result);
    });
    // users reviews sections end
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
//App Port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
