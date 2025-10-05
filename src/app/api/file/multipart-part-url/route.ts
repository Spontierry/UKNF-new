import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMultipartUploadPartUrl } from "@/actions/file";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await getMultipartUploadPartUrl(body);

    if (result?.serverError) {
      return NextResponse.json(
        { error: result.serverError.errorMessage || "Server error occurred" },
        { status: 500 }
      );
    }

    if (result?.validationErrors) {
      return NextResponse.json(
        { error: "Validation failed", details: result.validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error getting multipart upload part URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
