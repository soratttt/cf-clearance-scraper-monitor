process.env.NODE_ENV = 'test'
const { app, cleanup } = require('../src/index')
const request = require("supertest")

beforeAll(async () => {
    while (!global.browser) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}, 30000);


afterAll(async () => {
    global.finished = true
    if (cleanup) cleanup()
    if (global.browser) {
        await global.browser.close().catch(() => {})
    }
})


test('Scraping Page Source from Cloudflare Protection', async () => {
    return request(app)
        .post("/cf-clearance-scraper")
        .send({
            url: 'https://nopecha.com/demo/cloudflare',
            mode: "source"
        })
        .expect(200)
        .then(response => { expect(response.body.code).toEqual(200); })
}, 60000)


test('Creating a Turnstile Token With Site Key [min]', async () => {
    return request(app)
        .post("/cf-clearance-scraper")
        .send({
            url: 'https://turnstile.zeroclover.io/',
            siteKey: "0x4AAAAAAAEwzhD6pyKkgXC0",
            mode: "turnstile-min"
        })
        .expect(200)
        .then(response => { expect(response.body.code).toEqual(200); })
}, 60000)

test('Creating a Turnstile Token With Site Key [max]', async () => {
    return request(app)
        .post("/cf-clearance-scraper")
        .send({
            url: 'https://turnstile.zeroclover.io/',
            mode: "turnstile-max"
        })
        .expect(200)
        .then(response => { expect(response.body.code).toEqual(200); })
}, 60000)

test('Create Cloudflare WAF Session', async () => {
    return request(app)
        .post("/cf-clearance-scraper")
        .send({
            url: 'https://nopecha.com/demo/cloudflare',
            mode: "waf-session"
        })
        .expect(200)
        .then(response => { expect(response.body.code).toEqual(200); })
}, 60000)

// New API format tests
test('New API format - Creating a cftoken with new parameters', async () => {
    return request(app)
        .post("/cftoken")
        .send({
            type: "cftoken",
            websiteUrl: 'https://turnstile.zeroclover.io/',
            websiteKey: "0x4AAAAAAAEwzhD6pyKkgXC0"
        })
        .expect(200)
        .then(response => { 
            expect(response.body.code).toEqual(200);
            expect(response.body.token).toBeDefined();
        })
}, 60000)

test('New API format - Parameter validation', async () => {
    return request(app)
        .post("/cftoken")
        .send({
            type: "invalid",
            websiteUrl: 'https://turnstile.zeroclover.io/',
            websiteKey: "0x4AAAAAAAEwzhD6pyKkgXC0"
        })
        .expect(400)
        .then(response => { 
            expect(response.body.code).toEqual(400);
            expect(response.body.message).toContain('cftoken');
        })
})

test('New API format - Missing websiteUrl', async () => {
    return request(app)
        .post("/cftoken")
        .send({
            type: "cftoken",
            websiteKey: "0x4AAAAAAAEwzhD6pyKkgXC0"
        })
        .expect(400)
        .then(response => { 
            expect(response.body.code).toEqual(400);
            expect(response.body.message).toContain('websiteUrl');
        })
})

test('New API format - Missing websiteKey', async () => {
    return request(app)
        .post("/cftoken")
        .send({
            type: "cftoken",
            websiteUrl: 'https://turnstile.zeroclover.io/'
        })
        .expect(400)
        .then(response => { 
            expect(response.body.code).toEqual(400);
            expect(response.body.message).toContain('websiteKey');
        })
})