import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  async getLocationName(): Promise<string> {
    try {
      // solicitar permisos de Capacitor
      await Geolocation.checkPermissions();
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000
      });

      // usa nominatim con las coordenadas de Capacitor
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}&format=json`
      );
      const data = await response.json();

      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const country = data.address?.country || '';

      return city ? `${city}, ${country}` : 'Ubicación no disponible';

    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      return 'Ubicación no disponible';
    }
  }
}
