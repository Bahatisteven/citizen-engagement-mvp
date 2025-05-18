require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

app.use(express.json());


const allowed = [
  process.env.FRONTEND_URL,            
  'http://localhost:3000'              
];

app.use(cors({
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin) return callback(null, true);
    if (allowed.includes(incomingOrigin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
    }
  },
  credentials: true
}));


app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
