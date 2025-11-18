const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:52178'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));


const houseRouter = require('./routes/house.routes');
const userRouter = require('./routes/auth.routes');
const bookingRouter = require('./routes/booking.routes');

app.use('/api/houses', houseRouter);
app.use('/api/auth', userRouter);
app.use('/api', bookingRouter);


app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// MongoDB Atlas Connection
const atlasUri = process.env.MONGO_URI; 

if (!atlasUri) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file");
  process.exit(1);
}

console.log("➡️ Attempting to connect to MongoDB Atlas...");

mongoose.connect(atlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB Atlas Connected Successfully");
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});
