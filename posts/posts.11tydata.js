/*
 * Posts marked `wip: true` are still real files in the repo, but they must not
 * reach the deployed site — no page, no entry on Notes. They stay visible on
 * `npm run dev` so drafts can be previewed locally.
 */
const includeWip =
  process.env.ELEVENTY_RUN_MODE !== "build" || process.env.INCLUDE_WIP === "1";

module.exports = {
  eleventyComputed: {
    eleventyExcludeFromCollections: (data) =>
      data.wip && !includeWip ? true : data.eleventyExcludeFromCollections,
    permalink: (data) =>
      data.wip && !includeWip ? false : `notes/${data.page.fileSlug}.html`,
  },
};
