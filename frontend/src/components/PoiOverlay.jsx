import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);

        check();
        window.addEventListener('resize', check);

        return () => window.removeEventListener('resize', check);
    }, []);

    return isMobile;
}

function useExchangeRate(currency) {
    const [rateState, setRateState] = useState({
        loading: false,
        error: null,
        label: null
    });

    useEffect(() => {
        if (!currency) {
            setRateState({
                loading: false,
                error: null,
                label: null
            });
            return;
        }

        const base = String(currency).toUpperCase();

        if (base === 'EUR') {
            setRateState({
                loading: false,
                error: null,
                label: '1 EUR = €1.0000'
            });
            return;
        }

        const controller = new AbortController();

        async function loadRate() {
            try {
                setRateState({
                    loading: true,
                    error: null,
                    label: null
                });

                const date = new Date().toISOString().slice(0, 10);
                const url = `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(base)}/EUR?date=${date}`;

                const response = await fetch(url, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`Failed to load exchange rate: ${response.status}`);
                }

                const data = await response.json();

                // Frankfurter /v2/rate/{from}/{to}?date=YYYY-MM-DD returns the rate directly
                const eurRate = data?.rate;

                if (typeof eurRate !== 'number') {
                    throw new Error('EUR rate missing from Frankfurter response');
                }

                setRateState({
                    loading: false,
                    error: null,
                    label: `1 ${base} = €${eurRate.toFixed(4)} EUR`
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    return;
                }

                setRateState({
                    loading: false,
                    error,
                    label: null
                });
            }
        }

        loadRate();

        return () => controller.abort();
    }, [currency]);

    return rateState;
}

function formatEuro(value) {
    return `€${Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 0
    })}`;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(100%);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const DesktopPanel = styled.div`
    pointer-events: auto;
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 50;
    width: 380px;
    padding: 20px;

    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(10, 10, 15, 0.86);
    box-shadow:
        0 24px 80px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    animation: ${fadeIn} 160ms ease-out;
`;

const MobileDrawer = styled.div`
    pointer-events: auto;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    padding: 20px;

    max-height: 82vh;
    overflow-y: auto;

    border-radius: 28px 28px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom: none;
    background: rgba(10, 10, 15, 0.96);
    box-shadow:
        0 -24px 80px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    animation: ${slideUp} 220ms ease-out;
`;

const DrawerHandle = styled.div`
    width: 48px;
    height: 6px;
    margin: 0 auto 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.22);
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
`;

const TitleGroup = styled.div`
    min-width: 0;
`;

const Title = styled.h2`
    margin: 0;
    color: #ffffff;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 650;
`;

const Subtitle = styled.p`
    margin: 6px 0 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: 14px;
`;

const CloseButton = styled.button`
    width: 32px;
    height: 32px;
    flex: 0 0 auto;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border: 0;
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.65);

    font-size: 24px;
    line-height: 1;
    cursor: pointer;

    transition:
        background 120ms ease,
        color 120ms ease,
        transform 120ms ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }

    &:active {
        transform: scale(0.96);
    }
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
`;

const StatRow = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
`;

const Label = styled.span`
    color: rgba(255, 255, 255, 0.62);
`;

const Value = styled.span`
    color: #ffffff;
    font-weight: 500;
    text-align: right;
`;

const MutedValue = styled(Value)`
    color: rgba(255, 255, 255, 0.58);
`;

const ErrorValue = styled(Value)`
    color: #ff9aa8;
`;

const ProductLinesBlock = styled.div`
    margin-top: 2px;
`;

const ProductLabel = styled.p`
    margin: 0 0 8px;
    color: rgba(255, 255, 255, 0.62);
`;

const ProductTagList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const ProductTag = styled.span`
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.1);
    padding: 5px 9px;

    color: rgba(255, 255, 255, 0.82);
    font-size: 12px;
    line-height: 1;
`;

const EmptyProductLines = styled.span`
    color: rgba(255, 255, 255, 0.5);
`;

function ProductLines({ value }) {
    const lines = Array.isArray(value)
        ? value
        : String(value || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

    if (!lines.length) {
        return <EmptyProductLines>No product lines</EmptyProductLines>;
    }

    return (
        <ProductTagList>
            {lines.map(line => (
                <ProductTag key={line}>
                    {line}
                </ProductTag>
            ))}
        </ProductTagList>
    );
}

function ExchangeRateValue({ currency }) {
    const { loading, error, label } = useExchangeRate(currency);

    if (loading) {
        return <MutedValue>Loading…</MutedValue>;
    }

    if (error) {
        return <ErrorValue>Unavailable</ErrorValue>;
    }

    return <Value>{label || 'Not loaded'}</Value>;
}

function PoiContent({ poi, onClose }) {
    return (
        <>
            <Header>
                <TitleGroup>
                    <Title>
                        {poi.CITY}, {poi.COUNTRY}
                    </Title>

                    <Subtitle>
                        Territory: {poi.TERRITORY || '—'}
                    </Subtitle>
                </TitleGroup>

                <CloseButton
                    type="button"
                    onClick={onClose}
                    aria-label="Close POI popup"
                >
                    ×
                </CloseButton>
            </Header>

            <Content>
                <StatRow>
                    <Label>Total sales</Label>
                    <Value>{formatEuro(poi.total_sales_eur)}</Value>
                </StatRow>

                <StatRow>
                    <Label>Today's rate</Label>
                    <ExchangeRateValue currency={poi.currency} />
                </StatRow>

                <StatRow>
                    <Label>Quantity ordered</Label>
                    <Value>{formatNumber(poi.total_quantity)}</Value>
                </StatRow>

                <StatRow>
                    <Label>Number of orders</Label>
                    <Value>{formatNumber(poi.number_of_orders)}</Value>
                </StatRow>

                <ProductLinesBlock>
                    <ProductLabel>Product lines</ProductLabel>
                    <ProductLines value={poi.product_lines} />
                </ProductLinesBlock>
            </Content>
        </>
    );
}

export function PoiOverlay({ poi, onClose }) {
    const isMobile = useIsMobile();

    if (!poi) {
        return null;
    }

    if (isMobile) {
        return (
            <MobileDrawer>
                <DrawerHandle />
                <PoiContent poi={poi} onClose={onClose} />
            </MobileDrawer>
        );
    }

    return (
        <DesktopPanel>
            <PoiContent poi={poi} onClose={onClose} />
        </DesktopPanel>
    );
}