import { Loader2 } from "lucide-react";
import { Web3Provider, useWeb3 } from "./controllers/Web3Context";
import Dashboard from "./views/pages/Dashboard";
import LoginPage from "./views/pages/LoginPage";

import "./App.css";

function AppGate() {
    const { sessionReady, isConnected, isMockMode } = useWeb3();

    if (!sessionReady) {
        return (
            <div className="app-loading">
                <Loader2 size={32} className="app-loading__spin" />
                <span>Đang tải...</span>
            </div>
        );
    }

    if (!isConnected && !isMockMode) {
        return <LoginPage />;
    }

    return <Dashboard />;
}

function App() {
    return (
        <Web3Provider>
            <AppGate />
        </Web3Provider>
    );
}

export default App;
