require('./reports.nav.js');
require('./reports.summary.js');
require('./reports.daily.js');
require('./reports.consumption.js');
require('./reports.disagg.js');
require('./reports.monthly.js');
require('./reports.regular.js');
require('./reports.heatmap.js');
require('./reports.sankey.js');
require('./reports.alerts.js');

angular.module('app.controllers.reports', [
			'app.controllers.reports.nav',
			'app.controllers.reports.summary',
			'app.controllers.reports.daily',
			'app.controllers.reports.consumption',
			'app.controllers.reports.disagg',
			'app.controllers.reports.monthly',
			'app.controllers.reports.regular',
			'app.controllers.reports.heatmap',
			'app.controllers.reports.sankey',
			'app.controllers.reports.alerts'
		])
