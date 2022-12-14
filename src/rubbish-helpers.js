import { promises, existsSync } from "fs";
import { dateOptions, dateLocale } from "./config";

export const isProductionEnvironment = process.env.NODE_ENV === "production";

export const splitDateIntoParts = (date) => {
  return date.replace(/[^\d]/g, "-").split("-");
};

export const getDate = (
  dateString,
  options = dateOptions,
  locale = dateLocale
) => {
  if (typeof dateString === "string") {
    const [day, month, year] = splitDateIntoParts(dateString);
    dateString = `${year}-${month}-${day}`;
  }

  const date = new Date(dateString);

  return {
    date: {
      human: date.toLocaleDateString(locale, options),
      iso: date.toISOString(),
    },
  };
};

export const getJSONFormat = (data, space = undefined, replacer = null) =>
  JSON.stringify(data, replacer, space);

export const getCSVFormat = (data) => [`${data}`].join("\n\r");

export const writeFileSync = (path, data) => promises.writeFile(path, data);

export const writeCSVFile = async (path, data) => {
  !existsSync(path) && writeFileSync(path, data);

  const prev = await promises.readFile(path, "utf8");
  const next = [prev, data].join("\r\n");

  writeFileSync(path, next);
};
