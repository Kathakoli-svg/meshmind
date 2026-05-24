import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  Package,
  Users,
  Recycle,
  HeartHandshake,
  TrendingUp,
  Bell,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
  LogIn,
} from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetchAll();
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes, inRes, outRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/my-items"),
        api.get("/requests/incoming"),
        api.get("/requests/my"),
      ]);
      setStats(statsRes.data);
      setMyItems(itemsRes.data);
      setIncoming(inRes.data);
      setOutgoing(outRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    setRespondingId(requestId);
    try {
      await api.put(`/requests/${requestId}/respond`, { status });
      await fetchAll();
    } catch (err) {
      console.error("Respond error:", err);
      alert(err.response?.data?.detail || "Failed to respond");
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400",
      accepted: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      available: "bg-blue-500/20 text-blue-400",
      claimed: "bg-green-500/20 text-green-400",
    };
    return (
      <span
        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
          styles[status] || "bg-gray-500/20 text-gray-400"
        }`}
      >
        {status}
      </span>
    );
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#2D142C] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-6">
          <LogIn className="text-[#FE4540]" size={48} />
          <p className="text-gray-400 text-lg">
            Please log in to view your dashboard.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#FE4540] hover:bg-[#C72C41] transition px-8 py-3 rounded-2xl font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#2D142C] text-white">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader className="animate-spin text-[#FE4540]" size={40} />
          <span className="ml-4 text-gray-400 text-lg">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  const impactCards = [
    {
      title: "Items Shared",
      value: stats?.items_shared ?? 0,
      icon: Package,
    },
    {
      title: "Items Requested",
      value: stats?.items_requested ?? 0,
      icon: Users,
    },
    {
      title: "Resources Reused",
      value: stats?.resources_reused ?? "—",
      icon: Recycle,
    },
    {
      title: "People Helped",
      value: stats?.people_helped ?? 0,
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="min-h-screen bg-[#2D142C] text-white">
      <Navbar />

      <section className="pt-32 px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="mb-10">
            <p className="text-[#FE4540] uppercase tracking-[0.3em] text-sm mb-4">
              Impact Dashboard
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold">
              Hi, {user.name} 👋
            </h1>

            <p className="mt-5 text-gray-400 max-w-2xl">
              Track your donations, incoming requests, and community impact all
              in one place.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {impactCards.map((card, index) => (
              <div
                key={index}
                className="bg-[#510A32]/70 border border-white/10 rounded-3xl p-6 hover:border-[#FE4540]/60 transition"
              >
                <card.icon className="text-[#FE4540] mb-5" size={34} />
                <h3 className="text-3xl font-bold">{card.value}</h3>
                <p className="mt-2 text-gray-400 text-sm">{card.title}</p>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Redistribution Activity (3 cols) */}
            <div className="lg:col-span-3 bg-[#510A32]/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-[#FE4540]" size={28} />
                <h2 className="text-2xl font-semibold">
                  Redistribution Activity
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Items you shared */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-300">
                    Items you shared
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {myItems.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        You haven't donated any items yet.
                      </p>
                    )}
                    {myItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#2D142C] border border-white/10 rounded-2xl p-4 hover:border-[#FE4540]/30 transition"
                      >
                        <h4 className="font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.detected_category || item.category} •{" "}
                          {item.condition} • {item.location}
                        </p>
                        <div className="mt-2">
                          {statusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items you took (outgoing requests that were accepted) */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-300">
                    Items you took
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {outgoing.filter((r) => r.status === "accepted").length ===
                      0 && (
                      <p className="text-gray-500 text-sm">
                        You have not taken any items yet.
                      </p>
                    )}
                    {outgoing
                      .filter((r) => r.status === "accepted")
                      .map((req) => (
                        <div
                          key={req.id}
                          className="bg-[#2D142C] border border-white/10 rounded-2xl p-4 hover:border-[#FE4540]/30 transition"
                        >
                          <h4 className="font-semibold text-white">
                            {req.item_title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {req.item_category} •{" "}
                            {req.donor_name
                              ? `from ${req.donor_name}`
                              : "Anonymous donor"}
                          </p>
                          <div className="mt-2">
                            {statusBadge("claimed")}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Donation Requests (2 cols) */}
            <div className="lg:col-span-2 bg-[#510A32]/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="text-[#FE4540]" size={28} />
                <h2 className="text-2xl font-semibold">Donation Requests</h2>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                When someone requests your donation, their contact details
                appear here so you can reach out.
              </p>

              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                {incoming.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No donation requests yet.
                  </p>
                )}

                {incoming.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#2D142C] border border-white/10 rounded-2xl p-4 hover:border-[#FE4540]/30 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {req.requester_name} wants your{" "}
                          <span className="text-[#FE4540]">
                            {req.item_title}
                          </span>
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {req.item_category} • {formatDateTime(req.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail size={14} className="text-[#FE4540]" />
                        {req.requester_email}
                      </div>
                      {req.requester_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone size={14} className="text-[#FE4540]" />
                          {req.requester_phone}
                        </div>
                      )}
                    </div>

                    {/* Status / Actions */}
                    <div className="mt-3">
                      {req.status === "pending" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRespond(req.id, "accepted")}
                            disabled={respondingId === req.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 transition py-2 rounded-xl text-sm font-medium"
                          >
                            <CheckCircle size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, "rejected")}
                            disabled={respondingId === req.id}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-700 disabled:opacity-50 transition py-2 rounded-xl text-sm font-medium"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">Status:</span>
                          {statusBadge(req.status)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outgoing Requests Section */}
          {outgoing.length > 0 && (
            <div className="mt-6 bg-[#510A32]/70 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-[#FE4540]" size={28} />
                <h2 className="text-2xl font-semibold">
                  Your Outgoing Requests
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {outgoing.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#2D142C] border border-white/10 rounded-2xl p-4 hover:border-[#FE4540]/30 transition"
                  >
                    <h4 className="font-semibold text-white">
                      {req.item_title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {req.item_category} • {formatDate(req.created_at)}
                    </p>
                    {req.donor_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        Donated by {req.donor_name}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Status:</span>
                      {statusBadge(req.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
