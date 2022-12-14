import { rubbishScrapper } from "./rubbish-scrapper";
import { scheduleJob } from "node-schedule";
import { cronRules } from "./config";
import cron from "cron-validate";
import {
  getJSONFormat,
  getCSVFormat,
  writeFileSync,
  writeCSVFile,
  getDate,
} from "./rubbish-helpers";

export const schedule = () => {
  for (const [ruleName, ruleExpression] of Object.entries(cronRules)) {
    const isProductionEnvironment = process.env.NODE_ENV === "production";
    const cronExpression = cron(ruleExpression);

    if (isProductionEnvironment && ruleName === "dev") {
      return;
    }

    if (cronExpression.isValid()) {
      scheduleJob(ruleExpression, async (date) => {
        const scheduleData = await rubbishScrapper(date);
        const scheduleLog = getJSONFormat({
          updated_at: getDate(date, "human"),
          expresion: ruleExpression,
          name: ruleName,
        });

        writeFileSync(`./data/schedule.json`, getJSONFormat(scheduleData, 2));
        writeCSVFile(`./data/schedule.log`, getCSVFormat(scheduleLog));
      });
    }

    if (!cronExpression.isValid()) {
      const scheduleError = getJSONFormat({
        isError: cronExpression.isError(),
        message: cronExpression.getError(),
        date: getDate(new Date().toISOString(), "human"),
      });

      writeCSVFile("./data/error.log", getCSVFormat(scheduleError));
    }
  }
};
