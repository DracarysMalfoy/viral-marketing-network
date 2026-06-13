require('dotenv').config();
const express = require('express');
const {paymentMiddleware, x402ResourceServer} = require('@x402/express');
const  {ExactEvmScheme} = require('@x402/evm/exact/server');
const  {HTTPFacilitatorClient} = require('@x402/core/server');

const app = express();
app.use(express.json());
const payTo = process.env.WALLET_ADDRESS;
const facilitatorClient = new HTTPFacilitatorClient({url: 'https://x402.org/facilitator'});
const resourceServer = new x402ResourceServer(facilitatorClient).register("eip155:84532", new ExactEvmScheme());

app.use(paymentMiddleware({
    "POST /write": {
        accepts: [{scheme: "exact", price: "$0.002", network: "eip155:84532", payTo: payTo}], description: "Write marketing copy for a trending topic"
    }
},resourceServer));

app.post('/write', (req, res) => {
    const {topic, keywords} = req.body;
    if(!topic){
        return res.status(400).json({success: false, error: "Topic is required"});
    }
    const copies = [
        `The future is here with ${topic}!! Join thousands already utilising ${keywords ? keywords[0]: 'this technology'} to transform their lives. Don't get left behind
        !!`,
        `${topic} is altering everything we know. ${keywords ? keywords.join(', '): ' '} aren't just busswords, they're your next opportunity`,
        `Breaking News: ${topic} hits new highs. Smart investors and early adopters are already in. Are you ready to be a part of this revolutionary change?`
    ];
    const selectedCopy = copies[Math.floor(Math.random() * copies.length)];
    res.json({success: true, topic: topic, copy: selectedCopy, timestamp: new Date().toISOString()});
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Agent C running on port ${PORT}`);
    console.log(`Wallet Address: ${payTo}`);
    console.log(`Endpoint POST /write - costs $0.002 USDC`);
});
