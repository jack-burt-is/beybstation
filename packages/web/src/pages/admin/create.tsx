import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { tournaments } from "../../api/tournaments";
import Header from "../../components/header";
import Button from "../../components/button";
import Input from "../../components/input";
import PlayerSlot from "../../components/player-slot";

const DEFAULT_PLAYERS = Array.from({ length: 16 }, (_, i) => `Player ${i + 1}`);

export default function AdminCreate() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<string[]>(DEFAULT_PLAYERS.slice());

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      tournaments.create(
        name.trim(),
        players.map((p, i) => p.trim() || `Player ${i + 1}`),
      ),
    onSuccess: ({ tournament }) => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
      navigate(`/admin/tournament/${tournament.id}`);
    },
  });

  function setPlayer(i: number, v: string) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? v : p)));
  }

  return (
    <div className="app">
      <Header kicker="Create new" onHome={() => navigate("/admin/home")} />
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">admin · setup</div>
            <h1 className="display">New Tournament</h1>
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" size="sm" onClick={() => navigate("/admin/home")}>
              Cancel
            </Button>
            <Button
              size="sm"
              icon={Save}
              onClick={() => mutate()}
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div style={{ maxWidth: 520, marginBottom: 32 }}>
          <Input
            label="Tournament name"
            placeholder="Enter name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="kicker" style={{ marginBottom: 10 }}>
          Edit player names · 16 spinners
        </div>
        <div className="player-grid">
          {players.map((p, i) => (
            <PlayerSlot key={i} idx={i} value={p} editable onChange={(v) => setPlayer(i, v)} />
          ))}
        </div>
      </main>
    </div>
  );
}
