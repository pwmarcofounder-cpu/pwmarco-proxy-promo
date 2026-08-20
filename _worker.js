export default {
  async fetch(request) {
    const url = new URL(request.url);
    const originalHost = url.hostname; // Aapka Cloudflare Pages wala domain
    const targetHost = 'pwmarco-phi.vercel.app'; // Original Vercel domain
    
    url.hostname = targetHost;

    // Vercel ko compressed (zip) files bhejne se rokna
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.delete("accept-encoding");

    let fetchInit = {
      method: request.method,
      headers: modifiedHeaders,
    };
    
    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchInit.body = await request.clone().arrayBuffer();
    }

    let response = await fetch(url.toString(), fetchInit);
    let contentType = response.headers.get("content-type") || "";

    // HTML ke sath-sath ab hum JavaScript, JSON, aur plain text ko bhi deeply check karenge
    if (contentType.includes("text/html") || 
        contentType.includes("javascript") || 
        contentType.includes("json") || 
        contentType.includes("text/plain")) {
      
      let text = await response.text();

      // 1. Text Replacement (Case-insensitive)
      text = text.replace(/PW-MARCO/gi, "TONY BROTHERS");
      text = text.replace(/PW MARCO/gi, "TONY BROTHERS");
      text = text.replace(/pwmarco/gi, "tonybrothers"); // JS variables/links ke liye

      // 2. Logo Replacement
      const newLogoUrl = "https://i.ibb.co/kFsWWpY/photo-6068653674331837020-y.jpg";
      text = text.replace(/https?:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/gi, newLogoUrl);

      // 3. Domain Leak Prevention (Agar JS seedha vercel ko call kar rahi ho, toh usko rokna)
      const domainRegex = new RegExp(targetHost, 'g');
      text = text.replace(domainRegex, originalHost);

      let newHeaders = new Headers(response.headers);
      newHeaders.delete("content-length");
      newHeaders.delete("etag"); // Purani cache ko force clear karne ke liye
      
      // Browser ko strictly bolna ki wo is modified file ko cache na kare
      newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  }
};
