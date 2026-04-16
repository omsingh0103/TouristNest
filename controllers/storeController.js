const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");

// 🟢 Home Page
exports.getIndex = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/index", {
      registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.session.user ? true : false,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading homepage");
  }
};

// 🟢 Homes List
exports.getHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();
    res.render("store/home-list", {
      registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.session.user ? true : false,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading homes");
  }
};

// 🟢 Bookings Page
exports.getBookings = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login"); // force login if not logged in
  }
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: true,
    user: req.session.user,
  });
};

// 🟢 Favourites List
exports.getFavouriteList = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate("favourites");

    res.render("store/favourite-list", {
      favouriteHomes: user.favourites,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: true,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading favourites");
  }
};

// 🟢 Add to Favourite
exports.postAddToFavourite = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    if (!user.favourites.includes(homeId)) {
      user.favourites.push(homeId);
      await user.save();
    }
    res.redirect("/favourites");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to favourites");
  }
};

// 🟢 Remove from Favourite
exports.postRemoveFromFavourite = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const user = await User.findById(userId);

    user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
    await user.save();

    res.redirect("/favourites");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing favourite");
  }
};

// 🟢 Home Details
exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);

    if (!home) {
      return res.redirect("/homes");
    }

    res.render("store/home-detail", {
      home,
      pageTitle: "Home Detail",
      currentPage: "Home",
      isLoggedIn: req.session.user ? true : false,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading home details");
  }
};

// 🟢 Show Booking Form
exports.showBookingForm = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login"); // not logged in → redirect
    }

    const homeId = req.params.id;
    const home = await Home.findById(homeId);

    if (!home) {
      return res.redirect("/homes");
    }

    res.render("store/bookingForm", {
      home,
      pageTitle: "Book Home",
      currentPage: "bookings",
      isLoggedIn: true,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading booking form");
  }
};

// 🟢 Confirm Booking
exports.confirmBooking = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { name, checkIn, checkOut, gender, children } = req.body;

    const booking = new Booking({
      home: req.params.id,
      user: req.session.user._id, // link to logged-in user
      name,
      checkIn,
      checkOut,
      gender,
      children,
    });

    await booking.save();
    res.redirect("/store/bookings");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error confirming booking");
  }
};

exports.getBookings = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const bookings = await Booking.find({ user: req.session.user._id })
      .populate("home"); // show home details

    res.render("store/bookings", {
      bookings,
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: true,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).send("Error loading bookings.");
  }
};



