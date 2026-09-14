import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090D",
          borderRadius: "8px",
          border: "1.5px solid #FF7582",
          fontSize: "20px",
        }}
      >
        🐙
      </div>
    ),
    {
      ...size,
    }
  );
}
