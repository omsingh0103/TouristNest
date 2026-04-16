const mongoose = require('mongoose');
const DB_PATH = "mongodb+srv://ompratapsingh0103:Om01singh03@completecoding.wxhljmi.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";

const homeSchema = mongoose.Schema({
  houseName: String,
  photo: [String],
});

const Home = mongoose.model('Home', homeSchema);

async function check() {
  try {
    await mongoose.connect(DB_PATH);
    console.log('Connected');
    const homes = await Home.find().sort({_id: -1}).limit(5);
    console.log('Recent homes:', JSON.stringify(homes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
