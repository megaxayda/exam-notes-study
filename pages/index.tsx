import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Auth from "../components/Auth";
import Account from "../components/Account";
import { Session } from "inspector";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    //@ts-ignore
    setSession(supabase.auth.session());

    supabase.auth.onAuthStateChange((_event, session) => {
      //@ts-ignore
      setSession(session);
    });
  }, []);

  return (
    <div className="container" style={{ padding: "50px 0 100px 0" }}>
      <h1 className="text-3xl font-bold underline">
        Hello world! abc ascnklascnlakns
      </h1>
      {!session ? (
        <Auth />
      ) : (
        //@ts-ignore
        <Account key={session.user.id} session={session} />
      )}
    </div>
  );
}
