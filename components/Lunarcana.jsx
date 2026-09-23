import { useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";

const TAROT_CARDS = [
  { id: 0, name: "El Loco", emoji: "🃏", keywords: "libertad, inicio, aventura" },
  { id: 1, name: "El Mago", emoji: "🔮", keywords: "voluntad, poder, manifestación" },
  { id: 2, name: "La Sacerdotisa", emoji: "🌙", keywords: "intuición, misterio, sabiduría" },
  { id: 3, name: "La Emperatriz", emoji: "🌺", keywords: "fertilidad, abundancia, naturaleza" },
  { id: 4, name: "El Emperador", emoji: "👑", keywords: "autoridad, estructura, liderazgo" },
  { id: 5, name: "El Hierofante", emoji: "⛪", keywords: "tradición, espiritualidad, guía" },
  { id: 6, name: "Los Amantes", emoji: "💞", keywords: "amor, elección, unión" },
  { id: 7, name: "El Carro", emoji: "⚡", keywords: "victoria, control, determinación" },
  { id: 8, name: "La Fuerza", emoji: "🦁", keywords: "coraje, paciencia, compasión" },
  { id: 9, name: "El Ermitaño", emoji: "🕯️", keywords: "introspección, soledad, búsqueda" },
  { id: 10, name: "La Rueda", emoji: "☸️", keywords: "destino, ciclos, cambio" },
  { id: 11, name: "La Justicia", emoji: "⚖️", keywords: "equilibrio, verdad, karma" },
  { id: 12, name: "El Colgado", emoji: "🔄", keywords: "pausa, sacrificio, perspectiva" },
  { id: 13, name: "La Muerte", emoji: "🌑", keywords: "transformación, fin, renacimiento" },
  { id: 14, name: "La Templanza", emoji: "🌊", keywords: "moderación, armonía, propósito" },
  { id: 15, name: "El Diablo", emoji: "🔥", keywords: "sombra, ataduras, materialismo" },
  { id: 16, name: "La Torre", emoji: "⛈️", keywords: "ruptura, revelación, caos" },
  { id: 17, name: "La Estrella", emoji: "✨", keywords: "esperanza, inspiración, renovación" },
  { id: 18, name: "La Luna", emoji: "🌕", keywords: "ilusión, subconsciente, miedo" },
  { id: 19, name: "El Sol", emoji: "☀️", keywords: "alegría, éxito, vitalidad" },
  { id: 20, name: "El Juicio", emoji: "🎺", keywords: "despertar, llamado, redención" },
  { id: 21, name: "El Mundo", emoji: "🌍", keywords: "completitud, logro, integración" },
];

const SPREADS = [
  { id: "one",   name: "1 Carta",   desc: "Guía del día",               count: 1, icon: "✦" },
  { id: "three", name: "3 Cartas",  desc: "Pasado · Presente · Futuro", count: 3, icon: "✦✦✦" },
  { id: "five",  name: "5 Cartas",  desc: "Cruz de revelación",         count: 5, icon: "✦✦✦✦✦" },
];

/* ── Floating particles (stars + gold dust) ── */
function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.4,
    twinkleDur: (Math.random() * 3 + 2).toFixed(1),
    twinkleDelay: (Math.random() * 6).toFixed(1),
    driftDur: (Math.random() * 22 + 14).toFixed(1),
    driftDelay: (Math.random() * 10).toFixed(1),
    driftX: (Math.random() * 34 - 17).toFixed(0),
    driftY: (Math.random() * 34 - 17).toFixed(0),
    opacity: (Math.random() * 0.5 + 0.15).toFixed(2),
    gold: Math.random() > 0.8,
  })), []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.gold ? "rgba(255,215,110,0.95)" : "white",
          opacity: p.opacity,
          animation: `twinkle ${p.twinkleDur}s ${p.twinkleDelay}s ease-in-out infinite alternate,
                      drift ${p.driftDur}s ${p.driftDelay}s ease-in-out infinite alternate`,
          "--dx": `${p.driftX}px`,
          "--dy": `${p.driftY}px`,
        }} />
      ))}
    </div>
  );
}

/* ── Crescent moon SVG ── */
function MoonIcon({ size = 54 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none"
      style={{ filter: "drop-shadow(0 0 18px rgba(190,110,255,0.85)) drop-shadow(0 0 42px rgba(140,50,255,0.45))" }}>
      <path d="M39 27C39 35.284 32.284 42 24 42C15.716 42 9 35.284 9 27C9 18.716 15.716 12 24 12C15.716 12 9 18.716 9 27Z"
        fill="url(#mg)" />
      <circle cx="43" cy="15" r="1.6" fill="rgba(255,220,90,0.9)" />
      <circle cx="37" cy="8"  r="1.1" fill="rgba(255,220,90,0.7)" />
      <circle cx="47" cy="24" r="1.0" fill="rgba(255,255,255,0.75)" />
      <circle cx="41" cy="36" r="1.3" fill="rgba(255,220,90,0.6)" />
      <defs>
        <linearGradient id="mg" x1="9" y1="12" x2="39" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f0ddff" />
          <stop offset="45%"  stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Single tarot card ── */
function TarotCard({ card, revealed, index = 0, position = "" }) {
  return (
    <div style={{ perspective: 1000, width: 110, height: 182, flexShrink: 0 }}>
      <div style={{
        width: "100%", height: "100%", position: "relative",
        transformStyle: "preserve-3d",
        transition: `transform 0.85s cubic-bezier(0.4,0,0.2,1) ${index * 0.22}s`,
        transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 14,
          background: "linear-gradient(148deg, #110226 0%, #260550 52%, #0d0118 100%)",
          border: "1.5px solid rgba(170,110,255,0.32)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 28px rgba(90,10,170,0.5), inset 0 0 22px rgba(130,50,240,0.08)",
        }}>
          <div style={{ fontSize: 22, color: "rgba(190,140,255,0.35)" }}>🌙</div>
          <div style={{ position: "absolute", inset: 9, border: "1px solid rgba(160,100,255,0.16)", borderRadius: 8 }} />
          <div style={{ position: "absolute", inset: 15, border: "1px solid rgba(160,100,255,0.07)", borderRadius: 6 }} />
        </div>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)", borderRadius: 14,
          background: "linear-gradient(168deg, #080016 0%, #180034 58%, #07000f 100%)",
          border: "1.5px solid rgba(200,145,255,0.48)",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 5, padding: "10px 8px",
          boxShadow: "0 0 32px rgba(150,70,255,0.5), 0 8px 30px rgba(70,0,150,0.45), inset 0 0 28px rgba(90,0,190,0.14)",
        }}>
          {position && (
            <div style={{
              fontSize: 7.5, color: "rgba(210,165,255,0.52)",
              letterSpacing: 2.5, textTransform: "uppercase", fontFamily: "'Cinzel', serif",
            }}>{position}</div>
          )}
          <div style={{ fontSize: 37 }}>{card.emoji}</div>
          <div style={{
            fontSize: 10, color: "#eeddff", textAlign: "center",
            fontFamily: "'Cinzel', serif", fontWeight: 600, lineHeight: 1.3, letterSpacing: 0.5,
          }}>{card.name}</div>
          <div style={{
            fontSize: 8, color: "rgba(195,150,255,0.48)", textAlign: "center",
            fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.4,
          }}>{card.keywords}</div>
          <div style={{ position: "absolute", inset: 6, border: "1px solid rgba(200,145,255,0.11)", borderRadius: 10, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main app ── */
export default function Lunarcana() {
  const [screen, setScreen] = useState("home");
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState("");
  const [btnActive, setBtnActive] = useState(false);
  const resultRef = useRef(null);
  const POSITIONS_3 = ["Pasado", "Presente", "Futuro"];
  const POSITIONS_5 = ["Base", "Desafío", "Pasado", "Futuro", "Resultado"];
  function getPositions(count) {
    if (count === 1) return ["Ahora"];
    if (count === 3) return POSITIONS_3;
    if (count === 5) return POSITIONS_5;
    return [];
  }
  function drawCards(count) {
    return [...TAROT_CARDS].sort(() => Math.random() - 0.5).slice(0, count);
  }

  async function startReading() {
    setBtnActive(true);
    setTimeout(() => setBtnActive(false), 260);
    setShuffling(true);
    setError("");
    await new Promise(r => setTimeout(r, 1400));
    const cards = drawCards(selectedSpread.count);
    setDrawnCards(cards);
    setRevealedCards([]);
    setShuffling(false);
    setScreen("reading");
    for (let i = 0; i < cards.length; i++) {
      await new Promise(r => setTimeout(r, 500 + i * 260));
      setRevealedCards(prev => [...prev, i]);
    }
    await new Promise(r => setTimeout(r, 400));
    await getInterpretation(cards);
  }

  async function getInterpretation(cards) {
    setLoading(true);
    setInterpretation("");
    const positions = getPositions(cards.length);
    const cardList = cards.map((c, i) => `${positions[i]}: ${c.name} (${c.keywords})`).join(", ");
    const prompt = `Eres una tarotista mística y sabia llamada Lunarcana. El consultante pregunta: "${question || "¿Qué me depara el destino?"}". Las cartas reveladas son: ${cardList}. 

Da una lectura de tarot en español, mística y poética pero práctica. Máximo 180 palabras. Habla directamente al consultante (usa "tú"). Menciona cada carta por su nombre y posición. Termina con un consejo o mensaje de cierre inspirador.`;

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setInterpretation(data.text || "Las cartas guardan silencio hoy...");
    } catch {
      setError("Las estrellas no pudieron conectarse. Intenta de nuevo.");
    }
    setLoading(false);
    setScreen("result");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
  }

  function reset() {
    setScreen("home"); setSelectedSpread(null); setQuestion("");
    setDrawnCards([]); setRevealedCards([]); setInterpretation(""); setError("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% -8%, #1e0048 0%, #09001e 44%, #030008 100%)",
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: "#eeddff",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&display=swap');
        @keyframes twinkle  { from{opacity:.06} to{opacity:.88} }
        @keyframes drift    { from{transform:translate(0,0)} to{transform:translate(var(--dx),var(--dy))} }
        @keyframes float    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes moonGlow { 0%,100%{filter:drop-shadow(0 0 16px rgba(190,110,255,.65))} 50%{filter:drop-shadow(0 0 38px rgba(200,130,255,1)) drop-shadow(0 0 70px rgba(130,40,255,.55))} }
        @keyframes titleGlow{ 0%,100%{text-shadow:0 0 22px rgba(200,140,255,.4),0 0 44px rgba(150,70,255,.2)} 50%{text-shadow:0 0 32px rgba(220,165,255,.85),0 0 64px rgba(170,90,255,.55),0 0 100px rgba(120,30,255,.3)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shuffle  { 0%,100%{transform:rotate(0) scale(1)} 30%{transform:rotate(-11deg) scale(.91) translateX(-8px)} 70%{transform:rotate(11deg) scale(.91) translateX(8px)} }
        @keyframes orb1     { 0%,100%{transform:scale(1) translate(0,0);opacity:.22} 50%{transform:scale(1.3) translate(14px,-18px);opacity:.38} }
        @keyframes orb2     { 0%,100%{transform:scale(1) translate(0,0);opacity:.18} 50%{transform:scale(1.15) translate(-12px,14px);opacity:.32} }
        @keyframes pulse    { 0%{box-shadow:0 0 0 0 rgba(150,70,255,.65)} 70%{box-shadow:0 0 0 16px rgba(150,70,255,0)} 100%{box-shadow:0 0 0 0 rgba(150,70,255,0)} }
        @keyframes gold     { 0%,100%{opacity:.55} 50%{opacity:.95} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#030008}
        ::-webkit-scrollbar-thumb{background:rgba(130,50,210,.4);border-radius:2px}
        textarea{resize:none;outline:none}
        textarea::placeholder{color:rgba(175,125,255,.32)}
      `}</style>

      <FloatingParticles />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "4%", left: "6%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(85,0,175,.17) 0%, transparent 70%)", animation: "orb1 11s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "14%", right: "2%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(38,0,115,.22) 0%, transparent 70%)", animation: "orb2 14s 4s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "48%", left: "50%", transform: "translate(-50%,-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(55,0,130,.07) 0%, transparent 65%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 540, margin: "0 auto", padding: "0 20px 80px" }}>

        {screen === "home" && (
          <div style={{ animation: "fadeUp .9s ease both" }}>

            <div style={{ textAlign: "center", paddingTop: 58, paddingBottom: 36 }}>
              <div style={{ marginBottom: 18, display: "inline-block", animation: "float 5s ease-in-out infinite, moonGlow 3.2s ease-in-out infinite" }}>
                <MoonIcon size={56} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 7 }}>
                <span style={{ fontSize: 20, color: "rgba(255,215,90,.72)", animation: "gold 2.6s ease-in-out infinite" }}>☽</span>
                <h1 style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "clamp(23px, 7vw, 34px)",
                  fontWeight: 700, margin: 0, letterSpacing: 3,
                  background: "linear-gradient(135deg, #f2e0ff 0%, #ffffff 38%, #c084fc 68%, #9333ea 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  animation: "titleGlow 3.6s ease-in-out infinite",
                }}>LUNARCANA</h1>
                <span style={{ fontSize: 20, color: "rgba(255,215,90,.72)", animation: "gold 2.6s 1.3s ease-in-out infinite" }}>☾</span>
              </div>

              <p style={{ color: "rgba(205,160,255,.5)", fontSize: 10.5, letterSpacing: 5.5, textTransform: "uppercase", fontFamily: "'Cinzel', serif", margin: 0 }}>
                El Universo te responde
              </p>

              <div style={{ margin: "18px auto 0", width: 72, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,208,70,.5), transparent)" }} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{
                display: "block", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase",
                color: "rgba(195,150,255,.5)", fontFamily: "'Cinzel', serif", marginBottom: 10, textAlign: "center",
              }}>
                ¿Qué te susurra el Universo?
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Escribe tu pregunta..."
                rows={2}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,.022)",
                  border: "1px solid rgba(155,85,250,.27)",
                  borderRadius: 12, color: "#eeddff", fontSize: 14,
                  padding: "14px 16px", fontFamily: "Georgia, serif", lineHeight: 1.65,
                  transition: "border-color .3s, box-shadow .3s",
                  boxShadow: "inset 0 1px 8px rgba(90,0,170,.1)",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(185,115,255,.65)"; e.target.style.boxShadow = "inset 0 1px 8px rgba(90,0,170,.15), 0 0 18px rgba(150,70,255,.22)"; }}
                onBlur={e  => { e.target.style.borderColor = "rgba(155,85,250,.27)";  e.target.style.boxShadow = "inset 0 1px 8px rgba(90,0,170,.1)"; }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", color: "rgba(195,150,255,.45)", fontFamily: "'Cinzel', serif", marginBottom: 14, textAlign: "center" }}>
                Habla con el destino
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {SPREADS.map(s => {
                  const on = selectedSpread?.id === s.id;
                  return (                   
                    <button key={s.id} onClick={() => setSelectedSpread(s)} style={{
                      flex: 1, padding: "18px 8px 16px", borderRadius: 14,
                      border: on ? "1.5px solid rgba(198,135,255,.78)" : "1.5px solid rgba(155,85,250,.17)",
                      background: on ? "linear-gradient(148deg, rgba(105,25,195,.3), rgba(65,0,145,.2))" : "rgba(255,255,255,.016)",
                      color: on ? "#eeddff" : "rgba(185,140,255,.52)",
                      cursor: "pointer", transition: "all .3s", textAlign: "center",
                      boxShadow: on ? "0 0 22px rgba(155,70,255,.28), inset 0 0 18px rgba(110,30,210,.1)" : "none",
                    }}>
                      <div style={{ fontSize: 12, marginBottom: 7, letterSpacing: 2.5, color: on ? "rgba(255,208,70,.88)" : "rgba(195,145,255,.38)", transition: "color .3s" }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 5 }}>{s.name}</div>
                      <div style={{ fontSize: 9.5, opacity: .62, fontStyle: "italic", lineHeight: 1.4 }}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={startReading}
              disabled={!selectedSpread}
              style={{
                width: "100%", padding: "19px", borderRadius: 14,
                border: selectedSpread ? "1px solid rgba(205,145,255,.32)" : "none",
                background: selectedSpread
                  ? "linear-gradient(135deg, #6418bf 0%, #38008e 50%, #6418bf 100%)"
                  : "rgba(255,255,255,.04)",
                color: selectedSpread ? "#f0e0ff" : "rgba(255,255,255,.2)",
                fontSize: 12.5, fontFamily: "'Cinzel', serif", letterSpacing: 4, textTransform: "uppercase",
                cursor: selectedSpread ? "pointer" : "not-allowed",
                transition: "all .25s",
                boxShadow: selectedSpread ? "0 0 30px rgba(110,35,215,.6), 0 4px 22px rgba(70,0,170,.45)" : "none",
                transform: btnActive ? "scale(.97)" : "scale(1)",
                animation: selectedSpread ? "pulse 2.4s ease-out infinite" : "none",
              }}
            >
              ☽ &nbsp; Consultar el Destino &nbsp; ☾
            </button>

            <div style={{ textAlign: "center", marginTop: 26 }}>
              <span style={{ fontSize: 8.5, letterSpacing: 4, color: "rgba(175,125,255,.22)", textTransform: "uppercase", fontFamily: "'Cinzel', serif" }}>
                ✦ &nbsp; Mazo Mayor · 22 Arcanos &nbsp; ✦
              </span>
            </div>
          </div>
        )}

        {shuffling && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", animation: "fadeUp .45s ease both" }}>
            <div style={{ fontSize: 62, animation: "shuffle .55s ease-in-out infinite", marginBottom: 28 }}>🌙</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: 5, color: "rgba(195,150,255,.6)", textTransform: "uppercase" }}>
              El universo respira...
            </div>
          </div>
        )}

        {(screen === "reading" || screen === "result") && !shuffling && (
          <div style={{ animation: "fadeUp .7s ease both", paddingTop: 44 }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,208,70,.48)" }}>☽</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: 4, color: "rgba(195,150,255,.42)", textTransform: "uppercase" }}>
                  {selectedSpread?.desc}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,208,70,.48)" }}>☾</span>
              </div>
              {question && (
                <div style={{ fontSize: 13, color: "rgba(218,182,255,.62)", fontStyle: "italic", maxWidth: 300, margin: "0 auto", lineHeight: 1.65 }}>
                  "{question}"
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14, marginBottom: 36 }}>
              {drawnCards.map((card, i) => (
                <TarotCard key={card.id} card={card} revealed={revealedCards.includes(i)} index={i} position={getPositions(drawnCards.length)[i]} />
              ))}
            </div>

            <div ref={resultRef}>
              {loading && (
                <div style={{ textAlign: "center", padding: 28 }}>
                  <div style={{ fontSize: 26, animation: "float 1.6s ease-in-out infinite", marginBottom: 14 }}>✨</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4.5, color: "rgba(195,150,255,.52)", textTransform: "uppercase" }}>
                    Lunarcana lee las cartas...
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(200,50,50,.08)", border: "1px solid rgba(200,50,50,.25)", borderRadius: 12, padding: 16, textAlign: "center", color: "rgba(255,150,150,.75)", fontSize: 13, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              {interpretation && (
                <div style={{
                  background: "linear-gradient(168deg, rgba(65,12,125,.14), rgba(32,0,65,.2))",
                  border: "1px solid rgba(165,95,255,.2)", borderRadius: 16,
                  padding: "26px 22px", marginBottom: 22,
                  animation: "fadeUp .7s ease both",
                  boxShadow: "0 4px 32px rgba(90,15,195,.14)",
                }}>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 16, marginRight: 6 }}>🌙</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: 3.5, color: "rgba(195,150,255,.52)", textTransform: "uppercase" }}>Tu Lectura</span>
                    <span style={{ fontSize: 16, marginLeft: 6 }}>✨</span>
                  </div>
                  <div style={{ width: 48, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,208,70,.42), transparent)", margin: "0 auto 18px" }} />
                            <div style={{ fontSize: 14, lineHeight: 1.9, color: "rgba(230,206,255,.87)", fontStyle: "italic" }}>
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p style={{ margin: "0 0 12px 0" }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: "#ffd76a", fontWeight: 700, fontStyle: "normal" }} {...props} />,
              }}
            >
              {interpretation}
            </ReactMarkdown>
          </div>
                    
        
                </div>
              )}

              {screen === "result" && (
                <button
                  onClick={reset}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 12,
                    border: "1.5px solid rgba(155,85,250,.26)",
                    background: "rgba(255,255,255,.018)",
                    color: "rgba(190,145,255,.72)", fontSize: 11.5,
                    fontFamily: "'Cinzel', serif", letterSpacing: 4, textTransform: "uppercase",
                    cursor: "pointer", transition: "all .3s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "rgba(195,125,255,.65)"; e.target.style.color = "#eeddff"; e.target.style.boxShadow = "0 0 18px rgba(150,70,255,.22)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "rgba(155,85,250,.26)"; e.target.style.color = "rgba(190,145,255,.72)"; e.target.style.boxShadow = "none"; }}
                >
                  ✦ &nbsp; Nueva Consulta
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
