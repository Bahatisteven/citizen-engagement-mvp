require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

app.use(express.json());


app.use(cors({}));

// routes to be used for 
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// port number
const PORT = process.env.PORT || 3001;

// database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
