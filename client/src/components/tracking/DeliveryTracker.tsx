import React, { useState } from 'react';
import { Order, Warehouse, DeliveryPartner } from '../../types';
import {
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Building2,
  PhoneCall,
  UserCheck,
  Package,
  RotateCcw,
  AlertOctagon,
  Calendar,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';

interface DeliveryTrackerProps {
  order: Order;
  onOrderUpdated?: () => void;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ order, onOrderUpdated }) => {
  const [currentOrderStatus, setCurrentOrderStatus] = useState(order.orderStatus);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const isCancelled = currentOrderStatus === 'Cancelled';
  const isReturned = currentOrderStatus === 'Returned';
  const isRefunded = currentOrderStatus === 'Refunded';
  const isCancellable = ['Confirmed', 'Preparing', 'Packed', 'Assigned'].includes(currentOrderStatus);

  const handleCancelOrder = async () => {
    try {
      setIsSubmittingCancel(true);
      const res = await apiService.cancelOrder(order._id, cancelReason.trim() || 'Cancelled via Live Delivery Tracker');
      if (res.data.success) {
        toast.success(`Order #${order.orderNumber} cancelled successfully!`);
        setCurrentOrderStatus('Cancelled');
        setIsCancelModalOpen(false);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(res.data.message || 'Failed to cancel order.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error cancelling order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const steps = [
    'Confirmed',
    'Preparing',
    'Packed',
    'Assigned',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  let currentStepIndex = steps.indexOf(currentOrderStatus);
  if (currentStepIndex === -1) currentStepIndex = 0;

  const assignedWarehouse = typeof order.assignedWarehouse === 'object' ? order.assignedWarehouse : null;
  const assignedPartner = typeof order.assignedPartner === 'object' ? order.assignedPartner : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-8">
      {/* Top Delivery Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {order.courierName || order.deliveryPartner || 'MANIVYA Express Logistics'}
            </span>
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {assignedWarehouse ? assignedWarehouse.city : 'Visakhapatnam Hub'}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white mt-2">Tracking ID: {order.trackingNumber}</h3>
          <p className="text-xs text-slate-400">Order #{order.orderNumber}</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 text-left md:text-right flex-1 md:flex-initial">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" /> Estimated Delivery Date
            </span>
            <strong className="text-sm text-emerald-400 font-extrabold">
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </strong>
          </div>

          {/* Cancel Order Dustbin Button in Tracker */}
          {isCancellable && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              title="Cancel Order"
              className="px-3.5 py-3 bg-rose-500/10 hover:bg-rose-600/30 text-rose-400 hover:text-white rounded-2xl border border-rose-500/30 transition-all flex items-center space-x-1.5 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Exception Status Banner (Cancelled / Returned / Refunded) */}
      {(isCancelled || isReturned || isRefunded) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400">
          <AlertOctagon className="w-6 h-6 shrink-0" />
          <div className="text-xs">
            <strong className="font-bold block uppercase">{order.orderStatus} Status Active</strong>
            <span>This order has entered the {order.orderStatus.toLowerCase()} workflow process.</span>
          </div>
        </div>
      )}

      {/* 7-Step Animated Progress Stepper */}
      {!isCancelled && !isReturned && !isRefunded && (
        <div className="py-4">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto px-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((stepName, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={stepName} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50 ring-4 ring-slate-900'
                        : 'bg-slate-800 text-slate-500 ring-4 ring-slate-900'
                    } ${isCurrent ? 'animate-pulse ring-indigo-500/60' : ''}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-semibold mt-2 text-center max-w-[70px] ${
                      isCompleted ? 'text-indigo-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Dual-Node Route Map Representation */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-400 animate-bounce" /> Live Route Logistics Visualization
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono font-semibold">
            Status: {order.orderStatus}
          </span>
        </div>

        <div className="h-44 bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800/80 flex items-center justify-between px-6 sm:px-12">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:14px_14px]" />

          {/* Node 1: Origin Dispatch Warehouse */}
          <div className="z-10 text-center space-y-1.5 max-w-[140px]">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block truncate">
              {assignedWarehouse ? assignedWarehouse.name : 'Visakhapatnam Hub'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {assignedWarehouse ? `${assignedWarehouse.city}, ${assignedWarehouse.postalCode}` : 'Visakhapatnam 530026'}
            </span>
          </div>

          {/* Center Moving Courier Node */}
          <div className="z-10 text-center space-y-1 animate-pulse">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/40">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
              {order.courierName || 'MANIVYA Express'}
            </span>
          </div>

          {/* Node 2: Customer Destination */}
          <div className="z-10 text-center space-y-1.5 max-w-[140px]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white block truncate">
              {order.shippingAddress?.name || 'Customer Address'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid: Warehouse & Courier Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Warehouse Card */}
        <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Assigned Fulfillment Warehouse</span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {assignedWarehouse ? assignedWarehouse.name : 'MANIVYA Visakhapatnam Central Hub'}
          </h4>
          <p className="text-xs text-slate-300">
            {assignedWarehouse
              ? assignedWarehouse.fullAddress
              : '25-1-13, Gajuwaka Bypass Rd, Durgavanipalem, Visakhapatnam 530026'}
          </p>
          <p className="text-[11px] text-slate-400">
            Manager: <strong className="text-slate-200">{assignedWarehouse?.managerName || 'K. Venkat Rao'}</strong> ({assignedWarehouse?.managerPhone || '+91 89123 45678'})
          </p>
        </div>

        {/* Courier Partner Card */}
        <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Delivery Partner Information</span>
          </div>
          <h4 className="text-sm font-bold text-white">
            {assignedPartner ? assignedPartner.name : order.courierName || 'MANIVYA Express Logistics'}
          </h4>
          <p className="text-xs text-slate-300">
            Provider: <strong className="text-indigo-400 uppercase">{assignedPartner?.providerType || 'Internal Express'}</strong> • Vehicle: {assignedPartner?.vehicleType || 'Express Van'}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-2">
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>{assignedPartner?.phone || '+91 1800 123 4567'}</span>
          </p>
        </div>
      </div>

      {/* Comprehensive Status Change History Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipment Timeline Log</h4>
        <div className="space-y-2">
          {order.statusHistory?.map((history, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-start justify-between text-xs"
            >
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-bold text-white">{history.status}</h5>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      By {history.updatedBy || 'System'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{history.note}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(history.timestamp).toLocaleDateString()} • {new Date(history.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-scale">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Order #{order.orderNumber}</h3>
                <p className="text-xs text-slate-400">Are you sure you want to cancel this active shipment?</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-300 block">Reason for Cancellation (Optional)</label>
              <textarea
                rows={3}
                placeholder="Tell us why you want to cancel..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-emerald-400 font-semibold">
                ✓ Product stock inventory will be automatically restored upon cancellation.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isSubmittingCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
