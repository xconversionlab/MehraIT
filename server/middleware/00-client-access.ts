/**
 * Shared-access gate for the MehraIT client preview.
 *
 * Set CLIENT_PREVIEW_BASIC_AUTH to "username:password" in the deployment
 * environment. When unset, the middleware is a no-op (local development).
 * The gate runs before app routes and server functions, including auth signup,
 * so the client preview is not publicly claimable while first-admin bootstrap
 * is still enabled.
 */
import { createHash, timingSafeEqual } from "node:crypto";

interface AccessEvent {
  req: { headers: Headers };
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export default async function clientPreviewAccess(
  event: AccessEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const expected = process.env.CLIENT_PREVIEW_BASIC_AUTH?.trim();
  if (!expected) return next();

  const authorization = event.req.headers.get("authorization") ?? "";
  const encoded = authorization.match(/^Basic\s+(.+)$/i)?.[1];
  if (encoded) {
    let supplied = "";
    try {
      supplied = Buffer.from(encoded, "base64").toString("utf8");
    } catch {
      supplied = "";
    }
    if (timingSafeEqual(digest(supplied), digest(expected))) return next();
  }

  return new Response("MehraIT client preview. Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MehraIT Client Preview", charset="UTF-8"',
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
