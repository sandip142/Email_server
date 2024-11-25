const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const axios = require('axios');
const emailService = require('./emailService');

const BASE_URL = 'https://railway-server.vercel.app/trains'; // Replace with your train data server's URL

exports.startMonitoring = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const subscriptions = await Subscription.find();
      
      // Group subscriptions by email
      const emailGroups = subscriptions.reduce((acc, subscription) => {
        acc[subscription.email] = acc[subscription.email] || [];
        acc[subscription.email].push(subscription.trainNumber);
        return acc;
      }, {});

      for (const [email, trainNumbers] of Object.entries(emailGroups)) {
        let trainDetails = '';  // To hold the dynamic train details for this email
        let audioLink = ''; // Placeholder for the audio link

        for (const trainNumber of trainNumbers) {
          // Fetch train details from the train server
          const response = await axios.get(`${BASE_URL}/${trainNumber}`);
          const train = response.data;

          // Log the train data to ensure it's being fetched correctly
          console.log('Fetched Train Data:', train);

          // Check if train data is valid
          if (!train.trainName || !train.trainNumber || !train.arrivalTime || !train.departureTime) {
            console.log('Invalid train data:', train);
            continue;  // Skip this train if data is invalid
          }

          // Generate HTML for each train's details (directly injecting data)
          trainDetails += `
            <tr>
              <td>${train.trainName}</td>
              <td>${train.trainNumber}</td>
              <td>${train.source}</td>
              <td>${train.destination}</td>
              <td class="green-text">${train.arrivalTime}</td>
              <td class="red-text">${train.departureTime}</td>
            </tr>
          `;

          // Check if audioFilePath exists and set the audio link
          if (train.audioFilePath) {
            audioLink = `<p><strong>Audio Alert:</strong> <a href="${train.audioFilePath}" class="audio-link" target="_blank">Click here to listen</a></p>`;
          }
        }

        // Create the email body directly with the train details and audio link
        const emailHtml = `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                }
                .email-container {
                  max-width: 600px;
                  margin: auto;
                  background-color: #ffffff;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                  background-color: #ffcccb;
                  color: #333;
                  padding: 10px 15px;
                  text-align: center;
                  font-size: 20px;
                  font-weight: bold;
                }
                .email-content {
                  padding: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                  color: #333;
                  font-weight: bold;
                }
                .alert-symbol {
                  font-size: 24px;
                  color: red;
                  margin-right: 5px;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  🚨 Train Alert Notification 🚨
                </div>
                <div class="email-content">
                  <p>Dear Subscriber,</p>
                  <p>Here are the train details you are subscribed to:</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Train Name</th>
                        <th>Train Number</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Arrival Time</th>
                        <th>Departure Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${trainDetails}
                    </tbody>
                  </table>
                  ${audioLink}
                  <p style="margin-top: 20px;">Stay alert and plan your journey accordingly!</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Send the email
        await emailService.sendEmail(email, '🚆 Train Alert Notification', emailHtml);
        console.log(`Email sent to ${email} with train details.`);

        // Delete the subscriptions after sending the email
        await Subscription.deleteMany({ email: email, trainNumber: { $in: trainNumbers } });
        console.log(`Deleted subscriptions for ${email} with train numbers ${trainNumbers.join(', ')}`);
      }
    } catch (error) {
      console.error('Error in monitoring service:', error);
    }
  });
};
