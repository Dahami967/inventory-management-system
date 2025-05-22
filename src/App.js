import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";

import Dashboard from "./pages/Dashboard";
import AddItem from "./pages/AddItem";
import UpdateStock from "./pages/UpdateStock";
import ViewInventory from "./pages/ViewInventory";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/update-stock" element={<UpdateStock />} />
          <Route path="/view-inventory" element={<ViewInventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
