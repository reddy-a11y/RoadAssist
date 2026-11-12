import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons
const createUserIcon = () =>
  L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="
        background: #2563EB;
        color: white;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
        border: 3px solid white;
        cursor: pointer;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });

const createProviderIcon = (isSelected = false) =>
  L.divIcon({
    className: 'custom-provider-marker',
    html: `
      <div style="
        background: ${isSelected ? '#F97316' : '#101B35'};
        color: white;
        width: ${isSelected ? '44px' : '36px'};
        height: ${isSelected ? '44px' : '36px'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(16, 27, 53, 0.4);
        border: 3px solid ${isSelected ? '#FDBA74' : 'white'};
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
    `,
    iconSize: isSelected ? [44, 44] : [36, 36],
    iconAnchor: isSelected ? [22, 22] : [18, 18],
    popupAnchor: [0, -20]
  });

const LeafletMap = ({
  center = [17.4485, 78.3748],
  zoom = 13,
  userLocation = null,
  providers = [],
  selectedProviderId = null,
  onSelectProvider = null,
  onLocationSelect = null,
  routeTo = null, // [lat, lng] for live route line
  className = 'h-96 w-full rounded-2xl shadow-md border border-slate-200'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map clicks for location picker mode
      if (onLocationSelect) {
        map.on('click', (e) => {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const bounds = L.latLngBounds();

    // 1. Add User Location Marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon(),
        title: 'Your Location'
      }).addTo(markersGroup);

      userMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563EB; font-size: 13px;">Your Breakdown Location</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B;">
            Lat: ${Number(userLocation.lat).toFixed(4)}, Lng: ${Number(userLocation.lng).toFixed(4)}
          </p>
        </div>
      `);

      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // 2. Add Provider Markers
    providers.forEach((p) => {
      const pLat = parseFloat(p.current_latitude || p.latitude);
      const pLng = parseFloat(p.current_longitude || p.longitude);

      if (isNaN(pLat) || isNaN(pLng)) return;

      const isSelected = selectedProviderId === p.id;
      const marker = L.marker([pLat, pLng], {
        icon: createProviderIcon(isSelected),
        title: p.business_name
      }).addTo(markersGroup);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <h4 style="margin: 0; font-weight: 700; color: #101B35; font-size: 14px;">${p.business_name}</h4>
          <div style="margin: 4px 0; font-size: 12px; color: #475569;">
            ⭐ <strong>${Number(p.rating || 5.0).toFixed(1)}</strong> (${p.total_ratings || 0} reviews)
          </div>
          ${p.distanceKm !== undefined ? `<div style="font-size: 11px; color: #2563EB; font-weight: 600;">Distance: ~${p.distanceKm} km</div>` : ''}
          ${p.estimatedCost ? `<div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 4px;">Est. ₹${p.estimatedCost}</div>` : ''}
        </div>
      `);

      if (onSelectProvider) {
        marker.on('click', () => {
          onSelectProvider(p);
        });
      }

      bounds.extend([pLat, pLng]);
    });

    // 3. Add Route Line if tracking
    if (userLocation && routeTo && routeTo[0] && routeTo[1]) {
      const polyline = L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [routeTo[0], routeTo[1]]
        ],
        {
          color: '#2563EB',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8'
        }
      ).addTo(map);

      routeLineRef.current = polyline;
      bounds.extend(routeTo);
    }

    // Auto fit map view if valid bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [userLocation, providers, selectedProviderId, routeTo]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default LeafletMap;
