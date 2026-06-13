require('dotenv').config();
const express = require('express');
const {paymentMiddleware, x402ResourceServer} = require('@x402/express');
const {ExactEvmScheme} = require('@x402/evm/exact/server');
const {HTTPFacilitatorClient} = require('@x402/core/server');

const app = express();
app.use(express.json());
const payTo = process.env.WALLET_ADDRESS;
const feed = [];
const facilitatorClient = new HTTPFacilitatorClient({url: "https://x402.org/facilitator"});
const resourceServer = new x402ResourceServer(facilitatorClient).register("eip155:84532", new ExactEvmScheme());

app.use(paymentMiddleware({
    "POST /publish": {
        accepts: [{scheme: "exact", price: "$0.001", network: "eip155:84532", payTo: payTo}],
        description: "Publish content to decentralized feed"
    }
}, resourceServer));

app.post('/publish', (req, res) => {
    const {topic, copy} = req.body;
    if(!topic || !copy){
        return res.status(400).json({success: false, error: "Topic and copy are required"});
    }
    const post= {id: feed.length+1, topic: topic, copy: copy, publishedAt: new Date().toISOString()};
    feed.push(post);
    console.log(`Published post #${post.id}: ${topic}`);
    res.json({ success: true, post: post, totalPosts: feed.length});
});

app.get('/feed', (req, res) => {
    res.json({success: true, totalPosts: feed.length, posts: feed});
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Agent D running on port ${PORT}`);
    console.log(`Wallet Address: ${payTo}`);
    console.log(`Endpoint POST /publish - costs $0.001 USDC`);
});