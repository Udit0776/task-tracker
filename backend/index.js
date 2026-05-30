const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const { errorMiddleware, AppError } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Central Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Hello Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Multi-Tenant Task Tracker API!',
    documentation: 'Check README.md for setup instructions, endpoints, and credentials.'
  });
});

// Mount Central API Routes
app.use('/api', routes);

// Fallback for unhandled routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Centralized Error Handler (Must be at the very end!)
app.use(errorMiddleware);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
