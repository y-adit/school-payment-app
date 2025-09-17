const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: "https://schoolpaymentfrontend-eubl.onrender.com" // Your exact frontend URL
}));

app.use(express.json()); // Body parser

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Serve frontend in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
//   });
// }

// Test route
app.get('/', (req, res) => {
  res.send('School Payment API is running...');
});

console.log("✅ Auth routes mounted");


const PORT = process.env.PORT || 5000;
console.log("NODE_ENV:", process.env.NODE_ENV);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
