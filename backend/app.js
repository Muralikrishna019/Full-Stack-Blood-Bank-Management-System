const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Route files
const bloodInventoryRoutes = require('./routes/bloodInventory');
const auth = require('./routes/authRoutes');
const donor = require('./routes/donorRoutes');
const recipient = require('./routes/recipientRoutes');
const admin = require('./routes/adminRoutes');
const blood = require('./routes/bloodRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/donor', donor);
app.use('/api/recipient', recipient);
app.use('/api/admin', admin);
app.use('/api/blood', blood);
app.use('/api/blood-inventory', bloodInventoryRoutes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;