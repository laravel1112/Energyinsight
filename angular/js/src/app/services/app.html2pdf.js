var jsPDF = require('../external/jsPDF/jspdf'); // v1.1.135 customized. Latest npm v1.0.272 broken without RequireJS

angular.module('app.html2pdf', [])
.service('html2pdf', function() {

	this.export = function(elem, filePrefix){

	   html2canvas(elem, {
	        onrendered: function(canvas) {
	            var namefile = prompt("Save as...", filePrefix + "." + moment().format("YYYY-MM-DD") + ".pdf");
	            if(!namefile.endswith)

	            canvas.toBlob(function(blob){

	                var urlCreator = window.URL || window.webkitURL;
	                var imageUrl = urlCreator.createObjectURL(blob);
	                var img = new Image();
	                img.src = imageUrl;
	                img.onload = function(){
	                    var pdf = new jsPDF('l','px',[img.height, img.width]);
	                    pdf.addImage(img, 0, 0, img.width, img.height);
	                    pdf.save(namefile);
	                };
	            });
	        }
	    });

	}

	return this;
});