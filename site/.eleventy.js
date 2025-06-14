module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: "njk"
  };
};
