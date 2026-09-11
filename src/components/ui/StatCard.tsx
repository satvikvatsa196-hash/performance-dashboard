import React from 'react';
import { Card } from './Card';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  colorHint?: 'healthy' | 'warning' | 'critical' | 'offline';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, colorHint }) => {
  return (
    <Card title={title} className={styles.statCard}>
      <div className={styles.valueContainer}>
        <span className={styles.value} data-color={colorHint}>{value}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </Card>
  );
};
