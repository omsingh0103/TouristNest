const mongoose = require('mongoose');
const DB_PATH = "mongodb+srv://ompratapsingh0103:Om01singh03@completecoding.wxhljmi.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";

async function check() {
  try {
    await mongoose.connect(DB_PATH);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
