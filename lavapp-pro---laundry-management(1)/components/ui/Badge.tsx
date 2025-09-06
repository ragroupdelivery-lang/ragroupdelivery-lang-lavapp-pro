
import React from 'react';
import { OrderStatus } from '../../types';

interface BadgeProps {
  status: OrderStatus;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const colorClasses = {
    [OrderStatus.PendingCollection]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.InProgress]: 'bg-blue-100 text-blue-800',
    [OrderStatus.ReadyForDelivery]: 'bg-purple-100 text-purple-800',
    [OrderStatus.Completed]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}
    >
      {status}
    </span>
  );
};

export default Badge;
