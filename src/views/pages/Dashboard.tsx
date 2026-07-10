import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatsGrid from "./components/dashboard/StatsGrid";
import WarrantyChart from "./components/dashboard/WarrantyChart";
import BlockchainActivity from "./components/dashboard/BlockchainActivity";
import RecentWarrantyTable from "./components/dashboard/RecentWarrantyTable";
import QuickActions from "./components/dashboard/QuickActions";

import "./Dashboard.css";

const Dashboard = () => {
    return (
        <main className="dashboard">
            <DashboardHeader />

            <StatsGrid />

            <div className="dashboard-chart-grid">
                <WarrantyChart />
                <BlockchainActivity />
            </div>

            <RecentWarrantyTable />

            <QuickActions />
        </main>
    );
};

export default Dashboard;