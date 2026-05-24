import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const BASE_URL = "http://127.0.0.1:8000";

export default function Browse() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, [search, category]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== "All Categories") params.category = category;
      const res = await api.get("/items", { params });
      setItems(res.data);
    } catch {
      setError("Failed to load items. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (item) =>
    item.image_url
      ? `${BASE_URL}${item.image_url}`
      : "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format";

  return (
    <div className="min-h-screen bg-[#2D142C] text-white">
      <Navbar />

      <section className="pt-32 px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-[#FE4540] uppercase tracking-[0.3em] text-sm mb-4">
              Community Resources
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold">
              Browse Available Donations
            </h1>
            <p className="mt-5 text-gray-400 max-w-2xl">
              Discover books, clothes, school supplies, electronics, and other
              useful items shared by the community.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="flex items-center gap-3 bg-[#510A32]/70 border border-white/10 rounded-2xl px-4 py-4 flex-1">
              <Search className="text-[#FE4540]" size={22} />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-white placeholder:text-gray-400"
              />
            </div>

            <div className="relative lg:w-[240px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-[#510A32]/70 border border-white/10 hover:border-[#FE4540]/50 focus:border-[#FE4540] rounded-2xl px-5 py-4 outline-none text-white backdrop-blur-xl transition cursor-pointer"
              >
                <option value="All Categories" className="bg-[#2D142C]">
                  All Categories
                </option>
                <option value="Clothes" className="bg-[#2D142C]">
                  👕 Clothes (All)
                </option>
                <option value="Shoes" className="bg-[#2D142C]">
                  👟 Shoes
                </option>
                <option value="Shirts / Tops" className="bg-[#2D142C]">
                  👔 Shirts / Tops
                </option>
                <option value="Pants / Bottoms" className="bg-[#2D142C]">
                  👖 Pants / Bottoms
                </option>
                <option value="Jackets / Coats" className="bg-[#2D142C]">
                  🧥 Jackets / Coats
                </option>
                <option value="Dresses" className="bg-[#2D142C]">
                  👗 Dresses
                </option>
                <option value="Accessories" className="bg-[#2D142C]">
                  🎒 Accessories
                </option>
                <option value="Books" className="bg-[#2D142C]">
                  📚 Books
                </option>
                <option value="Electronics" className="bg-[#2D142C]">
                  💻 Electronics
                </option>
                <option value="School Supplies" className="bg-[#2D142C]">
                  ✏️ School Supplies
                </option>
                <option value="Utility Items" className="bg-[#2D142C]">
                  🔧 Utility Items
                </option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FE4540]">
                ▼
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-gray-400 text-center py-20">Loading items...</p>
          )}
          {error && <p className="text-red-400 text-center py-20">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-gray-400 text-center py-20">
              No items found. Be the first to{" "}
              <span
                className="text-[#FE4540] cursor-pointer hover:underline"
                onClick={() => navigate("/donate")}
              >
                donate
              </span>
              !
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#510A32]/70 border border-white/10 rounded-3xl overflow-hidden hover:border-[#FE4540]/50 transition group"
                >
                  <div className="overflow-hidden h-52">
                    <img
                      src={getImageSrc(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="p-5">
                    <span className="text-xs uppercase tracking-widest text-[#FE4540]">
                      {item.detected_category || item.category}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                      <MapPin size={16} />
                      {item.location}
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/item/${item.id}`, { state: { item } })
                      }
                      className="mt-6 w-full bg-[#FE4540] hover:bg-[#C72C41] transition py-3 rounded-xl font-medium shadow-lg shadow-[#FE4540]/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
