export default function Precios() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -8%, #1e0048 0%, #09001e 44%, #030008 100%)", fontFamily: "Georgia, serif", color: "#eeddff", padding: "60px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontFamily: "'Cinzel Decorative', serif", marginBottom: 40 }}>Precios</h1>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>

          <div style={{ flex: 1, minWidth: 240, border: "1.5px solid rgba(155,85,250,.27)", borderRadius: 14, padding: 24, background: "rgba(255,255,255,.02)" }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18 }}>Gratis</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "12px 0" }}>$0</p>
            <p style={{ opacity: 0.75, lineHeight: 1.6 }}>Lecturas de tarot limitadas por día, con interpretación generada por IA.</p>
          </div>

          <div style={{ flex: 1, minWidth: 240, border: "1.5px solid rgba(198,135,255,.6)", borderRadius: 14, padding: 24, background: "linear-gradient(148deg, rgba(105,25,195,.25), rgba(65,0,145,.15))" }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18 }}>Premium</h2>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "12px 0" }}>$4.99 <span style={{ fontSize: 14, opacity: 0.7 }}>/ mes</span></p>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Lecturas ilimitadas de tarot con interpretación de IA, tiradas de 1, 3 y 5 cartas. Cancela cuando quieras.</p>
          </div>

        </div>

        <p style={{ textAlign: "center", marginTop: 40, fontSize: 12, opacity: 0.5 }}>
          Precios en USD. Suscripción mensual recurrente, cancelable en cualquier momento.
        </p>
      </div>
    </div>
  );
}
