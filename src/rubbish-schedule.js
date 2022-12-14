import { rubbishScrapper } from "./rubbish-scrapper";
import { scheduleJob } from "node-schedule";
import { cronRules, filePaths } from "./config";
import cron from "cron-validate";
import {
  isProductionEnvironment,
  getJSONFormat,
  getCSVFormat,
  writeFileSync,
  writeCSVFile,
  getDate,
} from "./rubbish-helpers";

export const schedule = () => {
  for (const [ruleName, ruleExpression] of Object.entries(cronRules)) {
    const cronExpression = cron(ruleExpression);

    if (isProductionEnvironment && ruleName === "dev") {
      return;
    }

    if (cronExpression.isValid()) {
      scheduleJob(ruleExpression, async (dateString) => {
        const scheduleData = await rubbishScrapper(dateString);
        const { date } = getDate(dateString);
        const scheduleLog = getJSONFormat({
          updated_at: date.human,
          expresion: ruleExpression,
          name: ruleName,
        });

        writeFileSync(filePaths.schedule.json, getJSONFormat(scheduleData, 2));
        writeCSVFile(filePaths.schedule.log, getCSVFormat(scheduleLog));
      });
    }

    if (!cronExpression.isValid()) {
      const { getError, isError } = cronExpression;
      const isoDate = new Date().toISOString();
      const { date } = getDate(isoDate);

      const scheduleError = getJSONFormat({
        message: getError(),
        error: isError(),
        date: date.human,
      });

      writeCSVFile(filePaths.schedule.error, getCSVFormat(scheduleError));
    }
  }
};
