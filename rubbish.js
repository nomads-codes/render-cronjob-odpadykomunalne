const puppeteer = require("puppeteer");
const queryString = require("query-string");

(async () => {
  const queryParsed = queryString.parse(process.argv.slice(2).join("&"));
  let query = queryString.stringify(queryParsed);

  const browser = await puppeteer.launch({ headless: true });
  const base_url = "https://odpadykomunalne.tczew.pl/?p=1-harmonogram";

  const urls = {
    selective: `${base_url}&t=2&${query ? query : "&s=b3f753&d=14"}`,
    mixed: `${base_url}&t=1&${query ? query : "&s=b3f753&d=14"}`,
  };

  const getRubbishData = async (url, type) => {
    const page = await browser.newPage();
    await page.goto(url);

    const allResultsSelector = "#content";
    await page.waitForSelector(allResultsSelector);
    await page.click(allResultsSelector);

    const resultsSelector = "table tr:not([style])";
    await page.waitForSelector(resultsSelector);

    // Extract the results from the page.
    const rubbishData = await page.evaluate((resultsSelector) => {
      const contentNodeHeadingData = (heading) => {
        heading = heading?.textContent?.trim();

        if (heading.includes("(")) {
          heading = heading.replace("(", "");
        }

        if (heading.includes(")")) {
          heading = heading.replace(")", "");
        }

        if (heading.includes(", ulice:")) {
          heading = heading.replace(", ulice:", "");
        }

        const [date, day] = heading.split(" ");

        return {
          date,
          day,
        };
      };

      const contentNodeData = (content) => {
        const $showXSDate = content.querySelector(".show-xs-date");
        const $showWXS = content.querySelector(".show-w-xs");
        const $fa = content.querySelector(".fa");

        if ($showXSDate) {
          $showXSDate.remove();
        }

        if ($showWXS) {
          $showWXS.remove();
        }

        if ($fa) {
          $fa.remove();
        }

        content = content?.textContent?.trim();

        if (content.includes("W-G NA TEL.")) {
          content = content.replace("W-G NA TEL.", "GABARYTY");
        }

        if (content.includes("(cała)")) {
          content = content.replace("(cała)", " ");
        }

        content = content.split(" ").filter((element) => element.length > 0);

        const [streetPrefix, streetName, ...rest] = content;

        const street = [streetPrefix, streetName].join(" ") || "";
        const rubbish = rest.length ? rest : [""];

        return {
          rubbish,
          street,
        };
      };

      return [...document.querySelectorAll(resultsSelector)].map(
        (contentNode) => {
          const $content = contentNode.querySelector("ul li");
          const $heading = contentNode.querySelector("span");

          let heading = contentNodeHeadingData($heading);
          let content = contentNodeData($content);

          return {
            rubbish: content.rubbish,
            street: content.street,
            date: heading.date,
            day: heading.day,
          };
        }
      );
    }, resultsSelector);

    return rubbishData.map((rubbish) => {
      return {
        type: type,
        ...rubbish,
      };
    });
  };

  const rubbish = {
    selective: await getRubbishData(urls.selective, "selective"),
    mixed: await getRubbishData(urls.mixed, "mixed"),
  };

  console.log([...rubbish.selective, ...rubbish.mixed]);

  await browser.close();
})();
