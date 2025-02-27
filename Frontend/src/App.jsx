import Register from "./components/Register";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Myprofile from "./components/Myprofile";
function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route path="/" element={<><ProtectedRoute><Sidebar /></ProtectedRoute></>}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Myprofile />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
