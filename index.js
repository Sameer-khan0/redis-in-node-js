const Redis = require("ioredis");
const dotenv = require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

const redis = new Redis({
  host: process.env.HOST,
  port: process.env.REDIS_PORT,
  username: "default",
  password: process.env.REDIS_PASSWORD,
  tls: false,
});

redis.on("connect", () => {
  console.log("Connected to Redis!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

app.get("/post", async (req, res) => {
  try {
    const data = await redis.get("posts");
    if (data !== null) {
        console.log("got from redis")
      res.json(JSON.parse(data));
    } else {
      const data = await fetch("https://jsonplaceholder.typicode.com/posts");
      const formatedData = await data.json();
      await redis.set("posts", JSON.stringify(formatedData), "EX", 3000);
      res.json(formatedData);
    }
  } catch (error) {
    console.error(error);
}
});

app.get("/redis-keys-values", async (req, res) => {
    try {
      const keys = await redis.keys('*');
  
      const values = await redis.mget(keys);
  
      const result = {};
  
      keys.forEach((key, index) => {
        try {
          const parsedValue = JSON.parse(values[index]);
          result[key] = parsedValue;
        } catch (error) {
          result[key] = values[index]; 
        }
      });
  
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
