require('dotenv').config();
const express = require('express');
const {paymentMiddleware, x402ResourceServer} = require('@x402/express');
const {ExactEvmScheme} = require('@x402/evm/exact/server');
const {HTTPFacilitatorClient} = require('@x402/core/server');

const app = express();
app.use(express.json());
const payTo = process.env.WALLET_ADDRESS;
const facilitatorClient = new HTTPFacilitatorClient({url: "https://x402.org/facilitator"});
const resourceServer = new x402ResourceServer(facilitatorClient).register("eip155:84532", new ExactEvmScheme());
app.use(paymentMiddleware({"POST /review": {
    accepts: [{scheme: 'exact', price: '$0.002', network: 'eip155:84532', payTo: payTo}],
    description: 'Review content for brand safety'
}},resourceServer));

app.post('/review', (req, res) => {
    const {topic,copy} = req.body;
    if(!topic || !copy){
        return res.status(400).json({success: false, error: "Type and copy are required."});
    }
    const bannedWords = ['scam', 'guaranteed', 'risk-free', 'get rich', 'miracle'];
    const lowercaseCopy = copy.toLowerCase();
    const foundBannedWords = bannedWords.filter(word => lowercaseCopy.includes(word));
    let score = 100;
    score = score - foundBannedWords.length * 20;
    if(copy.length < 50) score = score - 10;
    if(copy.length > 500) score = score - 10;
    const isSafe = score >= 60;
    console.log(`Reviewed content for "${topic}": score = ${score}, safe = "${isSafe}`);
    res.json({success: true, topic: topic, score: score, isSafe: isSafe, reasons: foundBannedWords.length > 0 ? `Found banned words: ${foundBannedWords.join(', ')}`: `Content passed all checks`, timestamp: new Date().toISOString()});
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Agent E running on port ${PORT}`);
    console.log(`Wallet Address: ${payTo}`);
    console.log(`Endpoint POST /review - costs $0.002 USDC`);
});