require('./charts.nav.js');
require('./charts.summary.js');
require('./charts.summary.list.js');
require('./charts.summary.edit.js');
require('./charts.summary.import.js');

angular.module('app.controllers.charts', [
        'app.controllers.charts.nav',
        'app.controllers.charts.summary',
        'app.controllers.charts.summary.list',
        'app.controllers.charts.summary.edit',
        'app.controllers.charts.summary.import'
    ])