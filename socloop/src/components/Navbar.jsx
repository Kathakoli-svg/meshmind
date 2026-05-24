import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isHome = location.pathname === "/";

  const handleLogout = (onNavigate) => {
    logout();
    if (onNavigate) onNavigate();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Browse", path: "/browse" },
    { name: "Donate", path: "/donate" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const authActions = (onNavigate) => {
    if (isHome && !user) {
      return (
        <>
          <Link
            to="/login"
            onClick={onNavigate}
            className="text-gray-300 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={onNavigate}
            className="bg-[#FE4540] hover:bg-[#C72C41] transition px-5 py-2 rounded-xl font-medium shadow-lg shadow-[#FE4540]/20"
          >
            Get Started
          </Link>
        </>
      );
    }
    if (user) {
      return (
        <>
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="text-white font-medium hover:text-[#FE4540] transition"
          >
            {user.name}
          </Link>
          <button
            onClick={() => handleLogout(onNavigate)}
            className="flex items-center gap-2 text-gray-300 hover:text-[#FE4540] transition text-sm font-medium cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/10 backdrop-blur-xl bg-[#2D142C]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl sm:text-2xl font-bold text-[#FE4540]">
          SocLoop
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition text-sm font-medium ${
                location.pathname === link.path
                  ? "text-[#FE4540]"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {authActions()}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#2D142C]/95 backdrop-blur-xl">
          <div className="flex flex-col px-6 py-6 gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-base transition ${
                  location.pathname === link.path
                    ? "text-[#FE4540]"
                    : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {authActions(() => setMenuOpen(false))}
          </div>
        </div>
      )}
    </nav>
  );
}
