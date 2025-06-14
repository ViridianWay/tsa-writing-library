module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
    // Default layout for all Markdown and Nunjucks files
    defaults: [
      {
        matches: { },
        values: {
          layout: "layout.njk"
        }
      }
    ]
  };
};
