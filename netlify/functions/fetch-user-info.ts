import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

const jsonHeaders = { "Content-Type": "application/json" } as const;

function errorResponse(statusCode: number, message: string): HandlerResponse {
  return { statusCode, body: JSON.stringify({ error: message }), headers: jsonHeaders };
}

async function handler(event: HandlerEvent, _context: HandlerContext): Promise<HandlerResponse> {
  const { query } = event.queryStringParameters ?? {};

  if (!query) {
    return errorResponse(400, "Missing required query parameter: name");
  }

  const url = new URL(`https://ch.tetr.io/api/users/${encodeURIComponent(query)}`);

  const resp = await fetch(url.toString());

  const data = await resp.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: jsonHeaders,
  };
}

export { handler };