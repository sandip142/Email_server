const express = require('express');
const connectDB = require('../config/db');
const subscriptionRoutes = require('../routes/subscriptionRoutes');
const { startMonitoring } = require('../services/monitoringService');
const cors = require('cors');
const app = express();
app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use('/api/subscriptions', subscriptionRoutes);


connectDB();

// Start Monitoring
startMonitoring();

app.get("/",(req,res)=>{
    res.send("API HOME")
})

// Start the Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Monitoring server running on port ${PORT}`));
