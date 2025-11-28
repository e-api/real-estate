import { useGetPropertyQuery } from "@/state/api";
import { Compass, MapPin } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useEffect, useRef } from "react";

const PropertyLocation = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (isLoading || isError || !property) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: "https://demotiles.maplibre.org/style.json", // Replace with your custom style if needed
      center: [
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ],
      zoom: 14,
    });

    const marker = new maplibregl.Marker()
      .setLngLat([
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ])
      .addTo(map);

    // Note: customizing the marker color via internal SVG might not work depending on the default marker style.
    // You may want to replace it with a custom HTML marker.

    return () => map.remove();
  }, [property, isError, isLoading]);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) {
    return <>Property not Found</>;
  }

  return (
    <div className="py-16">
      <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
        Map and Location
      </h3>
      <div className="flex justify-between items-center text-sm text-primary-500 mt-2">
        <div className="flex items-center text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-gray-700" />
          Property Address:
          <span className="ml-2 font-semibold text-gray-700">
            {property.location?.address || "Address not available"}
          </span>
        </div>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            property.location?.address || ""
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center hover:underline gap-2 text-primary-600"
        >
          <Compass className="w-5 h-5" />
          Get Directions
        </a>
      </div>
      <div
        className="relative mt-4 h-[300px] rounded-lg overflow-hidden"
        ref={mapContainerRef}
      />
    </div>
  );
};

export default PropertyLocation;
