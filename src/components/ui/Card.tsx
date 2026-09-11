import React from 'react';
import styles from './Card.module.css';

export const Card: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className = '' }) => (
  <div className={`${styles.card} ${className}`}>
    {title && <h2 className={styles.title}>{title}</h2>}
    <div className={styles.content}>{children}</div>
  </div>
);
