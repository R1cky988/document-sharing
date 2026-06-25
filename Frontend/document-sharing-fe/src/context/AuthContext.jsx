import { createContext, useState, useCallback, useEffect } from "react";
import { getCurrentUser, getMyAvatar  } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const avatarBlob = await getMyAvatar();

        const avatarObjectUrl = URL.createObjectURL(avatarBlob);

        setAvatarUrl(avatarObjectUrl);

        setAuthed(true);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setAuthed(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    const avatarBlob = await getMyAvatar();
    setAvatarUrl(URL.createObjectURL(avatarBlob));
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    setAuthed(false);
    setUser(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authed,
        user,
        avatarUrl,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}