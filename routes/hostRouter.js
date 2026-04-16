// External Module
const express = require("express");
const hostRouter = express.Router();

// Local Module
const hostController = require("../controllers/hostController");
const isAuth = require("../middlewares/isAuth");
const upload = require("../utils/multer");

// Routes
hostRouter.get("/add-home", isAuth, hostController.getAddHome);

hostRouter.post(
  "/add-home",
  isAuth,
  (req, res, next) => {
    console.log("📁 POST /add-home - Body:", req.body);
    console.log("📁 Files received at middleware:", req.files);
    next();
  },
  upload.array("photos", 5),
  (req, res, next) => {
    console.log("📁 After multer - req.files:", req.files);
    console.log("📁 Files count:", req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      console.log("📁 First file:", req.files[0]);
    }
    next();
  },
  hostController.postAddHome
);

hostRouter.get("/host-home-list", isAuth, hostController.getHostHomes);

hostRouter.get("/edit-home/:homeId", isAuth, hostController.getEditHome);

hostRouter.post(
  "/edit-home",
  isAuth,
  upload.array("photos", 5),
  hostController.postEditHome
);

hostRouter.post(
  "/delete-home/:homeId",
  isAuth,
  hostController.postDeleteHome
);

module.exports = hostRouter;