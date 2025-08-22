import { Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Categories from "./pages/Categories.jsx";
import Warehouses from "./pages/Warehouses.jsx";
import Merchants from "./pages/Merchants.jsx";
import Product from "./pages/Product.jsx";
function App() {
  return (
     <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Parent dashboard */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="product" element={<Product />} />
        <Route path="categories" element={<Categories />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="merchants" element={<Merchants />} />
      </Route>
    </Routes>
  );
}

export default App;
