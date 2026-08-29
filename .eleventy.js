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
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });

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

  eleventyConfig.addFilter("firstImage", (html) => {
    if (!html) return "";
    const match = String(html).match(
      /<(?:img|video)[^>]+src="([^"]+)"/i
    );
    return match ? match[1] : "";
  });

  eleventyConfig.addFilter("stillSrc", (src) => {
    if (!src) return src;
    return String(src).replace(/\.(gif|webp|webm|apng)$/i, "-still.png");
  });

  eleventyConfig.addTransform("webm-as-video", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html") || !content) {
      return content;
    }
    return String(content).replace(
      /<img\b([^>]*?)\bsrc="([^"]+\.webm)"([^>]*)>/gi,
      (_, pre, src, post) => {
        const attrs = `${pre} ${post}`;
        const altMatch = /alt="([^"]*)"/.exec(attrs);
        const label = altMatch
          ? altMatch[1].replace(/"/g, "&quot;")
          : "";
        const aria = label ? ` aria-label="${label}"` : "";
        return `<video class="post-video" src="${src}" muted loop playsinline preload="auto" disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback"${aria}></video>`;
      }
    );
  });

  eleventyConfig.addFilter("firstParagraph", (html) => {
    if (!html) return "";
    const strip = (value) =>
      String(value)
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&ndash;/g, "–")
        .replace(/&mdash;/g, "—")
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/\s+/g, " ")
        .trim();

    const cleaned = String(html)
      .replace(/<figure[\s\S]*?<\/figure>/gi, "")
      .replace(/<(?:img|video)\b[^>]*>/gi, "")
      .replace(/<\/video>/gi, "");
    const paragraphs = [...cleaned.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => strip(match[1]))
      .filter(Boolean);

    return paragraphs[0] || strip(cleaned);
  });

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
