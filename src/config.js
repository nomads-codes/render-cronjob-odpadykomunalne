// 1. "At 20:00, only on Sunday"
// 2. "At 09:00 and 21:00, Monday through Friday"
// 3. "Every minute"

export const cronRules = {
  sunday: "00 20 * * 0", // 1
  week: "0 6,20 * * 1-5", // 2
  dev: "*/1 * * * *", // 3
};

export default {
  cronRules,
};