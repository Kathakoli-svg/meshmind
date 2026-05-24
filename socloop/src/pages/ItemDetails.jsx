import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { MapPin, Phone, Mail, User, Tag, Calendar, Loader, Cpu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const BASE_URL = "http://127.0.0.1:8000";

export default function ItemDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const browseItem = location.state?.item;

  const [item, setItem] = useState(
    browseItem && String(browseItem.id) === String(id) ? browseItem : null
  );
  const [loading, setLoading] = useState(
    !(browseItem && String(browseItem.id) === String(id))
  );
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      const hasBrowseMatch =
        browseItem && String(browseItem.id) === String(id);
      if (!hasBrowseMatch) {
        setLoading(true);
      }
      setError("");
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Item not found.");
        } else if (!hasBrowseMatch) {
          setError("Failed to load item details. Is the backend running?");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleRequestDonation = async () => {
    // Must be logged in
    if (!user) {
      navigate("/login");
      return;
    }

    setRequesting(true);
    setRequestError("");
    try {
      await api.post("/requests", { item_id: parseInt(id) });
      setRequested(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "You cannot request your own item") {
        setRequestError("This is your own donated item.");
      } else if (detail === "You already have a pending request for this item") {
        setRequested(true);
        setRequestError("");
      } else if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setRequestError(detail || "Failed to send request. Try again.");
      }
    } finally {
      setRequesting(false);
    }
  };

  const getImageSrc = () => {
    if (item?.image_url) return `${BASE_URL}${item.image_url}`;
    return "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D142C] text-white">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader className="animate-spin text-[#FE4540]" size={40} />
          <span className="ml-4 text-gray-400 text-lg">Loading item details...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#2D142C] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40">
          <p className="text-red-400 text-lg">{error || "Item not found"}</p>
          <Link
            to="/browse"
            className="mt-6 text-[#FE4540] hover:underline transition"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // Check if this is the user's own item
  const isOwnItem = user && item.donor_name === user.name;

  return (
    <div className="min-h-screen bg-[#2D142C] text-white">
      <Navbar />

      <section className="pt-32 px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img
              src={getImageSrc()}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Details */}
          <div className="bg-[#510A32]/70 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <p className="text-[#FE4540] uppercase tracking-[0.3em] text-sm mb-4">
              {item.detected_category || item.category}
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {item.title}
            </h1>

            {/* Info */}
            <div className="mt-10 space-y-5">
              {/* Donor */}
              {item.donor_name && (
                <div className="flex items-center gap-4">
                  <User className="text-[#FE4540]" size={22} />
                  <div>
                    <p className="text-gray-400 text-sm">Donor</p>
                    <h3 className="font-medium">{item.donor_name}</h3>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-4">
                <MapPin className="text-[#FE4540]" size={22} />
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <h3 className="font-medium">{item.location}</h3>
                </div>
              </div>

              {/* Phone */}
              {item.donor_phone && (
                <div className="flex items-center gap-4">
                  <Phone className="text-[#FE4540]" size={22} />
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <h3 className="font-medium">{item.donor_phone}</h3>
                  </div>
                </div>
              )}

              {/* Email */}
              {item.donor_email && (
                <div className="flex items-center gap-4">
                  <Mail className="text-[#FE4540]" size={22} />
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <h3 className="font-medium">{item.donor_email}</h3>
                  </div>
                </div>
              )}

              {/* AI Detected Category */}
              <div className="flex items-start gap-4">
                <Tag className="text-[#FE4540] mt-1" size={22} />
                <div>
                  <p className="text-gray-400 text-sm">AI Detected Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-medium">{item.detected_category || item.category}</h3>
                    <span className="bg-[#FE4540]/20 text-[#FE4540] px-2 py-0.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                      <Cpu size={12} /> AI
                    </span>
                  </div>
                  {item.detected_category && item.detected_category !== item.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      Listed as: {item.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Donated on */}
              {item.created_at && (
                <div className="flex items-center gap-4">
                  <Calendar className="text-[#FE4540]" size={22} />
                  <div>
                    <p className="text-gray-400 text-sm">Donated on</p>
                    <h3 className="font-medium">{formatDate(item.created_at)}</h3>
                  </div>
                </div>
              )}

              {/* Condition */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Condition</p>
                <span className="bg-[#FE4540]/20 text-[#FE4540] px-4 py-2 rounded-xl text-sm">
                  {item.condition}
                </span>
              </div>
            </div>

            {/* Request Error */}
            {requestError && (
              <p className="mt-4 text-red-400 text-sm text-center">{requestError}</p>
            )}

            {/* Button */}
            {isOwnItem ? (
              <div className="mt-10 w-full py-4 rounded-2xl font-semibold text-center bg-gray-600 cursor-not-allowed text-gray-300">
                This is your donated item
              </div>
            ) : (
              <button
                onClick={handleRequestDonation}
                disabled={requested || requesting}
                className={`mt-10 w-full py-4 rounded-2xl font-semibold transition ${
                  requested
                    ? "bg-green-600 cursor-not-allowed"
                    : requesting
                    ? "bg-[#FE4540]/60 cursor-wait"
                    : "bg-[#FE4540] hover:bg-[#C72C41]"
                }`}
              >
                {requested
                  ? "✓ Donation Requested"
                  : requesting
                  ? "Sending Request..."
                  : user
                  ? "Request Donation"
                  : "Login to Request"}
              </button>
            )}

            {/* Back */}
            <Link
              to="/browse"
              className="block text-center text-gray-400 hover:text-white transition mt-6"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
