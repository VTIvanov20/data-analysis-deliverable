export function buildCountryReports(data) {
    return data.reduce((acc, item) => {
        const country = item.COUNTRY || 'Unknown';

        if (!acc[country]) {
            acc[country] = {
                country,
                total_sales_eur: 0,
                total_quantity: 0,
                number_of_orders: 0,
                deliveries: 0,
                cities: new Set(),
                territories: new Set(),
                product_lines: new Set()
            };
        }

        acc[country].total_sales_eur += Number(item.total_sales_eur || 0);
        acc[country].total_quantity += Number(item.total_quantity || 0);
        acc[country].number_of_orders += Number(item.number_of_orders || 0);
        acc[country].deliveries += 1;

        if (item.CITY) {
            acc[country].cities.add(item.CITY);
        }

        if (item.TERRITORY) {
            acc[country].territories.add(item.TERRITORY);
        }

        if (Array.isArray(item.product_lines)) {
            item.product_lines.forEach(line => acc[country].product_lines.add(line));
        } else if (typeof item.product_lines === 'string') {
            item.product_lines
                .split(',')
                .map(line => line.trim())
                .filter(Boolean)
                .forEach(line => acc[country].product_lines.add(line));
        }

        return acc;
    }, {});
}

export function finalizeCountryReport(report) {
    if (!report) {
        return null;
    }

    return {
        ...report,
        cities: Array.from(report.cities),
        territories: Array.from(report.territories),
        product_lines: Array.from(report.product_lines)
    };
}