import React, { useEffect, useState } from 'react';
import { Building2, UserCheck, Truck, Plus, Trash2, CheckCircle2, Search, Sliders } from 'lucide-react';
import { apiService } from '../../services/api';
import { Warehouse, DeliveryPartner, Order } from '../../types';
import toast from 'react-hot-toast';

export const AdminLogisticsPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'shipments' | 'warehouses' | 'partners'>('shipments');

  // Warehouse Form Modal
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('');
  const [whPostal, setWhPostal] = useState('');
  const [whLat, setWhLat] = useState('17.6868');
  const [whLng, setWhLng] = useState('83.2185');
  const [whManager, setWhManager] = useState('');
  const [whPhone, setWhPhone] = useState('');

  // Partner Form Modal
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [ptName, setPtName] = useState('');
  const [ptPhone, setPtPhone] = useState('');
  const [ptVehicle, setPtVehicle] = useState<'Bike' | 'Van' | 'Truck'>('Van');
  const [ptProvider, setPtProvider] = useState<any>('Internal');

  const loadAllLogisticsData = async () => {
    try {
      setLoading(true);
      const [whRes, ptRes, ordRes] = await Promise.all([
        apiService.getWarehouses(),
        apiService.getDeliveryPartners(),
        apiService.getAllOrdersAdmin(),
      ]);

      if (whRes.data.success) setWarehouses(whRes.data.data);
      if (ptRes.data.success) setPartners(ptRes.data.data);
      if (ordRes.data.success) setOrders(ordRes.data.data);
    } catch (err) {
      toast.error('Failed to load logistics control data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllLogisticsData();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.createWarehouse({
        name: whName,
        code: whCode,
        fullAddress: whAddress,
        area: whCity,
        city: whCity,
        state: whState,
        postalCode: whPostal,
        latitude: parseFloat(whLat),
        longitude: parseFloat(whLng),
        managerName: whManager,
        managerPhone: whPhone,
      });

      if (res.data.success) {
        toast.success('Warehouse hub registered!');
        setWarehouseModalOpen(false);
        loadAllLogisticsData();
      }
    } catch (err) {
      toast.error('Failed to create warehouse');
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.createDeliveryPartner({
        name: ptName,
        phone: ptPhone,
        vehicleType: ptVehicle,
        providerType: ptProvider,
      });

      if (res.data.success) {
        toast.success('Delivery partner registered!');
        setPartnerModalOpen(false);
        loadAllLogisticsData();
      }
    } catch (err) {
      toast.error('Failed to register partner');
    }
  };

  const handleAssignWarehouse = async (orderId: string, warehouseId: string) => {
    try {
      const res = await apiService.assignWarehouseToOrder(orderId, warehouseId);
      if (res.data.success) {
        toast.success('Assigned warehouse successfully');
        loadAllLogisticsData();
      }
    } catch (err) {
      toast.error('Failed to assign warehouse');
    }
  };

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    try {
      const res = await apiService.assignPartnerToOrder(orderId, partnerId);
      if (res.data.success) {
        toast.success('Assigned delivery partner successfully');
        loadAllLogisticsData();
      }
    } catch (err) {
      toast.error('Failed to assign partner');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await apiService.updateLogisticsStatus(orderId, status);
      if (res.data.success) {
        toast.success(`Logistics status updated to ${status}`);
        loadAllLogisticsData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const allStatuses = [
    'Confirmed',
    'Preparing',
    'Packed',
    'Assigned',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned',
    'Refunded',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Logistics & Courier Fleet Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage warehouses, courier partner assignments, and 9-step delivery status workflows</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setWarehouseModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" /> <span>Add Warehouse</span>
          </button>
          <button
            onClick={() => setPartnerModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" /> <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'shipments' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Active Shipments ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'warehouses' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Fulfillment Hubs ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'partners' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Delivery Partners ({partners.length})</span>
        </button>
      </div>

      {/* Active Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-extrabold text-white text-sm">Order #{o.orderNumber}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">({o.trackingNumber})</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">Workflow Step:</span>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-indigo-400 font-bold text-xs px-3 py-1.5 rounded-xl"
                  >
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Warehouse Selector */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Assigned Warehouse</label>
                  <select
                    value={typeof o.assignedWarehouse === 'object' ? o.assignedWarehouse._id : o.assignedWarehouse || ''}
                    onChange={(e) => handleAssignWarehouse(o._id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Select Warehouse Hub --</option>
                    {warehouses.map((w) => (
                      <option key={w._id} value={w._id}>{w.name} ({w.city})</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Partner Selector */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Assigned Delivery Partner</label>
                  <select
                    value={typeof o.assignedPartner === 'object' ? o.assignedPartner._id : o.assignedPartner || ''}
                    onChange={(e) => handleAssignPartner(o._id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Select Delivery Partner --</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.providerType})</option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold block">Destination</label>
                  <p className="text-white font-bold truncate">{o.shippingAddress?.city}, {o.shippingAddress?.postalCode}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warehouses Tab */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((w) => (
            <div key={w._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                  {w.code}
                </span>
                <span className="text-xs text-emerald-400 font-bold">Active Hub</span>
              </div>
              <h4 className="text-sm font-bold text-white">{w.name}</h4>
              <p className="text-xs text-slate-300">{w.fullAddress}</p>
              <p className="text-[11px] text-slate-400">Manager: {w.managerName} ({w.managerPhone})</p>
            </div>
          ))}
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                  {p.providerType}
                </span>
                <span className="text-xs text-emerald-400 font-bold">{p.availability}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{p.name}</h4>
              <p className="text-xs text-slate-300">Vehicle: {p.vehicleType} • Phone: {p.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Warehouse Modal */}
      {warehouseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateWarehouse} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-3">
            <h3 className="text-base font-bold text-white">Add Fulfillment Warehouse Hub</h3>
            <input type="text" required placeholder="Warehouse Name (e.g. Vizag Hub)" value={whName} onChange={(e) => setWhName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            <input type="text" required placeholder="Code (e.g. WH-VTZ-01)" value={whCode} onChange={(e) => setWhCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase" />
            <input type="text" required placeholder="Full Address" value={whAddress} onChange={(e) => setWhAddress(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" required placeholder="City" value={whCity} onChange={(e) => setWhCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              <input type="text" required placeholder="State" value={whState} onChange={(e) => setWhState(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              <input type="text" required placeholder="Postal Code" value={whPostal} onChange={(e) => setWhPostal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" required placeholder="Manager Name" value={whManager} onChange={(e) => setWhManager(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              <input type="text" required placeholder="Manager Phone" value={whPhone} onChange={(e) => setWhPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setWarehouseModalOpen(false)} className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl text-slate-300">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-xs font-bold py-2.5 rounded-xl text-white">Save Hub</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Delivery Partner Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreatePartner} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-3">
            <h3 className="text-base font-bold text-white">Register Delivery Partner</h3>
            <input type="text" required placeholder="Partner / Fleet Name" value={ptName} onChange={(e) => setPtName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            <input type="text" required placeholder="Contact Phone" value={ptPhone} onChange={(e) => setPtPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            <div className="grid grid-cols-2 gap-2">
              <select value={ptVehicle} onChange={(e: any) => setPtVehicle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                <option value="Van">Van</option>
                <option value="Bike">Bike</option>
                <option value="Truck">Truck</option>
              </select>
              <select value={ptProvider} onChange={(e: any) => setPtProvider(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                <option value="Internal">Internal Fleet</option>
                <option value="Shiprocket">Shiprocket</option>
                <option value="Delhivery">Delhivery</option>
                <option value="BlueDart">Blue Dart</option>
                <option value="DTDC">DTDC</option>
                <option value="IndiaPost">India Post</option>
                <option value="AmazonShipping">Amazon Shipping</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setPartnerModalOpen(false)} className="flex-1 bg-slate-800 text-xs font-semibold py-2.5 rounded-xl text-slate-300">Cancel</button>
              <button type="submit" className="flex-1 bg-purple-600 text-xs font-bold py-2.5 rounded-xl text-white">Save Partner</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
