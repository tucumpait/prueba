import { Actor, log } from 'apify';
import axios from 'axios';
import * as cheerio from 'cheerio';

await Actor.init();

const input = await Actor.getInput();
const url = input?.url || 'https://example.com';

log.info(`Scrapeando: ${url}`);

const response = await axios.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
    },
    timeout: 30000,
});

const $ = cheerio.load(response.data);

const result = {
    url,
    title: $('title').first().text().trim(),
    description: $('meta[name="description"]').attr('content')?.trim() || '',
    headings: [],
    links: [],
};

$('h1, h2, h3, h4, h5, h6').each((i, element) => {
    result.headings.push({
        level: $(element).prop('tagName').toLowerCase(),
        text: $(element).text().trim(),
    });
});

$('a[href]').each((i, element) => {
    const href = $(element).attr('href');

    if (href) {
        result.links.push({
            text: $(element).text().trim(),
            href,
        });
    }
});

await Actor.pushData(result);

log.info('Scraping terminado', {
    title: result.title,
    headings: result.headings.length,
    links: result.links.length,
});

await Actor.exit();
