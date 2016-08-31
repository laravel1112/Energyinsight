angular.module("template/page.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/page.html",
      '<div>' +
      '<div class="header">' +
      '    <h1>Header</h1>' +
      '    <span>TODO: Add date and author</span>' +
      '</div>' +
      '<div class="content">' +
      '     <div ng-repeat="item in model.properties.elements" element="item" ng-model="item"></div>' +
      '</div>' +
      '<div class="page-options">' +
      '    <div class="btn-group" role="group" aria-label="...">' +
      '        <div class="btn-group" dropdown is-open="status.isopen">' +
      '            <button id="single-button" type="button" class="btn btn-default" dropdown-toggle>' +
      '                <i class="fa fa-bars"></i>' +
      '            </button>' +
      '            <ul class="dropdown-menu" role="menu" aria-labelledby="single-button">' +
      '                <li role="menuitem"><a href="#" ng-click="addPage()">Add page</a></li>' +
      '                <li class="divider"></li>' +
      '                <li role="menuitem"><a href="#">Delete</a></li>' +
      '            </ul>' +
      '        </div>' +
      '    </div>' +
      '</div>' +
      '</div>' +
    '');
}]);
angular.module("template/browser.frame.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/browser.frame.html",
'               <div class="browser-frame">' +
'                    <div class="browser-top-bar">' +
'                        <div class="browser-button-wrapper">' +
'                            <div class="browser-button"></div>' +
'                            <div class="browser-button"></div>' +
'                            <div class="browser-button"></div>' +
'                        </div>' +
'                        <div class="browser-address" inspectable></div>' +
'                    </div>' +
'                    <div class="browser-container" >' +
'                       <div ng-repeat="item in model.properties.elements" element="item"></div>' +
'                    </div>' +
'                </div>' +
        '');
    }]);

// RESERVED: Bootstrap navbar
angular.module("template/navbar.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/navbar.html",
        '<nav class="navbar navbar-default  navbar-static-top">' +
        '    <div class="container-fluid">' +
        '        <div class="navbar-header">' +
        '            <a class="navbar-brand" inspectable>Brand name</a>' +
        '        </div>' +
        '        <div class="nav navbar-nav">' +
        '            <li>' +
        '                <a inspectable>Link 1</a>' +
        '            </li>' +
        '            <li>' +
        '                <a inspectable>Link 2</a>' +
        '            </li>' +
        '            <li>' +
        '                <a inspectable>Link 3</a>' +
        '            </li>' +
        '        </ul>' +
        '        <ul class="nav navbar-nav navbar-right">' +
        '            <li>' +
        '                <a>Sign Up</a>' +
        '            </li>' +
        '        </ul>' +
        '    </div>' +
        '</nav>' +
    '');
    }]);
angular.module("template/navbar-bootstrap.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/navbar-bootstrap.html",
        '<nav inspectable class="navbar navbar-default navbar-static-top">' +
        '    <div class="container-fluid">' +
        '        <div ng-repeat="item in model.properties.elements" element="item" class="nav navbar-nav"></div>' +
        '    </div>' +
        '</nav>' +
    '');
}]);
angular.module("template/unordered-list.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/unordered-list.html",
        '<ul ng-class="model.properties.cssClass" inspectable>' +
        '    <li ng-repeat="item in model.properties.elements" element="item" inspectable></li>' +
        '</ul>' +
      '');
    }]);
angular.module("template/div.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/div.html",
        '<div ng-class="model.properties.cssClass"><div ng-repeat="item in model.properties.elements" element="item" inspectable></div></div>' +
      '');
    }]);
angular.module("template/anchor.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/anchor.html',
            '<a href="" inspectable ng-class="model.properties.cssClass"></a>' +
      '');
    }]);
angular.module("template/textbox.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/textbox.html',
            '<input type="text" ng-model="model.properties.text" inspectable ng-class="model.properties.cssClass"></a>' +
      '');
    }]);

angular.module("template/plain-text.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/plain-text.html',
            '{{model.properties.text}}' +
      '');
    }]);
angular.module("template/placeholder.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put('template/placeholder.html',
            '<div></div>' +
      '');
}]);

angular.module("template/container.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/container.html",
            '<div ng-repeat="element in elements"></div>' +
        '');
}]);


angular.module("template/partials", []).run(["$templateCache", function ($templateCache) {
        
        /************************************
         * 
         *  Create Project DIALOG
         * 
         ***********************************/         
        $templateCache.put("partials/dialog/project/create.html",
              '<div>' +
              '    <form name="dialogForm">' +
              '        <div class="header">' +
              '             <h1>Create New Project</h1>' +
              //'             <a class="close"><i class="fa fa-close"></i></a>' +
              '        </div>' +
              '        <div class="content">' +
              '        <div class="inner">' +
              '             <label>Name</label>' +
              '             <input ng-model="project.name" placeholder="Project Name" required autofocus />' +
              '        </div>' +
              '        </div>' +
              '        <div class="footer">' +
              '             <div class="btn-group pull-right">' +
              '                 <a class="btn btn-link" ng-click="modalOptions.close()">Dismiss</a>' +
              '                 <button class="btn btn-link btn-default" ng-disabled="dialogForm.$invalid" ng-click="modalOptions.ok(project)">Create</button>' +
              '             </div>' +
              '        </div>' +
              '    </form>' +
              '</div>' +
        '');    

        /************************************
         * 
         *  TREE template for DIALOG 
         * 
         ***********************************/         
        $templateCache.put("partials/dialog/tree.html",
            '<div ui-tree data-drag-delay="500">' +
            '   <ol ui-tree-nodes="" ng-model="handler.d" id="tree-root">' +
            '       <li ng-repeat="node in handler.d" ui-tree-node ng-include="\'template/tree-node-simple.html\'"></li>' +
            '   </ol>' +
            '</div>' +
        '');
        

        /************************************
         * 
         *  DIALOG template
         * 
         ***********************************/ 
        $templateCache.put("partials/dialog/dialog.html",
            '<div class="frame rel panel">' +
            '   <h3 ng-bind="handler.state().title" ng-show="handler.state().title"></h3>' +
            '   <partial data="item" handler="handler" class="content"></partial>' +
            '   <div class="footer" ng-show="handler.dialog().buttons">' +
            '      <button ng-show="handler.dialog().buttons.ok" class="btn w75" ng-click="modalOptions.ok(handler.data());">Ok</button>' +
            '      <button ng-show="handler.dialog().buttons.cancel" class="btn w75" ng-click="modalOptions.close();">Cancel</button>' +
            '   </div>' +
            '</div>' +
        '');
        
        /************************************
         * 
         *  TREE template for DIALOG 
         * 
         ***********************************/         
        $templateCache.put("partials/dialog/tree.html",
            '<div ui-tree data-drag-delay="500">' +
            '   <ol ui-tree-nodes="" ng-model="handler.d" id="tree-root">' +
            '       <li ng-repeat="node in handler.d" ui-tree-node ng-include="\'template/tree-node-simple.html\'"></li>' +
            '   </ol>' +
            '</div>' +
        '');
        
        
        /************************************
         * 
         *  TREE NODE template for UI-ROUTER NAVIGATION
         * 
         ***********************************/         
        $templateCache.put("template/tree-node.html",
            '<div ui-tree-handle>' +
            '    <a class="" data-nodrag>' +
            '        <i ng-click="toggle(this)" class="fa" ng-class="{ \'fa-angle-right\': collapsed, \'fa-angle-down\': !collapsed }"></i>' +
            '    </a>' +
            '    <a ui-sref="root.members.projects.proxy.topic({pid:$stateParams.pid, tid:node.id})" ng-click="select(node.id);" ng-dblclick="toggle(this);" ng-class="{selected: isSelected(node.id)}" ng-bind="node.title"></a>' +
            '    <a class="pull-right" data-nodrag ng-click="remove(this)">' +
            '        <i class="ctrl fa fa-trash-o"></i>' +
            '    </a>' +
            '    <a class="pull-right" data-nodrag ng-click="newSubItem(node)" style="margin-right: 8px;">' +
            '        <i class="ctrl fa fa-plus"></i>' +
            '    </a>' +
            '</div>' +
            '<ol ui-tree-nodes="" ng-model="node.nodes" ng-class="{hidden: collapsed}">' +
            '    <li ng-repeat="node in node.nodes" ui-tree-node ng-include="\'template/tree-node.html\'" data-collapsed="true">' +
            '    </li>' +
            '</ol>' +
        '');
        
        
        /************************************
         * 
         *  TREE NODE template for DIALOG
         * 
         ***********************************/         
        $templateCache.put("template/tree-node-simple.html",
            '<div ui-tree-handle>' +
            '    <a class="" data-nodrag>' +
            '        <i ng-click="toggle(this)" class="fa" ng-class="{ \'fa-angle-right\': collapsed, \'fa-angle-down\': !collapsed }"></i>' +
            '    </a>' +
            '    <a ng-click="handler.select(node.id);" ng-dblclick="toggle(this);" ng-class="{selected: isSelected(node.id)}" ng-bind="node.title"></a>' +
            '</div>' +
            '<ol ui-tree-nodes="" ng-model="node.nodes" ng-class="{hidden: collapsed}">' +
            '    <li ng-repeat="node in node.nodes" ui-tree-node ng-include="\'template/tree-node-simple.html\'" data-collapsed="true">' +
            '    </li>' +
            '</ol>' +
        '');

        /************************************
         * 
         *  TREE NODE template for PAGE OBJECTS
         * 
         ***********************************/         
        $templateCache.put("template/tree-node-objects.html",
            '<div ui-tree-handle>' +
            '    <a class="" data-nodrag>' +
            '        <i ng-click="toggle(this)" class="fa" ng-class="{ \'fa-angle-right\': collapsed, \'fa-angle-down\': !collapsed }"></i>' +
            '    </a>' +
            '    <a ng-click="select(this);" ng-dblclick="toggle(this);" ng-class="{selected: isSelected(this)}" ng-bind="node.title"></a>' +
            '</div>' +
            '<ol ui-tree-nodes="" ng-model="node.properties.elements" ng-class="{hidden: collapsed}">' +
            '    <li ng-repeat="node in node.properties.elements" ui-tree-node ng-include="\'template/tree-node-objects.html\'" data-collapsed="true">' +
            '    </li>' +
            '</ol>' +
        '');
        
        /************************************
         * 
         *  
         * 
         ***********************************/         
        $templateCache.put("template/rectangle-sketch.html",
            '<div ce-drag ce-resize class="rectangle-sketch">' +
            '   <div ng-repeat="item in model.properties.elements" element="item"></div>' +
            '</div>' +
        '');

        /************************************
         * 
         *  Table template
         * 
         ***********************************/         

        $templateCache.put("template/table.html",
            '<table class="table table-bordered">' +
            '    <thead>' +
            '        <tr>' +
            '            <th>Table heading</th>' +
            '            <th>Table heading</th>' +
            '            <th>Table heading</th>' +
            '            <th>Table heading</th>' +
            '            <th>Table heading</th>' +
            '            <th>Table heading</th>' +
            '        </tr>' +
            '    </thead>' +
            '    <tbody>' +
            '        <tr>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '        </tr>' +
            '        <tr>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '        </tr>' +
            '        <tr>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '            <td>Table cell</td>' +
            '        </tr>' +
            '    </tbody>' +
            '</table>' +
        '');

}]);

var directives = angular.module("app.directives", ["template/page.html", "template/browser.frame.html", "template/navbar.html", "template/unordered-list.html", "template/div.html", "template/anchor.html", "template/plain-text.html", "template/navbar-bootstrap.html", "template/placeholder.html", "template/partials"])
directives.directive("include", function ($http, $templateCache, $compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes) {
            var templateUrl = scope.$eval(attributes.include);
            $http.get(templateUrl, { cache: $templateCache }).success(
                function (tplContent) {
                    element.replaceWith($compile(tplContent.data)(scope));
                }
            );
        }
    };
});
directives.directive('pageElement', ['$parse', '$rootScope', function ($parse, $rootScope) {
    return {
        replace: true,
        require: '?ngModel',
        templateUrl: 'template/page.html',
        link: function (scope, element, attrs, ctrls) {
            scope.model = $parse(attrs.ngModel)(scope);
                
            scope.addPage = function (){
                $rootScope.$broadcast('page:add');
            }
        }
    };
}]);
directives.directive('browserFrame', ['$parse', function ($parse) {
    return {
        replace: true,
        require: '?ngModel',
        templateUrl: 'template/browser.frame.html',
        link: function (scope, element, attrs, ctrls) {
            scope.model = $parse(attrs.ngModel)(scope);
        }
    };
}]);
directives.directive('navbarBootstrap', ['$parse', '$compile', function ($parse, $compile) {
    return {
        require: '?ngModel',
        replace: true,
        templateUrl: 'template/navbar-bootstrap.html',
        link: function (scope, element, attrs, ctrls) {
            scope.model = $parse(attrs.ngModel)(scope);
            //element.empty();
            //var template = '<div element="' + model.directive + '"></div>';
            //var cTemplate = $compile(template)(scope);
            //element.append(cTemplate);
        }
    };
}]);
directives.directive('navbar', function () {
    return {
        templateUrl: 'template/navbar.html',
        link: function (scope, element, attrs, ctrls) {

        }
    };
});
directives.directive('unorderedList', ['$parse', function ($parse) {
    return{
        replace: true,
        templateUrl: 'template/unordered-list.html',
        link: function (scope, element, attrs, ctrls) {
                
            scope.model = $parse(attrs.ngModel)(scope);

        }
    };
    }]);
directives.directive('division', ['$parse', function ($parse) {
        return {
            replace: true,
            templateUrl: 'template/div.html',
            link: function (scope, element, attrs, ctrls) {
                
                scope.model = $parse(attrs.ngModel)(scope);

            }
        };
    }]);
directives.directive('anchor', ["$parse", "$compile", "$http", "$templateCache", function ($parse, $compile, $http, $templateCache) {
    return {
        replace: true,
        priority: 1001,
        terminal: true,
        templateUrl: 'template/anchor.html',
        link: function (scope, element, attrs, ctrls) {
                scope.model = $parse(attrs.ngModel)(scope);
                // Use TEXT property if set, ELEMENTS otherwise
                if (scope.model.properties.hasOwnProperty('text')) {

                    console.log('composite', false);
                    element.attr('ng-bind', 'model.properties.text');
                    element.removeAttr("anchor"); //remove the attribute to avoid indefinite loop
                    element.removeAttr("data-anchor"); //also remove the same attribute with data- prefix in case users specify data-common-things in the html
                    
                    $compile(element)(scope);
                    
                    // hack to satisfy inspectable condition 
                    element.attr('anchor', ''); 

                } else {
                    console.log('composite', true);
                    
                    $http.get('template/placeholder.html', { cache: $templateCache }).success(
                        function (tplContent) {
                            var e = $compile(tplContent)(scope)
                            e.attr("ng-repeat", "item in model.elements");
                            e.attr("element", "item");
                            e = $compile(e)(scope);
                            element.append(e);
                        }
                    );
                }
        }
    };
}]);
directives.directive('textbox', ['$parse', function ($parse) {
        return {
            replace: true,
            templateUrl: 'template/textbox.html',
            link: function (scope, element, attrs, ctrls) {
                
                scope.model = $parse(attrs.ngModel)(scope);

            }
        };
    }]);


    

directives.directive('rectangleSketch', ['$parse', function ($parse) {
        return {
            replace: true,
            templateUrl: 'template/rectangle-sketch.html',
            link: function (scope, element, attrs, ctrls) {
                
                scope.model = $parse(attrs.ngModel)(scope);

            }
        };
    }]);

directives.directive('tableElement', ['$parse', function ($parse) {
        return {
            replace: true,
            templateUrl: 'template/table.html',
            link: function (scope, element, attrs, ctrls) {
                
                scope.model = $parse(attrs.ngModel)(scope);

            }
        };
    }]);



directives.directive('compositeCheck', ["$parse", "$compile", function ($parse, $compile) {
        return {
            priority: 1000,
            terminal: true,
            link: function (scope, element, attrs, ctrls) {
                


            }
        };
    }]);


directives.directive('plainText', ['$parse', '$compile', function ($parse, $compile) {
    return {
//          replace: true,
//          templateUrl: 'template/plain-text.html',
            link: function (scope, element, attrs, ctrls) {
                //if (scope.model.properties.hasOwnProperty('text')) {
                //    console.log('scope.text', scope.text);
                //}
                scope.model = $parse(attrs.ngModel)(scope);
                
                scope.$watch('model', function () {
                    element.replaceWith(scope.model.properties.text);
                });
                
            }
    };
}]);
directives.directive('stencil', function () {
    return {
        link: function (scope, element, attrs, ctrls) {

        }
    };
});
directives.directive('element', ['$rootScope', '$injector', '$compile', '$injector', function ($rootScope, dialogService, $compile, $injector) {
        return {
            restrict: "EA",
            scope: { element: '=' },
            link: function ($scope, $element, $attrs) {
                
                //var elementExists = $injector.has($scope.element.directive);
                
                //console.log(elementExists, $scope.element.directive.replace('-', ''));
                //if (!elementExists) { return; }
                
                //init handler
                //$scope.handler = $injector.get($scope.data.handler);
                
                //watch for handler
                $scope.$watch($scope.element, function (value) {
                    $element.empty();
                    //var template = '<div ' + $scope.element.directive + ' ' + ($scope.element.inspectable === true ? 'inspectable'  : '') + ' ng-model="element"></div>';
                    var template = '<div ' + $scope.element.directive + ' inspectable ng-model="element"></div>';
                    var cTemplate = $compile(template)($scope);
                    if ($scope.element.replace === true) {
                        $element.replaceWith(cTemplate);
                    }
                    else {
                        $element.append(cTemplate);
                    }
                });
            }
        };
    }]);

directives.directive('container', function ($compile, $parse) {
    return {
        require: '?ngModel',
        //scope: { data: '=', handler: '=' },
        link: function (scope, element, attrs, ngModel) {
            //if (!ngModel) {
            //    if (console && console.warn) {
            //        console.warn('container requires ngModel to be on the element');
            //    }
            //    return;
            //}
            var model = $parse(attrs.ngModel)(scope);

            element.empty();
            var template = '<div element="' + model.directive + '"></div>';
            var cTemplate = $compile(template)(scope);
            element.append(cTemplate);
        },
        controller: function ($scope, $element, $window, $timeout) {
            
            $scope.init = function (element) {
                
                console.log('h: ', element);

            };

        }
    };
});

directives.directive('inspector', ['$rootScope', '$document', '$compile', function ($rootScope, $document, $compile) {
    return {
        controller: function ($scope, $element, $window, $timeout) {
            

            var iParent = $element[0];
            var w = angular.element($window);
            var timerHide;
            var registeredElements = [];
            $scope.selected = null;

            $scope.visible = false;
            $scope.isvisible = function () {
                return $scope.visible;
            };
            
            $scope.actionsVisible = false;
            $scope.isActionsVisible = function () {
                return $scope.actionsVisible;
            };

            function Overlay(width, height, left, top) {
                
                this.width = this.height = this.left = this.top = 0;
                
                // outer parent
                var outer = $('<div class="outer fadein fadeout" ng-show="isvisible()" />');
                
                // lines (boxes)
                var topbox = $("<div />").css("height", 1).appendTo(outer);
                var bottombox = $("<div />").css("height", 1).appendTo(outer);
                var leftbox = $("<div />").css("width", 1).appendTo(outer);
                var rightbox = $("<div />").css("width", 1).appendTo(outer);
                
                var overlayTemplate = angular.element($compile(outer)($scope));
                var body = angular.element(document).find('body');
                body.append(overlayTemplate);
                
               
                // don't count it as a real element
                outer.mouseover(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                });


                this.resize = function resize(width, height, left, top) {
                    if (width != null)
                        this.width = width;
                    if (height != null)
                        this.height = height;
                    if (left != null)
                        this.left = left;
                    if (top != null)
                        this.top = top;
                };
                
                this.show = function show() {
                    $scope.$apply(function () {
                        $scope.visible = true;
                    });
                };
                
                this.hide = function hide() {
                    //outer.hide();
                    $scope.$apply(function () {
                        $scope.visible = false;
                    });
                };
                
                this.render = function render(width, height, left, top) {
                    
                    this.resize(width, height, left, top);
                    this.show();
                    
                    topbox.css({
                        top: this.top - 2,
                        left: this.left - 2,
                        width: this.width + 5
                    });
                    bottombox.css({
                        top: this.top + this.height,
                        left: this.left - 2,
                        width: this.width +5
                    });
                    leftbox.css({
                        top: this.top,
                        left: this.left - 3,
                        height: this.height
                    });
                    rightbox.css({
                        top: this.top,
                        left: this.left + this.width +1,
                        height: this.height
                    });
                    
                };
            }
            
            // Init overlay
            var overlay = new Overlay(200, 200, 400, 20);
            
            
            //Bind mouseover element event
            
            
            this.leftclick = function (e) {
            
            
            };
            this.rightclick = function (e) {
            
            
            };
                
            var lastdoubleclicked = null;
            var inspectables = [];
            var lastInspectable = null;
            var level = 0;

            this.mousedoubleclick = function (e) {

                /*******************************************************
                * 
                * DRILL DOWN PROTOTYPE
                * 
                *******************************************************/
                //if (lastdoubleclicked == e.target) return;
                    
                    

                //lastInspectable = [];
                //lastdoubleclicked = e.target;
                //$(e.target).parents('[inspectable]').each(function () {
                //    inspectables.push($(this));
                //})
                //inspectables.reverse();
                //console.log(inspectables);
                //// increment or decrement level
                //level++;
            };    
                

                
            var ltar = null;
            //Show/hide overlay on mouseover
            this.mouseover = function (e) {
                //registeredElements.push(childElement);
                
                $timeout.cancel(timerHide);
                timerHide = null;
                var target = $(e.target);
                    
                    //test                    
                    //if (ltar != target) {
                    //    console.log(ltar);
                    //    ltar = target;
                    //}
                    
                    /*******************************************************
                     * 
                     * DRILL DOWN PROTOTYPE
                     * 
                     *******************************************************/
                     
                    //if (inspectables[level] == target) {

                    //} else if (inspectables[level] == null) {
                    //    target = $(e.target).parents('[inspectable]').last();
                    //} else {
                    //    target = inspectables[level];
                    //}
                    
                    if (target.attr('inspectable') == false) {
                        //console.log('non inspectable', target);
                    } else if (inspectables[level] == null) {
                        target = $(e.target).parents('[inspectable]').first();
                    }

                //Show overlay if inside parent, hide otherwise
                if (target.parents().is(iParent)) {
                    var offset = target.offset();
                    overlay.render(target.outerWidth(), target.outerHeight(), offset.left, offset.top);
                }
                else {
                    overlay.hide();
                }
            };

            this.mouseout = function (e) {
                if (timerHide)
                    return;
                timerHide = $timeout(
                    function () {
                        overlay.render(w.width(), w.height(), 0, $(window).scrollTop());
                        overlay.hide();
                    },700);
            };


            // DEPRICATED: alternative way to bind mouseover events
            //setTimeout(function () { angular.element(iParent.querySelector('.iactive') }, 0)
            
            //Unbind mouseover element event
            function cleanup(){ };
            

 

            /**********************************************
            * 
            * Inspector actions
            * 
            *********************************************/
            // #region Inspector menu
            var currentMousePos = { x: -1, y: -1 };
            
            var actions = $('<div class="actions fadein fadeout" ng-show="isActionsVisible()"><div class="innerA"><i class="middle action fa fa-times"></i><i class="action fa fa-trash-o" ></i><i class="action fa fa-pencil"></i><i class="action fa fa-pencil-square-o"></i><i class="action fa fa-pencil-square-o"></i></div></div>');
            var actionsTemplate = angular.element($compile(actions)($scope));
            var body = angular.element(document).find('body');
            body.append(actionsTemplate);
            
            function centerContent() {
                var container = $('.actions');
                var fields = $('.actions .action');
                fields.each(function () {
                    $(this).css("left", (container.width() - $(this).width()) / 2);
                    $(this).css("top", (container.height() - $(this).height()) / 2);
                });
            }

            function distributeFields(rad) {
                var radius = rad;
                var fields = $('.action'), container = $('.actions'),
                    width = container.width(), height = container.height(),
                    angle = 0, step = (2 * Math.PI) / (fields.length - 1);
                fields.each(function () {
                    if ($(this).hasClass('middle')){
                        return;
                    }
                    var x = Math.round(width / 2 + radius * Math.cos(angle) - $(this).width() / 2);
                    var y = Math.round(height / 2 + radius * Math.sin(angle) - $(this).height() / 2);
                    $(this).css({
                        left: x,
                        top: y
                    });
                    angle += step;
                });
            }
            
            $(document).bind('mousemove', function (e) {
                currentMousePos.x = event.pageX;
                currentMousePos.y = event.pageY;
            });

            // don't count it as a real element
            actionsTemplate.mouseover(function (e) {
                $timeout.cancel(timerHide);
                $timeout.cancel(hideActions);
                hideActions = timerHide = null;
                
                e.stopPropagation();
                e.preventDefault();
            });
            
            var hideActions = null;
            actionsTemplate.mouseout(function (e) {
                if (hideActions)
                    return;
                hideActions = $timeout(function () {
                    centerContent();
                    $scope.actionsVisible = false;
                    //actionsTemplate.hide();
                }, 500);
            });
                
            // Handler for outside event to highlight element
            this.select = function(target) {
                $timeout.cancel(timerHide);
                $timeout.cancel(hideActions);
                hideActions = timerHide = null;
                    
                setTimeout(function () {
                    $scope.selected = $(target);
                    var offset = $scope.selected.offset();
                    overlay.render($scope.selected.outerWidth(), $scope.selected.outerHeight(), offset.left, offset.top);
                        
                    $scope.$apply(function () {
                        var eScope = angular.element($scope.selected).scope()
                        $rootScope.$broadcast('properties', eScope);
                    });
                });
            }    

            this.mouseclick = function (e) {
                //return;
                $timeout.cancel(timerHide);
                $timeout.cancel(hideActions);
                hideActions = timerHide = null;
                
                var eScope = angular.element(e.target).scope()
                $scope.$apply(function () {
                    $rootScope.$broadcast('properties', eScope);
                });

                //keep selected element
                var target = $(e.target);
                if ($scope.selected == target)
                    $scope.selected = null;
                else
                    $scope.selected = $(e.target);

                
                /*******************************************************
                * 
                * MENU
                * 
                *******************************************************/
                            
                ////move menu to cursor position
                //centerContent();
                
                ////center menu
                //actionsTemplate.css({
                //    top: currentMousePos.y - 50,
                //    left: currentMousePos.x - 50
                //});
                
                ////show menu
                //$scope.$apply(function () {
                //    $scope.actionsVisible = true;
                
                //});
                
                ////arrange in circle
                //setTimeout(function () {
                //    distributeFields(50);
                //}, 0);


            };

            // #endregion

            
            $scope.$on('$destroy', function () {
                $(document).unbind('mousemove', function (e) { });
                $(actionsTemplate).unbind('mouseout', function (e) { });

                if (actionsTemplate)
                    actionsTemplate.remove();
                actionsTemplate = null;
            });
        }
    };
}]);
directives.directive('inspectable', ['$rootScope', function ($rootScope) {
    return {
        require: '^inspector',
        link: function link(scope, iElement, iAttrs, parentController) {
            var elem = iElement[0];
            $(elem).bind('mouseover', parentController.mouseover)
            $(elem).bind('mouseout', parentController.mouseout)
            $(elem).bind('click', parentController.mouseclick)
            $(elem).bind('dblclick', parentController.mousedoubleclick)
            
            $rootScope.$on('inspector:select', function (event, model) {
                if (scope.model == model && $(elem).attr(model.directive) != undefined) {
                    parentController.select(elem);
                }
            });

            //Destroy event called
            scope.$on('$destroy', function () {
                $(elem).unbind("mouseover", parentController.mouseover);
                $(elem).unbind("mouseout", parentController.mouseover);
                $(elem).unbind("click", parentController.mouseclick);
                $(elem).unbind('dblclick', parentController.mousedoubleclick)
            });
        }
    };
}]);

directives.filter('groupBy', ['pmkr.filterStabilize', function(stabilize) {
    return stabilize(function (data, key) {
        if (!(data && key)) return;
        var result = {};
        for (var i = 0; i < data.length; i++) {
            if (!result[data[i][key]])
                result[data[i][key]] = [];
            result[data[i][key]].push(data[i])
        }
        return result;
    });
}])
.factory('pmkr.filterStabilize', [
'pmkr.memoize',
function(memoize) {
    function service(fn) {
        function filter() {
            var args = [].slice.call(arguments);
            // always pass a copy of the args so that the original input can't be modified
            args = angular.copy(args);
            // return the `fn` return value or input reference (makes `fn` return optional)
            var filtered = fn.apply(this, args) || args[0];
            return filtered;
        }
        var memoized = memoize(filter);
        return memoized;
    }
    return service;
}
])
.factory('pmkr.memoize', [
function() {
    function service() {
        return memoizeFactory.apply(this, arguments);
    }
    function memoizeFactory(fn) {
        var cache = {};
        function memoized() {
            var args = [].slice.call(arguments);
            var key = JSON.stringify(args);
            var fromCache = cache[key];
            if (fromCache) {
                return fromCache;
            }
            cache[key] = fn.apply(this, arguments);
            return cache[key];
        }
        return memoized;
    }
    return service;
}
]);
directives.filter('getById', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (+input[i].id == +id) {
                return input[i];
            }
        }
        return null;
    }
});
directives.filter('getByPropertyName', function () {
    return function (input, name) {
        var result = null;
        angular.forEach(input, function (value, key) {
            if (result != null)
                return;
            
            if (name == key)
                result = { key: key, value: value };
        });
        return result;
    }
});

/***************************************************
 * 
 * Dialog
 * 
 **************************************************/ 

directives.service('modalService', ['$modal', function ($modal) {
        
        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '/App/views/dialog/default.htm'
        };
        
        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?'
        };
        
        var instance = null;
        
        
        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = true;
            return this.show(customModalDefaults, customModalOptions);
        };
        
        this.show = function (customModalDefaults, customModalOptions) {
            
            if (instance) {
                instance.dismiss('cancel');
                instance = null;
            }
            
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};
            
            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
            
            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);
            
            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    
                    instance = $modalInstance;
                    
                    $scope.modalOptions = tempModalOptions;
                    
                    $scope.modalOptions.ok = function (result) {
                        instance = null;
                        $modalInstance.close(result);
                    };
                    
                    $scope.modalOptions.close = function (result) {
                        $modalInstance.dismiss('cancel');
                    };
                };
            }
            
            return $modal.open(tempModalDefaults).result;
        };
        
        this.dismiss = function () {
            if (instance) {
                instance.dismiss('cancel');
                instance = null;
            }
        };


    }]);

directives.service('dialogService', ['$rootScope', 'modalService', '$q', '$injector', function ($rootScope, modalService, $q, $injector) {
        
        this.show = function (scopeData, handler, customOptions) {
            var deferred = $q.defer();
            
            var defaultOptions = {
                backdrop: true,
                modalFade: true,
                templateUrl: 'partials/dialog/dialog.html',
                windowClass: 'dialog',
                controller: function ($scope, $modalInstance) {
                    $scope.item = scopeData;
                    $scope.handler = handler;//$injector.get(scopeData.handler);
                    //$scope.handler.init(scopeData);
                    //$scope.handler = handler;
                    //$scope.handler.state.name
                    $scope.modalOptions = {};
                    $scope.modalOptions.ok = function (result) { $modalInstance.close(result); };
                    $scope.modalOptions.close = function (result) { $modalInstance.dismiss('cancel'); };
                }
            };
            var tempOptions = {};
            angular.extend(tempOptions, defaultOptions, customOptions);
            
            modalService.show(tempOptions).then(function (result) {
                //console.log('ok');
                deferred.resolve(result);
            }, function () {
                //console.log('cancel');
                deferred.reject();
            });
            
            return deferred.promise;

        };

    }]);

directives.factory('treeFactory', ['$rootScope', 'modalService', '$http', 'projectFactory', function ($rootScope, modalService, $http, projectFactory) {
        
        var _data = projectFactory.structure;
        var _collection = [];
        var _state = {};
        var _dialog = {};
        var states = [
            { name: 'default', title: 'Linkage', url: 'partials/dialog/tree.html', data: [{ name: '' }], dialog: { buttons: { ok: true, cancel: true } } }
        ];
        
        var config = function () { };
        var reset = function () { };
        
        var load = function () {
            return $http.get("/api/v1/media/get").then(function (response) {
                _collection = response.data;
            });
        };
        
        return {
            select: function (){
                console.log('select');
            },
            active: _state,
            d: _data,
            state: function () {
                return _state;
            },
            init: function (data) {
                _data = data;
                load();
            },
            activate: function (name) {
                for (var i = 0; i < states.length; i++) {
                    if (states[i].name == name) {
                        _state = states[i];
                        config();
                        break;
                    }
                }
            },
            dialog: function () {
                return _state.dialog;
            },
            get: function (name) {
                for (var i = 0; i < states.length; i++) {
                    if (states[i].name === name) {
                        return states[i];
                        break;
                    }
                }
                return null;
            },
            reset: function () {
                reset();
            },
            collection: function () {
                return _collection;
            },
            data: function () {
                return _data;
            }
        };

    }]);
directives.directive('partial', ['$rootScope', '$injector', '$compile', '$injector', function ($rootScope, dialogService, $compile, $injector) {
        return {
            restrict: "EA",
            scope: { data: '=', handler: '=' },
            link: function ($scope, $element, $attrs) {
                
                //watch for handler state
                $scope.$watch($scope.handler.state, function (value) {
                    $element.empty();
                    var template = '<div>' +
                               '    <div ng-include="\'' + $scope.handler.state().url + '\'"' + ($scope.handler.state().controller ? ' ng-controller="' + $scope.handler.state().controller + '" ' : ' ') + 'onload="doOnLoad()"></div>' +
                               '</div>';
                    var cTemplate = $compile(template)($scope);
                    $element.append(cTemplate);
                });

            }
        };
    }]);


/***************************************************
 * 
 * Sketch related
 * 
 **************************************************/ 

    function placeNode(node, top, left) {
        node.css({
            position: "absolute",
            top: top + "px",
            left: left + "px",
        });
    }
    
// To create a empty resizable and draggable box
directives.directive("ceBoxCreator", function ($document, $compile) {
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
    });
// To manage the drag
directives.directive("dragOuter", ['$rootScope', '$document', '$compile', function ($rootScope, $document, $compile) {
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
                        
                        console.log(eScope);
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
}]);
// To manage the drag
directives.directive("ceDrag", function ($document) {
        return function ($scope, $element, $attr) {
            var startX = 0,
                startY = 0,
                startWidth = 0,
                startHeight = 0;

            
            var newElement = angular.element('<div class="draggable"></div>');
        
        
            var parentWidth = $element.parent().width(),
                parentHeight = $element.parent().height();
            
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
            
                if(top + startHeight > parentHeight)
                    top = parentHeight - startHeight;
            
                if (left + startWidth > parentWidth)
                    left = parentWidth - startWidth;

                placeNode($element , top, left);
            }
            
            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        };
    });
    
// To manage the resizers
directives.directive("ceResize", function ($document) {
        return function ($scope, $element, $attr) {
            //Reference to the original 
            var $mouseDown;
            
            // Function to manage resize up event
            var resizeUp = function ($event) {
                var lowest = $mouseDown.top + $mouseDown.height + $mouseDown.top,
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
            
                    width = width > $element.parent().width() ? $element.parent().width() : width;

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

    });
