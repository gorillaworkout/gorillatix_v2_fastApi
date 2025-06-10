"use client";

import { Map, Marker } from "pigeon-maps";

export default function LocationSection({
  event,
}: {
  event: {
    venue: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}) {
  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden">
      <Map
        height={300}
        defaultCenter={[event.latitude, event.longitude]}
        defaultZoom={15}
      >
        <Marker anchor={[event.latitude, event.longitude]} />
      </Map>
    </div>
  );
}
