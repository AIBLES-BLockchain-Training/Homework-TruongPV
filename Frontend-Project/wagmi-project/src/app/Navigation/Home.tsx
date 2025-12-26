'use client';

import React from 'react';
import Link from 'next/link';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: '🔐',
      title: 'Secure Collateral Management',
      description: 'Lock and manage your collateral assets with enterprise-grade security. Multi-signature support and automated risk management.'
    },
    {
      icon: '💰',
      title: 'Flexible Lending Pool',
      description: 'Earn passive income by providing liquidity. Competitive APY rates with transparent fee structures and instant withdrawals.'
    },
    {
      icon: '📊',
      title: 'Real-time Price Oracle',
      description: 'Accurate and tamper-proof price feeds powered by Chainlink. Stay protected with automated liquidation mechanisms.'
    },
    {
      icon: '📈',
      title: 'Dynamic Interest Rates',
      description: 'Market-driven interest rates that adjust automatically based on supply and demand. Optimize your borrowing costs.'
    },
    {
      icon: '⚡',
      title: 'Instant Borrowing',
      description: 'Get instant access to liquidity against your crypto assets. No credit checks, no paperwork, just smart contracts.'
    },
    {
      icon: '🛡️',
      title: 'Risk Management',
      description: 'Advanced health factor monitoring and automated liquidation protection. Stay safe with real-time alerts.'
    }
  ];

  const stats = [
    { value: '$2.5M+', label: 'Total Value Locked' },
    { value: '500+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '5+', label: 'Supported Assets' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀</span>
            <span>Decentralized Lending Protocol</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to <span className="hero-title-gradient">Wagmi DeFi</span>
          </h1>
          
          <p className="hero-description">
            A next-generation DeFi lending platform built on smart contracts. 
            Borrow, lend, and manage your crypto assets with complete transparency and security.
          </p>
          
          <div className="hero-actions">
            <Link href="/LendingPool" className="hero-button hero-button-primary">
              Start Lending
              <span>→</span>
            </Link>
            <Link href="/Borrower" className="hero-button hero-button-secondary">
              Explore Borrowing
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <div className="features-subtitle">FEATURES</div>
            <h2 className="features-title">Everything you need for DeFi</h2>
            <p className="features-description">
              Built with security, transparency, and user experience in mind. 
              Our platform offers all the tools you need for decentralized finance.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
