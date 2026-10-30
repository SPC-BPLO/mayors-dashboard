import { ImageResponse } from "next/og";

export const alt = "Preview of the San Pablo City Mayor's Dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const departments = [
  { code: "BPLO", label: "Franchise", value: "6,214", detail: "Active records" },
  { code: "CTMO", label: "Traffic Violations", value: "3,482", detail: "Violations recorded" },
  { code: "CTO", label: "Finance-Cashier", value: "Live", detail: "Collection activity" },
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #d9f1ea 0%, #eef6f8 49%, #dceaf6 100%)",
          color: "#102d2b",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            left: -170,
            bottom: -240,
            borderRadius: 999,
            background: "rgba(36, 174, 137, .22)",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            right: -120,
            top: -210,
            borderRadius: 999,
            background: "rgba(80, 145, 196, .18)",
          }}
        />

        <div
          style={{
            margin: 52,
            padding: "38px 42px 36px",
            width: 1096,
            height: 526,
            display: "flex",
            flexDirection: "column",
            border: "2px solid rgba(255,255,255,.92)",
            borderRadius: 34,
            background: "rgba(255,255,255,.62)",
            boxShadow: "0 22px 65px rgba(33, 75, 70, .18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#187b68",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 4,
                }}
              >
                SAN PABLO CITY
              </span>
              <span style={{ marginTop: 9, fontSize: 45, fontWeight: 800, letterSpacing: -1.8 }}>
                Mayor&apos;s Dashboard
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 19px",
                borderRadius: 999,
                background: "#e3f6ef",
                color: "#14745f",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  marginRight: 10,
                  borderRadius: 99,
                  background: "#23a981",
                }}
              />
              LIVE EXECUTIVE VIEW
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, marginTop: 43 }}>
            {departments.map((department, index) => (
              <div
                key={department.code}
                style={{
                  width: 326,
                  minHeight: 245,
                  display: "flex",
                  flexDirection: "column",
                  padding: "27px 28px",
                  borderRadius: 24,
                  border: index === 0 ? "2px solid #5ab9a1" : "1px solid rgba(31, 80, 75, .13)",
                  background: index === 0 ? "rgba(225, 248, 240, .88)" : "rgba(255,255,255,.72)",
                  boxShadow: "0 12px 26px rgba(30, 72, 68, .08)",
                }}
              >
                <span style={{ color: "#137963", fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>
                  {department.code}
                </span>
                <span style={{ marginTop: 6, color: "#49625f", fontSize: 22, fontWeight: 700 }}>
                  {department.label}
                </span>
                <span style={{ marginTop: 31, color: "#102d2b", fontSize: 49, fontWeight: 800 }}>
                  {department.value}
                </span>
                <span style={{ marginTop: 7, color: "#657b78", fontSize: 17 }}>{department.detail}</span>
                <div
                  style={{
                    height: 7,
                    marginTop: 20,
                    borderRadius: 99,
                    background: index === 0 ? "#2a9b80" : index === 1 ? "#5b98c4" : "#e2a03f",
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 25,
              color: "#59716e",
              fontSize: 17,
            }}
          >
            <span>Key city statistics in one clear view</span>
            <span style={{ color: "#187b68", fontWeight: 700 }}>mayors-dashboard.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
