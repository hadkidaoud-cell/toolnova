export function ToolNovaBranding() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #312e81 0%, #6d28d9 40%, #a855f7 72%, #ec4899 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "0 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "#ffffff",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#7c3aed",
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -2,
          lineHeight: 1.05,
        }}
      >
        Tool
        <span style={{ color: "#fbbf24" }}>Nova</span>
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          marginTop: 20,
        }}
      >
        Every Tool. One Place.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 36,
          padding: "10px 24px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.14)",
          fontSize: 24,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        100+ free online tools &middot; No signup required
      </div>
    </div>
  );
}
