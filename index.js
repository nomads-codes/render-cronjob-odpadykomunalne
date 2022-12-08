import { rubbishScrapper } from "./rubbish-scrapper";
import { dateFormatter } from "./rubbish-helpers";
import { rubbishLogger } from "./rubbish-logger";

import { scheduleJob } from "node-schedule";

const scheduleCallbackFn = (date) => {
  const updated_at = dateFormatter(date);

  rubbishScrapper(updated_at);
  rubbishLogger(updated_at);
};

const rules = {
  // Every Sunday at 20:30
  sunday: "30 20 * * 0",

  // Every day-of-week from Monday through Friday at 20:30
  week: "11 20 * * 1-5",

  // One minute
  dev: "*/1 * * * *",
};

scheduleJob(rules.sunday, scheduleCallbackFn);
scheduleJob(rules.week, scheduleCallbackFn);
// scheduleJob(rules.dev, scheduleCallbackFn);
