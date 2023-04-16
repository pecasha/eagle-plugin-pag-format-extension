const gulp = require('gulp');
const clean = require('gulp-clean');
const replace = require('gulp-replace');
const less = require('gulp-less');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const cheerio = require('gulp-cheerio');
const inject = require('gulp-inject');
const jsonmin = require('gulp-jsonmin');

gulp.task('clean', () => {
    return gulp.src('./dist', {read: false, allowEmpty: true})
    .pipe(clean());
});

gulp.task('build:core', () => {
    return gulp.src('./build/core.js')
    .pipe(gulp.dest('./dist/lib'));
});

gulp.task('build:lib', gulp.series('build:core', () => {
    return gulp.src('./src/plugin/lib/**/*.*')
    .pipe(gulp.dest('./dist/lib'));
}));

gulp.task('build:js', gulp.series('build:lib', () => {
    return gulp.src(['./src/plugin/**/*.js', '!./src/plugin/lib/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
}));

gulp.task('build:less', () => {
    return gulp.src('./src/plugin/**/*.less')
    .pipe(less())
    .pipe(csso())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:image', () => {
    return gulp.src('./src/plugin/**/*.*(png|jpg|jpeg|gif|svg|webp)')
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:json', () => {
    return gulp.src('./src/plugin/**/*.json')
    .pipe(jsonmin())
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:html', () => {
    return gulp.src('./src/plugin/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('replace:html', () => {
    return gulp.src('./dist/*.html')
    .pipe(cheerio($ => {
        $("link").remove();
    }))
    .pipe(inject(gulp.src(['./dist/*.css', './dist/*.js', '!./dist/thumbnail.js']), {
        relative: true,
        removeTags: true,
        transform: (filePath, file) => {
            if(filePath.slice(-3) === '.js'){
                return `<script>${file.contents}</script>`;
            }
            if(filePath.slice(-4) === '.css') {
                return `<style>${file.contents}</style>`;
            }
            return file.contents.toString('utf8');
        }
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build:rev', gulp.series('build:image', 'build:json', 'build:less', 'build:js', 'build:html', () => {
    return gulp.src('./dist/**/*.*(html|js|css)')
    .pipe(replace('.less', '.css'))
    .pipe(replace('.ts', '.js'))
    .pipe(replace('../core/index', './lib/core'))
    .pipe(gulp.dest('./dist'));
}));

gulp.task('build', gulp.series('clean', 'build:rev', 'replace:html', () => {
    return gulp.src(['./build', './dist/*.css', './dist/*.js', '!./dist/thumbnail.js'], {read: false})
    .pipe(clean());
}));
