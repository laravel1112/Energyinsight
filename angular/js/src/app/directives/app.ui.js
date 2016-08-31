angular.module('app.ui', [])
.directive('dialogPrompt', ['$rootScope', '$parse', '$compile', '$injector', function ($rootScope, $parse, $compile, $injector) {
    return {
        restrict: "EA",
        scope: { config: '=dialogPrompt'},
        link: function ($scope, $element, $attrs) {

            var cTemplate;
            //$scope.config = $parse($attrs.dialogPrompt)($scope);

            var initPrompt = function(){
                $scope.config = $parse($attrs.dialogPrompt)($scope);
                if(!$scope.config) return;
                
                $scope.config.show = function(){ $scope.open();}
                $scope.config.hide = function(){ $scope.close();}
            }
            initPrompt();

            if(!$scope.config) return;

            $scope.open = function(){

                var container = $scope.config.containerID ? $('#' + $scope.config.containerID) : $($element);
                //var childScope = angular.element(container).scope();

                var template =
                    '<div class="flex flex-row flex-center flex-absolute" style="flex-self-center" ng-show="config.isVisible">' +
                    '   <form name="myForm" class="flex flex-resize">' + 
                    '       <div class="dialog-prompt-backdrop" ng-click="config.onCancel()"></div>' + 
                    '       <div class="panel panel-embedded panel-light panel-holo dialog-prompt ma flex flex-column flex-self-center">'+
                    '           <div class="heading"><h3 ng-bind="config.title"></h3></div>' +
                    '           <div class="body p15" ng-include="\'' + $scope.config.view + '\'" ' + ($scope.config.ctrl ? ' ng-controller="' + $scope.config.ctrl + '" ' : ' ') + '></div>' +
                    '           <div class="footer p15" ng-hide="config.hideFooter">' +
                    '               <button class="btn btn-default fr" ng-click="config.onOk()" ng-disabled="myForm.$invalid ' + ($scope.config.isClean ? ' || config.isClean()' : '') + '">OK</button>' +
                    '               <button class="btn btn-link fr" ng-click="config.onCancel()">CANCEL</button>' +
                    '           </div>' +
                    '       </div>' +
                    '   </form>' +
                    '</div>';

                cTemplate = $compile(template)($scope);
                angular.element(container).append(cTemplate);
                $scope.config.isVisible = true;
            }

            $scope.close = function(){
                $scope.config.isVisible = false; 
                if(cTemplate)
                    cTemplate.remove();
            }

            $scope.$on('$destroy', function(){
                if(cTemplate)
                    cTemplate.remove();
            });
        }
    };
}])
.directive('dialogPromptContainer', ['$rootScope', '$parse', '$compile', '$injector', function ($rootScope, $parse, $compile, $injector) {
    return {
        require: '^dialogPrompt',
        link: function($scope, $element, $attrs, parentCtrl){


        }
    }
}])
.directive('nanoscroll', ['$timeout', function ($timeout) {
    return {
        link: function (scope, elem, attrs, ctrl) {
            $timeout(function () {
                $(elem).nanoScroller({preventPageScrolling: true})    
            }, 5000);
        }
    }
}])
.directive('postRender',['$timeout', function (timer) {
    return {
        link: function (scope, elem, attrs, ctrl) {
            timer(function () {
                $('.nano').nanoScroller({preventPageScrolling: true})    
             }, 2000);
        }
    }
}])
.directive('confirmOnExit', ['$parse', '$rootScope', function($parse, $rootScope) {
    return {
        link: function($scope, elem, attrs) {

            // window.onbeforeunload = function(){
            //     $scope.formName = $parse(attrs.name)($scope);
            //     if ($scope.formName.$dirty) {
            //         return "Would you like to discard changes?";
            //     }
            // }
            $rootScope.$on('$stateChangeStart', function(event, next, current) {
                $scope.formName = $parse(attrs.name)($scope);
                if ($scope.formName && $scope.formName.$dirty) {
                    if(!confirm("Would you like to discard changes?")) {
                        event.preventDefault();
                    }
                }
            });
        }
    };
}])
.directive('expandableList', ['$rootScope', '$window', '$timeout', '$animateCss', function($rootScope, $window, $timeout, $animateCss){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: { items: '=' }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        // restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        template: 
            '<div>' +
            '   <ul class="expandableList">' +
            '       <li ng-show="items.length == 0" style="text-align=center">---</li>' +
            '       <li ng-repeat="item in items" ng-bind="item.text" ng-click="onClick(item, $index, $event)"></li>' +
            '   <ul>' +
            '</div>',
        // templateUrl: '',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, iElm, iAttrs, controller) {
            
            $scope.collapsed = true;
            
            var listTop = $(iElm).offset().top;
            $(iElm).find('ul').css({transition: 'all 1s ease'});

            var itemHeight = 0;

            // Init
            $(iElm[0]).css({ overflow: 'hidden', height: '0px', transition: 'all 1s ease'});
            // item.find("li").each(function () {
                
            // });

            angular.element($window).bind('resize', function() {
                if(!$scope.collapsed)
                {
                    $timeout(function(){
                        listTop = $(iElm).offset().top;

                        var listHeight = itemHeight * $scope.items.length;
                        var listHeightMax = $(window).height() - listTop;
                        var listHeightVisible = listHeight  > listHeightMax ? listHeightMax : listHeight;

                        // Adjust list to visible height 
                        $(iElm).css({ height: listHeightVisible });
                    }, 0);
                }
            })

            $scope.onClick = function(item, index, $event){

                itemHeight = $($event.target).outerHeight();

                var listHeight = itemHeight * $scope.items.length;

                // TODO: Enable page scroll calculation 
                // $(window).scroll(function() { //when window is scrolled
                // log(eTop - $(window).scrollTop());
                // });

                //var eTop =  //get the offset top of the element
                //eTop - $(window).scrollTop()); //position of the ele w.r.t window


                if($scope.collapsed)
                {
                    $scope.collapsed = false;   

                    var listHeight = itemHeight * $scope.items.length;
                    var listHeightMax = $(window).height() - listTop;
                    var listHeightVisible = listHeight  > listHeightMax ? listHeightMax : listHeight;
                    
                    //expand

                    var foldOuter = $animateCss(iElm,
                        {
                            to: { height: listHeightVisible + 'px' },
                            duration: 1,
                            easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
                        }
                    )

                    var inner = iElm[0].querySelector('ul');

                    var foldInner = $animateCss(angular.element(inner),
                        {
                          // BUG - If I set `from` I expect it to assign those values immediately and 
                          //       then animate to the `to` values. This does NOT happen!
                          //from    : {transform: 'translateY('+listHeightVisible+'px)'},
                          to      : {transform: 'translateY(0px)'},
                          duration: 1,
                          easing: 'cubic-bezier(0.77, 0, 0.175, 1)'
                        }
                    );

                    foldInner.start().then(function(){
                        console.log('expanding inner done');
                    });

                    foldOuter.start().then(function(){
                        console.log('expanding outer done');
                    }); 
                }
                else
                {
                    $scope.collapsed = true;   

                    var transformY = itemHeight * index * -1;

                    //collapse
                    
                    var itemTop = index * itemHeight;

                    var outer = $animateCss(iElm,
                        {
                            to: { height: itemHeight + 'px' },
                            duration: 1,
                            easing: 'cubic-bezier(0.77, 0, 0.175, 1)'
                        }
                    );

                    var inner = iElm[0].querySelector('ul');
                    var inner = $animateCss(angular.element(inner),
                        {
                          to      : { transform: 'translateY(' + transformY + 'px)' },
                          duration: 1,
                          easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
                        }
                    );

                    inner.start().then(function(){
                        $timeout(function(){
                            console.log('folding inner done');
                        })
                    }); 

                    outer.start().then(function(){
                        $timeout(function(){
                            console.log('folding outer done');
                            $rootScope.$state.go(item.href, $rootScope.$stateParams);
                        })
                    });    
                     
                }

            }

            $scope.$watch('items', function(){
                if(!$scope.items || $scope.items.length == 0)
                    return;

                $timeout(function(){
                    var item = _.max($(iElm).find('li'), function(item){ return $(item).outerHeight(); });
                    itemHeight = $(item).outerHeight();
                    $(iElm[0]).css({ height: itemHeight + 'px' });
                },0);    

            })

        }
    };
}])
.directive('buildingList', ['$rootScope', '$window', '$timeout', '$animateCss', '$templateCache', '$compile', '$http', '$ionicListDelegate', function($rootScope, $window, $timeout, $animateCss, $templateCache, $compile, $http, $ionicListDelegate){
    // Runs during compile
    return {
        scope: { config: '=' },
        replace: false,
        link: function($scope, iElm, iAttrs, controller) {

            var render = function (){
                $http.get($scope.config.template, { cache: $templateCache }).then(function(response) {
                    iElm.html(response.data);
                    $compile(iElm.contents())($scope);
                });
            }

            $scope.onSelect = function(e, item){
                e.preventDefault();
                e.stopPropagation();
                if($scope.config.onSelect)
                    $scope.config.onSelect(item);
            }

            $scope.onEdit = function(item){
                $ionicListDelegate.closeOptionButtons();

                if($scope.config.onEdit)
                    $scope.config.onEdit(item);
            }

            $scope.onClick = function(item, index, e){
                if($scope.config.onClick)
                    $scope.config.onClick(item, index, e);
                item.__selected = true;
            }

            $scope.$watchCollection('config', function(newValue, oldValue, scope) {
                render();                    
            });

            render();
        }
    };
}])
.directive('clickForOptions', ['$ionicGesture',  function($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
             $ionicGesture.on('tap', function(e){

                // Grab the content
                var content = element[0].querySelector('.item-content');

                // Grab the buttons and their width
                var buttons = element[0].querySelector('.item-options');

                if (!buttons) {
                    console.log('There are no option buttons');
                    return;
                }
                var buttonsWidth = buttons.offsetWidth;

                ionic.requestAnimationFrame(function() {
                    content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

                    if (!buttons.classList.contains('invisible')) {
                        content.style[ionic.CSS.TRANSFORM] = '';
                        setTimeout(function() {
                            buttons.classList.add('invisible');
                        }, 250);                
                    } else {
                        buttons.classList.remove('invisible');
                        content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
                    }
                });     

            }, element);
        }
    };
}])

.directive('lazyHighcharts', ['$compile', '$timeout', '$rootScope', function($compile, $timeout, $rootScope) {
    return {
        scope: { config: '=lazyHighcharts' },
        link: function ($scope, element, attrs) {
            var tmpl;

            $scope.$watch('config', function (newOptions, oldOptions, scope) {
                
                //if (newOptions === oldOptions) return;
                $scope.chartOptions1 = {};
                
                //console.log('lazy-highcharts config changed:', newOptions);

                $timeout(function(){
                    if(tmpl){
                        angular.element(tmpl).remove();    
                    }


                    $scope.chartOptions1 = newOptions;

                    var html = '<highchart config="chartOptions1" class="flex-absolute" style="top: 15px; right: 15px; bottom: 15px; left: 15px;" highcharts-panning></highchart>'
                    tmpl = $compile(html)($scope);
                    angular.element(element).append(tmpl);

                    $timeout(function(){
                        $rootScope.resize();
                    })                    
                })

            }, true);
        }
    };
}])
/***************************************************
 * 
 * Splitter
 * 
 **************************************************/ 

.directive('resizable',[ '$document', '$compile', '$parse', '$rootScope', function($document, $compile, $parse, $rootScope) {
    return {
        link: function ($scope, $element, $attrs) {

            $scope.lastWidth = 500;

            // Resizer

            var resizerTemplate = angular.element('<div id="sidebar-resizer"></div>');
            var resizer = angular.element($compile(resizerTemplate)($scope));
            $($element).append(resizer);

            // get config
            $scope.config = $parse($attrs.resizable)($scope);

            if ($scope.config.current > 0) {
                $($element).css({
                    'max-width': $scope.config.current + 'px',
                });
            }

            // Capture drag

            resizer.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);

                //TODO: upgrade to $broadcast if nessesary
                $rootScope.disableListSwipping = true;
            });



            $scope.show = function(newVal) {
                if(newVal){
                    $($element).css({'max-width': $scope.lastWidth + 'px'});
                } else{
                    $($element).css({'max-width': 0 + 'px'});
                }

            }


            // Resize element

            function mousemove(event) {
                //if ($attrs.resizer == 'vertical') {
                    // Handle vertical resizer
                    var x = event.pageX;
                    var offset = $($element).offset();

                    x = x-offset.left+15; // +15px negative margin
                    
                    //set limits
                    if ($scope.config.max && x > $scope.config.max) {
                       x = $scope.config.max;
                    }

                    if ($scope.config.min && x < $scope.config.min) {
                       x = $scope.config.min;
                    }

                    resizer.css({
                        'left': x + 'px'
                    });

                    $($element).addClass('resizing');

                    $($element).css({
                        'max-width': x + 'px'
                    });
                    $scope.lastWidth = x;

                // } else {
                //     // Handle horizontal resizer
                //     var y = window.innerHeight - event.pageY;

                //     resizer.css({
                //         bottom: y + 'px'
                //     });

                //     $($attrs.resizerTop).css({
                //         bottom: (y + parseInt($attrs.resizerHeight)) + 'px'
                //     });
                //     $($attrs.resizerBottom).css({
                //         height: y + 'px'
                //     });
                // }
            }

            // Unsubscribe from drag

            function mouseup() {
                $($element).removeClass('resizing');
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                $rootScope.disableListSwipping = false;
            }

        }
    }
}])


/***************************************************
 * 
 * Sketch related
 * 
 **************************************************/ 
.filter('groupByFirstWord', [ '$parse', 'filterWatcher', function ( $parse, filterWatcher ) {
    return function (collection, property) {

        if(!collection || collection.length == 0) {
            return collection;
        }
        //var result = _groupBy(collection);

      return filterWatcher.isMemoized('groupByFirstWord', arguments) || filterWatcher.memoize('groupByFirstWord', arguments, this,
          _groupBy(collection, $parse(property)));


        function _groupBy(collection) {
                var result = {};
                var prop;

                _.forEach(collection, function( elm ) {
                    //prop = getter(elm);
                    
                    var r = /^([\w\-]+)/;
                    var m = r.exec(elm.url);
                    
                    //prop = m[1];
                    if(!m) return;

                    if(!result[m[0]]) {
                        result[m[0]] = [];
                    }
                  result[m[1]].push(elm);
            });
            return result;
        }

    }
}])
.directive('inspector', ['$rootScope', '$ionicGesture', '$timeout', '$compile', '$requestLog', '$ionicModal', function($rootScope, $ionicGesture, $timeout, $compile, $requestLog, $ionicModal) {
    return {
        link: function(scope, element, attrs){
            
            scope._isvisible = true;
            scope.data = $requestLog.list();

            scope.$watchCollection($requestLog.list, function(newValue){
                scope.data = newValue;
            });
            
            var inspectorTemplate = angular.element(
                '<div class="inspector" ng-show="_isvisible">' +
                '   <ion-list>' + 
                '       <ion-item ng-repeat="(key, value) in data | groupByFirstWord: \'url\'"" ng-click="browse(key)">' +
                '               <span ng-bind="key"></span>' +
                '               <span ng-bind="value.length"></span>'  +
                '        </ion-item>' + 
                '   </ion-list>' + 
                '</div>');
            var inspectorElement = angular.element($compile(inspectorTemplate)(scope));
            var body = angular.element(document).find('body');
            body.append(inspectorElement);


            $ionicModal.fromTemplateUrl('template/modal.html', {
                scope: scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                scope.modal = modal;
            });

            scope.gridData = [];
            scope.browse = function(key){

                scope.gridData = _.filter(scope.data, function(item){
                    console.log('item.url ' , item.url);
                    var m = /^([\w\-]+)/.exec(item.url);
                    return m && key == m[0];
                });

                scope.gridOptions.columnDefs = [
                    {headerName: "url", field: "url", width: 100},
                    {headerName: "data", field: "data", width: 100}
                ]; 
                scope.gridOptions.api.setColumnDefs(scope.gridOptions.columnDefs);
                scope.gridOptions.api.setRowData(scope.gridData);

                scope.modal.show();

                $timeout(function(){
                    scope.gridOptions.api.sizeColumnsToFit();
                });
            }

            var lastTarget;
            var processHover = function(e){
                if(e.target == lastTarget) return;

                var appElement = $(e.target);
                var appScope = angular.element(appElement).scope();

                scope.$apply(function(){
                    lastTarget = e.target;
                    scope.target = (e.target ? $(e.target)[0].tagName : '');
                })

            }

            $(document).bind("mousemove", _.throttle(processHover, 500)); 
            $(document).bind("mousemove", function(e){
                // $(inspectorElement).css('cssText', $(inspectorElement).attr('style') + 
                //          'position: fixed;' +
                //          'top: ' + (e.clientY + 10) + 'px!important;' + 
                //          'left: ' + (e.clientX + 10) + 'px!important;' + 
                //          'width: 300px!important;' + 
                //          'height: 200px!important;' + 
                //          ''
                // );
            });

            //document.oncontextmenu = function() {return false;};

            $(document).mousedown(function(e){ 
                if( e.button == 2 ) { 
                  console.log('scope: ', angular.element(lastTarget).scope()); 
                  return false; 
                } 
                return true; 
            }); 

            $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
                $requestLog.add({url: '--- $stateChangeStart ---'});
            });








            var columnDefs = [
                {headerName: "Date", field: "date", width: 100},
                {headerName: "Value", field: "value", width: 100},
            ];

            scope.gridOptions = {
                enableColResize: true,
                columnDefs: columnDefs,
                rowData: [],
            };



        }
    }

}])



.directive('adjustable', ['$rootScope', '$ionicGesture', '$timeout',  function($rootScope, $ionicGesture, $timeout) {
    return {
        link: function(scope, element, attrs){

            //if($rootScope.layoutAdjustable) {
                var offset = $(element).offset();
                var width = $(element).outerWidth();
                var height = $(element).outerHeight();

                //fix element on screen
                $(element[0]).css('cssText', $(element).attr('style') + 
                                         ';position: fixed;' +
                                         'top: ' + offset.top + 'px!important;' + 
                                         'right: ' + offset.right + 'px!important;' + 
                                         'width: ' + width + 'px!important;' + 
                                         'height: ' + height + 'px!important;' + 
                                         ''
                                );

            //}


        }
    }

}])

    
// To create a empty resizable and draggable box
.directive("ceBoxCreator", function ($document, $compile) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                $element.on("click", function ($event) {
                    
                    var newNode = $compile('<div class="contentEditorBox" ce-drag ce-resize></div>')($scope);
                    placeNode(newNode, $event.pageY - 25, $event.pageX - 25);
                    angular.element($document[0].body).append(newNode);
                });
            }
        }
    })
// To manage the drag
.directive("dragOuter", ['$rootScope', '$document', '$compile', function ($rootScope, $document, $compile) {
        return {
            scope: { element: '=dragOuter' },
            link: function ($scope, $element, $attr) {
                var target = null;
                $scope._isvisible = false;
                
                // create highligter
                var outer = angular.element('<div class="outer fadein fadeout" ng-show="_isvisible" />');
                var bottombox = angular.element("<div />").css("height", 1).appendTo(outer);
                var overlayTemplate = angular.element($compile(outer)($scope));
                var body = angular.element(document).find('body');
                body.append(overlayTemplate);
                
                $scope.isvisible = function () {
                    return $scope._isvisible;
                };
                
                $element.bind("mousedown", function ($event) {
                    $('html').addClass('drag-add');  // set waiting
                    $scope._isvisible = true;
                    $document.bind("mousemove", mousemove);
                    $document.bind("mouseup", mouseup);
                });
                
                function mousemove($event) {
                    
                    // prevent highlight elements            
                    if ($event.target == bottombox[0]) return;
                    
                    // keep destination element
                    target = $event.target;
                    
                    // position highlight
                    var offset = $($event.target).offset();
                    var height = $($event.target).outerHeight();
                    var width = $($event.target).outerWidth();
                    bottombox.css({
                        top: offset.top + height,
                        left: offset.left,
                        width: width
                    });
                }
                
                function mouseup($event) {
                    $scope.$apply(function () {
                        $scope._isvisible = false;

                        var eScope = angular.element($event.target).scope();
                        if (eScope.element == null) return;
                        
                        $rootScope.$broadcast('element:add', { source: $scope.element, destination: eScope.element });

                        eScope.element.properties.elements.push(
                            {
                                title: 'Test',
                                directive: $scope.element,
                                inspectable: true,
                                replace: true,
                                properties: {
                                    cssClass: '',
                                    elements: []
                                }
                            }
                        );

                        //var template = '<div ' + $scope.element + '></div>';
                        //var cTemplate = $compile(template)($scope);
                        //$(target).append(cTemplate);
                    });

                    $('html').removeClass('drag-add');
                    $document.unbind("mousemove", mousemove);
                    $document.unbind("mouseup", mouseup);
                }
            }
    }
}])
// To manage the drag
.directive("ceDrag", function ($document) {
        return function ($scope, $element, $attr) {
            var startX = 0,
                startY = 0,
                startWidth = 0,
                startHeight = 0;

            
            var newElement = angular.element('<div class="draggable"></div>');
        
            var parentWidth = $($element).parent().width();
                parentHeight = $($element).parent().height();
            
            $element.append(newElement);
            newElement.on("mousedown", function ($event) {
                event.preventDefault();
                
                // To keep the last selected box in front
                angular.element(document.querySelectorAll(".contentEditorBox")).css("z-index", "0");
                $element.css("z-index", "1");
                
                startX = $event.pageX - $element[0].offsetLeft;
                startY = $event.pageY - $element[0].offsetTop;
            
                startWidth = $element[0].offsetWidth;
                startHeight = $element[0].offsetHeight;

                $document.on("mousemove", mousemove);
                $document.on("mouseup", mouseup);
            });
            
            function mousemove($event) {
                var top = $event.pageY - startY > 0 ? $event.pageY - startY : 0;
                var left = $event.pageX - startX > 0 ? $event.pageX - startX : 0;
            
                //if(top + startHeight > parentHeight)
                //    top = parentHeight - startHeight;
            
                //if (left + startWidth > parentWidth)
                //    left = parentWidth - startWidth;

                placeNode($element , top, left);
            }
            
            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        };
    })
    
// To manage the resizers
.directive("ceResize", function ($document) {
        return function ($scope, $element, $attr) {
            //Reference to the original 
            var $mouseDown;
            
            // Function to manage resize up event
            var resizeUp = function ($event) {

                var lowest = $mouseDown.top + $mouseDown.height,
                    top = $event.pageY - $mouseDown.pageY + $mouseDown.top > lowest ? lowest : $event.pageY - $mouseDown.pageY + $mouseDown.top ,
                    height = $mouseDown.top - top + $mouseDown.height;
            
                    $element.css({
                        top: top + "px",
                        height: height + "px"
                    });
            };
            
            // Function to manage resize right event
            var resizeRight = function ($event) {
            
                var leftest = $element[0].offsetLeft,
                    width = $mouseDown.pageX > leftest ? $event.pageX - $mouseDown.pageX + $mouseDown.width : 0;
            
                    //width = width > $($element).parent().width() ? $($element).parent().width() : width;
                    width = width > $(window).width() ? $(window).width() : width;

                $element.css({
                    width: width + "px"
                });
            };
            
            // Function to manage resize down event
            var resizeDown = function ($event) {
                var uppest = $element[0].offsetTop,
                    height = $event.pageY > uppest ? $event.pageY - $mouseDown.pageY + $mouseDown.height : 0;
                
                $element.css({
                    height: height + "px"
                });
            };
            
            // Function to manage resize left event
            function resizeLeft($event) {
                var rightest = $mouseDown.left + $mouseDown.width,
                    left = $event.pageX - $mouseDown.pageX + $mouseDown.left > rightest ? rightest : $event.pageX - $mouseDown.pageX + $mouseDown.left,
                    width = $mouseDown.left - left + $mouseDown.width;
            
                if(left < 0) {
                    width += left;
                    left = 0;
                }

                $element.css({
                    left: left + "px",
                    width: width + "px"
                });
            };
            
            var createResizer = function createResizer(className , handlers) {
                
                newElement = angular.element('<div class="' + className + '"></div>');
                $element.append(newElement);
                newElement.on("mousedown", function ($event) {
                    
                    $document.on("mousemove", mousemove);
                    $document.on("mouseup", mouseup);
                    
                    //Keep the original event around for up / left resizing
                    $mouseDown = $event;
                    $mouseDown.top = $element[0].offsetTop;
                    $mouseDown.left = $element[0].offsetLeft
                    $mouseDown.width = $element[0].offsetWidth;
                    $mouseDown.height = $element[0].offsetHeight;
                
                    function mousemove($event) {
                        event.preventDefault();
                        for (var i = 0; i < handlers.length ; i++) {
                            handlers[i]($event);
                        }
                    }
                    
                    function mouseup() {
                        $document.off("mousemove", mousemove);
                        $document.off("mouseup", mouseup);
                    }
                });
            }
            
            createResizer('sw-resize' , [resizeDown , resizeLeft]);
            createResizer('ne-resize' , [resizeUp   , resizeRight]);
            createResizer('nw-resize' , [resizeUp   , resizeLeft]);
            createResizer('se-resize' , [resizeDown , resizeRight]);
            createResizer('w-resize' , [resizeLeft]);
            createResizer('e-resize' , [resizeRight]);
            createResizer('n-resize' , [resizeUp]);
            createResizer('s-resize' , [resizeDown]);
        };

    })
.config(['$provide', function($provide) {

    $provide.decorator('$controller', ['$delegate', function($delegate) {

        return function (constructor, locals) {

            // controller name
            var name = arguments[0];
            
            // controller
            var obj = arguments[1];
            
            if(typeof name === 'string'){
                if(arguments[1].$scope.controllerName)
                    arguments[1].$scope.controllerName += ' ' + name;
                else{
                    arguments[1].$scope.controllerName = name;
                }
            }
            var controller = $delegate.apply(null, arguments);

            return angular.extend(function () {
                // if(typeof name === 'string'){
                //     if(locals.$scope.controllerName)
                //         locals.$scope.controllerName += ', ' + name;
                //     else
                //         locals.$scope.controllerName = name;

                // }
                return controller();
            }, controller);
        }

    }]);
}])
.run(['$templateCache', function($templateCache){
    $templateCache.put("template/energy-unit-groupped-list.html",
            '<div class="flex flex-absolute">' +
            '<ion-list ng-repeat="(key, value) in config.datasource() | filter: {type : 1} |  groupBy: \'campus\'" show-delete="false" can-swipe="true">' +
            '   <ion-item class="item-divider">' +
            '       <i class="svg-buildings"></i>' +
            '       <h3 ng-bind="key"></h3>' +
            '   </ion-item>' +
            '   <ion-item ng-mouseenter="config.onMouseEnter(e, item)" ng-mouseleave="config.onMouseLeave(e, item)" ng-repeat="item in value" ng-click="onClick(item, $index, $event)" md-ink-ripple click-for-options ng-class="{ selected: item.__selected, highlighted: item.__highlighted }" ng-if="item.buildingparam"> ' +
            '       <i class="svg-building"></i>' +
            '       <h3 ng-bind="item.name"></h3>' +
            '       <uib-rating class="rating" ng-model="item.value" max="5" state-on="\'icon-star\'" state-off="\'icon-star o3\'" readonly="true">{{item.value}}</uib-rating>' +
            // '       <p ng-bind-html="item.content | to_trusted" style="padding-left: 100px">...</p>' +
            '   </ion-item>' +
            '</ion-list> ' +
            '</div>' +
    '');

    $templateCache.put("template/tree-list.html",
            '<div class="flex flex-absolute" style="top: 56px">' +
            '<ion-list class="energyUnitList">' + 
            '    <ion-item ng-repeat="item in config.data" ng-click="onClick(item)" md-ink-ripple>' + 
            '       <i ng-if="item.type == 1" class="icon-building fs19"></i>' +
            '       <i ng-if="item.type == 2" class="icon-building-6 fs19"></i>' +
            '       <i ng-if="item.type == 3" class="icon-gauge-4 lh24" ng-style="{ \'color\': item.color }"></i>' +
            '       <i ng-if="item.type == 4" class="icon-schedule-2 lh24"></i>' +
            '       <i ng-if="item.type == 7" class="icon-temperature lh24"></i>' +
            '       {{item.name}}' + 
            '       <span class="item-note">' + 
            
            '       </span>' + 
            '       <button ng-if="item.type == 3 && !item.hasNoChildren" class="bar-light button select" ng-click="onSelect($event, item)" style="position: absolute;z-index:5; right: 0; top: 0; height: 100%; align-items: center;display:inline-flex;text-align:center;">' + 
            '           <i class="icon-circle" ng-class="{active: item.color}" ng-style="{background: node.color }"></i>' +        
            '       </button> ' +
            '       <ion-option-button class="button-positive" ng-click="onEdit(item)">Edit</ion-option-button>' +
            '    </ion-item>' + 
            '</ion-list>' +
    '');

    $templateCache.put("template/sitemap.html",
        '<div class="flex flex-absolute list-group sitemap-content">' +
            '<ion-list ng-repeat="(key, value) in config.data" show-delete="false" can-swipe="true">' +
            '   <ion-item class="item-divider">' +
            //'       <i class="icon-minus-square-o"></i>' +
            '       <span ng-bind="key"></span>' +
            '   </ion-item>' +
            '   <ion-item ng-repeat="item in value" ng-click="onClick(item, $index, $event)" ng-class="{selected: item.__selected}" md-ink-ripple click-for-options>' +
            '       <i ng-class="item.icon"></i>' +
            '       <h3 ng-bind="item.name"></h3>' +
            '   </ion-item>' +
            '</ion-list> ' +
        '</div>' +
    '');

}])



function placeNode(node, top, left) {
    $(node).css({
        position: "fixed",
        top: top + "px",
        left: left + "px",
    });
}



