import { NextRequest, NextResponse } from "next/server";
import { verifyAuthHeader } from "@/lib/firebase/admin";
import { logger } from "@/lib/services/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const placesLogger = logger.child({ module: "PlacesAPI" });

interface PhotonProperties {
  name?: string;
  state?: string;
  country?: string;
  country_code?: string;
  osm_id?: number;
}

interface PhotonFeature {
  properties: PhotonProperties;
}

interface PhotonResponse {
  type: string;
  features: PhotonFeature[];
}

function formatLocation({ name, state, country, country_code }: PhotonProperties): string {
  if (!name || !country) return name ?? "";
  if (country_code === "us" && state) return `${name}, ${state}, USA`;
  return `${name}, ${country}`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = await verifyAuthHeader(authHeader);
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "7");
  url.searchParams.set("lang", "en");
  // Filter to settlements only
  url.searchParams.append("osm_tag", "place:city");
  url.searchParams.append("osm_tag", "place:town");
  url.searchParams.append("osm_tag", "place:municipality");

  try {
    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "ResumeBuilder/1.0" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      placesLogger.error("Photon API error", { status: response.status });
      return NextResponse.json({ predictions: [] });
    }

    const data = (await response.json()) as PhotonResponse;

    const seen = new Set<string>();
    const predictions = (data.features ?? [])
      .map((f) => ({
        description: formatLocation(f.properties),
        placeId: String(f.properties.osm_id ?? Math.random()),
      }))
      .filter(({ description }) => {
        if (!description || seen.has(description)) return false;
        seen.add(description);
        return true;
      })
      .slice(0, 5);

    return NextResponse.json({ predictions });
  } catch (error) {
    placesLogger.error(
      "Failed to fetch locations",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json({ predictions: [] });
  }
}
