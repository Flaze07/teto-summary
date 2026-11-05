import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

const jsonHeaders = { "Content-Type": "application/json" } as const;

function errorResponse(statusCode: number, message: string): HandlerResponse {
  return { statusCode, body: JSON.stringify({ error: message }), headers: jsonHeaders };
}

async function handler(event: HandlerEvent, _context: HandlerContext): Promise<HandlerResponse> {
  const { id, pri = "0", sec = "0", ter = "0" } = event.queryStringParameters ?? {};

  if (!id) {
    return errorResponse(400, "Missing required query parameter: name");
  }

  const url = new URL(`https://ch.tetr.io/api/users/${encodeURIComponent(id)}/records/league/top`);
  url.searchParams.set("limit", "100");
  if (Number(pri) !== 0 || Number(sec) !== 0 || Number(ter) !== 0) {
    url.searchParams.set("after", `${pri}:${sec}:${ter}`);
  }

  const resp = await fetch(url.toString());

  if (!resp.ok) {
    return errorResponse(resp.status, `TETR.IO API error: ${resp.statusText}`);
  }

  const data = await resp.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: jsonHeaders,
  };
}

export { handler };
