/********************************************************************
 *
 *
 *  App Directives
 *
 *  - At a high level, directives are markers on a DOM element
 *    (such as an attribute, element name, comment or CSS class)
 *    that tell AngularJS's HTML compiler ($compile) to attach
 *    a specified behavior to that DOM element (e.g. via event listeners),
 *    or even to transform the DOM element and its children.
 *
*********************************************************************/
require('./baidumap.js');
require('./angular.idangero.us.js');
require('./angular.busy.js');
require('./angular.highcharts.redraw.js');
require('./angular.partial.js');
require('./angular.ui-grid.custom.js');
require('./angular.daterange.js');
require('./angular.filehandler.js');
require('./angular.fileinput.js');
require('./angular.ui-tree.directives.js');
require('./angular.walkthrough.js');
require('./app.ui.js');
require('./app.validation.js');
require('./app.shinyapp.js');

angular.module('app.directives', [ 'app.ui', 'app.validation', 'baiduMap', 'ksSwiper', 'daterange', 'busy', 'highcharts.redraw', 'ui.grid.custom', 'ui.tree.directives', 'partial', 'fileHandler', 'fileInput', 'walkthrough', 'app.shinyapp'])


function css(a) {
    var sheets = document.styleSheets, o = {};
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if (a.is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
            }
        }
    }
    return o;
}

function css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split("; ");
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
}
