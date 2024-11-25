const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  trainNumber: { type: String, required: true },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;
