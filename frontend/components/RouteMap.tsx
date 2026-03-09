'use client';

import { useEffect, useRef } from 'react';
import type { PointType, RouteMapProps } from '@/types/routemap';
import { parseRouteCoords, DEFAULT_MAP_CENTER, ROUTE_POLYLINE_OPTIONS, ROUTE_POLYLINE_PASSED, ROUTE_POLYLINE_NOT_PASSED, ROUTE_POLYLINE_IN_TRANSIT } from '@/utils/routemap';

export function RouteMap({
  routeCoordinates,
  height = 360,
  labels,
  pointTypes,
  extraPoints,
  routePassed,
  pointStatus,
}: RouteMapProps) {
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;
    const types = pointTypes ?? [];
    const extras = extraPoints ?? [];

    void import('leaflet').then((mod) => {
      if (typeof document !== 'undefined') {
        const id = 'leaflet-css';
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
      }
      const L = mod.default;
      if (!mounted || !containerRef.current || mapRef.current) return;

      const points = parseRouteCoords(routeCoordinates);
      const pointLabels = labels ?? [];
      const passed = routePassed ?? [];
      const statuses = pointStatus ?? [];

      const hasRoute = points.length >= 2;

      const center = hasRoute
        ? points[Math.floor(points.length / 2)]
        : points[0] || DEFAULT_MAP_CENTER;

      const map = L.map(containerRef.current).setView(center, hasRoute ? 6 : 10);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const createMarkerIcon = (kind: PointType, isPassed: boolean, isInTransit = false) => {
        const isBurned = kind === 'burned';
        const inTransitFill = '#6366f1';
        const baseFill = isInTransit
          ? inTransitFill
          : isBurned
          ? '#dc2626'
          : kind === 'script'
            ? '#6366f1'
            : kind === 'outside'
              ? '#6b7280'
              : '#c41e3a';
        const fill = !isBurned && !isInTransit && isPassed ? '#16a34a' : baseFill;
        const checkHtml = !isBurned && !isInTransit && isPassed
          ? '<path d="M9 16.2L6.2 13.4l-1.4 1.4L9 19l8-8-1.4-1.4L9 16.2z" fill="#fff" stroke="#0f766e" stroke-width="0.5"/>'
          : '';
        if (isBurned) {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
              '<path d="M12 7v4l2 2m-2 4h.01" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        if (isInTransit) {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
              '<path d="M8 12h8v6c0 2.2-1.8 4-4 4s-4-1.8-4-4v-6z" fill="#fff"/>' +
              '<rect x="10" y="10" width="4" height="3" rx="0.5" fill="' + fill + '"/>' +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        if (kind === 'script') {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
              '<path d="M8 12h8v6c0 2.2-1.8 4-4 4s-4-1.8-4-4v-6z" fill="#fff"/>' +
              '<rect x="10" y="10" width="4" height="3" rx="0.5" fill="' + fill + '"/>' +
              (checkHtml ? '<g transform="translate(0,-2)">' + checkHtml + '</g>' : '') +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        if (kind === 'outside') {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
              '<text x="12" y="14" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">?</text>' +
              (checkHtml ? '<g transform="translate(0,-2)">' + checkHtml + '</g>' : '') +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        return L.divIcon({
          className: '',
          html:
            '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="12" cy="10.5" r="3" fill="#ffffff"/>' +
            (checkHtml ? '<g transform="translate(0,-2)">' + checkHtml + '</g>' : '') +
            '</svg>',
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });
      };

      if (hasRoute) {
        for (let segStart = 0; segStart < points.length - 1; segStart++) {
          const segEnd = segStart + 1;
          const bothPassed = passed[segStart] === true && passed[segEnd] === true;
          const isInTransit = statuses[segEnd] === 'in_transit' && passed[segStart] === true;
          if (isInTransit) {
            L.polyline([points[segStart], points[segEnd]], ROUTE_POLYLINE_IN_TRANSIT).addTo(map);
          } else if (bothPassed) {
            L.polyline([points[segStart], points[segEnd]], ROUTE_POLYLINE_PASSED).addTo(map);
          }
        }
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });

        points.forEach((pt, i) => {
          const isFirst = i === 0;
          const isLast = i === points.length - 1;
          const pointType = types[i] ?? (isFirst ? 'origin' : isLast ? 'receiver' : 'receiver');
          const isPassedPoint = passed[i] === true;
          const isInTransitPoint = statuses[i] === 'in_transit';
          const icon = createMarkerIcon(pointType, isPassedPoint, isInTransitPoint);
          const marker = L.marker(pt, { icon }).addTo(map);
          const tooltipText = pointLabels[i] ?? (isFirst ? 'Start' : isLast ? 'End' : `Point ${i + 1}`);
          marker.bindTooltip(tooltipText, { direction: 'top' });
        });
      } else if (points.length === 1) {
        const pointType = types[0] ?? 'receiver';
        const isPassedPoint = passed[0] === true;
        const isInTransitPoint = statuses[0] === 'in_transit';
        const icon = createMarkerIcon(pointType, isPassedPoint, isInTransitPoint);
        const marker = L.marker(points[0], { icon }).addTo(map);
        marker.bindTooltip(
          pointLabels[0] ?? `${points[0][0].toFixed(4)}, ${points[0][1].toFixed(4)}`,
          { direction: 'top' }
        );
      }

      extras.forEach((p) => {
        const icon = createMarkerIcon(p.pointType ?? 'receiver', false);
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
        const tooltipText =
          p.label ??
          `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
        marker.bindTooltip(tooltipText, { direction: 'top' });
      });
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    routeCoordinates,
    labels?.join(','),
    pointTypes?.join(','),
    routePassed?.join(','),
    pointStatus?.join(','),
    extraPoints ? extraPoints.map((p) => `${p.lat},${p.lng},${p.label ?? ''},${p.pointType ?? ''}`).join(';') : '',
  ]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden' }}
    />
  );
}
