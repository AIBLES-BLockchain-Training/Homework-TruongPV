'use client';

import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './connect.css';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  // Wallet icons mapping
  const getWalletIcon = (name: string) => {
    const icons: Record<string, string> = {
      'MetaMask': '🦊',
      'Coinbase Wallet': '💎',
      'WalletConnect': '🔗',
      'Injected': '💼',
    };
    return icons[name] || '👛';
  };

  // Wallet descriptions
  const getWalletDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'MetaMask': 'Popular browser extension wallet',
      'Coinbase Wallet': 'Secure wallet by Coinbase',
      'WalletConnect': 'Connect via QR code',
      'Injected': 'Browser wallet detected',
    };
    return descriptions[name] || 'Connect your wallet';
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (account.status === 'connected') {
      return (
        <span className="status-badge connected">
          <span className="status-dot"></span>
          Connected
        </span>
      );
    }
    if (account.status === 'connecting' || status === 'pending') {
      return (
        <span className="status-badge connecting">
          <span className="status-dot"></span>
          Connecting...
        </span>
      );
    }
    return (
      <span className="status-badge disconnected">
        <span className="status-dot"></span>
        Disconnected
      </span>
    );
  };

  return (
    <div className="wallet-container fade-in">
      <div className="wallet-grid">
        {/* Account Section */}
        <div className="account-card">
          <div className="account-header">
            <div className="account-icon">👤</div>
            <h2>Account Status</h2>
          </div>

          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Status</span>
              {getStatusBadge()}
            </div>

            {account.addresses && account.addresses.length > 0 && (
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{formatAddress(account.addresses[0])}</span>
              </div>
            )}

            {account.chainId && (
              <div className="info-row">
                <span className="info-label">Chain ID</span>
                <span className="info-value">#{account.chainId}</span>
              </div>
            )}

            {account.connector && (
              <div className="info-row">
                <span className="info-label">Connector</span>
                <span className="info-value">{account.connector.name}</span>
              </div>
            )}
          </div>

          {account.status === 'connected' && (
            <button
              className="disconnect-button"
              type="button"
              onClick={() => disconnect()}
            >
              Disconnect Wallet
            </button>
          )}

          {account.status === 'disconnected' && (
            <div style={{ 
              padding: 'var(--space-4)', 
              background: 'var(--bg-hover)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}>
              Please connect your wallet to continue
            </div>
          )}
        </div>

        {/* Connect Section */}
        <div className="connect-card">
          <div className="connect-header">
            <div className="connect-icon">🔌</div>
            <h2>Connect Wallet</h2>
          </div>

          <p className="connect-description">
            Choose your preferred wallet to connect and interact with the DeFi protocol. 
            Make sure you have sufficient funds for gas fees.
          </p>

          <div className="wallet-buttons">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                className="wallet-button"
                onClick={() => connect({ connector })}
                type="button"
                disabled={status === 'pending' || account.status === 'connecting'}
              >
                <div className="wallet-button-icon">
                  {getWalletIcon(connector.name)}
                </div>
                <div className="wallet-button-content">
                  <span className="wallet-button-name">{connector.name}</span>
                  <span className="wallet-button-desc">
                    {getWalletDescription(connector.name)}
                  </span>
                </div>
                <span className="wallet-button-arrow">→</span>
              </button>
            ))}
          </div>

          <div className={`status-info ${status === 'pending' ? 'loading' : ''} ${error ? 'error' : ''}`}>
            <div className="status-row">
              <span className="status-label">Connection Status:</span>
              <span className="status-value">
                {status === 'pending' && (
                  <>
                    <span className="loading-spinner"></span> Connecting...
                  </>
                )}
                {status === 'success' && '✅ Success'}
                {status === 'idle' && '⏸️ Ready'}
                {status === 'error' && '❌ Error'}
              </span>
            </div>

            {error && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <p className="error-message">
                  <strong>Error:</strong> {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
