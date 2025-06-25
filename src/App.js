import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { Link } from 'react-router-dom';

import Dashboard from "./pages/Dashboard";
import AddItem from "./pages/AddItem";
import UpdateStock from "./pages/UpdateStock";
import ViewInventory from "./pages/ViewInventory";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";


function App() {
  return (
    <Router>
      <Routes>
        

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/add-item" element={<Layout><AddItem /></Layout>} />
        <Route path="/update-stock" element={<Layout><UpdateStock /></Layout>} />
        <Route path="/view-inventory" element={<Layout><ViewInventory /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
