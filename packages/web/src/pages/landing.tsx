import { useNavigate } from "react-router";
import Header from "../components/header";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Header />
      <main className="app-main" style={{ padding: 0 }}>
        <div className="landing-hero">
          <img src="/logo.png" alt="Beybstation" />
          <p>Sheffield · Live tournament · admin</p>
        </div>
        <div className="landing-stage">
          <div className="landing-card" onClick={() => navigate("/results")}>
            <div className="ico">▣</div>
            <h2>Live Results</h2>
            <p>Watch the bracket update in real time.</p>
          </div>
          <div className="landing-card is-admin" onClick={() => navigate("/admin")}>
            <div className="ico">✦</div>
            <h2>Admin Only</h2>
            <p>Password up. Operators only.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
