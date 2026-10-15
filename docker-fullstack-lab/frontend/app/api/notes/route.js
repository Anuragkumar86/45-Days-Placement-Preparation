export const dynamic = "force-dynamic";

const apiBaseUrl = process.env.API_INTERNAL_URL ?? "http://api:4000";

async function forwardToApi(method, request) {
  try {
    const init = {
      method,
      cache: "no-store",
      headers: { "content-type": "application/json" },
    };

    if (request) init.body = await request.text();

    const upstream = await fetch(`${apiBaseUrl}/api/notes`, init);
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Could not reach the internal API:", error.message);
    return Response.json({ error: "The backend API is currently unavailable." }, { status: 502 });
  }
}

export async function GET() {
  return forwardToApi("GET");
}

export async function POST(request) {
  return forwardToApi("POST", request);
}
