import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformStockData(data: any) {
  const timeSeries = data["Time Series (Daily)"];
  const dataArray = [];

  for (const date in timeSeries) {
    if (timeSeries.hasOwnProperty(date)) {
      const dataEntry = timeSeries[date];
      dataArray.unshift({
        date: date,
        open: parseFloat(dataEntry["1. open"]),
        high: parseFloat(dataEntry["2. high"]),
        low: parseFloat(dataEntry["3. low"]),
        close: parseFloat(dataEntry["4. close"]),
        volume: parseFloat(dataEntry["5. volume"]),
      });
    }
  }

  return dataArray;
}
