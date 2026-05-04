import { createClient } from "@supabase/supabase-js";

function getStoragePathFromPublicUrl(playbackUrl: string) {
  try {
    const url = new URL(playbackUrl);
    const marker = "/object/public/videos/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return Response.json(
        {
          success: false,
          error: "Missing NEXT_PUBLIC_SUPABASE_URL on the server.",
        },
        { status: 500 },
      );
    }

    if (!serviceRoleKey) {
      return Response.json(
        {
          success: false,
          error:
            "Missing SUPABASE_SERVICE_ROLE_KEY on the server. Restart the dev server after adding it to .env.local.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      id?: string;
      playbackUrl?: string;
    };

    if (!body.id || !body.playbackUrl) {
      return Response.json(
        { success: false, error: "Missing video id or playback URL." },
        { status: 400 },
      );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { error } = await adminSupabase
      .from("videos")
      .delete()
      .eq("id", body.id);

    if (error) {
      return Response.json(
        {
          success: false,
          error: `Could not delete database row: ${error.message}`,
        },
        { status: 500 },
      );
    }

    const storagePath = getStoragePathFromPublicUrl(body.playbackUrl);

    if (storagePath) {
      const { error: storageError } = await adminSupabase.storage
        .from("videos")
        .remove([storagePath]);

      if (storageError) {
        console.error("Storage cleanup failed after DB delete:", storageError);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown admin delete error.";

    return Response.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
