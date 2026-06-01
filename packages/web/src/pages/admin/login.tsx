import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { login } from "../../api/auth";
import { setToken, isLoggedIn } from "../../lib/auth";
import Header from "../../components/header";
import Button from "../../components/button";
import Input from "../../components/input";
import { LogIn } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) {
    navigate("/admin/home", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) { setError("Password required."); return; }
    setLoading(true);
    setError("");
    try {
      const { token } = await login(password);
      setToken(token);
      navigate("/admin/home", { replace: true });
    } catch {
      setError("Wrong password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Header kicker="Admin · log in" onHome={() => navigate("/")} />
      <main className="login-stage">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Admin Only</h1>
          <div className="sub">Password up</div>
          <div style={{ marginBottom: 24 }}>
            <Input
              label="Password"
              type="password"
              placeholder="Enter password…"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <div className="login-error">{error}</div>}
          </div>
          <Button block icon={LogIn} disabled={loading} type="submit">
            {loading ? "Checking…" : "Login"}
          </Button>
        </form>
      </main>
    </div>
  );
}
