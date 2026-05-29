import * as THREE from 'three';
import { useRoute } from 'wouter';
import { latLonToVector3 } from '../util/coordinateHelper';

// I made some colors
const TERRITORY_COLORS = {
    NA: '#00B8FA',      // blue
    EMEA: '#FF9512',    // orange
    APAC: '#46E15F'     // green
};

function getTerritoryColor(territory) {
    return TERRITORY_COLORS[String(territory || '').toUpperCase()] || '#ff4d9d';
}

export function SalesPoints({ data, onPointClick }) {
    const [matchStart] = useRoute('/start');

    if (!matchStart) {
        return null;
    }

    return (
        <group name="SalesPoints">
            {data.map((item, index) => {
                const position = latLonToVector3(
                    item.latitude,
                    item.longitude
                );

                if (!position) {
                    return null;
                }

                const sales = Number(item.total_sales_eur || 0);

                const markerScale = THREE.MathUtils.clamp(
                    Math.sqrt(sales) / 1200,
                    0.025,
                    0.09
                );

                const markerColor = getTerritoryColor(item.TERRITORY);

                return (
                    <mesh
                        key={`${item.CITY}-${item.COUNTRY}-${index}`}
                        position={position}
                        scale={markerScale}
                        onClick={(e) => {
                            e.stopPropagation();

                            onPointClick({
                                ...item,
                                worldPosition: position.toArray()
                            });
                        }}
                    >
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshBasicMaterial
                            color={markerColor}
                            transparent
                            opacity={0.95}
                            depthWrite={false}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}