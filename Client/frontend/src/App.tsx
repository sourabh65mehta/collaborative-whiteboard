import { useEffect, useState, type FormEvent } from "react";
import {
  clearToken,
  getToken,
  login,
  me,
  register,
  setToken,
  type AuthUser,
} from "./api";
import "./App.css";

type Mode = "login" | "register";

function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }

    me()
      .then((data) => {
        setUser({
          id: data.user.sub,
          email: data.user.email,
          username: data.user.username,
        });
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "register"
          ? await register(email, username, password)
          : await login(email, password);

      setToken(result.token);
      setUser(result.user);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  if (checkingSession) {
    return (
      <main className="auth-shell">
        <p>Checking session…</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Whiteboard</p>
          <h1>Signed in</h1>
          <p className="lede">JWT auth is working. Your password is stored as a unique salt plus scrypt hash.</p>
          <dl>
            <div>
              <dt>Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Collaborative whiteboard</p>
        <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
        <p className="lede">
          Accounts use a JWT access token. Passwords are salted and hashed before they reach the database.
        </p>

        <div className="tabs" role="tablist">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Log in
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {mode === "register" ? (
            <label>
              Username
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                required
              />
            </label>
          ) : null}

          <label>
            Password
            <input
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={mode === "register" ? 8 : 1}
              required
            />
          </label>

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
