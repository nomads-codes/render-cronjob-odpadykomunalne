import { getDate } from "./rubbish-helpers";
import queryString from "query-string";
import puppeteer from "puppeteer";

export const rubbishScrapper = async (updated_at) => {
  let queryParsed = queryString.parse(process.argv.slice(2).join("&"));
  let query = queryString.stringify(queryParsed);

  const base_url = "https://odpadykomunalne.tczew.pl/?p=1-harmonogram";
  const browser = await puppeteer.launch({ headless: true });

  const calculateDays = (value) => Number(value) + 1;
  const defaults = {
    street: {
      name: "Romana Klima",
      id: "b3f753",
    },
    search: {
      days: calculateDays("14"),
    },
  };

  if (query.length <= 0) {
    query = `&s=${defaults.street.id}&d=${defaults.search.days}`;
  }

  const urls = {
    selective: `${base_url}&t=2&${query}`,
    mixed: `${base_url}&t=1&${query}`,
  };

  const getRubbishData = async (url) => {
    const page = await browser.newPage();
    await page.goto(url);

    const allResultsSelector = "#content";
    await page.waitForSelector(allResultsSelector);
    await page.click(allResultsSelector);
    const resultsSelector = "table tr:not([style])";
    await page.waitForSelector(resultsSelector);

    // Extract the results from the page.
    return await page.evaluate(async (resultsSelector) => {
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

        const [, streetName, ...rest] = content;
        const rubbish = rest.length ? rest : ["ZMIESZANE"];

        return {
          street: streetName,
          rubbish,
        };
      };

      return [...document.querySelectorAll(resultsSelector)].map(
        (contentNode) => {
          const $content = contentNode.querySelector("ul li");
          const $heading = contentNode.querySelector("span");

          let heading = contentNodeHeadingData($heading);
          let content = contentNodeData($content);

          return {
            date: heading.date,
            day: heading.day,
            rubbish: content.rubbish,
          };
        }
      );
    }, resultsSelector);
  };

  const [selective, mixed] = await Promise.all([
    await getRubbishData(urls.selective),
    await getRubbishData(urls.mixed),
  ]);

  const data = [...selective, ...mixed]
    .map((data) => {
      const { date } = getDate(data.date);

      return {
        ...data,
        date: date.iso,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  await browser.close();

  const { date } = getDate(updated_at);

  return {
    details: {
      updated_at: date.iso,
      urls,
    },
    data,
  };
};
