export function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/\.[^/.]+$/, "")      // bỏ extension
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}