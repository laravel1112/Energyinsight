var $ = require('jquery'); //This include jquery
$.fn.dataTable=require('datatables');
require('jstree');
//require('jquery-ui');
// global.jqxBaseFramework=window.jQuery=$;
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxcore.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxdata.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxbuttons.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxscrollbar.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxpanel.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxcheckbox.js');
// require('../node_modules/jqwidgets-framework/jqwidgets/jqxtree.js');
window.jQuery=$;
require('./bootstrap');
//$=require('./bootstrap-modal.js')($);
module.exports=$;