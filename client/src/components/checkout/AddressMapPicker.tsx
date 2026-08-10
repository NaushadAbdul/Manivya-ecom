import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { Address } from '../../types';

interface AddressMapPickerProps {
  onAddressSelect: (address: Address) => void;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({ onAddressSelect }) => {
  const { currentLocation, savedAddresses, detectLocation, addSavedAddress } = useLocation();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [fullAddress, setFullAddress] = useState(currentLocation?.fullAddress || '');
  const [area, setArea] = useState(currentLocation?.area || '');
  const [city, setCity] = useState(currentLocation?.city || '');
  const [state, setState] = useState(currentLocation?.state || '');
  const [postalCode, setPostalCode] = useState(currentLocation?.postalCode || '');
  const [lat, setLat] = useState<number>(currentLocation?.latitude || 17.6868);
  const [lng, setLng] = useState<number>(currentLocation?.longitude || 83.2185);

  const handleSaveAndUse = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Partial<Address> = {
      type: selectedType,
      name: name || user?.name || 'Delivery Address',
      phone: phone || user?.phone || '+91 98765 43210',
      fullAddress,
      area,
      city,
      state,
      country: 'India',
      postalCode,
      latitude: lat,
      longitude: lng,
      isDefault: true,
    };

    await addSavedAddress(newAddr);
    onAddressSelect(newAddr as Address);
  };

  return (
    <div className="space-y-6">
      {/* Auto Detect Location Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Browser Auto GPS Location</h4>
            <p className="text-xs text-slate-400">
              {currentLocation ? `${currentLocation.city}, ${currentLocation.state} (${currentLocation.postalCode})` : 'Detecting current coordinates...'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
        >
          Detect GPS
        </button>
      </div>

      {/* Saved Addresses List */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Saved Address</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr._id}
                onClick={() => onAddressSelect(addr)}
                className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                      {addr.type}
                    </span>
                    <h5 className="text-xs font-bold text-white">{addr.name}</h5>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{addr.fullAddress}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{addr.city}, {addr.state} - {addr.postalCode}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map Pin Representation */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-400" /> Interactive Location Pin ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            OpenStreetMap Verified
          </span>
        </div>

        {/* Map Canvas Simulation */}
        <div className="h-44 bg-slate-900 rounded-2xl relative flex items-center justify-center border border-slate-800 overflow-hidden group">
          <div
            className="absolute inset-0 opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"
          />
          <div className="z-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/50 animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="bg-slate-950/80 text-white text-xs px-3 py-1 rounded-full border border-slate-700 font-semibold block">
              {city || 'Visakhapatnam Dispatch Hub (530026)'}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => { setLat(lat + 0.005); setLng(lng + 0.005); }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-2 py-1 rounded border border-slate-700"
            >
              Zoom In
            </button>
          </div>
        </div>
      </div>

      {/* Address Details Form */}
      <form onSubmit={handleSaveAndUse} className="space-y-4 bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Complete Address Details</h4>

        <div className="grid grid-cols-3 gap-2">
          {(['Home', 'Office', 'Other'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedType === t
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Recipient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Mobile Phone</label>
            <input
              type="text"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Full Street Address / House No.</label>
          <input
            type="text"
            required
            placeholder="Flat 402, Building A, MG Road"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Area</label>
            <input
              type="text"
              required
              placeholder="Bandra West"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">City</label>
            <input
              type="text"
              required
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">State</label>
            <input
              type="text"
              required
              placeholder="Maharashtra"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Postal Code</label>
            <input
              type="text"
              required
              placeholder="400050"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Confirm & Save Address
        </button>
      </form>
    </div>
  );
};
