import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const artifactPath = resolve(
    "artifacts/src/contracts/WarrantyManager.sol/WarrantyManager.json"
);
const abiOut = resolve("src/models/contractABI.json");

const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
writeFileSync(abiOut, JSON.stringify(artifact.abi, null, 2));
console.log("Synced ABI → src/models/contractABI.json");
