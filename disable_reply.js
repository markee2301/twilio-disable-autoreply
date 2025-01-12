const https = require('https');

exports.handler = async function (context, event, callback) {
  let twiml = new Twilio.twiml.MessagingResponse();

  //TwiML Bin URL
  const twimlBinUrl = 'https://handler.twilio.com/twiml/EHcbda28ee515b00aacbfbcedc5667b39d';

  //Make.com webhook URL
  const makeWebhookUrl = 'https://hook.us1.make.com/fqmne49856xl6q0eau8f2w2mwoswd8xx';

  try {
    // Trigger TwiML Bin
    twiml.redirect(twimlBinUrl);

    // Send incoming message data to the Make.com webhook
    const sendRequest = () =>
      new Promise((resolve, reject) => {
        const postData = JSON.stringify(event);

        const url = new URL(makeWebhookUrl);

        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve(data));
        });

        req.on('error', (error) => reject(error));

        req.write(postData);
        req.end();
      });

    const response = await sendRequest();
    console.log('Webhook response:', response);

    // Return a TwiML empty response
    return callback(null, twiml);
  } catch (error) {
    console.error('Error occurred:', error);
    // Return 500 if error
    return callback(error);
  }
};
