import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

const GUEST_USER = {
  id: "guest",
  name: "Guest Explorer",
  email: "guest@vermex.ai",
  role: "user",
  isGuest: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("vermex_guest") === "true") {
      return GUEST_USER;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.isGuest) {
      setLoading(false);
      return;
    }
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("vermex_guest") === "true") {
          setUser(GUEST_USER);
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    loginAsGuest() {
      if (typeof sessionStorage !== "undefined") sessionStorage.setItem("vermex_guest", "true");
      setUser(GUEST_USER);
    },
    async login(input) {
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("vermex_guest");
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(input) });
      setUser(data.user);
    },
    async register(input) {
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("vermex_guest");
      const data = await api("/auth/register", { method: "POST", body: JSON.stringify(input) });
      setUser(data.user);
    },
    async logout() {
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("vermex_guest");
      if (!user?.isGuest) {
        try { await api("/auth/logout", { method: "POST" }); } catch {}
      }
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
