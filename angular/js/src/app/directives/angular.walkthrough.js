angular.module('walkthrough', [])
.directive('walkthrough', ['$rootScope', '$document', '$compile', function ($rootScope, $document, $compile) {
    return {
    	scope: { config: '=walkthrough' },
        controller: ['$scope', '$element', '$window', '$timeout', function ($scope, $element, $window, $timeout) {

			var wndWidth = $(window).outerWidth(),
				wndHeight = $(window).outerHeight();

			var actionsTemplate, overlayTemplate;

            $scope.selected = null;

            $scope.visible = false;
            $scope.isvisible = function () {
                return $scope.visible;
            };

            function Overlay(width, height, left, top) {
                
                //this.width = this.height = this.left = this.top = 0;

                // outer parent
                var outer = $('<div class="outer fadein fadeout" ng-show="isvisible()" />');
                
                // backdrop
                var topbox = $("<div />").css({ top:0, left: 0, width: wndWidth, height: 0 }).appendTo(outer);
                var bottombox = $("<div />").css({ top:wndHeight, left: 0, width: wndWidth, height: 0 }).appendTo(outer);
                var leftbox = $("<div />").css({ top:0, left: 0, width: 0, height: wndHeight }).appendTo(outer);
                var rightbox = $("<div />").css({top:0, left: wndWidth, width: 0, height: wndHeight}).appendTo(outer);
                
                overlayTemplate = angular.element($compile(outer)($scope));
                var body = angular.element(document).find('body');
                body.append(overlayTemplate);


                this.resize = function resize(width, height, left, top) {
                    if (width != null)
                        this.width = width;
                    if (height != null)
                        this.height = height;
                    if (left != null)
                        this.left = left;
                    if (top != null)
                        this.top = top;

                    wndWidth = $(window).outerWidth(),
                	wndHeight = $(window).outerHeight();
                };
                
                this.show = function show() {
                    $scope.visible = true;
                };
                
                this.hide = function hide() {
                    //outer.hide();
                    $scope.visible = false;
                };
                
                this.render = function render(width, height, left, top) {
                    
                    this.resize(width, height, left, top);
                    this.show();
                    
                    topbox.css({
                        top: 0,//this.top - 2,
                        left: 0,//this.left - 2,
                        width: $(window).outerWidth(),
                        height: this.top
                    });
                    bottombox.css({
                        top: this.top + this.height,
                        left: 0,//this.left - 2,
                        width: $(window).outerWidth(),//this.width + 5,
                        height: $(window).outerHeight() - (this.top + this.height)
                    });
                    leftbox.css({
                        top: this.top,
                        left: 0, //this.left - 3,
                        height: this.height,
                        width: this.left
                    });
                    rightbox.css({
                        top: this.top,
                        left: this.left + this.width + 1,
                        height: this.height,
                        width: $(window).width() - (this.left + this.width),
                    });
                    
                };

                this.remove = function(){
                    $(overlayTemplate).remove();
                }

            }
            
            function Dialog() {

	            var actions = $(
	            	'<div class="walkthrough-dialog fadein fadeout ng-hide" ng-show="isvisible()">' +
	            	'	<div class="panel panel-default flex flex-resize flex-column flex-absolute" ng-class="{\'panel-title-less\': !steps[activeStep].title }">' +
	            	'		<div class="panel-heading flex-noresize" ng-show="steps[activeStep].title"></div>' + 
	            	'		<div class="panel-body flex-resize" ng-bind-html="getStepContent() | to_trusted"></div>' +
	            	'		<div class="panel-footer flex-noresize">' + 
	            	'			<button class="btn btn-default fl" ng-click="prev()" ng-show="activeStep > 0">上一项</botton>' + 
	            	'			<button class="btn btn-default fr" ng-click="next()" ng-hide="activeStep == steps.length - 1">下一项</botton>' + 
	            	'			<button class="btn btn-default fr" ng-click="finish()" ng-show="activeStep == steps.length - 1">关闭</botton>' + 
	            	'			<button class="btn btn-link fr" ng-click="finish()" >结束</botton>' + 
	            	'		</div>' + 
	            	'	</div>' + 
	            	'</div>');

	            actionsTemplate = angular.element($compile(actions)($scope));
	            var body = angular.element(document).find('body');
	            body.append(actionsTemplate);

            	this.render = function render(position, width, height, left, top){
                    //this.resize(width, height, left, top);
                    //this.show();
                    var pTop, pLeft;
						pWidth = $(actionsTemplate).outerWidth(),
						pHeight = $(actionsTemplate).outerHeight(),
						pSpace = 15;

                    position = position || 'left';
                	switch(position){
                		case 'top':
                			pTop = top - pHeight;
            				pLeft = left + (width / 2) - (pWidth / 2);

                            pTop = pTop > pSpace ? pTop : pSpace;

                			break;
                		case 'right':
							pTop = top + (height / 2) - (pHeight / 2);
            				pLeft = left + width + pSpace;

							pTop = pTop < top ? top : pTop; //prevent above target position
							pTop = pTop + pHeight > wndHeight ? wndHeight - pHeight - pSpace : pTop; //prevent window overflow position 
                			break;
                		case 'bottom':
                			pTop = top + height + pSpace;
                			pLeft = left + (width / 2) - (pWidth / 2); 
                            
                            if(pLeft + pWidth > wndWidth) // prevent window overflow horizontaly
                                pLeft = wndWidth - pWidth - pSpace;

                			break;
                		case 'left':
							pTop = top + (height / 2) - (pHeight / 2);
							pLeft = left - pWidth - pSpace;

							pTop = pTop < top ? top : pTop; //prevent above target position
							pTop = pTop + pHeight > wndHeight ? wndHeight - pHeight - pSpace : pTop; //prevent window overflow position 
                			break;
                        case 'inside':
                            pTop = top + (height / 2) - (pHeight / 2);
                            pLeft = left + (width / 2) - (pWidth / 2);
                            break;
                	}
                    actionsTemplate.css({
                    	top: pTop + 'px',
                    	left: pLeft + 'px'
                    });
            	}

                this.remove = function(){
                    $(actionsTemplate).remove();
                }
            }


            // Init overlay
            var overlay = new Overlay($(window).outerWidth(), $(window).outerHeight(), 0, $(window).scrollTop());
            var dialog = new Dialog();
            

            $(window).bind('resize', function(){
            	wndWidth = $(window).outerWidth();
				wndHeight = $(window).outerHeight();

        		if($scope.visible)
        			$scope.select($scope.steps[$scope.activeStep]);
            });

            /**********************************************
            * 
            * Dialog actions
            * 
            *********************************************/
            
            // Handler for outside event to highlight element
            $scope.select = function(step) {      
                $timeout(function () {
                    $scope.selected = $(step.target);

                    if($($scope.selected).is(":visible")){
                        var offset = $scope.selected.offset();
                        overlay.render($scope.selected.outerWidth(), $scope.selected.outerHeight(), offset.left, offset.top);
                        dialog.render(step.position, $scope.selected.outerWidth(), $scope.selected.outerHeight(), offset.left, offset.top);
                    }
                    else{
                        $scope.next();
                    }

                });
            }    


			var onShowWalkthrough = $rootScope.$on('walkthrough:show', function (opts) {
            	$scope.start();
        	});
            
			var onHideWalkthrough = $rootScope.$on('walkthrough:hide', function () {
				if(overlay){
	            	overlay.render($(window).outerWidth(), $(window).outerHeight(), 0, $(window).scrollTop());
	            	overlay.hide();
				}
				$scope.activeStep = 0;
        	});

            $scope.steps = [];
            $scope.activeStep = 0;

            $scope.getStepTemplate = function(){
            	if($scope.visible)
            		return $scope.steps[$scope.activeStep].templateUrl;
            }

            $scope.getStepContent = function(){
                if($scope.visible){
                    var templateElement = $('#' + $scope.steps[$scope.activeStep].templateId);
                    console.log(templateElement);
                    if(templateElement)
                        return templateElement.html();
                    else
                        return 'Walkthrough step is not configured.';
                }
            }

            this.addStep = function(step){
                //prevent duplicates and steps defined in repeater
                var exists = _.filter($scope.steps, function(item){
                    if(item.templateId == step.templateId || (step.groupId && item.groupId == step.groupId)){
                        return item;
                    }
                });

                if(exists.length == 0){

                    //set step order according to element position inside 'walkthrough-content' element 
                    var index = 0;

                    _.each($('#walkthrough-content').children(), function(item){
                        if(item.id == step.templateId){
                            step.order = index;
                            step.position = $(item).attr('position') || step.position;
                        }
                        index++; 
                    });

                    $scope.steps.push(step);
                }
            }

            $scope.start = function(){                           
            	$scope.steps = _.sortBy($scope.steps, function(step) { return step.order; })
        		$scope.select($scope.steps[0]);
            }

			$scope.next = function(){
				$scope.activeStep++;
                if($scope.activeStep > $scope.steps.length - 1){
                    console.log($scope.activeStep);
                    $scope.finish();
                }
                else{
        		    $scope.select($scope.steps[$scope.activeStep]);
                }
            }

			$scope.prev = function(){
				$scope.activeStep--;
        		$scope.select($scope.steps[$scope.activeStep]);
            }

			$scope.finish = function(){
            	overlay.render($(window).outerWidth(), $(window).outerHeight(), 0, $(window).scrollTop());
				overlay.hide();
				$scope.activeStep = 0;
            }            
            
            $scope.$on('$destroy', function () {
            	
                // unbind broadcast event
                onShowWalkthrough(); 
                
                if (overlay)
                    overlay.remove();
                
                if(dialog)
            		dialog.remove();

                $(window).unbind('resize', function() {});

                $scope.steps= [];

                overlay = null;
				dialog = null;
            });
        }]
    }
}])
.directive('walkthroughStep', ['$rootScope', '$parse', function ($rootScope, $parse) {
    return {
        require: '^walkthrough',
        //scope: { config: '=walkthroughStep' },
        link: function link($scope, $elem, $attrs, parentController) {

            // target
            // templateId
            // templateUrl
            // position
            // order
            
            $scope.config = $parse($attrs.walkthroughStep)($scope);

        	var stepConfig = angular.extend({ target: $elem[0] }, $scope.config);
            parentController.addStep(stepConfig);
        }
    };
}])
.run(['$rootScope', function($rootScope){
    
    $rootScope.showWalkthrough = function(evt){
        $rootScope.$broadcast('walkthrough:show', true);
    }
    
}])