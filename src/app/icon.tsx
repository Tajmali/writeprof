import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0f1b3d 0%, #0369a1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* W mark */}
        <svg width="22" height="18" viewBox="0 0 26 20" fill="none">
          <path
            d="M1 2 L7 17 L13 7 L19 17 L25 2"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Cyan dot top-right */}
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#38bdf8",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
