import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/browse");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D142C] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#510A32]/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
        <p className="text-gray-400 text-center mt-3">
          Login to continue your sustainability journey.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="flex items-center gap-3 bg-[#2D142C] border border-white/10 rounded-xl px-4 overflow-hidden">
            <Mail className="text-[#FE4540] shrink-0" size={22} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-white py-4 outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-3 bg-[#2D142C] border border-white/10 rounded-xl px-4 overflow-hidden">
            <Lock className="text-[#FE4540] shrink-0" size={22} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent text-white py-4 outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FE4540] hover:bg-[#C72C41] disabled:opacity-60 disabled:cursor-not-allowed transition py-4 rounded-xl font-semibold shadow-lg shadow-[#FE4540]/20"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-[#FE4540] hover:underline">
            Sign up
          </Link>
        </p>
        <Link
          to="/"
          className="block text-center text-gray-500 hover:text-white transition mt-5 text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
