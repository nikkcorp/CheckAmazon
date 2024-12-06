const axios = require('axios');
const cheerio = require('cheerio');
const readline = require('readline');

const amazonDomains = {
  'DE': 'https://www.amazon.de/dp/',
  'IT': 'https://www.amazon.it/dp/',
  'ES': 'https://www.amazon.es/dp/',
  'FR': 'https://www.amazon.fr/dp/',
  'UK': 'https://www.amazon.co.uk/dp/',
  'US': 'https://www.amazon.com/dp/',
  'JP': 'https://www.amazon.co.jp/dp/',
  'CA': 'https://www.amazon.ca/dp/',
};

// Readline interface for taking input from terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n\nPlease enter SKU: '
});

rl.prompt();

async function checkProductExistence(sku) {
  let productExists = false;

  for (const [country, url] of Object.entries(amazonDomains)) {
    const productUrl = `${url}${sku}`;

    try {
      const response = await axios.get(productUrl);
      const $ = cheerio.load(response.data);

      const isProductAvailable = $('title').text().toLowerCase().includes('page not found') || 
                                $('h1').text().toLowerCase().includes('no results for') ||
                                $('h2').text().toLowerCase().includes('product does not exist');
      
      if (isProductAvailable) {
        console.log(`Product does not exist on Amazon ${country} - ${productUrl}`);
      } else {
        console.log(`amazon ${country} - ${productUrl}`);
        productExists = true;
      }
    } catch (error) {}
  }

  if (!productExists) {
    console.log('Product does not exist');
  }
}

rl.on('line', async (input) => {
  const sku = input.trim();

  if (sku === '') {
    console.clear();
    rl.prompt();
    return;
  }

  await checkProductExistence(sku);

  rl.prompt();
});
