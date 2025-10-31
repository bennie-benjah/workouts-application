require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const workoutRoutes = require('./routes/workouts');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  'https://workouts-pal.vercel.app', // production frontend
  'http://localhost:3000'            // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// ✅ Routes
app.use('/api/workouts', workoutRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is running successfully 🚀');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 10000;
    app.listen(port, () => console.log(`✅ Server running on port ${port}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
