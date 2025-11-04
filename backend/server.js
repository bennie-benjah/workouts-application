require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const workoutRoutes = require('./routes/workouts');
const userRoutes = require('./routes/user');

const app = express();

// ✅ CORS configuration (must come before routes)
const allowedOrigins = [
  'https://workouts-pal.vercel.app',  // production
  'http://localhost:3000'             // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Express middleware
app.use(express.json());

// ✅ Simple request logger
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// ✅ Routes
app.use('/api/workouts', workoutRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', require('./routes/auth'));

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running successfully 🚀');
});

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 10000;
    app.listen(port, () => {
      console.log(`Connected to DB & Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('DB connection error:', error);
  });
