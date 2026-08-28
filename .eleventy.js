module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("site/**");
  eleventyConfig.ignores.add("posts/_TEMPLATE.md");

  eleventyConfig.addPassthroughCopy({ "site/css": "css" });
  eleventyConfig.addPassthroughCopy({ "site/js": "js" });
  eleventyConfig.addPassthroughCopy({ "site/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "site/index.html": "index.html" });
  eleventyConfig.addPassthroughCopy({ "site/contact.html": "contact.html" });
  eleventyConfig.addPassthroughCopy({ "site/.nojekyll": ".nojekyll" });

  eleventyConfig.addFilter("readableDate", (dateObj) =>
    dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );

  eleventyConfig.addFilter("htmlDateString", (dateObj) =>
    dateObj.toISOString().slice(0, 10)
  );

  eleventyConfig.addCollection("posts", (collection) =>
    collection
      .getFilteredByGlob("posts/*.md")
      .sort((a, b) => b.date - a.date)
  );

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "production",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    gitignoreIntegration: false,
  };
};
