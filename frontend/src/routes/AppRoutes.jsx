import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import ComparisonPage from "../pages/ComparisonPage"

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/compare" element={<ComparisonPage />} />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes