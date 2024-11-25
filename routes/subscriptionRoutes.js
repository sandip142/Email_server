const express = require('express');
const { createSubscription } = require('../controller/subscriptionController');

const router = express.Router();

router.post('/', createSubscription);

module.exports = router;
