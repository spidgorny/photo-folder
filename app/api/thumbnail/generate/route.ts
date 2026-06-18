import { getS3Storage } from "@lib/S3Storage";
import { NextResponse } from "next/server";

/**
 * API endpoint to trigger the manual regeneration (on-demand) of a thumbnail for a given file key.
 * This function calls an external Lambda/Cloud Function via presigned URL to perform the heavy lifting.
 * @param request - NextRequest object containing the key in params or body.
 * @returns A Promise resolving with success status and message, or failing if the resource is inaccessible.
 */
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("key");

    if (!fileKey) {
        return NextResponse.json({ success: false, message: "Missing 'key' parameter." }, { status: 400 });
    }

    console.log(`--- Thumbnail Generation Triggered for Key: ${fileKey} ---`);

    try {
        const s3 = getS3Storage();
        // The generation Lambda/handler needs the source file details, but for simplicity now, 
        // we'll assume the handler only needs to know which key is missing its thumbnail.
        
        // === STEP 1: Obtain a signed URL to call the external lambda endpoint/API ===
        // This process usually involves calling another internal API that wraps the Cloud Function invocation.
        const serviceUrl = "/api/sync/presign"; // Reusing presigned endpoint for simplicity, or use a dedicated one
        
        // In a real scenario, this would call an endpoint like: /api/thumbnail/trigger?key={fileKey}
        // For now, we simulate generating a temporary token to execute the Lambda directly.
        // Generate a presigned URL for invoking the thumbnail generation lambda
        const presignedUrl = await s3.getPresignUrl(`/thumbnails/trigger`, 'application/json');
        // Call the generation endpoint using the presigned URL and pass the file key
        const response = await fetch(`${presignedUrl}?fileKey=${encodeURIComponent(fileKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trigger_generation: true })
        });


        if (!response.ok) {
            // Handle non-2xx response from the external generation service
             return NextResponse.json({ success: false, message: `Backend API call failed with status ${response.status}: ${await response.text()}` }, { status: 500 });
        }

        const result = await response.json();

        if (result.status === 'success' && result.message.includes('Job queued')) {
            return NextResponse.json({ success: true, message: `Generation process started successfully for ${fileKey}. Please wait a moment and refresh.` }, { status: 202 });
        } else {
             // Handle explicit failure returned by the service
             return NextResponse.json({ success: false, message: result.message || "Unknown generation error." }, { status: 400 });
        }

    } catch (error) {
        console.error("Failed to trigger thumbnail generation:", error);
         // Ensure we return a structured JSON response on failure.
        return NextResponse.json({ success: false, message: `Internal server error during job queuing: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
}