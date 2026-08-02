import { ImageResponse } from "next/og";
import { ToolNovaBranding } from "./og-renderer";

export const alt = "ToolNova - Every Tool. One Place.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<ToolNovaBranding />, size);
}
