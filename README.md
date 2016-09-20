# gulp-addSuffix
gulp插件：为文件名添加自定义后缀，生成文件名更改记录文件，根据记录文件更新html引用文件名。

## install

```
npm install gulp-addSuffix --save-dev
```



## Usage

```javascript
var addSuffix = require('gulp-addSuffix');  //引入插件

//js编译
gulp.task('build:js', function() {
    gulp.src(['src/js/*.js'])
        .pipe(uglify())   //js压缩
    	//为文件名添加自定义后缀，并记录文件名变化。参数：1.记录文件相对路径，2.后缀字符串。
        .pipe(addSuffix('dest/js/record.json', '.min'))
        .pipe(gulp.dest('dest/js')); 
});

//修改html
gulp.task('build:html', 'build:js', function() {
    gulp.src('src/html/*.html')
    	//根据记录文件，更新html中的引用文件名。参数：记录文件相对路径
        .pipe(addSuffix.html('dest/js/record.json')) 
        .pipe(gulp.dest('dest/html'));
});
```

