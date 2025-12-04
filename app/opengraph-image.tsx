import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ResumeForge - AI-Powered Resume Builder";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 60px",
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              borderRadius: 20,
              background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
              marginBottom: 40,
              boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.4)",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            ResumeForge
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            AI-Powered Resume Builder
          </div>

          {/* Features badges */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 40,
            }}
          >
            {["ATS-Friendly", "AI Optimized", "Free to Start"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 100,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ color: "#e2e8f0", fontSize: 18 }}>
                    {feature}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            color: "#64748b",
            fontSize: 20,
          }}
        >
          resumeforge.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}







