const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {sendMail}=require('../utils/sendMail')



const { Transaction } = require("../models/transaction");

function handleGetTransfer(req, res) {
  res.render("transfer", { message: null });
}

async function handlePostTransfer(req, res) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      console.log("handlePostTransfer");
      const { receiverEmail, amount, password } = req.body;
      const transferAmount = Number(amount);
      const senderEmail = req.session.user.email;
      const senderUser = await User.findOne({ email: senderEmail }).session(
        session,
      );
      if (!senderUser) {
        console.log(" !senderUser ");
        return res.redirect("/login");
      }

      const receiverUser = await User.findOne({ email: receiverEmail }).session(
        session,
      );
      if (!receiverUser) {
        console.log(" !receiverUser ");
        return res.render("transfer", { message: "Receiver Not Found" });
      }
      if (isNaN(transferAmount) || transferAmount <= 0) {
        console.log(" isNaN(transferAmount)|| transferAmount<=0 ");
        return res.render("transfer", { message: "Invalid Amount" });
      }

      if (senderUser.balance < transferAmount) {
        console.log(" senderUser.balance<transferAmount ");
        return res.render("transfer", { message: "INSUFFICIENT AMOUNT " });
      }

      if (receiverUser._id.toString() == senderUser._id.toString()) {
        return res.render("transfer", { message: "Cannot Transfer to Self " });
      }

      const passwordMatch = await bcrypt.compare(password, senderUser.password);
      if (!passwordMatch) {
        return res.render("transfer", {
          message: "password not matched. try again ",
        });
      }

      await User.updateOne(
  { email: senderEmail },
  { $inc: { balance: -transferAmount } },
  { session }
);

await User.updateOne(
  { email: receiverEmail },
  { $inc: { balance: transferAmount } },
  { session }
);


const updatedSender = await User.findOne({
  email: senderEmail,
}).session(session);

      await Transaction.create([{
  sender: senderEmail,
  receiver: receiverEmail,
  amount: transferAmount,
  type: "Transfer",
}], { session });

    await sendMail(senderUser.email,"Transfer ",`Hello ${senderUser.name}! Money Transfered Succesfully to ${updatedSender.name} . Your Updated Balance is ${updatedSender.balance}` )
      return res.redirect("/user/dashboard");
    });
  } catch (error) {
    console.log("Error while loggin transfer ", error);
  } finally {
    await session.endSession();
  }
}

async function handlePostFindUser(req, res) {
  const { email } = req.body;

  const senderEmail = req.session.user.email;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    user: { name: user.name, email: user.email },
    senderEmail,
  });
}
module.exports = { handleGetTransfer, handlePostTransfer, handlePostFindUser };
