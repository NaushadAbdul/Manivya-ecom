import React, { createContext, useContext, useState, useEffect } from 'react';
import { Address } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface LocationContextType {
  currentLocation: Address | null;
  savedAddresses: Address[];
  permissionGranted: boolean | null;
  detectLocation: () => Promise<void>;
  selectAddress: (address: Address) => void;
  loadSavedAddresses: () => Promise<void>;
  addSavedAddress: (address: Partial<Address>) => Promise<void>;
  deleteSavedAddress: (id: string) => Promise<void>;
  shippingInfo: {
    shippingFee: number;
    estimatedDays: string;
    expressAvailable: boolean;
    warehouse: string;
  };
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [shippingInfo, setShippingInfo] = useState({
    shippingFee: 0,
    estimatedDays: '2-3 Business Days',
    expressAvailable: true,
    warehouse: 'Central Express Hub',
  });

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setPermissionGranted(false);
      return;
    }

    toast.loading('Detecting your current location...', { id: 'geo-toast' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPermissionGranted(true);

        try {
          // Reverse geocode via OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const addressDetails = data.address || {};

          const detectedAddr: Address = {
            type: 'Current',
            name: 'Detected Location',
            phone: '',
            fullAddress: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            area: addressDetails.suburb || addressDetails.neighbourhood || addressDetails.road || 'Gajuwaka',
            city: addressDetails.city || addressDetails.town || addressDetails.state_district || 'Visakhapatnam',
            state: addressDetails.state || 'Andhra Pradesh',
            country: addressDetails.country || 'India',
            postalCode: addressDetails.postcode || '530026',
            latitude,
            longitude,
          };

          setCurrentLocation(detectedAddr);
          toast.success(`Location detected: ${detectedAddr.city}, ${detectedAddr.state}`, { id: 'geo-toast' });

          // Calculate shipping info
          const shipRes = await apiService.calculateShippingFee(latitude, longitude, 1200);
          if (shipRes.data.success) {
            setShippingInfo(shipRes.data.data);
          }
        } catch (err) {
          toast.dismiss('geo-toast');
          const fallbackAddr: Address = {
            type: 'Current',
            name: 'Current Coordinates',
            phone: '',
            fullAddress: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            area: 'Gajuwaka',
            city: 'Visakhapatnam',
            state: 'Andhra Pradesh',
            country: 'India',
            postalCode: '530026',
            latitude,
            longitude,
          };
          setCurrentLocation(fallbackAddr);
        }
      },
      (_error) => {
        setPermissionGranted(false);
        toast.error('Location permission denied. You can manually enter address.', { id: 'geo-toast' });
      }
    );
  };

  const loadSavedAddresses = async () => {
    try {
      const res = await apiService.getAddresses();
      if (res.data.success) {
        setSavedAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a: Address) => a.isDefault);
        if (defaultAddr && !currentLocation) {
          setCurrentLocation(defaultAddr);
        }
      }
    } catch (err) {
      console.warn('Addresses not loaded (guest mode)');
    }
  };

  const selectAddress = (address: Address) => {
    setCurrentLocation(address);
    toast.success(`Active delivery address: ${address.city}`);
  };

  const addSavedAddress = async (addressData: Partial<Address>) => {
    const localAddr: Address = {
      _id: `addr-${Date.now()}`,
      type: addressData.type || 'Home',
      name: addressData.name || 'Delivery Address',
      phone: addressData.phone || '',
      fullAddress: addressData.fullAddress || '',
      area: addressData.area || '',
      city: addressData.city || '',
      state: addressData.state || '',
      country: addressData.country || 'India',
      postalCode: addressData.postalCode || '',
      latitude: addressData.latitude || 17.6868,
      longitude: addressData.longitude || 83.2185,
      isDefault: true,
    };

    try {
      const res = await apiService.createAddress(addressData);
      if (res.data && res.data.success) {
        toast.success('Delivery address saved!');
        setCurrentLocation(res.data.data);
        await loadSavedAddresses();
        return;
      }
    } catch (err) {
      console.warn('Backend address save notice:', err);
    }

    setSavedAddresses((prev) => [localAddr, ...prev]);
    setCurrentLocation(localAddr);
    toast.success('Delivery address set!');
  };

  const deleteSavedAddress = async (id: string) => {
    try {
      const res = await apiService.deleteAddress(id);
      if (res.data.success) {
        toast.success('Address deleted');
        await loadSavedAddresses();
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        savedAddresses,
        permissionGranted,
        detectLocation,
        selectAddress,
        loadSavedAddresses,
        addSavedAddress,
        deleteSavedAddress,
        shippingInfo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
