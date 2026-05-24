export default function Loader() {
  return (
    <div className="min-h-screen bg-[#2D142C] flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[#FE4540] animate-spin"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#FE4540] shadow-lg shadow-[#FE4540]/40"></div>
        </div>
      </div>
    </div>
  );
}
