import { useState, useEffect } from "react";
import axios from "axios";

const AGENT_A_URL = "https://opulent-space-memory-4ppqxr6pvwhqj6r-3006.app.github.dev";

function App() {
  const [payments, setPayments] = useState([]);
  const [campaignResult, setCampaignResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Connect to SSE stream for live payment events
  useEffect(() => {
    const eventSource = new EventSource(`${AGENT_A_URL}/events`);
    
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== 'ping') {
        setPayments(prev => [data, ...prev]);
      }
    };

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);

    return () => eventSource.close();
  }, []);

  // Run campaign
  const runCampaign = async () => {
    setLoading(true);
    setCampaignResult(null);
    try {
      const response = await axios.get(`${AGENT_A_URL}/campaign`);
      setCampaignResult(response.data);
      // Refresh payments
      const paymentsResponse = await axios.get(`${AGENT_A_URL}/payments`);
      setPayments(paymentsResponse.data.events.reverse());
    } catch (err) {
      setCampaignResult({ success: false, error: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🤖 Autonomous Viral Marketing Network</h1>
      <p style={styles.subtitle}>Powered by x402 Agent-to-Agent Payments</p>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={{ ...styles.dot, background: connected ? '#22c55e' : '#ef4444' }} />
        <span>{connected ? 'Connected to Agent A' : 'Disconnected'}</span>
      </div>

      {/* Run Campaign Button */}
      <button
        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        onClick={runCampaign}
        disabled={loading}
      >
        {loading ? '⏳ Running Campaign...' : '🚀 Run Campaign'}
      </button>

      {/* Campaign Result */}
      {campaignResult && (
        <div style={{
          ...styles.card,
          borderColor: campaignResult.success ? '#22c55e' : '#ef4444'
        }}>
          <h2 style={styles.cardTitle}>
            {campaignResult.success ? '✅ Campaign Complete' : '❌ Campaign Failed'}
          </h2>
          {campaignResult.success && (
            <>
              <p><strong>Trend:</strong> {campaignResult.trend?.topic}</p>
              <p><strong>Copy:</strong> {campaignResult.copy}</p>
              <p><strong>Post ID:</strong> #{campaignResult.post?.id}</p>
              <p><strong>Published:</strong> {campaignResult.post?.publishedAt}</p>
            </>
          )}
          {!campaignResult.success && (
            <p style={{ color: '#ef4444' }}>{campaignResult.error}</p>
          )}
        </div>
      )}

      {/* Payment Events */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>💰 Payment Events ({payments.length})</h2>
        {payments.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No payments yet. Run a campaign!</p>
        ) : (
          payments.map((payment, i) => (
            <div key={i} style={styles.paymentRow}>
              <span style={styles.amount}>{payment.amount}</span>
              <span style={styles.arrow}>→</span>
              <span style={styles.agent}>{payment.to}</span>
              <span style={styles.purpose}>for {payment.purpose}</span>
              <span style={styles.time}>
                {new Date(payment.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Agent Pipeline */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔗 Agent Pipeline</h2>
        <div style={styles.pipeline}>
          {['Agent A\nCampaign Manager', 'Agent B\nTrend Oracle', 'Agent C\nCopywriter', 'Agent E\nBrand Safety', 'Agent D\nFeed'].map((agent, i, arr) => (
            <div key={i} style={styles.pipelineItem}>
              <div style={styles.agentBox}>{agent}</div>
              {i < arr.length - 1 && <div style={styles.pipelineArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#0f172a',
    minHeight: '100vh',
    padding: '32px',
    fontFamily: 'system-ui, sans-serif',
    color: '#e2e8f0',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '24px',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '24px',
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  button: {
    display: 'block',
    margin: '0 auto 32px',
    background: 'linear-gradient(135deg, #0369a1, #38bdf8)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#38bdf8',
  },
  paymentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    fontSize: '0.875rem',
  },
  amount: {
    color: '#22c55e',
    fontWeight: '600',
    minWidth: '60px',
  },
  arrow: {
    color: '#94a3b8',
  },
  agent: {
    color: '#38bdf8',
    minWidth: '80px',
  },
  purpose: {
    color: '#94a3b8',
    flex: 1,
  },
  time: {
    color: '#64748b',
    fontSize: '0.75rem',
  },
  pipeline: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pipelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  agentBox: {
    background: '#0f3460',
    border: '1px solid #38bdf8',
    borderRadius: '8px',
    padding: '12px 16px',
    textAlign: 'center',
    fontSize: '0.8rem',
    whiteSpace: 'pre-line',
    color: '#e2e8f0',
  },
  pipelineArrow: {
    color: '#38bdf8',
    fontSize: '1.5rem',
  },
};

export default App;