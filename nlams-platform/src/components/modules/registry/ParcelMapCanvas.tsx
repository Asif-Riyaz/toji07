import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ParcelMapCanvas: React.FC = () => {
  const position: [number, number] = [20.5937, 78.9629]; // India center

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Sample Land Parcel. <br /> ULPIN: XYZ123
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ParcelMapCanvas;
