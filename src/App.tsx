// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChainInfoPage } from "./pages/ChainInfoPage";
import { FakeBaycPage } from "./pages/FakeBaycPage";
import { FakeBaycTokenPage } from "./pages/FakeBaycTokenPage";
import { FakeNefturiansPage } from "./pages/FakeNefturiansPage";
import { FakeNefturiansUserPage } from "./pages/FakeNefturiansUserPage";
import { FakeMeebitsPage } from "./pages/FakeMeebitsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { WrongNetworkPage } from "./pages/WrongNetworkPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/chain-info" replace />} />
        <Route path="/chain-info" element={<ChainInfoPage />} />

        <Route path="/fakeBayc" element={<FakeBaycPage />} />
        <Route path="/fakeBayc/:tokenId" element={<FakeBaycTokenPage />} />

        <Route path="/fakeNefturians" element={<FakeNefturiansPage />} />
        <Route
          path="/fakeNefturians/:userAddress"
          element={<FakeNefturiansUserPage />}
        />

        <Route path="/fakeMeebits" element={<FakeMeebitsPage />} />

        <Route path="*" element={<NotFoundPage />} />

        <Route path="/wrong-network" element={<WrongNetworkPage />} />
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}

export default App;
