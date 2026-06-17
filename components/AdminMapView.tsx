'use client';

import { Property } from '@/types';

interface Props { properties: Property[]; }

export default function AdminMapView({ properties }: Props) {
  const center = properties.length > 0
    ? `${properties[0].lat},${properties[0].lng}`
    : '10.787,79.138';

  const openGoogleMaps = (p: Property) => {
    window.open(`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=16`, '_blank');
  };

  return (
    <div>
      {/* OpenStreetMap iframe centered on Thanjavur */}
      <div className="rounded-xl overflow-hidden border border-gray-200 mb-4" style={{ height: 320 }}>
        <iframe
          title="Property Map"
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=79.0,10.7,79.3,10.9&layer=mapnik`}
          style={{ border: 0 }}
        />
      </div>

      {/* Property list with map links */}
      <div className="space-y-2">
        {properties.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-2xl mb-2">📍</p>
            <p>No properties with GPS location yet</p>
            <p className="text-xs mt-1">Lender la Use My Location click pannanum</p>
          </div>
        ) : (
          properties.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${!p.available ? 'bg-red-500' : p.verified ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.location} · ₹{p.rent?.toLocaleString('en-IN')}/mo</p>
                  <p className="text-xs text-gray-300">{p.lat?.toFixed(4)}°N, {p.lng?.toFixed(4)}°E</p>
                </div>
              </div>
              <button
                onClick={() => openGoogleMaps(p)}
                className="flex-shrink-0 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📍 Open Maps
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
