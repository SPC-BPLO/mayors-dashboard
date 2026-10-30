import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };

export default function SocialPreview() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(120deg, #0a2b4c 0%, #071c36 58%, #03152c 100%)",
          color: "#f4f8fc",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 820,
            height: 820,
            left: -210,
            top: -120,
            borderRadius: 999,
            background: "rgba(75, 143, 194, .2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 150,
            left: -70,
            top: 70,
            background: "linear-gradient(100deg, rgba(183,231,255,.8), rgba(55,46,93,.72) 48%, rgba(155,197,221,.65))",
            transform: "rotate(-8deg)",
            opacity: .65,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 660,
            height: 150,
            right: -80,
            bottom: -25,
            background: "linear-gradient(90deg, rgba(23,51,78,.8), rgba(162,189,209,.62), rgba(56,47,77,.75))",
            transform: "rotate(-7deg)",
            opacity: .45,
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "44px 58px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 550,
              height: 542,
              display: "flex",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "2px solid rgba(213, 234, 249, .28)",
              borderRadius: 42,
              background: "linear-gradient(150deg, rgba(130,177,218,.94), rgba(49,68,103,.88) 48%, rgba(100,137,170,.76))",
              boxShadow: "0 30px 70px rgba(0, 10, 27, .38)",
            }}
          >
            <div
              style={{
                width: 445,
                height: 445,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "rgba(247,251,255,.94)",
                boxShadow: "0 0 0 13px rgba(0,91,54,.82), 0 0 0 27px rgba(5,35,68,.72), 0 23px 55px rgba(0,15,37,.38)",
              }}
            >
              <img
                src="https://mayors-dashboard.vercel.app/san-pablo-city-seal.png?v=1"
                width="430"
                height="430"
                alt="San Pablo City official seal"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 28,
                top: 28,
                display: "flex",
                flexDirection: "column",
                padding: "12px 16px",
                border: "1px solid rgba(224,238,250,.2)",
                borderRadius: 12,
                background: "rgba(5,26,53,.78)",
              }}
            >
              <span style={{ fontSize: 19, fontWeight: 800 }}>City Government of San Pablo</span>
              <span style={{ marginTop: 4, color: "#b8cde1", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>
                OFFICE OF THE CITY MAYOR
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                left: 28,
                bottom: 28,
                display: "flex",
                flexDirection: "column",
                padding: "13px 18px",
                borderRadius: 12,
                background: "rgba(5,26,53,.86)",
              }}
            >
              <span style={{ color: "#b8cde1", fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>
                EXECUTIVE REPORTING PORTAL
              </span>
              <span style={{ marginTop: 5, fontSize: 23, fontWeight: 800 }}>Mayor&apos;s Dashboard</span>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              height: 542,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 65,
            }}
          >
            <span style={{ color: "#6eb0df", fontSize: 16, fontWeight: 800, letterSpacing: 4 }}>
              SAN PABLO CITY
            </span>
            <span style={{ marginTop: 18, fontSize: 76, fontWeight: 500, lineHeight: .96, letterSpacing: -4 }}>
              Mayor&apos;s
            </span>
            <span style={{ fontSize: 76, fontWeight: 500, lineHeight: .96, letterSpacing: -4 }}>
              Dashboard
            </span>
            <span style={{ marginTop: 30, color: "#a6c2dd", fontSize: 26, lineHeight: 1.35 }}>
              City statistics and executive insights in one clear view.
            </span>
            <div style={{ width: 132, height: 6, marginTop: 34, borderRadius: 99, background: "#3e91cc" }} />
            <span style={{ marginTop: 27, color: "#7fa3c3", fontSize: 17 }}>
              mayors-dashboard.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
