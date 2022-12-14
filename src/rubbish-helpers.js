import { promises, existsSync } from "fs";

export const getDate = (date, style = "iso") => {
  if (typeof date === "string") {
    const [day, month, year] = date.replace(/[^\d]/g, "-").split("-");
    date = `${year}-${month}-${day}`;
  }

  date = new Date(date);

  const humanOptions = {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const dateFormat = {
    human: (date) => date.toLocaleDateString("pl-PL", humanOptions),
    iso: (date) => date.toISOString(),
  };

  const styles = {
    human: dateFormat.human(date),
    iso: dateFormat.iso(date),
  };

  return styles[style];
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
