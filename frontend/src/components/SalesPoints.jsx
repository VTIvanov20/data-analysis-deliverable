import * as THREE from 'three';
import { latLonToVector3 } from '../util/coordinateHelper';

export function SalesPoints({ data, onPointClick }) {
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
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshBasicMaterial
                            color="#ff4d9d"
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