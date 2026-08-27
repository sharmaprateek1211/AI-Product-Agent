"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  website_url: string;
  description: string;
  target_customer: string;
  analysis: any;
  blueprint: any;
  created_at: string;
};

export default function DashboardClient({
  userEmail,
  initialProjects,
}: {
  userEmail: string;
  initialProjects: Project[];
}) {
  const supabase = createClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function formatAsScript(data: any) {
    if (!data) return "";

    const asLines = (v: any): string => {
      if (v == null) return "";
      if (Array.isArray(v)) return v.map((it) => (typeof it === "string" ? `- ${it}` : `- ${JSON.stringify(it)}`)).join("\n");
      if (typeof v === "object") return Object.entries(v)
        .map(([k, val]) => `${k}: ${typeof val === 'object' ? '\n' + asLines(val) : String(val)}`)
        .join("\n");
      return String(v);
    };

    const lines: string[] = [];
    if (data.productName) lines.push(`# ${data.productName}`);
    if (data.description) lines.push(String(data.description));
    if (data.targetUsers) lines.push(`Target users: ${asLines(data.targetUsers)}`);
    if (data.problem) lines.push(`Problem to solve: ${String(data.problem)}`);
    if (data.keyFeatures) lines.push(`Key features:\n${asLines(data.keyFeatures)}`);
    if (data.mvpFeatures) lines.push(`MVP features:\n${asLines(data.mvpFeatures)}`);
    if (data.navigation) lines.push(`Navigation:\n${asLines(data.navigation)}`);
    if (data.pages) lines.push(`Pages:\n${asLines(data.pages)}`);
    if (data.uiDirection) lines.push(`UI direction: ${String(data.uiDirection)}`);
    if (data.businessModel) lines.push(`Business model: ${String(data.businessModel)}`);
    if (data.improvements) lines.push(`Suggested improvements:\n${asLines(data.improvements)}`);

    // Fallback to raw JSON if nothing matched
    if (lines.length === 0) return JSON.stringify(data, null, 2);

    return lines.join("\n\n");
  }

  async function run(mode: "analyze" | "build" | "modify") {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode,
        url,
        description: desc,
        targetCustomer: target,
        current: result,
        instruction,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMsg(data.error || "AI request failed");
      return;
    }

    setResult(data.result);
  }

  async function save() {
    if (!result) {
      setMsg("Analyze/build something first.");
      return;
    }

    if (!supabase) {
      setMsg("Supabase is not configured.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;

    if (!userId) {
      setMsg("You must be signed in to save projects.");
      return;
    }

    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      name: result.productName || "Untitled Product",
      website_url: url,
      description: desc,
      target_customer: target,
      analysis: result,
      blueprint: result,
    });

    setMsg(error ? error.message : "Project saved.");
  }

  async function logout() {
    if (!supabase) {
      setMsg("Supabase is not configured.");
      return;
    }

    await supabase.auth.signOut();
    location.href = "/login";
  }

  return (
    <main className="container dashboard">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1>Product Builder</h1>
          <p className="muted">{userEmail}</p>
        </div>

        <button className="btn secondary" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="card">
        <input
          className="input"
          placeholder="Website URL e.g. https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={!supabase}
        />

        <textarea
          className="textarea"
          placeholder="What do you want to build?"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          disabled={!supabase}
        />

        <input
          className="input"
          placeholder="Target customer"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={!supabase}
        />

        <div className="row">
          <button
            className="btn"
            disabled={loading || !supabase}
            onClick={() => run("analyze")}
          >
            {loading ? "Working..." : "Analyze Website"}
          </button>

          <button
            className="btn secondary"
            disabled={loading || !supabase}
            onClick={() => run("build")}
          >
            Build My Product
          </button>

          <button
            className="btn secondary"
            onClick={save}
            disabled={!supabase}
          >
            Save
          </button>
        </div>
      </div>

      {result && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2>{result.productName || "Product Concept"}</h2>

          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
            <strong>View:</strong>
            <button className={`btn ${!showScript?"":"secondary"}`} onClick={()=>setShowScript(false)}>JSON</button>
            <button className={`btn ${showScript?"":"secondary"}`} onClick={()=>setShowScript(true)}>Script</button>
          </div>

          <div className="result">
            {!showScript ? (
              <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <pre style={{whiteSpace:"pre-wrap"}}>{formatAsScript(result)}</pre>
            )}
          </div>

          <h3>Modify with AI</h3>

          <textarea
            className="textarea"
            placeholder="Make the design more premium. Add a dashboard..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={!supabase}
          />

          <button
            className="btn"
            onClick={() => run("modify")}
            disabled={!supabase}
          >
            Apply Change
          </button>
        </div>
      )}

      {msg && <p className="small">{msg}</p>}

      <h2 style={{ marginTop: 45 }}>Saved projects</h2>

      <div className="grid">
        {initialProjects.map((p) => (
          <div
            className="card clickable"
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedProject(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSelectedProject(p);
              }
            }}
          >
            <h3>{p.name}</h3>

            <p className="muted small">{p.website_url}</p>

            <p className="muted">{p.description}</p>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 800,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>{selectedProject.name}</h2>

              <div>
                {selectedProject.website_url && (
                  <a
                    className="btn secondary"
                    href={selectedProject.website_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Site
                  </a>
                )}

                <button
                  className="btn"
                  style={{ marginLeft: 8 }}
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <p className="muted">{selectedProject.description}</p>

            <h3>Analysis</h3>

                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <strong>View:</strong>
                    <button className="btn" onClick={()=>{ /* keep JSON view default for modal */ }}>JSON</button>
                    <button className="btn secondary" onClick={()=>{ /* placeholder - modal stays JSON */ }}>Script</button>
                  </div>

                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      maxHeight: 300,
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(selectedProject.analysis, null, 2)}
                  </pre>
          </div>
        </div>
      )}
    </main>
  );
}