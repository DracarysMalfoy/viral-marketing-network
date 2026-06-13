# Autonomous Viral Marketing Network

An autonomous agent-to-agent payment network that runs a continuous social media marketing campaign. Every call between agents goes through a real x402 payment. There are no free calls.

## How It Works

Every inter-agent call follows this cycle:

1. Agent A calls another agent
2. Agent returns 402 Payment Required
3. Agent A automatically pays in USDC on Base Sepolia
4. Agent retries and delivers the data

## Agent Pipeline

```
Agent A (Campaign Manager)
    ↓ pays $0.001
Agent B (Trend Oracle) → returns trending topics
    ↓ pays $0.002
Agent C (Copywriter) → writes marketing copy
    ↓ pays $0.002
Agent E (Brand Safety Reviewer) → reviews content
    ↓ pays $0.001 (if safe)
Agent D (Decentralized Feed) → publishes content
```

## Agent Descriptions

| Agent | Role | Port | Price |
|-------|------|------|-------|
| Agent A | Campaign Manager — orchestrates everything | 3006 | — |
| Agent B | Trend Oracle — returns trending topics | 3001 | $0.001 |
| Agent C | Copywriter — writes marketing copy | 3002 | $0.002 |
| Agent D | Decentralized Feed — publishes content | 3003 | $0.001 |
| Agent E | Brand Safety Reviewer — scores content | 3004 | $0.002 |

## Features

- Every inter-agent call goes through a real x402 payment
- USDC payments on Base Sepolia testnet
- Feedback loop — if content fails safety check, Agent C regenerates
- Live React dashboard with streaming payment events
- SSE (Server Sent Events) for real time updates
- Clean separation between agent servers

## Project Structure

```
agents/
    agent-a/    Campaign Manager
    agent-b/    Trend Oracle
    agent-c/    Copywriter
    agent-d/    Decentralized Feed
    agent-e/    Brand Safety Reviewer
dashboard/      React frontend
start-all.sh    Start all agents
```

## Prerequisites

- Node.js v18+
- Base Sepolia testnet ETH
- Base Sepolia testnet USDC from Circle faucet

## Installation

```bash
git clone https://github.com/DracarysMalfoy/viral-marketing-network
cd viral-marketing-network

# Install dependencies for each agent
cd agents/agent-a && npm install && cd ..
cd agents/agent-b && npm install && cd ..
cd agents/agent-c && npm install && cd ..
cd agents/agent-d && npm install && cd ..
cd agents/agent-e && npm install && cd ..

# Install dashboard dependencies
cd dashboard && npm install && cd ..
```

## Environment Variables

Create a `.env` file in each agent folder:

**Agent A (.env):**
```
PRIVATE_KEY=your_agent_a_private_key
AGENT_B_URL=http://localhost:3001
AGENT_C_URL=http://localhost:3002
AGENT_D_URL=http://localhost:3003
AGENT_E_URL=http://localhost:3004
PORT=3006
```

**Agents B, C, D, E (.env):**
```
PRIVATE_KEY=your_agent_private_key
WALLET_ADDRESS=your_agent_wallet_address
PORT=300X
```

## Running the Project

Start all agents:

```bash
# Terminal 1
cd agents/agent-b && node index.js

# Terminal 2
cd agents/agent-c && node index.js

# Terminal 3
cd agents/agent-d && node index.js

# Terminal 4
cd agents/agent-e && node index.js

# Terminal 5
cd agents/agent-a && node index.js
```

Start the dashboard:

```bash
cd dashboard && PORT=3005 npm start
```

## Running a Campaign

Once all agents are running, either:

- Click **Run Campaign** in the dashboard
- Or call the API directly:

```bash
curl http://localhost:3006/campaign
```

## API Endpoints

**Agent A:**
- `GET /campaign` — runs the full campaign pipeline
- `GET /payments` — returns all payment events
- `GET /events` — SSE stream of live payment events

**Agent B:**
- `GET /trends` — returns trending topics (costs $0.001)

**Agent C:**
- `POST /write` — writes marketing copy (costs $0.002)

**Agent D:**
- `POST /publish` — publishes to feed (costs $0.001)
- `GET /feed` — returns all published posts (free)

**Agent E:**
- `POST /review` — reviews content safety (costs $0.002)

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Each agent runs as an Express server |
| x402 | Payment protocol for agent-to-agent calls |
| USDC | Payment token on Base Sepolia |
| Base Sepolia | Ethereum L2 testnet |
| React | Live dashboard frontend |
| SSE | Real time payment event streaming |

## Security

- Private keys stored in `.env` files only
- `.env` files are gitignored
- Each agent has its own separate wallet

## License

MIT
