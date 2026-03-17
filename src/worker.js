export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      const key = "site/Degrees of Lewdity.html";
      const obj = await env.R2_BUCKET.get(key);
      if (!obj) return new Response("Not Found", { status: 404 });

      const headers = new Headers();
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "no-cache");
      return new Response(obj.body, { headers });
    }

    const key = `site${path}`;
    const obj = await env.R2_BUCKET.get(key);
    if (!obj) return new Response("Not Found", { status: 404 });

    const headers = new Headers(obj.httpMetadata || {});
    if (path.startsWith("/img/")) {
      headers.set("cache-control", "public, max-age=31536000, immutable");
    }

    return new Response(obj.body, { headers });
  },
};
