// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WarrantyManager
/// @notice Quan ly bao hanh dien thoai tren blockchain (Cronos EVM Testnet).
/// @dev 4 chuc nang chinh: kich hoat/gia han bao hanh, kiem tra bao hanh,
///      chuyen quyen so huu, luu lich su sua chua.
contract WarrantyManager {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum WarrantyStatus {
        None,
        Active,
        Repair,
        Expired
    }

    struct Warranty {
        string imei;
        string model;
        address owner;
        uint256 activatedAt;
        uint256 expiresAt;
        bool exists;
        WarrantyStatus status;
    }

    struct RepairRecord {
        uint256 timestamp;
        string description;
        address recordedBy;
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    address public admin;

    // keccak256(imei) => Warranty
    mapping(bytes32 => Warranty) private warranties;
    // keccak256(imei) => list of repairs
    mapping(bytes32 => RepairRecord[]) private repairHistory;
    // enumeration helper
    bytes32[] private allImeiHashes;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event WarrantyActivated(string imei, address indexed owner, uint256 expiresAt);
    event WarrantyRenewed(string imei, uint256 newExpiresAt);
    event OwnershipTransferred(string imei, address indexed from, address indexed to);
    event RepairAdded(string imei, string description, uint256 timestamp);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "WarrantyManager: chi admin/hang moi duoc phep");
        _;
    }

    modifier warrantyExists(string calldata imei) {
        require(warranties[_key(imei)].exists, "WarrantyManager: khong tim thay IMEI");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ---------------------------------------------------------------------
    // 1. Kich hoat bao hanh (co ho tro gia han / kich hoat lai)
    // ---------------------------------------------------------------------

    /// @param imei Ma IMEI cua may
    /// @param model Ten model may (vd: "iPhone 16 Pro")
    /// @param owner_ Dia chi vi cua chu so huu hien tai
    /// @param durationInDays Thoi han bao hanh tinh tu thoi diem kich hoat (ngay)
    function activateWarranty(
        string calldata imei,
        string calldata model,
        address owner_,
        uint256 durationInDays
    ) external onlyAdmin {
        require(owner_ != address(0), "WarrantyManager: dia chi owner khong hop le");
        require(durationInDays > 0, "WarrantyManager: thoi han phai > 0");

        bytes32 key = _key(imei);
        Warranty storage w = warranties[key];
        uint256 newExpiry = block.timestamp + (durationInDays * 1 days);

        if (!w.exists) {
            w.imei = imei;
            w.model = model;
            w.owner = owner_;
            w.activatedAt = block.timestamp;
            w.expiresAt = newExpiry;
            w.exists = true;
            w.status = WarrantyStatus.Active;

            allImeiHashes.push(key);
            emit WarrantyActivated(imei, owner_, newExpiry);
        } else {
            // Gia han / kich hoat lai cho IMEI da ton tai
            w.model = model;
            w.owner = owner_;
            w.activatedAt = block.timestamp;
            w.expiresAt = newExpiry;
            w.status = WarrantyStatus.Active;

            emit WarrantyRenewed(imei, newExpiry);
        }
    }

    // ---------------------------------------------------------------------
    // 2. Kiem tra bao hanh
    // ---------------------------------------------------------------------

    function checkWarranty(string calldata imei)
        external
        view
        warrantyExists(imei)
        returns (
            string memory model,
            address owner_,
            uint256 activatedAt,
            uint256 expiresAt,
            WarrantyStatus status
        )
    {
        Warranty storage w = warranties[_key(imei)];

        WarrantyStatus currentStatus = w.status;
        if (currentStatus == WarrantyStatus.Active && block.timestamp > w.expiresAt) {
            currentStatus = WarrantyStatus.Expired;
        }

        return (w.model, w.owner, w.activatedAt, w.expiresAt, currentStatus);
    }

    // ---------------------------------------------------------------------
    // 3. Chuyen quyen so huu
    // ---------------------------------------------------------------------

    /// @dev Chu so huu hien tai hoac admin deu co the thuc hien chuyen quyen.
    function transferOwnership(string calldata imei, address newOwner)
        external
        warrantyExists(imei)
    {
        bytes32 key = _key(imei);
        Warranty storage w = warranties[key];

        require(
            msg.sender == w.owner || msg.sender == admin,
            "WarrantyManager: chi chu so huu hoac admin moi duoc chuyen quyen"
        );
        require(newOwner != address(0), "WarrantyManager: dia chi nguoi nhan khong hop le");

        address oldOwner = w.owner;
        w.owner = newOwner;

        emit OwnershipTransferred(imei, oldOwner, newOwner);
    }

    // ---------------------------------------------------------------------
    // 4. Luu lich su sua chua
    // ---------------------------------------------------------------------

    function addRepairRecord(string calldata imei, string calldata description)
        external
        onlyAdmin
        warrantyExists(imei)
    {
        bytes32 key = _key(imei);

        repairHistory[key].push(
            RepairRecord({
                timestamp: block.timestamp,
                description: description,
                recordedBy: msg.sender
            })
        );

        warranties[key].status = WarrantyStatus.Repair;

        emit RepairAdded(imei, description, block.timestamp);
    }

    /// @notice Danh dau may da sua xong, tra trang thai ve Active (neu con han)
    function markRepairComplete(string calldata imei) external onlyAdmin warrantyExists(imei) {
        Warranty storage w = warranties[_key(imei)];
        w.status = block.timestamp > w.expiresAt
            ? WarrantyStatus.Expired
            : WarrantyStatus.Active;
    }

    function getRepairHistory(string calldata imei)
        external
        view
        warrantyExists(imei)
        returns (RepairRecord[] memory)
    {
        return repairHistory[_key(imei)];
    }

    // ---------------------------------------------------------------------
    // Tien ich / Admin
    // ---------------------------------------------------------------------

    function getTotalWarranties() external view returns (uint256) {
        return allImeiHashes.length;
    }

    /// @notice Lay danh sach IMEI theo trang thai phan trang (offset/limit)
    function getImeiByIndex(uint256 index) external view returns (string memory) {
        require(index < allImeiHashes.length, "WarrantyManager: index vuot gioi han");
        return warranties[allImeiHashes[index]].imei;
    }

    // ---------------------------------------------------------------------
    // Phan quyen (RBAC) — view helpers cho frontend
    // ---------------------------------------------------------------------

    /// @notice Kiem tra tai khoan co phai admin (hang / trung tam bao hanh)
    function isAdminAccount(address account) external view returns (bool) {
        return account == admin;
    }

    /// @notice Kiem tra tai khoan co phai chu so huu thiet bi theo IMEI
    function isWarrantyOwner(string calldata imei, address account) external view returns (bool) {
        bytes32 key = _key(imei);
        if (!warranties[key].exists) return false;
        return warranties[key].owner == account;
    }

    /// @notice Tra ve quyen thao tac chuyen quyen: admin hoac owner cua IMEI
    function canTransferOwnership(string calldata imei, address account) external view returns (bool) {
        if (account == admin) return true;
        bytes32 key = _key(imei);
        if (!warranties[key].exists) return false;
        return warranties[key].owner == account;
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "WarrantyManager: dia chi admin moi khong hop le");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    function _key(string calldata imei) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(imei));
    }
}