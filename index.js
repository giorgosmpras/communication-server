const cors = require("cors");
const express = require("express");
const connectDB = require("./db/connection");
require("dotenv").config();

const operatorRoute = require("./routes/operator_api");
const mailtrapRoute = require("./routes/mailtrap_api");

const app = express();

app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/api/operator", operatorRoute);
app.use("/api/mailtrap", mailtrapRoute);

const port = process.env.SERVER_PORT;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}...`);
      console.log(`Database Connected...`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
