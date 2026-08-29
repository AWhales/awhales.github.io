/*
 * Posts marked `wip: true` are hidden from the Notes list on the live site, but
 * their page is still built so you can share a direct URL. They show on the
 * Notes list in `npm run dev` (with a WIP badge) for local preview.
 */
const includeWipInList =
  process.env.ELEVENTY_RUN_MODE !== "build" || process.env.INCLUDE_WIP === "1";

module.exports = {
  eleventyComputed: {
    eleventyExcludeFromCollections: (data) =>
      data.wip && !includeWipInList ? true : data.eleventyExcludeFromCollections,
    permalink: (data) => `notes/${data.page.fileSlug}.html`,
  },
};
