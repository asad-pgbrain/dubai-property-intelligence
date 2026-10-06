import { ImageResponse } from "next/og";

export const alt = "Dubai Property Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
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
          backgroundColor: "#fafafa",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              background: "#2563eb",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            DPI
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: "#18181b",
            }}
          >
            Dubai Property Intelligence
          </div>
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#18181b",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "30px",
          }}
        >
          Dubai Property Data,
          <br />
          <span style={{ color: "#2563eb" }}>Without the Guesswork</span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#71717a",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          161,000+ transactions from the Dubai Land Department
        </div>
      </div>
    ),
    { ...size }
  );
}
