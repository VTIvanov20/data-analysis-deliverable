export const COUNTRY_NAME_MAP = {
    'United States of America': 'United States',
    'Czechia': 'Czech Republic',
    'Russian Federation': 'Russia',
    'Republic of Korea': 'South Korea',
    'Democratic Republic of the Congo': 'DR Congo'
};

export function normalizeCountryName(geoCountryName) {
    return COUNTRY_NAME_MAP[geoCountryName] || geoCountryName;
}