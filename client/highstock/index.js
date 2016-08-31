var Highcharts=require('./highstock.src');
require('./exporting.src')(Highcharts);
/**
 * Grid-light theme for Highcharts JS
 * @author Torstein Honsi
 */

// Load the fonts
Highcharts.createElement('link', {
   href: '//fonts.googleapis.com/css?family=Dosis:400,600',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

Highcharts.theme = {
   colors: ['#F79646', '#4BACC6', '#8064A2', '#9BBB59', '#C0504D', '#4F81BD', '#C0504D', '#1F497D'],

   chart: {
      backgroundColor: null,
      style: {
         fontFamily: "Dosis, sans-serif"
      }
   },
   title: {
      style: {
         fontSize: '16px',
         fontWeight: 'bold',
         textTransform: 'uppercase'
      }
   },
   tooltip: {
      borderWidth: 0,
      backgroundColor: 'rgba(219,219,216,0.8)',
      shadow: false
   },
   legend: {
      itemStyle: {
         fontWeight: 'bold',
         fontSize: '13px'
      }
   },
   xAxis: {
      gridLineWidth: 1,
      labels: {
         style: {
            fontSize: '12px'
         }
      }
   },
   yAxis: {
      minorTickInterval: 'auto',
      title: {
         style: {
            textTransform: 'uppercase'
         }
      },
      labels: {
         style: {
            fontSize: '12px'
         }
      }
   },
   plotOptions: {
      candlestick: {
         lineColor: '#404048'
      },
      // series:{
      // 	cropThreshold
      // }
   },


   // General
   background2: '#F0F0EA'
   
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);
window.Highcharts=Highcharts;
require('./highcharts-3d');
require('./highcharts_more');
require('./solid_gauge');


module.exports=Highcharts;