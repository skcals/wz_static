const { src, dest, parallel, watch } = require("gulp");
const fs = require("fs");
const autoprefixer = require("gulp-autoprefixer");
const ejs = require("gulp-ejs");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");

sass.compiler = require("node-sass");

function ejsToHtml() {
  return src("./views/pages/*.ejs")
    .pipe(
      ejs(
        {
          data: JSON.parse(fs.readFileSync("./views/data/data.json", "utf8"))
        },
        {},
        { ext: ".html" }
      )
    )
    .pipe(dest("./build"));
}

function css() {
  return src("./public/css/*.css")
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(dest("./build/css"));
}

function compileSass() {
  return src("./public/css/sass/**/*.scss")
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(dest("./build/css/CustomStyles/"));
}

function js() {
  return src("./public/js/*.js").pipe(dest("./build/js"));
}
function es6() {
  return src("./public/js/es6/*.js")
    .pipe(concat("bundle.min.js"))
    .pipe(babel())
    .pipe(uglify())
    .pipe(dest("./build/js"));
}

function img() {
  return src("./public/images/**/*")
    .pipe(imagemin())
    .pipe(dest("./build/images"));
}

function watchFile() {
  watch("./public/js/*.js", js);
  watch("./public/js/es6/*.js", es6);
  watch("./public/css/*.css", css);
  watch("./public/images", img);
  watch("./public/css/sass/**/*.scss", compileSass);
  watch("./views", ejsToHtml);
  watch("./build/").on("change", browserSync.reload);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "./build"
    }
  });
  src("./views/data/").on("change", browserSync.reload);
  browserSync.reload();
  watchFile();
}

exports.js = js;
exports.css = css;
exports.es6 = es6;
exports.img = img;
exports.compileSass = compileSass;
exports.ejsToHtml = ejsToHtml;
exports.serve = serve;
exports.default = parallel(js, css, es6, img, compileSass, ejsToHtml, serve);
