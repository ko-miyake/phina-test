var gulp = require('gulp');
var connect = require('gulp-connect');
const sass = require("gulp-sass");

gulp.task('serve', function(){
    connect.server();
  });

  // style.scssをタスクを作成する
gulp.task("default", function() {
  // style.scssファイルを取得
  return (
    gulp
      .src("css/style.scss")
      // Sassのコンパイルを実行
      .pipe(sass())
      // cssフォルダー以下に保存
      .pipe(gulp.dest("css"))
  );
});