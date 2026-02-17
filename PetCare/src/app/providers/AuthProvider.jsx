import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../../services/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isBooting, setIsBooting] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null);
            setIsBooting(false);
        });

        return unsub;
    }, []);

    const value = useMemo(
        () => ({
            user,
            isBooting,
            login: async (email, password) => {
                if (!email || !password) {
                    throw new Error("Email and password are required");
                }
                const res = await signInWithEmailAndPassword(auth, email, password);
                return res.user;
            },

            register: async (email, password) => {
                if (!email || !password) {
                    throw new Error("Email and password are required");
                }
                const res = await createUserWithEmailAndPassword(auth, email, password);
                return res.user;
            },
            logout: async () => {
                await signOut(auth);
            },
        }),
        [user, isBooting]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
