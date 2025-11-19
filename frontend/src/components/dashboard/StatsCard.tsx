'use client';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

export default function StatsCard({
  icon,
  label,
  value,
  color = 'primary',
  trend,
}: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary-900/30 to-primary-700/30 border-primary-500/30',
    success: 'from-success-900/30 to-success-700/30 border-success-500/30',
    danger: 'from-danger-900/30 to-danger-700/30 border-danger-500/30',
    yellow: 'from-yellow-900/30 to-yellow-700/30 border-yellow-500/30',
    purple: 'from-purple-900/30 to-purple-700/30 border-purple-500/30',
    blue: 'from-blue-900/30 to-blue-700/30 border-blue-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.primary
      } border rounded-xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <div className={`text-sm font-medium ${
            trend.direction === 'up' ? 'text-success-400' : 'text-danger-400'
          }`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </motion.div>
  );
}