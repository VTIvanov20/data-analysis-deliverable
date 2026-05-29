export function SalesInfoPanel({ selectedPoint, selectedCountryReport }) {
    if (!selectedPoint && !selectedCountryReport) {
        return null;
    }

    if (selectedPoint) {
        return (
            <div className="sales-info-panel">
                <h3>{selectedPoint.CITY}, {selectedPoint.COUNTRY}</h3>
                <p>Territory: {selectedPoint.TERRITORY}</p>
                <p>Sales: €{Number(selectedPoint.total_sales_eur || 0).toLocaleString()}</p>
                <p>Quantity: {Number(selectedPoint.total_quantity || 0).toLocaleString()}</p>
                <p>Orders: {Number(selectedPoint.number_of_orders || 0).toLocaleString()}</p>
                <p>Product lines: {selectedPoint.product_lines}</p>
            </div>
        );
    }

    return (
        <div className="sales-info-panel">
            <h3>{selectedCountryReport.country}</h3>
            <p>Total sales: €{Number(selectedCountryReport.total_sales_eur || 0).toLocaleString()}</p>
            <p>Total quantity: {Number(selectedCountryReport.total_quantity || 0).toLocaleString()}</p>
            <p>Total orders: {Number(selectedCountryReport.number_of_orders || 0).toLocaleString()}</p>
            <p>Deliveries: {Number(selectedCountryReport.deliveries || 0).toLocaleString()}</p>
            <p>Cities: {selectedCountryReport.cities.join(', ')}</p>
            <p>Product lines: {selectedCountryReport.product_lines.join(', ')}</p>
        </div>
    );
}