import { useState } from "react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatsGrid from "./components/dashboard/StatsGrid";
import WarrantyChart from "./components/dashboard/WarrantyChart";
import BlockchainActivity from "./components/dashboard/BlockchainActivity";
import RecentWarrantyTable from "./components/dashboard/RecentWarrantyTable";
import QuickActions from "./components/dashboard/QuickActions";
import RoleBanner from "../components/RoleBanner";
import {
    ActivateModal,
    SearchModal,
    TransferModal,
    RepairModal,
} from "../components/ActionModals";

import "./Dashboard.css";

export type ModalType = "activate" | "search" | "transfer" | "repair" | null;

export interface ModalState {
    type: ModalType;
    imei?: string;
}

const Dashboard = () => {
    const [modal, setModal] = useState<ModalState>({ type: null });

    const openModal = (type: ModalType, imei = "") => {
        setModal({ type, imei: imei || undefined });
    };

    const openSearch = (imei = "") => {
        openModal("search", imei);
    };

    const closeModal = () => {
        setModal({ type: null });
    };

    return (
        <main className="dashboard">
            <DashboardHeader onAction={openModal} onSearch={openSearch} />

            <RoleBanner />

            <StatsGrid onAction={openModal} />

            <div className="dashboard-chart-grid">
                <WarrantyChart />
                <BlockchainActivity />
            </div>

            <RecentWarrantyTable onAction={openModal} onSearch={openSearch} />

            <QuickActions onAction={openModal} />

            {modal.type === "activate" && <ActivateModal onClose={closeModal} />}
            {modal.type === "search" && (
                <SearchModal onClose={closeModal} initialImei={modal.imei || ""} />
            )}
            {modal.type === "transfer" && (
                <TransferModal onClose={closeModal} initialImei={modal.imei || ""} />
            )}
            {modal.type === "repair" && (
                <RepairModal onClose={closeModal} initialImei={modal.imei || ""} />
            )}
        </main>
    );
};

export default Dashboard;
