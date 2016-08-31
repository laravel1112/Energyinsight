angular.module('ui.tree.directives', [])
    .directive('uiTreeWrapper', function () {
      return {
            controller: ['$scope', '$rootScope', '$timeout', '$window', function($scope, $rootScope, $timeout, $window) {
                $scope.initialWidth = 250;
                $scope.wrapperWidth = 250; 
                $scope.wrapperStyle = {'min-width': '250px'};

                // child directive reporting
                this.reportWidest = function(childWidth)    {
                    //$scope.wrapperWidth = childWidth + 40 > $scope.wrapperWidth ? childWidth + 40 : $scope.wrapperWidth;
                    //$scope.wrapperStyle['min-width'] = $scope.wrapperWidth + 'px';

                    $timeout(function(){
                        var widest = $scope.initialWidth;
                        $('[ui-tree-wrapper]').find('[data-collapsed] span:visible').each(function(){
                            var minWidth = $(this).offset().left + $(this).width();
                            widest = widest > minWidth ? widest : minWidth;  
                        });
                        $scope.wrapperStyle['min-width'] = (widest + 40) + 'px';
                        $scope.resize();
                    });

                };

                $scope.resize = function(){
                    $timeout(function () {
                        $rootScope.$broadcast('layout-resize');
                    });
                }

                // expand on hover 
                $scope.onMouseOver = function(){
                    //$scope.wrapperStyle = {'min-width': $scope.wrapperWidth + 'px'};
                    $scope.resize();
                }

                // collapse on blur 
                $scope.onMouseLeave = function(){
                    //$scope.wrapperStyle = {'min-width': $scope.wrapperWidth + 'px'};
                    // TODO: Find intuitive way to shrink panel, likely with pin button
                    // $scope.wrapperStyle = {'min-width': $scope.initialWidth + 'px'};
                    $scope.resize();
                }
            }],
        }
    })
    .directive('uiTreeSize', ['$parse', '$timeout', '$window', function ($parse, $timeout, $window) {
        return {
            replace: false,
            require: '^uiTreeWrapper',
            link: function ($scope, element, attrs, ctrl) {

                $scope.$watch(function() {return element.attr('data-collapsed'); }, function(newValue){
                    //await expand/collapse completes
                    $timeout(function(){

                        // Version 1: grow/shrink
                        // var widest = 0;
                        // //find and report widest to parent
                        // $(element).find('span:visible').each(function(){
                        //     var minWidth = $(this).offset().left + $(this).width();
                        //     var widest = widest > minWidth ? widest : minWidth;  
                        //     ctrl.reportWidest(minWidth);
                        // });

                        // Version 2: grow/shrink on expand/collapse
                        ctrl.reportWidest();

                    })
                });

            }
        }
    }])

    .directive('uiGridDatetimeEdit', ['uiGridConstants', 'uiGridEditConstants', '$compile', function (uiGridConstants, uiGridEditConstants, $compile) {
            return {
                scope: true,
                compile: function () {
                    return {
                        pre: function ($scope, $elm, $attrs) {
                            console.log('pre');
                        },
                        post: function ($scope, $elm, $attrs) {

                            //set focus at start of edit
                            $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                                console.log('Custom Directive: Begun the cell event');

                                if($('#uiGridDateEditCtrl').length){
                                    console.log('element exists');
                                }else{
                                    var offset = $($elm).offset();
                                    console.log(offset);
                                    var ctrl = $(
                                        '<div id="uiGridDateEditCtrl" class="ui-grid-datetime-ctrl" style="position: fixed;">' +
                                        '   <uib-datepicker template-url="template/daterange-datepicker.html" ng-model="row.entity[\'date\']" starting-day="1" show-weeks="false" class="datepicker"></uib-datepicker>' +
                                        '</div>');
                                    ctrl.css({ 
                                        top:offset.top + $($elm).outerHeight(), 
                                        left: offset.left, 
                                        width: $($elm).width(), 
                                        height: '200px',
                                        'z-index': 10
                                    });
                                    ctrlTemplate = angular.element($compile(ctrl)($scope));
                                    $('body').append(ctrlTemplate);
                                }
                                

                                // $elm[0].focus();
                                // $elm[0].style.width = ($elm[0].parentElement.offsetWidth - 1) + 'px';


                                // //for bootstrap dropdown
                                // $elm.on('change', function (evt) {
                                //     console.log('Custom Directive: blur() :  the dropdown just blurred');
                                //     $scope.stopEdit(evt);
                                // });


                                // //for boostrap datepicker 
                                // $elm.on('blur', function (evt) {
                                //     console.log('Custom Directive: blur() :  the calender blurred using onblur()');
                                //     $scope.stopEdit(evt);
                                // });
                            });


                            $scope.stopEdit = function (evt) {
                                // no need to validate a dropdown - invalid values shouldn't be
                                // available in the list
                                console.log('Custom Directive: stopEdit() :  Now stopping the edit functionality');
                                //$scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                            };

                            $elm.on('keydown', function (evt) {
                                // switch (evt.keyCode) {
                                //     case uiGridConstants.keymap.ESC:
                                //         evt.stopPropagation();
                                //         $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                                //         break;
                                //     case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                                //         $scope.stopEdit(evt);
                                //         break;
                                //     case uiGridConstants.keymap.LEFT:
                                //         $scope.stopEdit(evt);
                                //         break;
                                //     case uiGridConstants.keymap.RIGHT:
                                //         $scope.stopEdit(evt);
                                //         break;
                                //     case uiGridConstants.keymap.UP:
                                //         evt.stopPropagation();
                                //         break;
                                //     case uiGridConstants.keymap.DOWN:
                                //         evt.stopPropagation();
                                //         break;
                                //     case uiGridConstants.keymap.TAB:
                                //         $scope.stopEdit(evt);
                                //         break;
                                // }
                                return true;
                            });
                        }
                    }
                },
                link: function($scope, $elm, $attrs){
                    console.log('link');
                }
        };
    }]);  