export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
  }
};
export const error = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error("[ERROR]", ...args);
  }
};
