const express = require("express");
const route = express.Router();
const {
  createOperator,
  loginOperator,
  forgotPassword,
  resetPassword,
} = require("../controllers/operatorHandler");

route.post("/create-operator", createOperator);
route.post("/login", loginOperator);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);

route.get("/health", async (req, res) => {
  return res.send("OKtest");
});

module.exports = route;
