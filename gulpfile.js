process.argv.silent = true;
var gulp = require('gulp');
var fs = require('fs');
var prompt = require('gulp-prompt');
var gutil = require('gulp-util'); 
var shell = require('gulp-shell'); 
var extend = require('node.extend');
var os = require('os');
var ifaces = os.networkInterfaces();
var plugins1 = require('gulp-load-plugins')();
var runSequence = require('run-sequence');              // WARNING: HACK: This is intended to be a temporary solution until the release of gulp 4.0 which has support for defining task dependencies in series or in parallel.
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var path = require('path');
var livereload = require('gulp-livereload');            // DEV enviroment only, reloads page in browser on source change (install livereload plugin for chrome)
var browserify = require('gulp-browserify');            // Gulp browserify, similiar to requirejs, but better
var uglify = require('gulp-uglify');                    // Gulp js minification
var concat = require('gulp-concat');                    // Gulp file concatination
var minifyCSS = require('gulp-minify-css');             // Gulp css minification
var sass = require('gulp-sass');                        // Gulp SASS
var eventStream = require('event-stream');
var order = require('gulp-order');

var ___PUBLIC___ = './angular/';
var ___STATIC___='./common/static/';
var ___STCMOBILE___='./mobile/ionic/www/static/';


gulp.task('vendor-scripts', function () {

    gulp.src([___PUBLIC___ + 'js/src/app/vendor.js'])
        .pipe(browserify({
            shim: {
                'jquery': {
                    path: './node_modules/jquery/dist/jquery.min.js',
                    exports: '$'
                },
                'moment': {
                    path: './node_modules/moment/moment.js',
                    exports: 'moment'
                },
                'underscore': {
                    path: './node_modules/underscore/underscore-min.js',
                    exports: '_',
                    depends: {
                        angular: 'angular'
                    }
                },
                'angular-ui-grid': {
                    path: './node_modules/angular-ui-grid/ui-grid.js',
                    exports: 'uigrid',
                    depends: {
                        angular: 'angular'
                    }
                },
                'angular-ui-bootstrap': {
                    path: './node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.js',
                    exports: 'uibootstrap',
                    depends: {
                        angular: 'angular'
                    }
                },
                'html2canvas': {
                    path: './node_modules/html2canvas/dist/html2canvas.min.js',
                    exports: 'html2canvas'
                },
                'ionic': {
                    path: './angular/js/src/app/external/ionic/js/ionic.min.js',
                    exports: 'ionic'
                },
                'ionic-angular': {
                    path: './angular/js/src/app/external/ionic/js/ionic-angular.js',
                    exports: 'ionic-angular'
                },
                'ag-grid': {
                    path: './node_modules/ag-grid/dist/ag-grid.noStyle.js',
                    exports: 'ag-grid',
                    depends: {
                        angular: 'angular'
                    }
                },
                'angular-toastr': {
                    path: './node_modules/angular-toastr/dist/angular-toastr.tpls.js',
                    exports: 'toastr'  
                },
                'affix': {
                    path: './angular/js/src/app/external/ion-affix/ion-affix.js',
                    exports: 'affix'  
                }
            }
        }))
        .pipe(concat('vendor.min.js'))
        //.pipe(uglify()) 
        .pipe(gulpif(argv.min, uglify()))
        .pipe(gulp.dest(___STATIC___ + 'js'))
        .pipe(gulp.dest(___STCMOBILE___ + 'js'))
        .pipe(livereload());

    gulp.src([___PUBLIC___ + 'js/src/app/vendor.highcharts.js'])
        .pipe(browserify({
            shim: {
                'Highcharts': {
                    path: './node_modules/highstock-release/highstock.src.js',
                    exports: 'Highcharts'
                },
                "HighchartsMore": {
                    path: './node_modules/highstock-release/highcharts-more.src.js',
                    exports: "HighchartsMore",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "HighchartsSolidGauge": {
                    path: './node_modules/highstock-release/modules/solid-gauge.js',
                    exports: "HighchartsSolidGauge",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "Highcharts3D": {
                    path: './node_modules/highstock-release/highcharts-3d.js',
                    exports: "Highcharts3D",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "HighchartsAdapter": {
                    path: './node_modules/highstock-release/adapters/standalone-framework.js',
                    exports: "HighchartsAdapter",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "HighchartsHeatmap": {
                    path: './node_modules/highstock-release/modules/heatmap.js',
                    exports: "HighchartsHeatmap",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "HighchartsBoost": {
                    path: './node_modules/highstock-release/modules/boost.js',
                    exports: "HighchartsBoost",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                "HighchartsExport": {
                    path: './node_modules/highstock-release/modules/exporting.js',
                    exports: "HighchartsExport",
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                },
                'highchartsng': {
                    path: './angular/js/src/app/external/highcharts-ng/highcharts-ng.js',
                    exports: 'highchartsng',
                    depends: {
                        'Highcharts': 'Highcharts'
                    }
                }
            }
        }))
        .pipe(concat('vendor.highcharts.min.js'))
        //.pipe(uglify())
        .pipe(gulpif(argv.min, uglify()))
        .pipe(gulp.dest(___STATIC___ + 'js'))
        .pipe(gulp.dest(___STCMOBILE___ + 'js'))
        .pipe(livereload());
});

// build js files and reload server
gulp.task('app-scripts', function () {

    //app config
    gulp.src([___PUBLIC___ + 'js/src/app/config.json'])
        .pipe(gulp.dest(___STATIC___ + 'js'))
        .pipe(gulp.dest(___STCMOBILE___ + 'js'))
        .pipe(livereload());

    //app scripts
    gulp.src([
            ___PUBLIC___ + 'js/src/app/app.js'
    ])
        .pipe(browserify())
        //.pipe(uglify())
        .pipe(gulpif(argv.min, uglify()))
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(___STATIC___ + 'js'))
        .pipe(gulp.dest(___STCMOBILE___ + 'js'))
        .pipe(livereload());


})

// reload html files
gulp.task('html', function () {
    gulp.src([___PUBLIC___ + '**/*.html'])
        .pipe(gulp.dest(___STATIC___))
        .pipe(gulp.dest(___STCMOBILE___))
        .pipe(livereload());
})

// reload image files
gulp.task('images', function () {
    gulp.src([___PUBLIC___ + '**/image/**/*'])
        .pipe(gulp.dest(___STATIC___))
        .pipe(gulp.dest(___STCMOBILE___))
        .pipe(livereload());
})

// reload json files
gulp.task('json', function () {
    gulp.src([___PUBLIC___ + '**/data/*.*'])
        .pipe(gulp.dest(___STCMOBILE___))
        .pipe(livereload());
})

// build css files and reload server
gulp.task('styles', function () {

    var vendorFiles = gulp.src([
                            './node_modules/angular-ui-grid/ui-grid.css',
                            './angular/js/src/app/external/ionic/css/ionic.css',
                            './node_modules/angular-material/angular-material.css',
                            './node_modules/angular-ui-tree/dist/angular-ui-tree.min.css',
                            './node_modules/angular-loading-bar/build/loading-bar.min.css',
                            './node_modules/bootstrap/dist/css/bootstrap.css',
                            './node_modules/angular-ui-bootstrap/ui-bootstrap-csp.css',
                            './node_modules/swiper/dist/css/swiper.css',
                            // './node_modules/font-awesome/css/font-awesome.min.css',
                            './node_modules/angularjs-slider/dist/rzslider.min.css',
                            './node_modules/angular-toastr/dist/angular-toastr.css',
                            './node_modules/ag-grid/dist/styles/ag-grid.css',
                            './node_modules/ag-grid/dist/styles/theme-fresh.css',
                            './node_modules/ag-grid/dist/styles/theme-material.css',
                            './node_modules/ag-grid/dist/styles/theme-common.css',

    ])
                       .pipe(concat('vendor.css'));


    var appFiles = gulp.src(___PUBLIC___ + 'css/src/site.scss')
                       .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
                       .pipe(concat('app.css'));

    eventStream.concat(appFiles, vendorFiles)
        .pipe(order(["vendor.css", "app.css"]))
        .pipe(concat('app.min.css'))
        //.pipe(minifyCSS())
        .pipe(gulpif(argv.min, minifyCSS()))
        .pipe(gulp.dest(___STATIC___ + 'css'))
        .pipe(gulp.dest(___STCMOBILE___ + 'css'))

    //copy fonts
    gulp.src([
            './node_modules/angular-ui-grid/ui-grid.eot',
            './node_modules/angular-ui-grid/ui-grid.woff',
            './node_modules/angular-ui-grid/ui-grid.ttf',
            './node_modules/angular-ui-grid/ui-grid.svg',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.eot',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff2',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.ttf',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.svg',

            // './node_modules/font-awesome/fonts/fontawesome.otf',
            // './node_modules/font-awesome/fonts/fontawesome-webfont.eot',
            // './node_modules/font-awesome/fonts/fontawesome-webfont.woff',
            // './node_modules/font-awesome/fonts/fontawesome-webfont.woff2',
            // './node_modules/font-awesome/fonts/fontawesome-webfont.ttf',
            // './node_modules/font-awesome/fonts/fontawesome-webfont.svg',

            // './node_modules/open-iconic/font/fonts/open-iconic.eot',
            // './node_modules/open-iconic/font/fonts/open-iconic.otf',
            // './node_modules/open-iconic/font/fonts/open-iconic.svg',
            // './node_modules/open-iconic/font/fonts/open-iconic.ttf',
            // './node_modules/open-iconic/font/fonts/open-iconic.woff',

            ___PUBLIC___ + 'css/fontello.eot',
            ___PUBLIC___ + 'css/fontello.svg',
            ___PUBLIC___ + 'css/fontello.ttf',
            ___PUBLIC___ + 'css/fontello.woff',

            // WARNING: Noto expensive to load, testing Arial

            // ___PUBLIC___ + 'css/NotoSansSC-Thin.otf',
            // ___PUBLIC___ + 'css/NotoSansSC-Thin.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Thin.woff2',

            // ___PUBLIC___ + 'css/NotoSansSC-Light.otf',
            // ___PUBLIC___ + 'css/NotoSansSC-Light.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Light.woff2',

            // ___PUBLIC___ + 'css/NotoSansSC-Regular.otf',
            // ___PUBLIC___ + 'css/NotoSansSC-Regular.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Regular.woff2',
    
            // ___PUBLIC___ + 'css/NotoSansSC-Medium.otf ',
            // ___PUBLIC___ + 'css/NotoSansSC-Medium.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Medium.woff2',

            // ___PUBLIC___ + 'css/NotoSansSC-Bold.otf',
            // ___PUBLIC___ + 'css/NotoSansSC-Bold.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Bold.woff2',


            // ___PUBLIC___ + 'css/NotoSansSC-Black.otf',
            // ___PUBLIC___ + 'css/NotoSansSC-Black.woff',
            // ___PUBLIC___ + 'css/NotoSansSC-Black.woff2'            

    ])
        .pipe(gulp.dest(___STATIC___ + 'css'))
        .pipe(gulp.dest(___STCMOBILE___ + 'css'))
        .pipe(livereload());

    //copy fonts
    gulp.src([
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.eot',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff2',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.ttf',
            './node_modules/bootstrap/fonts/glyphicons-halflings-regular.svg',
    ])
        .pipe(gulp.dest(___STATIC___ + 'fonts'))
        .pipe(gulp.dest(___STCMOBILE___ + 'fonts'))
        .pipe(livereload());

})

// watch for changes
gulp.task('watch', [], function () {
    livereload.listen();

    gulp.watch([___PUBLIC___ + 'js/src/**/*.js', '!' + ___PUBLIC___ + 'js/src/app/vendor.js'], ['app-scripts']);
    gulp.watch([___PUBLIC___ + 'js/src/app/config.json'], ['app-scripts']);
    gulp.watch([___PUBLIC___ + 'js/src/app/vendor.js'], ['vendor-scripts']);
    gulp.watch([___PUBLIC___ + 'js/src/app/vendor.highcharts.js'], ['vendor-scripts']);
    gulp.watch([___PUBLIC___ + 'css/src/**/*.scss'], ['styles']);
    gulp.watch([___PUBLIC___ + 'data/**/*.json'], ['json']);
    gulp.watch([___PUBLIC___ + '**/*.html'], ['html']);
    gulp.watch([___PUBLIC___ + '**/*.html'], ['html']);
});


gulp.task('configure', [], function () {
    return prompter;
});


gulp.task('default', ['html', 'vendor-scripts', 'app-scripts', 'styles', 'images', 'json', 'watch'], function () {

});



/****************************************************
*
*   App Configuration 
*
*****************************************************/

var loadConfig = function(){
    var defaultConfig = 
    {
            app_comment: "DO NOT EDIT THIS FILE, SEE loadConfig() IN gulpfile.js ",
            name: "EQuota",
            app_id: "",
            documentRoot: "mobile/ionic/www",
            proxies: [
                    {
                        path: "/api",
                        proxyUrl: "http://localhost:8000/api"
                    },
                    {
                        path: "/api-token-auth",
                        proxyUrl: "http://localhost:8000/api-token-auth"
                    }
            ],
            app_last_action: 0,
            app_api_protocol: "http",
            app_api_ip: "localhost",
            app_api_port: "8000",
    }

    try {
        var path = 'ionic.project';
        if(fs.existsSync(path)){
            var fileContents = fs.readFileSync(path, "utf8");
            extend(defaultConfig, JSON.parse(fileContents));
            defaultConfig.exists = true;
        }
    } catch (e) {
        console.log(e);
    }    
    return defaultConfig;
}

gulp.task('config', [], function () {

    var jsonConfig = loadConfig();

    var launchOptions = ['Website', 'Mobile', 'Configure', 'Exit'];

    var ips = getIPs();                         // list of all available IP's
    ips.push('custom ...');                     // custom IP entry
    ips.splice(0, 0, jsonConfig.app_api_ip);    // add last used IP

    return gulp.src('gulpfile.js', {read: false})
        .pipe(
            prompt.prompt(
                [
                {
                    name: 'action',
                    type: 'list',
                    choices: launchOptions,
                    message: 'EQuota launch options:',
                    default: jsonConfig.app_last_action
                },
                { 
                    name: 'ip',
                    type: 'list',
                    message: 'Please select API ip adddress:',
                    choices: ips,
                    default: 0,
                    when: function (response) {
                        return response.action == 'Configure' || !jsonConfig.exists;
                    },
                },
                {
                    name: 'ip',
                    type: 'input',
                    message: 'Enter custom API ip address:',
                    default: jsonConfig.app_api_ip,
                    when: function (response) {
                        return response.ip == ips[ips.length - 1]; //i.e. custom
                    },
                },
                {
                    name: 'port',
                    type: 'input',
                    message: 'API port:',
                    default: jsonConfig.app_api_port,
                    when: function (response) {
                        return response.action == 'Configure' || !jsonConfig.exists;
                    },
                }],
                function (res){

                    // Combine tasks corresponding to user selection
                    var sequences = [];

                    switch(res.action){
                        case 'Website':
                            sequences.push('python_serve');
                            sequences.push('python_celery_worker');
                            sequences.push('python_celery_beat');
                            sequences.push('python_celery_flower');
                            break;
                        case 'Mobile':
                            sequences.push('python_serve');
                            sequences.push('ionic_serve');
                            break;
                        case 'Configure':
                            break;
                        case 'Exit':
                            return;
                    }

                    // Save config
                    // var contents = {
                    //     API_IP: (res.ip ? res.ip : jsonConfig.API_IP),
                    //     API_PORT: (res.port ? res.port : jsonConfig.API_PORT),
                    //     LAST_LAUNCH_OPTION: launchOptions.indexOf(res.action)
                    // };
                    var contents = 
                    {
                        "proxies": [
                                {
                                    "path": "/api",                                                 // API proxy
                                    "proxyUrl": (res.protocol ? res.protocol : jsonConfig.app_api_protocol) + "://" + // http/https 
                                                (res.ip ? res.ip : jsonConfig.app_api_ip) + ":" +   // ip
                                                (res.port ? res.port : jsonConfig.app_api_port) +   // port
                                                "/api"                                              // path
                                },
                                {
                                    "path": "/api-token-auth",                                      // AUTH proxy
                                    "proxyUrl": (res.protocol ? res.protocol : jsonConfig.app_api_protocol) + "://" + // http/https 
                                                (res.ip ? res.ip : jsonConfig.app_api_ip) + ":" +   // ip
                                                (res.port ? res.port : jsonConfig.app_api_port) +   // port
                                                "/api-token-auth"                                   // path
                                }
                        ],
                        "app_last_action": launchOptions.indexOf(res.action),
                        "app_api_protocol": (res.protocol ? res.protocol : jsonConfig.app_api_protocol),
                        "app_api_ip": (res.ip ? res.ip : jsonConfig.app_api_ip),
                        "app_api_port": (res.port ? res.port : jsonConfig.app_api_port),

                        // prevent IP prompt by ionic, dev only use
                        "ionicServeAddress": (res.protocol ? res.protocol : jsonConfig.app_api_protocol) + "://" + // http/https 
                                                (res.ip ? res.ip : jsonConfig.app_api_ip) + ":" +   // ip
                                                ('8100'/*res.port ? res.port : jsonConfig.app_api_port*/)
                    };            

                    extend(jsonConfig, contents);

                    fs.writeFileSync('ionic.project', JSON.stringify(jsonConfig));


                    // Launch tasks
                    if(sequences.length > 0)
                        runSequence('npm_install', function(){
                            runSequence(sequences);
                        });

            })
        );

    //prompter.write();
});

var getIPs = function(){
    
    var addresses = [];
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details){
            if (details.family =='IPv4') {
                addresses.push(details.address);
            }
        });
    };
    return addresses;
}

gulp.task('npm_install', [], function() { 

    return gulp.src('gulpfile.js', {read: false})
                .pipe(shell('npm install'));

});
// WEB
var childP=require('child_process');
gulp.task('python_serve', [], function(cb) { 
    var config = loadConfig();
    // childP.spawn('python', ['manage.py', 'celery', '-A', 'energyinsight', 'beat', '-l', 'info'],{
    //     detached:false,
    //     stdio:'inherit',
    // })
    // var mainserver=childP.spawn('python',['manage.py', 'runserver',config.app_api_ip+':'+config.app_api_port],{
    //     detached:false,
    //     stdio:'inherit'
    // })

    //  childP.spawn('python manage.py runserver ' + config.app_api_ip + ':' + config.app_api_port,function(err,stdout,stderr){
    //     console.log(stdout);
    //     console.log(stderr);
    //     cb(err);
    // })
    return gulp.src('gulpfile.js', {read: false})
             .pipe(shell('python manage.py runserver ' + config.app_api_ip + ':' + config.app_api_port));
            //.pipe(shell('uwsgi --socket mysite.sock  --module energyinsight.wsgi --chmod-socket=666'));

});


gulp.task('python_celery_worker', [], function(cb) { 
    return gulp.src('gulpfile.js', {read: false})
            .pipe(shell('python manage.py celery worker -n worker1 -f celery_worker.log --loglevel=info -Q low'));

});


gulp.task('python_celery_beat', [], function(cb) { 

   return gulp.src('gulpfile.js', {read: false})
            // todo: detect error if rabbit is not running
            // .pipe(shell('rabbitmq-server -detached'))
            // .on('error', function(e){ } ) 
            .pipe(shell('python manage.py celery purge -f'))
            .pipe(shell('python manage.py celery -A energyinsight beat -l info -f celery_beat.log'));
});

gulp.task('python_celery_flower', [], function(cb) { 
    return gulp.src('gulpfile.js', {read: false})
            .pipe(shell('python manage.py  celery -A energyinsight flower --quiet'));    

});

// MOBILE
gulp.task('ionic_serve', [], function() { 
    var config = loadConfig();
    return gulp.src('gulpfile.js', {read: false})
            .pipe(shell('ionic serve --address ' + config.app_api_ip + ' --port 8100'));
});


gulp.task('live', ['html', 'vendor-scripts', 'app-scripts', 'styles', 'images', 'json'], function () {

});