export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Yahan original website ka domain name hai
    const targetHost = 'pwmarco-phi.vercel.app';
    url.hostname = targetHost;

    // Original website ko fetch karna
    let response = await fetch(url.toString(), request);
    let contentType = response.headers.get("content-type");

    // Hum sirf HTML ya JavaScript files me modifications karenge 
    if (contentType && (contentType.includes("text/html") || contentType.includes("application/javascript") || contentType.includes("text/javascript"))) {
      
      let text = await response.text();

      // 1. Branding change karna (PW-MARCO -> TONY BROTHERS)
      // Note: Case-sensitive replace use kar rahe hain taaki backend urls break na ho
      text = text.replace(/PW-MARCO/g, "TONY BROTHERS");
      text = text.replace(/PW MARCO/g, "TONY BROTHERS");

      // 2. Logo / Image change karna (i.ibb.co links ko aapke logo se replace karna)
      const newLogoUrl = "https://i.ibb.co/kFsWWpY/photo-6068653674331837020-y.jpg";
      text = text.replace(/https?:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g, newLogoUrl);

      // Naye response ke headers setup karna (kyunki text ka size change ho gaya hai)
      let newHeaders = new Headers(response.headers);
      newHeaders.delete("content-length"); 

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    // Agar image/css/font hai toh direct pass kar do
    return response;
  }
};
