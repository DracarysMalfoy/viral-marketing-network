require('dotenv').config();
const express = require('express');
const { paymentMiddleware, x402ResourceServer } = require('@x402/express');
const { ExactEvmScheme } = require('@x402/evm/exact/server');
const { HTTPFacilitatorClient } = require('@x402/core/server');

const app = express();
app.use(express.json());

const payTo = process.env.WALLET_ADDRESS;
const facilitatorClient = new HTTPFacilitatorClient({ 
    url: "https://x402.org/facilitator" 
});

const resourceServer = new x402ResourceServer(facilitatorClient)
    .register("eip155:84532", new ExactEvmScheme());

app.use(
    paymentMiddleware(
        {
            "GET /trends": {
                accepts: [
                    {
                        scheme: "exact",
                        price: "$0.001",
                        network: "eip155:84532",
                        payTo: payTo
                    }
                ],
                description: "Get trending topics for marketing campaign"
            }
        },
        resourceServer
    )
);

app.get('/trends', (req,res) =>{const trends = [
    {topic: "AI Agents", score: 95, keywords: ["autonomous", "AI", "agents", "automation"]},
    {topic: "Web3 Payments", score: 88, keywords: ["crypto", "payments", "blockchain", "USDC"]},
    {topic: "Defi Revolution", score: 82, keywords: ["defi", "finance", "decentralized", "yield"]},
    {topic: "NFT Gaming", score: 78, keyowrds: ["NFT", "gaming", "play-to-earn", "metaverse"]},
    {topic: "Layer 2 Scaling", score: 75, keywords: ["layer2", "scaling", "base", "optimism"]}
];
res.json({success: true, timestamp: new Date().toISOString(), trends: trends});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Agent B running on port ${PORT}`);
    console.log(`Wallet Address= ${process.env.WALLET_ADDRESS}`);
    console.log(`Endpoint: GET /trends - costs $0.001 USDC`);
});

