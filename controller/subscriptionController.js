const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  try {
    const { email, trainNumber } = req.body;

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({ email, trainNumber });
    if (existingSubscription) {
      return res.status(400).json({ message: 'You are already subscribed to this train.' });
    }

    const subscription = new Subscription({ email, trainNumber });
    await subscription.save();

    res.status(201).json({ message: 'Subscription created successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
