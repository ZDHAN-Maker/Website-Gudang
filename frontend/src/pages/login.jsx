import { useState } from "react";
import api from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Function untul login
  // Menggunakan API yang telah dibuat di api.js
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      console.log(res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token); 
        setMessage("Login berhasil ✅");
      } else {
        setMessage("Login gagal ❌");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Login gagal ❌");
    }
  };

  // Memastikan form login tampil di tengah layar
  // Menggunakan Tailwind CSS untuk styling
  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="p-6 border rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-3 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-3 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">
          Login
        </button>
        <p className="mt-3 text-center">{message}</p>
      </form>
    </div>
  );
}
