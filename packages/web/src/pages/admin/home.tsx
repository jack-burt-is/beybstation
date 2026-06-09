import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, LogOut } from "lucide-react";
import { tournaments } from "../../api/tournaments";
import { clearToken } from "../../lib/auth";
import Header from "../../components/header";
import Button from "../../components/button";
import Badge from "../../components/badge";

export default function AdminHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => tournaments.list(),
  });

  const setActive = useMutation({
    mutationFn: (id: string) => tournaments.setActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tournaments"] }),
  });

  const activeId = data?.activeId ?? null;

  function signOut() {
    clearToken();
    navigate("/admin", { replace: true });
  }

  return (
    <div className="app">
      <Header
        kicker="Admin · tournaments"
        onHome={() => navigate("/")}
        right={
          <Button variant="ghost" size="sm" icon={LogOut} onClick={signOut}>
            Sign out
          </Button>
        }
      />
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">admin only</div>
            <h1 className="display">Beybstation Tournaments</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state"><div className="spin">◈</div></div>
        ) : (
          <div className="tourn-list">
            {data?.tournaments.map((t) => (
              <div
                key={t.id}
                className={["tourn-card", t.id === activeId && "is-active"].filter(Boolean).join(" ")}
                onClick={() => navigate(`/admin/tournament/${t.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="date">Tournament · {t.date.slice(5)}</div>
                  {t.id === activeId ? (
                    <Badge kind="win">Active</Badge>
                  ) : (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={(e) => { e.stopPropagation(); setActive.mutate(t.id); }}
                      disabled={setActive.isPending}
                    >
                      Set active
                    </button>
                  )}
                </div>
                <div className="name">{t.name}</div>
              </div>
            ))}
            <div className="tourn-card is-new" onClick={() => navigate("/admin/create")}>
              <Plus size={20} /> Create new
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
