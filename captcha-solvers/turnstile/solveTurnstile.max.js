const fs = require("fs");
function solveTurnstileMin({ url, proxy }) {
  return new Promise(async (resolve, reject) => {
    if (!url) return reject("Missing url parameter");

    let context = null;
    let page = null;
    let isResolved = false;
    
    const cleanup = async () => {
      if (page) {
        try {
          await page.close().catch(() => {});
        } catch (e) {}
      }
      if (context) {
        try {
          await context.close().catch(() => {});
        } catch (e) {}
      }
    };
    
    const timeoutHandler = setTimeout(async () => {
      if (!isResolved) {
        isResolved = true;
        await cleanup();
        reject("Timeout Error");
      }
    }, global.timeOut || 60000);

    try {
      context = await global.browser
        .createBrowserContext({
          proxyServer: proxy ? `http://${proxy.host}:${proxy.port}` : undefined,
        })
        .catch(() => null);

      if (!context) {
        clearTimeout(timeoutHandler);
        return reject("Failed to create browser context");
      }

      page = await context.newPage();
      
      await page.setDefaultTimeout(30000);
      await page.setDefaultNavigationTimeout(30000);

      if (proxy?.username && proxy?.password) {
        await page.authenticate({
          username: proxy.username,
          password: proxy.password,
        });
      }
        
      await page.evaluateOnNewDocument(() => {
        let token = null;
        async function waitForToken() {
          while (!token) {
            try {
              token = window.turnstile.getResponse();
            } catch (e) {}
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          var c = document.createElement("input");
          c.type = "hidden";
          c.name = "cf-response";
          c.value = token;
          document.body.appendChild(c);
        }
        waitForToken();
      });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
      });

      await page.waitForSelector('[name="cf-response"]', {
        timeout: 60000,
      });
      
      const token = await page.evaluate(() => {
        try {
          return document.querySelector('[name="cf-response"]').value;
        } catch (e) {
          return null;
        }
      });
      
      isResolved = true;
      clearTimeout(timeoutHandler);
      await cleanup();
      
      if (!token || token.length < 10) {
        return reject("Failed to get token");
      }
      
      resolve(token);
      
    } catch (e) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutHandler);
        await cleanup();
        reject(e.message || 'Unknown error');
      }
    }
  });
}
module.exports = solveTurnstileMin;
