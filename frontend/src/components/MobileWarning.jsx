import { useEffect, useState } from 'react';
import styled from 'styled-components';

import mobilePreview from '../../img/IMG_7532.jpg';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 768);
        };

        check();
        window.addEventListener('resize', check);

        return () => {
            window.removeEventListener('resize', check);
        };
    }, []);

    return isMobile;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 24px;
    background: #050505;

    color: #ffffff;
    text-align: center;
`;

const Card = styled.div`
    width: 100%;
    max-width: 420px;
    padding: 28px 24px;

    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 15, 0.72);
    box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
`;

const Title = styled.h1`
    margin: 0 0 12px;
    font-size: 1.6rem;
    line-height: 1.15;
    font-weight: 700;
`;

const Message = styled.p`
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
    font-size: 1rem;
    line-height: 1.6;
`;

const Small = styled.p`
    margin: 18px 0 0;
    color: rgba(255, 255, 255, 0.48);
    font-size: 0.85rem;
    line-height: 1.5;
`;

const PreviewImage = styled.img`
    display: block;
    width: 100%;
    margin-top: 20px;
    border-radius: 20px;
    object-fit: cover;
`;

export function MobileWarning() {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return null;
    }

    return (
        <Overlay>
            <Card>
                <Title>Hello, Thomas</Title>
                <Title>There's no mobile support</Title>

                <Message>
                    Please open this website on a desktop or laptop, preferably on a Full HD monitor.
                </Message>

                <Small>
                    Haven't really planned for mobile support and the experience is pretty bad on smaller screens. <br /> Regardless, here's a picture of a cat and a duck for your entertainment
                </Small>
            </Card>
            <PreviewImage
                src={mobilePreview}
                alt="for your entertainment"
            />       
        </Overlay>
    );
}