/*************************************************All the templates *****************************/

module.exports={
    'home':require('./template/home/home.hbs'),
    'table':require('./template/home/table.hbs'),
    'home_carousel':require('./template/home/carousel.hbs'),
	'chart':require('./template/chart/chart.hbs'),
    'chart_left':require('./template/chart/leftsidebar.hbs'),
    'chart_center':require('./template/chart/topcontent.hbs'),
    'info_panel':require('./template/chart/infopanel.hbs'),
    'chart_right':require('./template/chart/rightsidebar.hbs'),
    'report':require('./template/report/report.hbs'),
    'report_side':require('./template/report/sidebar.hbs'),
    'report_recommendation': require('./template/report/report_recommendation.hbs'),
    'report_configuration': require('./template/report/report_configuration.hbs'),
    'report_summary':require('./template/report/report_summary.hbs'),
    'report_agg':require('./template/report/report_agg.hbs'),
    'report_monthly':require('./template/report/report_monthly.hbs'),
    'report_trend':require('./template/report/report_trend.hbs'),
    'report_section':require('./template/report/report_section.hbs'),

    'report_consumptionTrends':require('./template/report/report_consumptionTrends.hbs'),
    'graph_element':require('./template/graphs/graph_element.hbs'),
    'graph_gadget':require('./template/graphs/gadget.hbs'),
    'graph_timeline':require('./template/graphs/timeline.hbs'),
    'graph_panel_small':require('./template/graphs/panel_small.hbs'),
    'graph_panel_small2':require('./template/graphs/panel_small2.hbs'),
    'user_admin':require('./template/user_admin/user_admin.hbs')

};
