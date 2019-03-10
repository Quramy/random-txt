import { launch, Page } from "puppeteer";
import fs from "fs";
import path from "path";

async function getList(page: Page) {
  const handlers = await page.$$("#output > ul > li");
  const list = await Promise.all(handlers.map(h => page.evaluate((x: HTMLLIElement) => {
    return Promise.resolve(x.textContent);
  }, h)));
  return (list as any) as string[];
}

async function main() {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();

  page.goto("http://tools.256web.net/free/blog/");
  await page.waitForNavigation();
  const inputHandle = await page.$("#input_name");
  if (!inputHandle) {
    throw new Error("no input");
  }
  await inputHandle.type("$TITLE");
  const submitHandle = await page.$("input[type='button'][name='submit']");
  if (!submitHandle) {
    throw new Error("no submit button");
  }

  let result = [] as string[];
  for (let i = 0; i < 4000; ++i) {
    await submitHandle.click();
    await page.waitForResponse("http://tools.256web.net/free/blog/ajax-output.php?callback=callback");
    await page.waitForSelector("#output > ul");

    const list = await getList(page);
    result = [...result, ...list];
    if (i && i % 50 === 0) {
      console.log(`Requested ${i} times...`);
    }
  }

  await page.close();
  result = Array.from(new Set(result)).sort();
  fs.writeFileSync(path.resolve(__dirname, "result.json"), JSON.stringify(result, null, 2), "utf-8");
  browser.close();
}

main().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
