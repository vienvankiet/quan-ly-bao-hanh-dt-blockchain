import "./RecentWarrantyTable.css";

const warranties = [
    {
        imei: "356789123456789",
        brand: "Samsung S24 Ultra",
        owner: "Nguyễn Văn A",
        expire: "15/12/2027",
        status: "Active",
    },
    {
        imei: "351234567890123",
        brand: "iPhone 16 Pro",
        owner: "Trần Thị B",
        expire: "22/09/2027",
        status: "Repair",
    },
    {
        imei: "358765432109876",
        brand: "Xiaomi 15",
        owner: "Lê Văn C",
        expire: "04/06/2026",
        status: "Expired",
    },
    {
        imei: "352345678901234",
        brand: "OPPO Find X8",
        owner: "Phạm Minh D",
        expire: "30/01/2028",
        status: "Active",
    },
];

const RecentWarrantyTable = () => {
    return (
        <section className="recent-table">
            <div className="recent-table__header">
                <h3>Recent Warranty</h3>
                <button>View All</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>IMEI</th>
                        <th>Model</th>
                        <th>Owner</th>
                        <th>Expire</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {warranties.map((item) => (
                        <tr key={item.imei}>
                            <td>{item.imei}</td>
                            <td>{item.brand}</td>
                            <td>{item.owner}</td>
                            <td>{item.expire}</td>
                            <td>
                                <span
                                    className={`status status--${item.status.toLowerCase()}`}
                                >
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default RecentWarrantyTable;