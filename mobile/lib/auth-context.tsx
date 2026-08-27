import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState {
  session: Session | null;
  checking: boolean;
  isStaff: boolean;
  talentId: string | null;
  talentFirstName: string | null;
  refreshTalent: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [talentId, setTalentId] = useState<string | null>(null);
  const [talentFirstName, setTalentFirstName] = useState<string | null>(null);

  const isStaff = session?.user?.app_metadata?.role === "staff";

  const refreshTalent = useCallback(async () => {
    if (!session || isStaff) {
      setTalentId(null);
      setTalentFirstName(null);
      return;
    }
    let { data } = await supabase
      .from("talent")
      .select("id,first_name")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      await supabase.from("talent").update({ user_id: session.user.id }).is("user_id", null).eq("email", session.user.email);
      const retry = await supabase
        .from("talent")
        .select("id,first_name")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      data = retry.data;
    }

    const row = data?.[0];
    setTalentId(row?.id ?? null);
    setTalentFirstName(row?.first_name ?? null);
  }, [session, isStaff]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshTalent();
  }, [refreshTalent]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, checking, isStaff, talentId, talentFirstName, refreshTalent, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
