import { forwardRef, Suspense, useContext, useState } from "react";
import { Text, GradientTexture } from "@react-three/drei";
import CountryDataContext from '../CountryDataContext';

import JosefinSansBoldFont from '../../fonts/JosefinSans-Bold.woff';
import RalewaySemiBoldFont from '../../fonts/Raleway-SemiBold.woff';
import { useLocation } from "wouter";

const HoverText = forwardRef(({ hoverColor, children, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);
    const over = () => setHovered(true);
    const out = () => setHovered(false);

    return <Text {...props} ref={ref} color={hovered ? hoverColor : null} onPointerOver={over} onPointerOut={out}>
        {children}
    </Text>
});

export function StartScreen({ ...props }) {
    const countryDataContext = useContext(CountryDataContext);
    const [location, setLocation] = useLocation();

    return <Suspense fallback={null}>
        <group position={[0, 0, 1.5]}>
            <group position={[0, 0, 0]}>
                {/* Text shadow */}
                <Text
                    position={[0.025, -0.025, -0.01]}
                    font={JosefinSansBoldFont}
                    fontSize={1}
                    color="#000"
                >
                    <meshBasicMaterial
                        color="#000"
                        transparent
                        opacity={0.15}
                        depthWrite={false}
                    />
                    GROUP NINE
                </Text>

                {/* Main text */}
                <Text
                    position={[0, 0, 0]}
                    color={'#8A4ADD'}
                    font={JosefinSansBoldFont}
                    fontSize={1}
                    castShadow={'#ffffff'}
                >
                    <meshBasicMaterial>
                        <GradientTexture
                            stops={[0, 1]}
                            colors={['#ffffff', '#8A4ADD']}
                            size={100}
                        />
                    </meshBasicMaterial>
                    GROUP NINE
                </Text>
            </group>
            

            {countryDataContext.error ?
                <HoverText
                    position={[0, -0.5, 0]}
                    fonts={RalewaySemiBoldFont}
                    fontSize={0.2}
                    hoverColor="red"
                >
                    <meshBasicMaterial />
                    An error occurred!
                </HoverText> : countryDataContext.loading ? 
                    <HoverText
                        position={[0, -0.7, 0]}
                        fonts={RalewaySemiBoldFont}
                        fontSize={0.3}
                        hoverColor="red"
                    >
                        <meshBasicMaterial />
                        {countryDataContext.loadingStatus}   
                    </HoverText> :
                    <>
                        <HoverText
                            position={[0, -0.5, 0]}
                            font={RalewaySemiBoldFont}
                            fontSize={0.2}
                            hoverColor="red"
                            onClick={() => setLocation('/start')}
                        >
                            <meshBasicMaterial />
                            Click this text to browse some data points!
                        </HoverText>

                        <HoverText
                            position={[0, -0.74, 0]}
                            font={RalewaySemiBoldFont}
                            fontSize={0.12}
                            opacity={0.8}
                            hoverColor={null}
                        >
                            <meshBasicMaterial />
                            Made by Valeri, Amina and Luka
                        </HoverText>
                    </>
            }
        </group>
    </Suspense>;
}