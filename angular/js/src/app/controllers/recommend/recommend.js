require('./recommend.nav.js');
require('./recommend.summary.js');
require('./recommend.summary.details.js');
require('./recommend.strategies.js');
require('./recommend.strategy1.js');
require('./recommend.strategy2.js');
require('./recommend.strategy3.js');
require('./recommend.strategy4.js');
require('./recommend.strategy5.js');
require('./recommend.config.js');


angular.module('app.controllers.recommendations', [
        'app.controllers.recommendations.nav',
        'app.controllers.recommendations.summary',
        'app.controllers.recommendations.summary.details',
        'app.controllers.recommendations.strategies',
        'app.controllers.recommendations.strategies.strategy1',
        'app.controllers.recommendations.strategies.strategy2',
        'app.controllers.recommendations.strategies.strategy3',
        'app.controllers.recommendations.strategies.strategy4',
        'app.controllers.recommendations.strategies.strategy5',
        'app.controllers.recommendations.configuration'
    ]);