import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DeliveryTracker } from '../components/tracking/DeliveryTracker';
import { apiService } from '../services/api';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiService
      .getOrderById(id)
      .then((res) => {
        if (res.data.success) {
          setOrder(res.data.data);
        }
      })
      .catch((err) => console.error('Order fetch error', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Fetching live order tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">The requested order tracking ID is invalid or deleted.</p>
        <Link to="/profile" className="inline-block bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
          Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Live Order Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time status updates from MANIVYA Express Logistics</p>
        </div>

        <Link to="/profile?tab=orders" className="text-xs font-semibold text-indigo-400 hover:underline">
          View All Orders
        </Link>
      </div>

      <DeliveryTracker order={order} />
    </div>
  );
};
