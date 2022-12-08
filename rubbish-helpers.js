export const dateFormatter = (date) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    minute: "2-digit",
    hour: "2-digit",
  };

  return new Date(date).toLocaleDateString("pl-PL", options);
};

export const escapeDoubleColons = (value) => value.replaceAll('"', '""');
export const valueToString = (value) => value.toString();
export const valueQuote = (value) => `"${value}"`;

export const dataToCSV = (data) => {
  const itterator = (array) =>
    array
      .map((row) => {
        return row
          .map(valueToString)
          .map(escapeDoubleColons)
          .map(valueQuote)
          .join(",");
      })
      .join("\r\n");

  if (typeof data === "string") {
    const escapedColons = escapeDoubleColons(data);
    const quotes = valueQuote(escapedColons);
    return quotes;
  } else if (Array.isArray(data)) {
    return itterator(data);
  } else {
    return itterator(Object.entries(data));
  }
};
