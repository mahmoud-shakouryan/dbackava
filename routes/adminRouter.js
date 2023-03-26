const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const User = require("../models/user.js");
const Payment = require("../models/payment.js");

const adminRouter = express.Router();

adminRouter.get(
  "/users",
  expressAsyncHandler(async (req, res) => {
    const timeRange = req.query.timeRange;
    const buyRange = req.query.buyRange;
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (timeRange) {
      case "all":
        if (buyRange === "purchased_and_not_purchased") {
          const users = await User.find({});
          return res.status(200).send(users);
        } else if (buyRange === "only_purchased_ones") {
          const users = await User.find({
            paidVidIds: { $exists: true, $gt: [] },
          }).exec();
          res.status(200).send(users);
        } else if (buyRange === "null") {
          const users = await User.find();
          return res.status(200).send(users);
        }
        break;
      case "last_month":
        if (buyRange === "purchased_and_not_purchased") {
          const users = await User.find({
            createdAt: {
              $gte: last30Days,
              $lt: today,
            },
          });
          return res.status(200).send(users);
        } else if (buyRange === "only_purchased_ones") {
          const pays = await Payment.find({
            createdAt: {
              $gte: last30Days,
              $lt: today,
            },
            isPaid: { $exists: true, $ne: false },
          });
          const users = [];
          for (const pay of pays) {
            const user = await User.find({ _id: { $in: pay.user.toString() } });
            users.push(user[0]);
          }
          return res.status(200).send(users);
        } else if (buyRange === "null") {
          const users = await User.find({
            createdAt: {
              $gte: last30Days,
              $lt: today,
            },
          });
          return res.status(200).send(users);
        }
        break;
      case "last_week":
        if (buyRange && buyRange === "purchased_and_not_purchased") {
          const users = await User.find({
            createdAt: {
              $gte: last7Days,
              $lt: today,
            },
          });
          return res.status(200).send(users);
        } else if (buyRange && buyRange === "only_purchased_ones") {
          const users = await User.find({
            createdAt: {
              $gte: last7Days,
              $lt: today,
            },
            paidVidIds: { $exists: true, $gt: [] },
          });
          return res.status(200).send(users);
        } else if (buyRange === "null") {
          const users = await User.find({
            createdAt: {
              $gte: last7Days,
              $lt: today,
            },
          });
          return res.status(200).send(users);
        }
        break;
      default:
        const users = await User.find();
        res.status(200).send(users);
        break;
    }
  })
);

export default adminRouter;
