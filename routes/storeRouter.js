// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");
const isAuth = require("../middlewares/isAuth"); // ✅ import middleware

// Routes
storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", isAuth, storeController.getBookings);
storeRouter.get("/favourites", isAuth, storeController.getFavouriteList);

// Show booking form (protected)
storeRouter.get("/book/:id", isAuth, storeController.showBookingForm);
storeRouter.post("/book-confirm", isAuth, (req, res, next) => {
  console.log("📍 Route Hit: POST /book-confirm");
  next();
}, storeController.confirmBooking);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", isAuth, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", isAuth, storeController.postRemoveFromFavourite);

// Export only once ✅
module.exports = storeRouter;
