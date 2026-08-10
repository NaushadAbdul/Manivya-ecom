export class LocationService {
  /**
   * Calculates shipping fees and estimated delivery time based on distance/area
   */
  static calculateDeliveryInfo(latitude?: number, longitude?: number, orderSubtotal: number = 0) {
    // Free shipping on orders over 999
    if (orderSubtotal >= 999) {
      return {
        shippingFee: 0,
        estimatedDays: '2-3 Business Days',
        expressAvailable: true,
        warehouse: 'Central Fulfillment Hub',
      };
    }

    if (!latitude || !longitude) {
      return {
        shippingFee: 79,
        estimatedDays: '3-5 Business Days',
        expressAvailable: false,
        warehouse: 'Regional Fulfillment Center',
      };
    }

    // Central Dispatch Hub: Visakhapatnam, Andhra Pradesh (530026)
    const hubLat = 17.6868;
    const hubLng = 83.2185;

    const distanceKm = LocationService.haversineDistance(latitude, longitude, hubLat, hubLng);

    let shippingFee = 49;
    let estimatedDays = '1-2 Business Days';

    if (distanceKm > 500) {
      shippingFee = 99;
      estimatedDays = '4-6 Business Days';
    } else if (distanceKm > 100) {
      shippingFee = 69;
      estimatedDays = '2-4 Business Days';
    }

    return {
      shippingFee,
      estimatedDays,
      expressAvailable: distanceKm < 300,
      warehouse: distanceKm < 300 ? 'MANIVYA Visakhapatnam Central Hub' : 'AP Regional Fulfillment Center',
      distanceKm: Math.round(distanceKm),
    };
  }

  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = LocationService.toRad(lat2 - lat1);
    const dLon = LocationService.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(LocationService.toRad(lat1)) *
        Math.cos(LocationService.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
