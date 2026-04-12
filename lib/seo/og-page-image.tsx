import { ImageResponse } from "next/og";

interface OgPageImageOptions {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
}

export const ogPageSize = {
  width: 1200,
  height: 630,
};

export const ogPageContentType = "image/png";

export function createOgPageImage({
  eyebrow,
  title,
  description,
  accent = "#F97316",
}: OgPageImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 12% 18%, ${accent}33 0%, transparent 28%), radial-gradient(circle at 84% 82%, ${accent}22 0%, transparent 24%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "70px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 820,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 82,
                  height: 82,
                  borderRadius: 24,
                  background: accent,
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                RZ
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  border: `1px solid ${accent}55`,
                  padding: "10px 18px",
                  fontSize: 24,
                  color: "#FDBA74",
                }}
              >
                {eyebrow}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.3,
                  color: "#CBD5E1",
                  maxWidth: 900,
                }}
              >
                {description}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 22,
              color: "#E2E8F0",
            }}
          >
            <div
              style={{
                borderRadius: 999,
                padding: "12px 22px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              ATS-first
            </div>
            <div
              style={{
                borderRadius: 999,
                padding: "12px 22px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Free PDF export
            </div>
            <div
              style={{
                borderRadius: 999,
                padding: "12px 22px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              ResumeZeus
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogPageSize,
    }
  );
}
