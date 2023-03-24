#!/usr/bin/env node

require("dotenv/config");

const { CommentService } = require("./lib/index.js");
const { IG_LINK, PHRASE_AUTHOR, IG_USERNAME, IG_PASSWORD } = process.env;

(async () => {
    const commentService = new CommentService({
        loginInstagram: IG_USERNAME,
        passwordInstagram: IG_PASSWORD,
        puppeteer_options: {
            headless: true,
        },
    });

    await commentService.execute({
        link: IG_LINK,
        author: PHRASE_AUTHOR,
        mode: 1
    });
})();
