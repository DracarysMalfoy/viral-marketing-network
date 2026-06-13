#!/bin/bash
echo "Starting all agents..."
cd /workspaces/viral-marketing-network/agents/agent-b && node index.js &
cd /workspaces/viral-marketing-network/agents/agent-c && node index.js &
cd /workspaces/viral-marketing-network/agents/agent-d && node index.js &
cd /workspaces/viral-marketing-network/agents/agent-e && node index.js &
cd /workspaces/viral-marketing-network/agents/agent-a && node index.js &
echo "All agents started!"
