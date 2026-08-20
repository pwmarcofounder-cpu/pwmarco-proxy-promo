export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetHost = 'pwmarco-phi.vercel.app';
    url.hostname = targetHost;

    // Vercel ko compressed (zip) files bhejne se rokna zaroori hai
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.delete("accept-encoding"); // Yeh line text replacement ko work karwayegi

    let fetchInit = {
      method: request.method,
      headers: modifiedHeaders,
    };
    
    // Agar koi form submit ho raha ho toh uski body bhi handle karna
    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchInit.body = await request.clone().arrayBuffer();
    }

    let response = await fetch(url.toString(), fetchInit);
    let contentType = response.headers.get("content-type") || "";

    // HTML, JS, aur JSON sab jagah change check karna
    if (contentType.includes("text/html") || contentType.includes("javascript") || contentType.includes("json")) {
      
      let text = await response.text();

      // Case-insensitive (gi) replace lagana taaki capital/small sab change ho jaye
      text = text.replace(/PW-MARCO/gi, "TONY BROTHERS");
      text = text.replace(/PW MARCO/gi, "TONY BROTHERS");

      const newLogoUrl = "https://i.ibb.co/kFsWWpY/photo-6068653674331837020-y.jpg";
      text = text.replace(/https?:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/gi, newLogoUrl);

      let newHeaders = new Headers(response.headers);
      newHeaders.delete("content-length");
      newHeaders.set("Cache-Control", "no-store"); // Browser cache na ho isliye

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  }
};
