'use client';
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // Import MapLibre CSS
import { useAppSelector } from '@/state/redux';
import { useGetPropertiesQuery } from '@/state/api';
import { Property } from '@/types/prismaTypes';

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: 'https://demotiles.maplibre.org/style.json', // Use MapLibre's default style or add your own
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector('path[fill="#3FB1CE"]');
      if (path) path.setAttribute('fill', '#000000');
    });

    const resizeMap = () => {
      if (map) setTimeout(() => map.resize(), 700);
    };
    resizeMap();

    return () => map.remove();
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        className="map-container rounded-xl"
        ref={mapContainerRef}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: maplibregl.Map) => {
  const marker = new maplibregl.Marker()
    .setLngLat([property.location.coordinates.longitude, property.location.coordinates.latitude])
    .setPopup(
      new maplibregl.Popup().setHTML(`
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
      `)
    )
    .addTo(map);
  return marker;
};

export default Map;
