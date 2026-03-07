import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ResumeZeus - ATS-ready resume builder";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const chipStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 44,
  padding: "0 24px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#F8FAFC",
  fontSize: 20,
  fontWeight: 700,
} as const;

const line = (width: number, color: string, height: number = 10) => ({
  width,
  height,
  borderRadius: 999,
  background: color,
});

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #111827 0%, #0f172a 55%, #1e293b 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 12%, rgba(249,115,22,0.16) 0, rgba(249,115,22,0.16) 16%, transparent 17%), radial-gradient(circle at 88% 88%, rgba(251,191,36,0.12) 0, rgba(251,191,36,0.12) 18%, transparent 19%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "72px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 650,
              paddingRight: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 104,
                    height: 104,
                    borderRadius: 28,
                    background:
                      "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                    color: "#fff",
                    fontSize: 38,
                    fontWeight: 800,
                  }}
                >
                  RZ
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 42,
                    padding: "0 22px",
                    borderRadius: 999,
                    border: "1px solid rgba(253,186,116,0.35)",
                    background: "rgba(255,247,237,0.1)",
                    color: "#FED7AA",
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  ResumeZeus
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  color: "#fff",
                  fontSize: 74,
                  lineHeight: 1.02,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                <span>Build an ATS-ready</span>
                <span>resume faster</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  color: "#CBD5E1",
                  fontSize: 30,
                  lineHeight: 1.35,
                  fontWeight: 500,
                }}
              >
                <span>Create polished resumes, export PDF for free,</span>
                <span>and use 30 AI credits at signup.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div style={chipStyle}>Free PDF Export</div>
              <div style={chipStyle}>ATS Friendly</div>
              <div style={chipStyle}>30 AI Credits</div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 14,
                top: 40,
                width: 350,
                height: 438,
                borderRadius: 28,
                background: "rgba(2,6,23,0.34)",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                width: 350,
                height: 438,
                padding: 28,
                borderRadius: 28,
                background: "#FFFDF9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: 22,
                  borderRadius: 22,
                  background: "#FFF7ED",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: "#FED7AA",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={line(126, "#0F172A", 14)} />
                  <div style={line(168, "#64748B")} />
                  <div style={line(112, "#94A3B8")} />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 20,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    flex: 1,
                    padding: 20,
                    borderRadius: 20,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                  }}
                >
                  <div style={line(94, "#0F172A", 12)} />
                  <div style={line(136, "#CBD5E1", 8)} />
                  <div style={line(122, "#CBD5E1", 8)} />
                  <div style={line(118, "#0F172A", 12)} />
                  <div style={line(124, "#CBD5E1", 8)} />
                  <div style={line(98, "#CBD5E1", 8)} />
                  <div style={line(84, "#0F172A", 12)} />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: 98,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      height: 116,
                      borderRadius: 20,
                      background: "#0F172A",
                    }}
                  >
                    <span
                      style={{
                        color: "#CBD5E1",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      ATS Score
                    </span>
                    <span
                      style={{
                        color: "#F59E0B",
                        fontSize: 38,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      92
                    </span>
                    <span
                      style={{
                        color: "#94A3B8",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Excellent
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      padding: 18,
                      borderRadius: 20,
                      border: "1px solid #FDBA74",
                      background: "#FFF7ED",
                    }}
                  >
                    <div style={line(52, "#F97316", 12)} />
                    <div style={line(42, "#FDBA74", 8)} />
                    <div style={line(56, "#FDBA74", 8)} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  width: "100%",
                  height: 18,
                  borderRadius: 999,
                  background: "#E2E8F0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "76%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
