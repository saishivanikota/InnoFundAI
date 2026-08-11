import React from 'react';

const Card = ({ title, value, icon, description, badgeText, badgeColor = 'primary', onClick }) => {
  return (
    <div 
      className={`glass-panel stat-card ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
      
      <div className="stat-card-body">
        <h2 className="stat-card-value">{value}</h2>
        
        {(description || badgeText) && (
          <div className="stat-card-footer">
            {badgeText && (
              <span className={`badge badge-${badgeColor} stat-card-badge`}>
                {badgeText}
              </span>
            )}
            {description && <span className="stat-card-description">{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
