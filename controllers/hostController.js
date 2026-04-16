const Home = require("../models/home");
const fs = require("fs");
const path = require("path");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to Airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    // ✅ check owner
    if (home.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).send("Forbidden: Not your home");
    }

    res.render("host/edit-home", {
      home,
      pageTitle: "Edit Home",
      currentPage: "host-homes",
      editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = async (req, res, next) => {
  try {
    const homes = await Home.find({ ownerId: req.session.user._id });

    res.render("host/host-home-list", {
      registeredHomes: homes,
      currentHostId: req.session.user._id,
      pageTitle: "Your Homes",   // ✅ pageTitle always defined
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching host homes:", err);
    res.redirect("/");
  }
};

exports.postAddHome = async (req, res) => {
  try {
    console.log("🏠 postAddHome called");
    console.log("🏠 req.files:", req.files);
    console.log("🏠 req.body:", req.body);
    
    // Get photo paths from uploaded files
    const photoPaths = req.files && req.files.length > 0 
      ? req.files.map(file => "/uploads/" + file.filename)
      : [];

    const newHome = new Home({
      houseName: req.body.houseName,
      price: req.body.price,
      location: req.body.location,
      rating: req.body.rating,
      photo: photoPaths,
      description: req.body.description,
      ownerId: req.user._id, // ✅ save host’s ID
    });

    await newHome.save();
    console.log("✅ Home saved with photo paths:", newHome.photo);
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.error("❌ Error creating home:", err);
    res.status(500).send("Error creating home");
  }
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  Home.findById(id)
    .then((home) => {
      if (!home) return res.redirect("/host/host-home-list");

      // ✅ only allow editing if owner matches
      if (home.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden: Not your home");
      }

      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      if (req.files && req.files.length > 0) {
        // Delete old file if exists
        if (home.photo && home.photo.length > 0) {
          const oldPath = path.join(__dirname, "..", home.photo[0]);
          fs.unlink(oldPath, (err) => {
            if (err) console.log("⚠️ Error while deleting old file:", err);
          });
        }

        // Save new photos
        home.photo = req.files.map(file => "/uploads/" + file.filename);
      }

      return home.save();
    })
    .then(() => {
      console.log("✅ Home updated");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("❌ Error while editing home:", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findById(homeId)
    .then((home) => {
      if (!home) return res.redirect("/host/host-home-list");

      // ✅ check ownership before delete
      if (home.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden: Not your home");
      }

      return Home.findByIdAndDelete(homeId);
    })
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("❌ Error while deleting:", error);
    });
};
