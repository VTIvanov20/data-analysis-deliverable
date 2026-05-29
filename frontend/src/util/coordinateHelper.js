import * as THREE from 'three';

export const GLOBE_RADIUS = 4;
export const POINT_RADIUS = 4.04;

export function latLonToVector3(lat, lon, radius = POINT_RADIUS) {
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {
        return null;
    }

    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude + 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}