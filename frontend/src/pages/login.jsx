import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Function untuk login
  // Menggunakan API yang telah dibuat di api.js
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      console.log(res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setMessage("Login berhasil ✅");
        // Redirect ke dashboard
        navigate("/dashboard");
      } else {
        setMessage("Login gagal ❌");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Login gagal ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-sm w-full text-center">
        {/* Logo dan Judul */}
        <div className="flex justify-center items-center mb-6">
          {/* Anda bisa mengganti ini dengan tag <img> untuk logo atau SVG */}
          <span className="font-bold text-2xl text-gray-800">MONDAY</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hey
          <span role="img" aria-label="waving-hand">
            🙌
          </span>
          , Welcome Back!
        </h1>
        <p className="text-gray-500 mb-8">Login to your account to continue!</p>

        {/* Formulir Login */}
        <form onSubmit={handleLogin}>
          {/* Input Email */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6L12 13L2 6" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Your email address"
              // Ganti bg-black-100 menjadi bg-black
              className="w-full bg-black text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Input Password */}
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Your password"
              // Ganti bg-black-100 menjadi bg-black
              className="w-full bg-black text-white placeholder-gray-400 pl-12 pr-12 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Ikon mata untuk show/hide password */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400 hover:text-gray-600 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>

          {/* Tautan Lupa Password */}
          <div className="text-left text-sm text-gray-500 mb-6">
            Forgot Password?{" "}
            <a href="#" className="text-blue-500 font-medium hover:underline">
              Reset Password
            </a>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-all"
          >
            Sign In
          </button>
        </form>

        {/* Pesan status */}
        {message && (
          <p
            className={`mt-4 font-medium ${
              message.includes("berhasil") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
