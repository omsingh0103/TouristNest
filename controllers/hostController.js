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
    console.log("🏠 postAddHome - Files received:", req.files);
    console.log("🏠 postAddHome - Body info:", req.body.houseName);

    if (!req.files || req.files.length === 0) {
      console.log("⚠️ No files were uploaded!");
    }

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
    if (err.name === 'ValidationError') {
      console.error("🔍 Validation Errors:", Object.keys(err.errors).map(key => `${key}: ${err.errors[key].message}`));
    }
    res.status(500).send(`Error creating home: ${err.message}`);
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
        console.log("🔄 Updating photos for home:", id);
        // 🔥 DELETE OLD IMAGES FROM FILESYSTEM
        if (home.photo && home.photo.length > 0) {
          const oldPhotos = Array.isArray(home.photo) ? home.photo : [home.photo];
          oldPhotos.forEach((p) => {
            const relPath = p.startsWith("/") ? p.substring(1) : p;
            const fullPath = path.join(process.cwd(), relPath);
            fs.unlink(fullPath, (err) => {
              if (err) console.log("⚠️ Could not delete old file:", fullPath, err.message);
              else console.log("✅ Deleted old file:", fullPath);
            });
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
  console.log("🗑️ postDeleteHome - Attempting to delete home:", homeId);

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("⚠️ Home not found for deletion");
        return res.redirect("/host/host-home-list");
      }
      
      console.log("📂 Home found. Current photos:", home.photo);

      // ✅ check ownership before delete
      if (home.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).send("Forbidden: Not your home");
      }

      // 🔥 DELETE IMAGES FROM FILESYSTEM
      if (home.photo && home.photo.length > 0) {
        const photosToDelete = Array.isArray(home.photo) ? home.photo : [home.photo];
        photosToDelete.forEach((p) => {
          if (p) {
            // Remove leading slash if exists to make it relative for path.join
            const relativePath = p.startsWith("/") ? p.substring(1) : p;
            const fullPath = path.join(process.cwd(), relativePath);
            fs.unlink(fullPath, (err) => {
              if (err) console.log("⚠️ Could not delete file:", fullPath, err.message);
              else console.log("✅ Deleted file:", fullPath);
            });
          }
        });
      }

      return Home.findByIdAndDelete(homeId);
    })
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("❌ Error while deleting:", error);
      res.redirect("/host/host-home-list");
    });
};
