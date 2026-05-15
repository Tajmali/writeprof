import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSignedUploadParams } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const folder = url.searchParams.get("folder") || "writeprof/uploads";
    const params = getSignedUploadParams(folder);

    return NextResponse.json({ success: true, data: params });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const { uploadFile } = await import("@/lib/cloudinary");
    const result = await uploadFile(dataUri, {
      folder: `writeprof/${payload.role.toLowerCase()}s`,
      resource_type: "auto",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
