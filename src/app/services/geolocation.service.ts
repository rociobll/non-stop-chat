import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  async getLocationName(): Promise<string> {
    try {
      // solicitar permisos de Capacitor
      await Geolocation.checkPermissions();
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 4000,
      });

      // usa nominatim con las coordenadas de Capacitor
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}&format=json`,
      );


      const { address } = await response.json();
      const { city, town, village, country } = address;
      const _city = city || town || village || '';
      const _country = country || '';

      return city ? `${_city}, ${_country}` : 'Ubicación no disponible';


    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      return 'Ubicación no disponible';
    }
  }
}
