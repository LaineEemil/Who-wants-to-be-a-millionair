/* global module */

module.exports = function(grunt) {
  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    validation: {
        options: {
            reset: grunt.option("reset") || true,
            stoponerror: false,
            relaxerror: [".*Consider.*",
             "Section lacks heading. Consider using h2-h6 elements to add identifying headings to all sections.",
             "The Content-Type was “text/html”. Using the HTML parser",
             "Using the schema for HTML with SVG 1.1, MathML 3.0, RDFa 1.1, and ITS 2.0 support"
            ]
        },
        files: {
            src: ["lectures/*.html", "examples/*.html", "exercises/*/*.html"]
        }
    },
    linter: {
      files: ["examples/*.js", "Gruntfile.js", "exercises/*/*.js"],
      exclude: ["exercises/lib/*"]
    }
  });

  grunt.loadNpmTasks("grunt-w3c-html-validation");
  grunt.loadNpmTasks("grunt-linter");

  grunt.registerTask("default", ["validation"]);
  grunt.registerTask("lint", ["linter"]);
};
