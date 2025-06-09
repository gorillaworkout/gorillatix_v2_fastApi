import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

type EventProps = {
  event: {
    venue: string;
    address: string;
    latitude: number;
    longitude: number;
  };
};

export default function LocationSection({ event }: EventProps) {
  return (
    <div
      className="mt-4 rounded-lg overflow-hidden bg-muted"
      style={{ height: "300px" }}
    >
      <Map
        latitude={event.latitude}
        longitude={event.longitude}
        venue={event.venue}
      />
    </div>
  );
}
