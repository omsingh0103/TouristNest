// Core Module
const path = require('path');
const fs = require('fs'); 

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const multer = require('multer');
const DB_PATH = "mongodb+srv://ompratapsingh0103:Om01singh03@completecoding.wxhljmi.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const Home = require("./models/home");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();

// 📝 REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 


const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

// Multer is configured in utils/multer.js

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(rootDir, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: "KnowledgeGate AI with Complete Coding",
  resave: false,
  saveUninitialized: true,
  store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn
  next();
})

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session?.isLoggedIn || false;
  res.locals.user = req.session?.user || null;
  res.locals.currentPage = ''; // default so nav never crashes
  next();
});

app.use(authRouter)
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

// 🔍 DEBUG: Check what's in the database
app.get("/debug/homes", async (req, res) => {
  try {
    const homes = await Home.find().limit(1);
    res.json({
      message: "Latest home in database",
      home: homes[0]
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3000;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});