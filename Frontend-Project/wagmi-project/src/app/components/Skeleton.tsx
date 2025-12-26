'use client';

import React from 'react';
import './Skeleton.css';

export const FormSkeleton: React.FC = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-form">
        <div className="skeleton-header">
          <div className="skeleton-line skeleton-title"></div>
        </div>

        <div className="skeleton-input-group">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-input"></div>
          <div className="skeleton-line skeleton-helper"></div>
        </div>

        <div className="skeleton-input-group">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-input"></div>
          <div className="skeleton-line skeleton-helper"></div>
        </div>

        <div className="skeleton-input-group">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-textarea"></div>
          <div className="skeleton-line skeleton-helper"></div>
        </div>

        <div className="skeleton-line skeleton-button"></div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <div className="skeleton-line skeleton-icon"></div>
          <div className="skeleton-line skeleton-card-title"></div>
        </div>

        <div className="skeleton-card-content">
          <div className="skeleton-card-row">
            <div className="skeleton-line skeleton-card-label"></div>
            <div className="skeleton-line skeleton-card-value"></div>
          </div>
          <div className="skeleton-card-row">
            <div className="skeleton-line skeleton-card-label"></div>
            <div className="skeleton-line skeleton-card-value"></div>
          </div>
          <div className="skeleton-card-row">
            <div className="skeleton-line skeleton-card-label"></div>
            <div className="skeleton-line skeleton-card-value"></div>
          </div>
        </div>

        <div className="skeleton-line skeleton-button"></div>
      </div>
    </div>
  );
};

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <FormSkeleton key={index} />
      ))}
    </div>
  );
};
