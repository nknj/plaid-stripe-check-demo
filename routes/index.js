var express = require('express');
var router = express.Router();

const PLAID_CLIENT_ID = '60d57676e78f92000f68c9aa';
const PLAID_SECRET = '39003c8031f08ab57331d7d6dac7e1';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Plaid -> Check + Stripe Demo' });
});

router.post('/create_link_token', async function (request, response) {
  var plaid = require('plaid');
  var client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments.sandbox
  });

  var createTokenResponse = await client.createLinkToken({
    user: {client_user_id: '123-test-user-id'},
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    webhook: 'https://webhook.example.com',
    country_codes: ['US'],
  });

  response.json(createTokenResponse);
});


router.post('/get_processor_tokens', async function (request, response) {
  var plaid = require('plaid');
  var client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments.sandbox
  });

  var plaidAccessToken = (await client.exchangePublicToken(request.body.public_token)).access_token;
  var stripeBankAccountToken = (await client.createStripeToken(plaidAccessToken, request.body.account_id)).stripe_bank_account_token;
  var checkProcessorToken = (await client.createProcessorToken(plaidAccessToken, request.body.account_id, 'check')).processor_token;

  response.json({
    plaid: plaidAccessToken,
    stripe: stripeBankAccountToken,
    check: checkProcessorToken
  });
});

module.exports = router;
