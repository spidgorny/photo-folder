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
        console.error("[Thumbnail Generate] Missing 'key' parameter");
        return NextResponse.json({ success: false, message: "Missing 'key' parameter." }, { status: 400 });
    }

    console.log(`[Thumbnail Generate] Triggered for Key: ${fileKey}`);

    try {
        const s3 = getS3Storage();
        console.log(`[Thumbnail Generate] S3 storage initialized`);

        // === STEP 1: Obtain a signed URL to call the external lambda endpoint/API ===
        console.log(`[Thumbnail Generate] Getting presigned URL for /thumbnails/trigger`);
        const presignedUrl = await s3.getPresignUrl(`/thumbnails/trigger`, 'application/json');
        console.log(`[Thumbnail Generate] Presigned URL obtained: ${presignedUrl.substring(0, 50)}...`);

        // Call the generation endpoint using the presigned URL and pass the file key
        const fullUrl = `${presignedUrl}?fileKey=${encodeURIComponent(fileKey)}`;
        console.log(`[Thumbnail Generate] Calling Lambda at: ${fullUrl.substring(0, 100)}...`);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trigger_generation: true })
        });

        console.log(`[Thumbnail Generate] Lambda response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Thumbnail Generate] Lambda call failed with status ${response.status}: ${errorText}`);
            return NextResponse.json({ success: false, message: `Backend API call failed with status ${response.status}: ${errorText}` }, { status: 500 });
        }

        const result = await response.json();
        console.log(`[Thumbnail Generate] Lambda response:`, result);

        if (result.status === 'success' && result.message.includes('Job queued')) {
            return NextResponse.json({ success: true, message: `Generation process started successfully for ${fileKey}. Please wait a moment and refresh.` }, { status: 202 });
        } else {
             console.error(`[Thumbnail Generate] Lambda returned failure:`, result);
             return NextResponse.json({ success: false, message: result.message || "Unknown generation error." }, { status: 400 });
        }

    } catch (error) {
        console.error("[Thumbnail Generate] Failed to trigger thumbnail generation:", error);
        console.error("[Thumbnail Generate] Error details:", error instanceof Error ? error.stack : String(error));
        return NextResponse.json({ success: false, message: `Internal server error during job queuing: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
}