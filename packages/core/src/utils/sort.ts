import { Tool } from "../types";

export function sortTools(
  tools: Tool[],
  sortBy: string = "popularity",
  order: "asc" | "desc" = "desc"
): Tool[] {
  return [...tools].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "createdAt":
        aVal = a.createdAt;
        bVal = b.createdAt;
        break;
      case "updatedAt":
        aVal = a.updatedAt;
        bVal = b.updatedAt;
        break;
      case "popularity":
      default:
        aVal = a.popularity;
        bVal = b.popularity;
        break;
    }

    if (typeof aVal === "string") {
      return order === "asc"
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }

    return order === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });
}
