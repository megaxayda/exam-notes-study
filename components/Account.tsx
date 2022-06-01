import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useDebounce } from "use-debounce";

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);

  const [newNote, setNewNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [syncText] = useDebounce(text, 1000);

  useEffect(() => {
    if (newNote) setNotes([...notes, newNote]);
  }, [newNote]);

  useEffect(() => {
    getProfile();
  }, [session]);

  useEffect(() => {
    const noteListener = supabase
      .from("notes")
      .on("INSERT", (payload) => setNewNote(payload.new))
      // .on("DELETE", (payload) => handleDeletedChannel(payload.old))
      .subscribe();
    // Cleanup on unmount
    return () => {
      noteListener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    addNote(syncText);
  }, [syncText]);

  async function getProfile() {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const addNote = async (content: string) => {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      const title = content.split("\n")[0];

      await supabase
        .from("notes")
        .insert([{ name: title, content, created_by: user?.id }]);

      return;
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="website"
          value={website || ""}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>

      <div className="mt-10">
        <button className="border-2 border-indigo-600">Add new notes</button>
      </div>

      <div className="mt-10">
        <p className="text-2xl">List of notes</p>
        {notes.map((e, id) => (
          <div key={id}>{e.name}</div>
        ))}
      </div>

      <div className="mt-10">
        <p className="text-2xl">Input note</p>
        <textarea
          className="border-2 "
          value={text}
          rows={5}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
