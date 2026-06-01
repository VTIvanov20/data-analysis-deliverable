import * as THREE from 'three';
import { latLonToVector3 } from './coordinateHelper';

function getRingBounds(ring, bounds) {
  ring.forEach(point => {
    const lon = Number(point[0]);
    const lat = Number(point[1]);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return;
    }

    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    bounds.minLon = Math.min(bounds.minLon, lon);
    bounds.maxLon = Math.max(bounds.maxLon, lon);
  });
}

function getCountryBounds(feature) {
  const bounds = {
    minLat: Infinity,
    maxLat: -Infinity,
    minLon: Infinity,
    maxLon: -Infinity
  };

  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates.forEach(ring => {
      getRingBounds(ring, bounds);
    });
  }

  if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(polygon => {
      polygon.forEach(ring => {
        getRingBounds(ring, bounds);
      });
    });
  }

  if (
    !Number.isFinite(bounds.minLat) ||
    !Number.isFinite(bounds.maxLat) ||
    !Number.isFinite(bounds.minLon) ||
    !Number.isFinite(bounds.maxLon)
  ) {
    return null;
  }

  return bounds;
}

function getCountryCenterLatLon(feature) {
  const bounds = getCountryBounds(feature);

  if (!bounds) {
    return null;
  }

  return {
    latitude: (bounds.minLat + bounds.maxLat) / 2,
    longitude: (bounds.minLon + bounds.maxLon) / 2
  };
}

function getRotationToFaceCamera(latitude, longitude) {
  const target = latLonToVector3(latitude, longitude, 1);

  if (!target) {
    return [0, 0, 0];
  }

  target.normalize();

  // camera will be facing the +Z axis
  const cameraFacingDirection = new THREE.Vector3(0, 0, 1);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    target,
    cameraFacingDirection
  );

  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

  return [euler.x, euler.y, euler.z];
}

export function getCountryRotation(feature) {
  const center = getCountryCenterLatLon(feature);

  if (!center) {
    return [0, 0, 0];
  }

  return getRotationToFaceCamera(center.latitude, center.longitude);
}