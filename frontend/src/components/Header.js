import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 shadow-md flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          📌 {location.pathname === "/stats" ? "Statistikpanel" : "Beställnings-Kanban"}
        </h1>
        <span className="text-sm bg-slate-700 px-3 py-1 rounded-full text-white border border-slate-500">
          Inloggad som: <strong>{user?.username}</strong> ({user?.role})
        </span>
      </div>

      <div className="flex gap-3">
        {user?.role === "admin" || user?.role === "manager" ? (
          <button
            onClick={() => navigate("/stats")}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg shadow text-white text-sm transition"
          >
            📊 Statistik
          </button>
        ) : null}

        {location.pathname === "/stats" && (
          <button
            onClick={() => navigate("/kanban")}
            className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg shadow text-white text-sm transition"
          >
            ⬅️ Tillbaka
          </button>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow text-white text-sm transition"
        >
          Logga ut
        </button>
      </div>
    </header>
  );
};

export default Header;
