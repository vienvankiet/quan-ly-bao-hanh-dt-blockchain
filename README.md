# Hệ thống Quản lý Bảo hành Điện thoại trên Blockchain

Ứng dụng web quản lý bảo hành điện thoại theo IMEI, lưu trữ dữ liệu trên **Cronos EVM Testnet** thông qua smart contract `WarrantyManager`. Người dùng đăng nhập bằng **MetaMask**, thao tác kích hoạt bảo hành, tra cứu, chuyển quyền sở hữu và lưu lịch sử sửa chữa trực tiếp trên blockchain.

---

## Mục lục

1. [Tính năng](#tính-năng)
2. [Phân quyền (RBAC)](#phân-quyền-rbac)
3. [Thông tin contract đã deploy](#thông-tin-contract-đã-deploy)
4. [Hướng dẫn cho thành viên nhóm (Developer)](#hướng-dẫn-cho-thành-viên-nhóm-developer)
5. [Hướng dẫn cho người dùng (End User)](#hướng-dẫn-cho-người-dùng-end-user)
6. [Cấu trúc dự án](#cấu-trúc-dự-án)
7. [Xử lý sự cố](#xử-lý-sự-cố)

---

## Tính năng

| Chức năng | Mô tả |
|-----------|--------|
| **Kích hoạt bảo hành** | Admin đăng ký IMEI, model, chủ sở hữu và thời hạn bảo hành lên blockchain |
| **Tra cứu IMEI** | Xem thông tin bảo hành và lịch sử sửa chữa theo mã IMEI |
| **Chuyển quyền sở hữu** | Chủ thiết bị hoặc Admin chuyển quyền sang ví MetaMask khác |
| **Thêm lịch sử sửa chữa** | Admin ghi nhận thiết bị đang sửa chữa |
| **Hoàn tất sửa chữa** | Admin đánh dấu máy đã sửa xong, trả trạng thái về Active |
| **Dashboard** | Thống kê thiết bị, biểu đồ, giao dịch gần đây |
| **Demo Mode** | Trải nghiệm giao diện không cần MetaMask (dữ liệu lưu local) |

---

## Phân quyền (RBAC)

Quyền được kiểm tra trên **smart contract** và **frontend**:

| Vai trò | Điều kiện | Quyền |
|---------|-----------|-------|
| **Admin (Hãng)** | Ví trùng với `admin` trên contract | Kích hoạt bảo hành, thêm/hoàn tất sửa chữa, chuyển quyền mọi thiết bị |
| **Owner (Chủ thiết bị)** | Ví là `owner` của ít nhất một IMEI | Tra cứu, chuyển quyền thiết bị của mình |
| **User (Người dùng)** | Đã đăng nhập MetaMask, chưa sở hữu IMEI | Tra cứu IMEI |
| **Guest (Khách)** | Chưa đăng nhập | Chỉ xem trang đăng nhập |

> **Lưu ý:** Ví deploy contract mặc định là **Admin**. Hai thành viên khác có thể dùng ví riêng — nếu cần quyền Admin, Admin hiện tại phải gọi hàm `changeAdmin` trên contract.

---

## Thông tin contract đã deploy

| Mục | Giá trị |
|-----|---------|
| **Network** | Cronos Testnet |
| **Chain ID** | 338 (0x152) |
| **Contract** | `0x328c6F067cD8831F2C4609abFdd7f7A815Eb139f` |
| **Explorer** | [Xem trên Cronos Explorer](https://explorer.cronos.org/testnet/address/0x328c6F067cD8831F2C4609abFdd7f7A815Eb139f) |
| **IMEI mẫu trên chain** | `356789123456789`, `351234567890123` |

Chi tiết deploy lưu tại: `deployments/cronosTestnet.json`

---

## Hướng dẫn cho thành viên nhóm (Developer)

Phần này dành cho **2 thành viên còn lại** (hoặc bất kỳ dev nào) clone repo và chạy được dự án.

### Yêu cầu hệ thống

- **Node.js** >= 18
- **npm** >= 9
- Trình duyệt có cài **MetaMask**
- Git

### Bước 1 — Clone và cài đặt

```bash
git clone <url-repo>
cd quan-ly-bao-hanh-dt-blockchain
npm install
```

### Bước 2 — Cấu hình môi trường

Sao chép file mẫu và điền thông tin:

```bash
cp .env.example .env
```

Nội dung `.env`:

```env
# Chi can neu muon deploy contract moi
PRIVATE_KEY=

CRONOS_RPC_URL=https://evm-t3.cronos.org
CRONOSCAN_API_KEY=

# Dia chi contract da deploy san (dung gia tri ben duoi)
VITE_CONTRACT_ADDRESS=0x328c6F067cD8831F2C4609abFdd7f7A815Eb139f
```

> **Quan trọng:** Không commit file `.env` lên Git. Chỉ cần `VITE_CONTRACT_ADDRESS` là đủ để chạy frontend với contract đã deploy.

### Bước 3 — Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị (thường là `http://localhost:5173`).

### Bước 4 — Build production

```bash
npm run build
npm run preview
```

### Các lệnh phát triển

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy frontend (Vite dev server) |
| `npm run build` | Build production |
| `npm run compile` | Compile smart contract + đồng bộ ABI |
| `npm run deploy:local` | Deploy lên mạng Hardhat local (test) |
| `npm run deploy:cronos` | Deploy lên Cronos Testnet (cần `PRIVATE_KEY` + tCRO) |
| `npm run lint` | Kiểm tra ESLint |

### Deploy contract mới (tùy chọn)

Chỉ cần khi muốn deploy lại contract, **không bắt buộc** nếu dùng contract sẵn có.

1. Tạo ví MetaMask, lấy **tCRO testnet** từ [Cronos Faucet](https://cronos.org/faucet)
2. Thêm `PRIVATE_KEY` vào `.env` (private key của ví deploy, **không chia sẻ**)
3. Chạy:

```bash
npm run compile
npm run deploy:cronos
```

Script sẽ tự:
- Deploy `WarrantyManager.sol`
- Seed 2 IMEI mẫu
- Cập nhật `VITE_CONTRACT_ADDRESS` trong `.env`
- Lưu kết quả vào `deployments/cronosTestnet.json`

### Thêm Cronos Testnet vào MetaMask (cho dev)

| Trường | Giá trị |
|--------|---------|
| Network Name | Cronos Testnet |
| RPC URL | `https://evm-t3.cronos.org` |
| Chain ID | `338` |
| Symbol | tCRO |
| Explorer | `https://explorer.cronos.org/testnet` |

App sẽ tự yêu cầu chuyển mạng khi đăng nhập MetaMask.

### Phân công gợi ý cho nhóm 3 người

| Thành viên | Nhiệm vụ gợi ý |
|------------|----------------|
| **Dev 1 (Deployer/Admin)** | Quản lý contract, kích hoạt bảo hành, sửa chữa |
| **Dev 2** | Test tra cứu, chuyển quyền với ví Owner |
| **Dev 3** | Test UI, Demo Mode, viết báo cáo / demo |

---

## Hướng dẫn cho người dùng (End User)

Phần này dành cho **người dùng cuối** sử dụng ứng dụng qua trình duyệt.

### Chuẩn bị

1. Cài extension **MetaMask** trên Chrome / Firefox / Edge  
   → [https://metamask.io](https://metamask.io)
2. Tạo ví hoặc import ví có sẵn
3. Thêm mạng **Cronos Testnet** (app sẽ hỏi tự động khi đăng nhập)
4. (Tùy chọn) Lấy **tCRO testnet** nếu cần gửi giao dịch — [Cronos Faucet](https://cronos.org/faucet)

### Đăng nhập

1. Mở ứng dụng (link do nhóm cung cấp, ví dụ `http://localhost:5173`)
2. Chọn một trong hai cách:
   - **Đăng nhập bằng MetaMask** — dùng blockchain thật
   - **Tiếp tục chế độ Demo** — dùng thử, không cần ví

3. MetaMask sẽ hiện popup → chọn ví → **Kết nối** → **Ký** (nếu có)

### Giao diện chính

Sau khi đăng nhập, bạn thấy **Dashboard** gồm:

- **Role Banner** — vai trò hiện tại (Admin / Owner / User) và quyền được phép
- **Stats Grid** — số thiết bị, đang bảo hành, đang sửa, giao dịch
- **Biểu đồ** — thiết bị kích hoạt 7 tháng gần nhất
- **Blockchain Activity** — giao dịch gần đây (click để xem trên Explorer)
- **Recent Warranty** — bảng danh sách bảo hành
- **Quick Actions** — 4 nút thao tác nhanh

### Các thao tác

#### 1. Tra cứu IMEI (mọi người dùng đã đăng nhập)

- Nhấn **Search IMEI** (Quick Actions hoặc menu **MENU**)
- Hoặc gõ IMEI vào ô tìm kiếm trên header → Enter
- Nhập IMEI, ví dụ: `356789123456789` → **Tra cứu**
- Xem: model, chủ sở hữu, ngày kích hoạt, hết hạn, trạng thái, lịch sử sửa chữa

#### 2. Kích hoạt bảo hành (chỉ Admin)

- Nhấn **Activate Warranty**
- Điền: IMEI, Model, địa chỉ ví chủ sở hữu, thời hạn (ngày)
- **Kích hoạt bảo hành** → xác nhận giao dịch trên MetaMask
- Chờ vài giây → dữ liệu cập nhật trên Dashboard

#### 3. Chuyển quyền sở hữu (Admin hoặc Owner)

- Nhấn **Transfer Ownership** (hoặc icon ↻ trên bảng)
- Nhập IMEI và địa chỉ ví người nhận (`0x...`)
- **Xác nhận chuyển** → ký giao dịch MetaMask

#### 4. Thêm lịch sử sửa chữa (chỉ Admin)

- Nhấn **Add Repair**
- Nhập IMEI và mô tả sửa chữa
- **Thêm lịch sử** → ký giao dịch MetaMask
- Trạng thái thiết bị chuyển sang **Repair**

#### 5. Hoàn tất sửa chữa (chỉ Admin)

- Trong modal **Add Repair**, phần **Hoàn tất sửa chữa**
- Hoặc nhấn icon ✓ trên bảng (thiết bị đang Repair)
- Nhập IMEI → **Đánh dấu hoàn tất**

### Header — các icon

| Icon / Nút | Chức năng |
|------------|-----------|
| 🔍 Ô tìm kiếm | Tra cứu IMEI |
| 🔔 Chuông | Xem giao dịch gần đây |
| 💼 Wallet | Menu ví: địa chỉ, vai trò, sao chép, **Đăng xuất** |
| ☰ MENU | Danh sách chức năng + chuyển Demo/Web3 + đăng xuất |

### Đăng xuất

- Click nút **Wallet** → **Đăng xuất**
- Hoặc menu **MENU** → **Đăng xuất**

### Chế độ Demo vs Web3

| | Demo Mode | Web3 Mode |
|---|-----------|-----------|
| Cần MetaMask | Không | Có |
| Dữ liệu | Lưu trên trình duyệt (local) | Lưu trên blockchain |
| Phân quyền | Mọi quyền (test) | Theo vai trò thật |
| Giao dịch | Giả lập | Giao dịch thật trên Cronos |

Chuyển chế độ: **MENU** → **Chuyển sang Demo** / **Chuyển sang Web3**

---

## Cấu trúc dự án

```
quan-ly-bao-hanh-dt-blockchain/
├── src/
│   ├── contracts/          # Smart contract Solidity
│   │   └── WarrantyManager.sol
│   ├── controllers/        # Web3Context (MetaMask, contract calls)
│   ├── config/             # Contract address, chain config
│   ├── models/             # Types, ABI, phân quyền
│   └── views/              # React UI (Dashboard, modals, login)
├── scripts/
│   ├── deploy.ts           # Script deploy lên blockchain
│   └── sync-abi.mjs        # Đồng bộ ABI sau compile
├── ignition/modules/       # Hardhat Ignition module
├── deployments/            # Thông tin deploy theo network
├── artifacts/              # Contract ABI sau compile
├── hardhat.config.ts
├── .env.example            # Mẫu biến môi trường
└── package.json
```

### Luồng dữ liệu

```
Người dùng → React UI → Web3Context → MetaMask → Cronos Testnet → WarrantyManager.sol
```

---

## Xử lý sự cố

| Lỗi | Cách xử lý |
|-----|------------|
| **MetaMask chưa cài** | Cài extension tại [metamask.io](https://metamask.io) |
| **Sai mạng** | Chuyển sang Cronos Testnet (Chain ID 338) — app sẽ hỏi tự động |
| **Chỉ Admin mới được kích hoạt** | Đăng nhập bằng ví Admin (ví deploy contract) |
| **Contract chưa được tải** | Kiểm tra `VITE_CONTRACT_ADDRESS` trong `.env`, restart `npm run dev` |
| **Giao dịch thất bại / hết gas** | Lấy thêm tCRO từ [faucet](https://cronos.org/faucet) |
| **Không tìm thấy IMEI** | Kiểm tra IMEI đúng 15 số; thử IMEI mẫu `356789123456789` |
| **Demo không thấy dữ liệu Web3** | Chuyển sang Web3: **MENU** → **Chuyển sang Web3**, đăng nhập MetaMask |

---

## Công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Vite, Ethers.js v6, Recharts
- **Smart Contract:** Solidity 0.8.20, Hardhat 3
- **Blockchain:** Cronos EVM Testnet
- **Ví:** MetaMask

---

## Liên hệ / Hỗ trợ

Nếu gặp lỗi khi cài đặt hoặc sử dụng, liên hệ thành viên phụ trách deploy contract (Admin) hoặc tạo issue trên repository.
