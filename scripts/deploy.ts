import hre from "hardhat";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const DEPLOYMENTS_DIR = resolve(process.cwd(), "deployments");
const ENV_FILE = resolve(process.cwd(), ".env");

async function main() {
    const connection = await hre.network.getOrCreate();
    const networkName = connection.networkName;
    const ethers = connection.ethers;

    if (networkName === "cronosTestnet" && !process.env.PRIVATE_KEY?.trim()) {
        throw new Error(
            "Thiếu PRIVATE_KEY trong .env. Thêm private key ví MetaMask (có tCRO testnet) rồi chạy lại: npm run deploy:cronos"
        );
    }

    console.log(`\nDeploying WarrantyManager → ${networkName}`);

    const [deployer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WarrantyManager");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const admin = await contract.admin();
    const chainId = Number((await ethers.provider.getNetwork()).chainId);

    console.log(`Contract: ${address}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Admin:    ${admin}`);
    console.log(`ChainId:  ${chainId}`);

    const deployment = {
        network: networkName,
        chainId,
        contractAddress: address,
        admin,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
    };

    if (!existsSync(DEPLOYMENTS_DIR)) mkdirSync(DEPLOYMENTS_DIR, { recursive: true });

    const outFile = resolve(DEPLOYMENTS_DIR, `${networkName}.json`);
    writeFileSync(outFile, JSON.stringify(deployment, null, 2));
    console.log(`Saved: ${outFile}`);

    let envContent = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
    const line = `VITE_CONTRACT_ADDRESS=${address}`;
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(/VITE_CONTRACT_ADDRESS=.*/g, line);
    } else {
        envContent += (envContent.endsWith("\n") ? "" : "\n") + line + "\n";
    }
    writeFileSync(ENV_FILE, envContent);
    console.log(`Updated .env`);

    // Seed mau
    if (networkName === "cronosTestnet" || networkName === "hardhat" || networkName === "localhost") {
        console.log("\nSeeding sample warranties...");
        const samples = [
            { imei: "356789123456789", model: "Samsung S24 Ultra", days: 365n },
            { imei: "351234567890123", model: "iPhone 16 Pro", days: 365n },
        ];
        for (const s of samples) {
            try {
                const tx = await contract.activateWarranty(
                    s.imei,
                    s.model,
                    deployer.address,
                    s.days
                );
                await tx.wait();
                console.log(`  ✓ ${s.imei}`);
            } catch (e) {
                console.log(`  - ${s.imei}:`, (e as Error).message);
            }
        }
    }

    console.log("\n✅ Deploy hoàn tất!");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
