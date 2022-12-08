import { dataToCSV } from "./rubbish-helpers";
import { promises, existsSync } from "fs";

const file_path = `./logs/rubbish-logger.csv`;

export const rubbishLogger = (data) => {
  const new_data = dataToCSV(data);

  const writeFileSync = (path, data, message) =>
    promises
      .writeFile(path, data)
      .then(() => console.log(`\n${message} Success: \n${new_data}`))
      .catch((error) => console.log(`\n${message} Failed: \n${error}`));

  if (!existsSync(file_path)) {
    writeFileSync(file_path, new_data, "Write File");
  } else {
    promises
      .readFile(file_path, "utf8")
      .then((old_data) => {
        const updated_data = [old_data, new_data].join("\r\n");
        writeFileSync(file_path, updated_data, "Update File");
      })
      .catch((error) => console.log(`\nRead Error: \n${error}`));
  }
};
