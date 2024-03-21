const {src, dest, watch, parallel} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const scss = require('gulp-sass')(require('sass'));
const  ghPages  = require ('gulp-gh-pages');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const fonter =require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');



function server(){
    browserSync.init({
        server: {
            baseDir: "dist"
        }
    });
    watch("src/*.html").on('change', browserSync.reload);
};


function styles(){
    return src('src/scss/**/*.+(scss|sass)')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream())
};

function html() {
    return src("src/*.html")
        .pipe(dest("dist/"))
};

function scripts(){
    return src([
        'node_modules/gsap/dist/gsap.min.js',
        'node_modules/gsap/dist/ScrollTrigger.min.js',
        'src/js/**/*.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream())
};

function fonts(){
    return src('src/fonts/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('src/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('dist/fonts'))
};

function images(){
    return src('src/images/**/*')
        .pipe(imagemin())

        .pipe(dest('dist/images'))
        .pipe(browserSync.stream())
};

function webpImages() {
    return src("src/images/**/*.{png,jpg,jpeg}")
        .pipe(webp())
        .pipe(dest("dist/images"));
};

function avifImages(){
    return src("src/images/**/*.{png,jpg,jpeg}")
    .pipe(avif({quality: 50}))
    .pipe(dest("dist/images"));
};

function sprite(){
    return src('src/icons/sprite/**/*.svg')
    .pipe(cheerio({
        run: function ($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        },
        parserOptions: {xmlMode: true}
    }))
        .pipe(svgSprite({
            mode:{
                symbol:{
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('dist/icons/sprite'))
};

function icons() {
    return src("src/icons/**/*")
        .pipe(dest("dist/icons"))
        .pipe(browserSync.stream());
};


function watching(){
    watch("src/scss/**/*.+(scss|sass|css)", parallel(styles));
    watch("src/*.html").on('change', parallel(html));
    watch("src/js/**/*.js").on('change', parallel(scripts));
    watch("src/fonts/*").on('all', parallel(fonts));
    watch("src/icons/**/*").on('all', parallel(icons));
    watch("src/images/**/*").on('all', parallel(images));
    watch("src/images/**/*.{png,jpg,jpeg}", parallel(webpImages));
    watch("src/images/**/*.{png,jpg,jpeg}", parallel(avifImages));
    watch('src/icons/sprite/**/*.svg').on('all', parallel(sprite));
};

/*function deploy(cb) {
    ghPages.publish(path.join(process.cwd(), './src'), cb);
}*/


exports.styles = styles;
exports.sprite = sprite;
exports.images = images;
exports.fonts = fonts;
exports.scripts = scripts;
exports.watching = watching;
exports.html = html;
exports.icons = icons;
exports.webpImages = webpImages;
exports.avifImages = avifImages;
exports.server = server;

exports.default = parallel(server, styles, scripts, images, html, sprite, avifImages, webpImages, icons, fonts, watching);

function deploy() {
    return src('./dist/**/*')
        .pipe(ghPages());
}
exports.deploy = deploy;