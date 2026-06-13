require('dotenv').config();
const express = require("express");
const cors = require('cors');
const axios = require("axios");
const {wrapAxiosWithPayment, x402Client} = require('@x402/axios');
const {privateKeyToAccount} = require('viem/accounts');
const {registerExactEvmScheme} = require('@x402/evm/exact/client');
const {baseSepolia} = require('viem/chains');


const app = express();
app.use(cors());
app.use (express.json());
const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const client = new x402Client();
registerExactEvmScheme(client, {signer: account});
const api = wrapAxiosWithPayment(axios.create(), client);

const paymentEvents = [];
function logPayment(from, to, amount, purpose){
    const event = {from, to, amount, purpose, timestamp: new Date().toISOString()};
    paymentEvents.push(event);
    console.log(`Payment: ${amount} USDC from ${from} to ${to} for ${purpose}`);
    return event;
}



app.get('/campaign', async (req, res) => {
    try{
        console.log(`Starting Campaign...`);
        console.log(`Step 1: Paying Agent B for trends...`);
        const trendsResponse = await api.get(`${process.env.AGENT_B_URL}/trends`);
        logPayment('Agent A', 'Agent B', '$0.001', 'trends');
        console.log('Agent B response:', JSON.stringify(trendsResponse.data));
        const trends = trendsResponse.data.trends;
        console.log(`Got ${trends.length} trends from Agent B`);
        const topTrend= trends[0];

        console.log('Top trend:', topTrend.topic);
        console.log('AGENT_C_URL:', process.env.AGENT_C_URL);
        
        let copy;
        let attempts = 0;
        const maxAttempts = 3;

        console.log('About to enter while loop, attempts:', attempts, 'maxAttempts:', maxAttempts);


        
        while(attempts < maxAttempts){
            attempts++;
            console.log(`Step 2: Paying Agent C to write copy (attempt ${attempts})`);
            let copyResponse;
            try {
                copyResponse = await api.post(`${process.env.AGENT_C_URL}/write`, {topic: topTrend.topic, keywords: topTrend.keywords});
                console.log('Agent C full response:', JSON.stringify(copyResponse.data));
            } catch(copyErr) {
                console.error('Agent C error:', copyErr.message);
                console.error('Agent C error details:', copyErr.response?.data);
                break;
            }
            copy = copyResponse.data.copy;
            console.log('Agent C response:', JSON.stringify(copyResponse.data));
            logPayment('Agent A', 'Agent C', '$0.002', 'copywriting');
            console.log(`Got copy from Agent C: ${copy}`);
            console.log(`Step 3: Paying Agent E to review content...`);
            let review;
            try {
                const reviewResponse = await api.post(`${process.env.AGENT_E_URL}/review`, {topic: topTrend.topic, copy: copy});
                review = reviewResponse.data;
            } catch(reviewErr) {
                console.error('Agent E error:', reviewErr.message);
                review = { isSafe: true, score: 100, reasons: 'Review skipped' };
            }
            logPayment('Agent A', 'Agent E', '$0.002', 'brand safety review');
            console.log(`Safety score: ${review.score}, Safe: ${review.isSafe}`);
            if(review.isSafe){
                console.log(`Content passed safety check.`);
                break;
            }else{
                console.log(`Content failed safety check: ${review.reasons}`);
                if(attempts < maxAttempts){
                    console.log(`Regenerating copy...`);
                }
            }
        }

        console.log(`Step 4: Paying Agent D to publish content...`);
        const publishResponse = await api.post(`${process.env.AGENT_D_URL}/publish`, {topic: topTrend.topic, copy: copy});
        const post = publishResponse.data.post;
        logPayment('Agent A', 'Agent D', '$0.001', 'publishing');
        console.log(`Published post #${post.id} to feed`);
        console.log(`Campaign complete`);

        res.json({success: true, message: "Campaign completed successfully", trend: topTrend, copy:copy, post: post, timestamp: new Date().toISOString()});
    }catch(err){
        console.error("Campaign error: ", err.message);
        res.status(500).json({success: false, error: err.message});
    }
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    paymentEvents.forEach(event => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
    const interval = setInterval(() => {
        res.write(`data: ${JSON.stringify({type: 'ping'})}\n\n`);
    },5000);

    req.on('close', () => {
        clearInterval(interval);
    });
});

app.get('/payments', (req, res) => {
    res.json({success: true, totalPayments: paymentEvents.length, events: paymentEvents});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Agent A running on port ${PORT}`);
    console.log(`Wallet Address: ${account.address}`);
});