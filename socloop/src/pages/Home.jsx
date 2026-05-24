import Navbar from "../components/Navbar";
import Features from "../components/Features";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2D142C] text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 px-4 sm:px-6 relative min-h-screen flex items-center">
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#801336] opacity-20 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-4xl">
            <p className="text-[#FE4540] uppercase tracking-[0.3em] text-sm mb-6">
              Sustainable Communities • AI Powered
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              Building
              <span className="text-[#FE4540]"> Smarter </span>&
              <span className="text-[#C72C41]"> Sustainable </span>
              Cities Together
            </h1>

            <p className="mt-8 text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl">
              Redistribute books, clothes, and essential resources, reduce
              environmental waste and empower
              communities through intelligent sustainability.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/donate")}
                className="bg-[#FE4540] hover:bg-[#C72C41] transition px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-[#FE4540]/20"
              >
                Start Donating
              </button>

              <button
                onClick={() => navigate("/browse")}
                className="border border-white/10 hover:bg-white/10 transition px-8 py-4 rounded-2xl font-semibold backdrop-blur-lg"
              >
                Explore Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />
    </div>
  );
}
