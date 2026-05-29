import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Html } from '@react-three/drei';
import { useRoute, useLocation } from 'wouter';
import { useContext, useEffect, useMemo, useState } from 'react';
// import { fetchCountryDesc } from '../util/wikipediaApi';
import CountryDataContext from '../CountryDataContext';
import salesData from '../data/sales_data.json';
import { buildCountryReports, finalizeCountryReport } from '../util/salesReports';
import { normalizeCountryName } from '../util/countryNameMap';
import {
    Heading, Divider, Button,
    Box,
    Link, Text as ChakraText,
    Center
} from "@chakra-ui/react";

function SummaryRow({ label, value }) {
    return (
        <Box display="flex" justifyContent="space-between" gap="16px">
            <ChakraText color="rgba(255,255,255,0.62)" fontSize="0.95rem">
                {label}
            </ChakraText>

            <ChakraText color="#fff" fontSize="0.95rem" fontWeight={600} textAlign="right">
                {value}
            </ChakraText>
        </Box>
    );
}

function CountrySalesSummary({ report }) {
    if (!report) {
        return (
            <Box
                marginTop="4vh"
                width="34vw"
                padding="24px"
                borderRadius="24px"
                border="1px solid rgba(255,255,255,0.12)"
                background="rgba(10, 10, 15, 0.65)"
                backdropFilter="blur(14px)"
                boxShadow="0 24px 80px rgba(0,0,0,0.35)"
            >
                <ChakraText color="rgba(255,255,255,0.65)" fontSize="1rem">
                    No sales data available for this country.
                </ChakraText>
            </Box>
        );
    }

    return (
        <Box
            marginTop="4vh"
            width="34vw"
            maxWidth="520px"
            padding="24px"
            borderRadius="24px"
            border="1px solid rgba(255,255,255,0.12)"
            background="rgba(10, 10, 15, 0.72)"
            backdropFilter="blur(14px)"
            boxShadow="0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)"
        >
            <Heading
                as="h3"
                color="#fff"
                fontSize="1.25rem"
                marginBottom="18px"
                _selection={{ backgroundColor: '#ea4c89' }}
            >
                Sales overview
            </Heading>

            <Box display="flex" flexDirection="column" gap="12px">
                <SummaryRow
                    label="Total sales"
                    value={`€${Number(report.total_sales_eur || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 0
                    })}`}
                />

                <SummaryRow
                    label="Total quantity"
                    value={Number(report.total_quantity || 0).toLocaleString()}
                />

                <SummaryRow
                    label="Total orders"
                    value={Number(report.number_of_orders || 0).toLocaleString()}
                />

                <SummaryRow
                    label="Deliveries"
                    value={Number(report.deliveries || 0).toLocaleString()}
                />

                <Box>
                    <ChakraText color="rgba(255,255,255,0.62)" fontSize="0.95rem" marginBottom="8px">
                        Cities
                    </ChakraText>

                    <ChakraText color="#fff" fontSize="0.95rem">
                        {report.cities.length ? report.cities.join(', ') : '—'}
                    </ChakraText>
                </Box>

                <Box>
                    <ChakraText color="rgba(255,255,255,0.62)" fontSize="0.95rem" marginBottom="8px">
                        Product lines
                    </ChakraText>

                    <Box display="flex" flexWrap="wrap" gap="8px">
                        {report.product_lines.length ? (
                            report.product_lines.map(line => (
                                <Box
                                    key={line}
                                    as="span"
                                    padding="5px 9px"
                                    borderRadius="999px"
                                    border="1px solid rgba(255,255,255,0.15)"
                                    background="rgba(255,255,255,0.1)"
                                    color="rgba(255,255,255,0.82)"
                                    fontSize="0.8rem"
                                >
                                    {line}
                                </Box>
                            ))
                        ) : (
                            <ChakraText color="rgba(255,255,255,0.5)" fontSize="0.95rem">
                                —
                            </ChakraText>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export function TakeMeThere() {
    const [match, params] = useRoute('/map/:country');
    const [location, setLocation] = useLocation();
    const [locationHeading, setLocationHeading] = useState("Thinking...");
    const [locationDescription, setLocationDescription] = useState("Also thinking...");
    const countryDataContext = useContext(CountryDataContext);

    const countryReports = useMemo(() => {
        return buildCountryReports(salesData);
    }, []);

    const decodedCountry = match ? decodeURIComponent(params.country) : '';
    const salesCountryName = normalizeCountryName(decodedCountry);

    const countryReport = useMemo(() => {
        return finalizeCountryReport(countryReports[salesCountryName]);
    }, [countryReports, salesCountryName]);

    useEffect(() => {
        let isMounted = true;

        if (countryDataContext.loading) return;

        if (!countryDataContext.data.features
            .map(e => e.properties.ADMIN)
            .includes(decodeURIComponent(params.country))) {
            setLocation('/start');
        } else {
            setLocationHeading(decodeURIComponent(params.country));
            setLocationDescription('Thinking...');

            // fetchCountryDesc(decodeURIComponent(params.country))
            //     .then(desc => {
            //         if (isMounted) {
            //             setLocationDescription(desc);
            //         }
            //     })
            //     .catch(e => {
            //         console.error(e);

            //         if (isMounted) {
            //             setLocationDescription('Could not fetch country data.');
            //         }
            //     });
        }

        return () => {
            isMounted = false;
        };
    }, [countryDataContext, params.country, setLocation]);

    return (
        <Html as="div" fullscreen>
            <Box fontFamily="Inter, sans-serif">
                <Box color="#fff" marginTop="18vh" marginLeft="10vw">
                    <Divider
                        orientation="vertical"
                        height="10px"
                        borderColor="#f00"
                    />

                    <Heading
                        width="36vw"
                        fontWeight={700}
                        fontSize="7rem"
                        lineHeight="0.95"
                        _selection={{ backgroundColor: '#ea4c89' }}
                    >
                        {locationHeading}
                    </Heading>

                    <ChakraText
                        width="34vw"
                        marginTop="3vh"
                        fontWeight={400}
                        fontSize="1.25rem"
                        color="rgba(255,255,255,0.78)"
                        _selection={{ backgroundColor: '#ea4c89' }}
                    >
                        A total description of {locationHeading}'s sales performance, including key metrics and insights.
                    </ChakraText>

                    <CountrySalesSummary report={countryReport} />
                </Box>
            </Box>
        </Html>
    );
}