const {
  handleUserDashboard,
  handleUserLogout,
  handleGetUserDeposit,
  handlePostUserDeposit,
  handleGetUserWithdraw,
  handlePostUserWithdraw,
  handleUserTransactions,
  handleGetUserStatement
} = require("../controllers/userController");
const express = require("express");
const { isLoggedIn } = require("../middleware/authorization");
const UserRouter = express.Router();

UserRouter.get("/dashboard", isLoggedIn, handleUserDashboard);
UserRouter.get("/deposit", isLoggedIn, handleGetUserDeposit);
UserRouter.post("/deposit", isLoggedIn, handlePostUserDeposit);
UserRouter.get("/withdraw", isLoggedIn, handleGetUserWithdraw);
UserRouter.get("/statement", isLoggedIn, handleGetUserStatement);
UserRouter.post("/withdraw", isLoggedIn, handlePostUserWithdraw);
UserRouter.get("/transactions", isLoggedIn, handleUserTransactions);
UserRouter.get("/logout", isLoggedIn, handleUserLogout);
module.exports = { UserRouter };
