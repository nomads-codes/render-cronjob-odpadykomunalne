import { defaultQuery, queryBaseURL } from "./config";
import qs from "query-string";

const queryArguments = process?.argv?.slice(2)?.join("&")?.toString();
const isQueryArgumentsValid = queryArguments.length > 0;

const queryString = isQueryArgumentsValid
  ? `&${qs.stringify(qs.parse(queryArguments))}`
  : `&s=${defaultQuery.street}&d=${defaultQuery.days}`;

export const queryUrls = {
  selective: `${queryBaseURL}&t=2&${queryString}`,
  mixed: `${queryBaseURL}&t=1&${queryString}`,
};
