import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WarrantyManagerModule = buildModule("WarrantyManagerModule", (m) => {
    const warrantyManager = m.contract("WarrantyManager");
    return { warrantyManager };
});

export default WarrantyManagerModule;
