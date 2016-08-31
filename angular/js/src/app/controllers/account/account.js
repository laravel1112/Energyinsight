require('./account.nav.js');
require('./account.profile.js');
require('./account.login.js');

angular.module('app.controllers.account', [
		'app.controllers.account.nav',
		'app.controllers.account.profile',
		'app.controllers.account.login',
	])
