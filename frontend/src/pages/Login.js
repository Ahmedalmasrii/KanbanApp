import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import RecipharmLogo from "../images/Recipharm_logotype.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // Dekoda JWT och extrahera id, role och companyName
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("user", JSON.stringify({
        id: decoded.id,
        role: decoded.role,
        companyName: decoded.companyName
      }));

      // Spara även companyName separat
      localStorage.setItem("companyName", decoded.companyName);

      if (res.data.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate("/kanban");
      }
    } catch (err) {
      const msg = err.response?.data?.msg;
      if (msg?.includes("låst")) {
        alert("Kontot är låst. Kontakta IT-avdelningen.");
      } else if (msg?.includes("inaktivt")) {
        alert("Kontot är inaktivt. Kontakta administratör.");
      } else {
        alert("Fel e-post eller lösenord.");
      }
    }
  };

  return (
    <section className="h-screen bg-neutral-200 flex items-center justify-center">
      <div className="container px-4 md:px-12 max-w-6xl">
        <div className="flex flex-wrap items-center justify-center bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="w-full lg:w-6/12 px-8 py-10">
            <div className="text-center mb-6">
              <img className="mx-auto w-48" src={RecipharmLogo} alt="Recipharm logotyp" />
              <p className="text-sm text-gray-600">
                Välkommen till Recipharms kanbansystem
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <p className="mb-4 text-sm text-gray-700">Logga in på ditt konto</p>

              <input
                type="email"
                placeholder="E-postadress"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <button
                type="submit"
                className="w-full mb-3 py-2 text-white font-medium text-sm uppercase rounded shadow transition duration-150"
                style={{
                  background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                }}
              >
                Logga in
              </button>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Har du inget konto?</p>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-danger border border-danger px-4 py-1 text-xs rounded uppercase hover:bg-neutral-200"
                >
                  Registrera
                </button>
              </div>
            </form>
          </div>

          <div
            className="hidden lg:flex lg:w-6/12 items-center justify-center text-white px-10 py-8"
            style={{
              background: "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
            }}
          >
            <div>
              <h4 className="text-2xl font-semibold mb-4">
                Vi är stolta över att vara en del av Recipharm
              </h4>
              <p className="text-sm leading-relaxed">
                På Recipharm är vi engagerade i att leverera högkvalitativa tjänster inom läkemedelsutveckling och tillverkning. Vårt team spelar en avgörande roll för patientsäkerhet och produktkvalitet över hela världen. Var med och forma framtiden för läkemedelsinnovation genom engagemang, noggrannhet och samarbete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
