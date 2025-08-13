import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
    // TODO: panggil API backend untuk login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-blue-600">MON</span>
            <span className="text-orange-500">DAY</span>
          </h1>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl font-bold text-center">
          Hey👋, Welcome Back!
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Login to your account to continue!
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
            <span className="material-icons text-gray-400 mr-2">mail</span>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent flex-1 outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
            <span className="material-icons text-gray-400 mr-2">lock</span>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent flex-1 outline-none"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a href="#" className="text-blue-500 text-sm">
              Reset Password
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
