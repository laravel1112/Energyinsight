angular.module('app.controllers.charts.nav', [])
    .factory('chartsNavDeligate', ['$q', '$rootScope', 'EnergyUnitFactory', '$compile', function ($q, $rootScope, EnergyUnitFactory, $compile) {

        return {
            toPDF: function(filePrefix){
                $rootScope.$broadcast('export.pdf', {filePrefix: filePrefix});
            }
        }

    }])
    .controller('chartsNavCtrl', ['$scope', '$rootScope', 'EnergyUnitFactory', '$ionicListDelegate', '$timeout', 'DataSource', '$ionicPopover', '$ionicHistory',
        function ($scope, $rootScope, EnergyUnitFactory, $ionicListDelegate, $timeout, DataSource, $ionicPopover, $ionicHistory) {


        $scope.parentID = 0;
        $scope.maxSeries=8
        var serieColors = ['#F79646', '#4BACC6', '#8064A2', '#9BBB59', '#C0504D', '#4F81BD', '#C0504D', '#1F497D'];
        $scope.originalNodes = [];
        $scope.checkedNodes = [];

        $scope.currentUnit = { name: 'loading...'}

        /********************************************************************
         *
         *
         *  Menu popup Edit / Add / Import 
         *
         *
        *********************************************************************/

        $scope.popData = [
            { name: 'add',  title: 'Add meter', href: 'root.charts.summary.edit', params: { uid: 0, parentID: $rootScope.$stateParams.uid} }, 
            { name: 'import', title: 'Import Data', href: 'root.charts.summary.import'}
        ];
        
        $scope.popSelected = function(item){
            if(item.name == 'add')
            {
                $scope.addMeter(3);
            }

            $rootScope.setActiveView('content');
            $rootScope.go(item.href, angular.extend({uid: $rootScope.$stateParams.uid}, item.params || {}));
            $scope.popover.hide();
        }

        $ionicPopover.fromTemplateUrl('template/popover-list-menu.html', { scope: $scope }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.onAdd = function(e){
            if($scope.currentUnit.type > 2)
                $scope.popover.show(e)
            else
                $scope.popSelected($scope.popData[0]); // 0 <-- add meter, 1 <-- import data
        }


        // TODO: REMOVE OBSOLETE (see subnav)
        $scope.addMeter = function(type){

            var node = {
                 parent: type == 2 ? null : parseInt($rootScope.$stateParams.uid),
                 //campus: $scope.formData.campus,
                 //influxKey: Math.random().toString(36).substring(7),
                 name: 'New Entity',
                 type: type, // 1 == building, 2 == campus, 3 == meter (default) ...
                 id: 0
             }
             DataSource.addUnit(node);
        }


        $scope.getLevel = function(id, lvl){
            if(!lvl) lvl = 0;

            var item = _.find($scope.originalNodes, function(node){
                return node.id == id;
            });

            return !item ? lvl : $scope.getLevel(item.parent, ++lvl)
        }


        $scope.canSwipe = function(){
            return !$rootScope.disableListSwipping;
        }


        // Send node edit event
        $scope.edit = function (node, evt) {
            if(evt){
                evt.preventDefault();
                evt.stopPropagation();
            }
            $ionicListDelegate.closeOptionButtons();
            $rootScope.go('root.charts.summary.edit', { uid: node.id }, 'forward');            
            $timeout(function(){
                $rootScope.$broadcast('chart-serie-edit', node);
            });
        }


        // Send node selected event
        $scope.toggleSeries = function (node, ctrl, evt) {
            if(node.nodes.length > 0 && ctrl) {
                ctrl.collapsed ? ctrl.expand() : ctrl.collapse();
                node.collapsed = !node.collapsed;
                //$(evt.currentTarget).parent().hasClass('collapsed') ? $(evt.currentTarget).parent().removeClass('collapsed') : $(evt.currentTarget).parent().addClass('collapsed');
                return;
            }


            if($rootScope.$stateParams.uid)
            {
                return;
            }

            if(evt) {
                evt.preventDefault();
                evt.stopPropagation();
            }
            var index = $scope.checkedNodes.indexOf(node);
            if (index >= 0) {
                node.color = null;
                $scope.checkedNodes.splice(index, 1);
            } else {
                console.log('node ' , node);
                if (node.influxKey) {

                    // Limit selectable nodes
                    if ($scope.checkedNodes.length >= $scope.maxSeries)
                        return;

                    for (var ci = 0; ci < serieColors.length; ci++) {
                        var items = $scope.checkedNodes.filter(function(item) {
                            return item.color == serieColors[ci];
                        });
                        if (items.length > 0) continue;


                        node.color = serieColors[ci];
                        $scope.checkedNodes.push(node);
                        break;
                    }
                }
            }
            
            $rootScope.setActiveView('content');
            $rootScope.$broadcast('chart-serie-checked', node);
        }


        $scope.buildTree = function(result){
            var map = {}, node, roots = [], nodes = [];

            $scope.originalNodes = result;
            nodes = angular.copy($scope.originalNodes);
            var maxId=0; 
            //remove duplicates
            var nodes = _.map(_.groupBy(nodes, function(doc){
                                        if(doc.id>=maxId)   
                                            maxId=doc.id+1;
                                        return doc.id;
                                }),
                                function(grouped){
                               	    node=grouped[0];
                                    node.euid=node.id;
                                    return node;
                            });

    	    // Add "fake" nodes in a building node has disaggregated series
    	    function addFakeNode(node,maxId,disag){
        		return {
        			id:maxId,
        			parent:node.id,
        			type:3,
        			euid:node.euid,
        			name:disag,
        			disagg:disag,
        			influxKey:node.influxKey||"temp",
        			campus:node.campus
        		}		
    	    }

    	    var hijackheadbar=$('a[href="/hijack/release-hijack/"]');
    	    if(hijackheadbar.length>0){   
    	    	var i=0;
    	    	while (i<nodes.length){
    	    	    node=nodes[i];
    	    	    i++;
    	    	    if(node.type!=1||!node.invisible)continue;
                    var total_node=addFakeNode(node,maxId,'total')
                    maxId++;
                    nodes.push(total_node);
                    nodes.push(addFakeNode(total_node,maxId,'lighting'));
    	    	    maxId++;

    	    	    nodes.push(addFakeNode(total_node,maxId,'plug'));
    	    	    maxId++;

    	    	    nodes.push(addFakeNode(total_node,maxId,'cooling'));
    	    	    maxId++;

    	    	    nodes.push(addFakeNode(total_node,maxId,'misc'));
    	    	    maxId++;

    	    	    nodes.push(addFakeNode(total_node,maxId,'motor'));
    	    	    maxId++;

    	    	    nodes.push(addFakeNode(total_node,maxId,'heating'));
    	    	    maxId++;
    	    	}
    	    }
            
            //map ids for parent reference
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.nodes = [];
                map[node.id] = i;
            }

            //build tree from flat array
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                if (node.parent && node.id != $rootScope.$stateParams.uid) {
                    if(nodes[map[node.parent]]){
                        node.level = $scope.getLevel(node.id);
                        node.collapsed = node.level > 1; 
                        nodes[map[node.parent]].nodes.push(node);
                    }
                } else {
                    node.level = 0;
                    roots.push(node);
                }
            }

            //bind to ui-tree
            $scope.nodes = roots;

        }


        $scope.getParentTitle = function() {
            if($scope.parentID == 0) return;

            // find current parent item
            var item = _.find($scope.originalNodes, function(item) {
                return item.id == $scope.parentID; 
            });
            
            // set parent item level higher
            return item.name;
        }
        

        $scope.onListItemClick = function(item){
            $scope.parentID = item.id;

            var children = _.filter($scope.originalNodes, function(item) {
                if($scope.parentID == 0 && !item.parent) return true;
                return item.parent == $scope.parentID; 
            });

        }


        $scope.getListItems = function(parentID){

            var children = _.filter($scope.originalNodes, function(item) {
                if(parentID == 0 && !item.parent) return true;
                return item.parent == $scope.parentID; 
            });
            return children;

        }


        var getAllChildren = function(id, children){
            if(!children) children = [];

            _.each($scope.originalNodes, function(node){
                if(node.parent == id){
                  children.push(node);  
                  children = getAllChildren(node.id, children)
                }
            });

            return children;
        }

        // Load tree for the first time
        DataSource.Units().then(function(units){

            $scope.originalNodes = angular.copy(units);

            //new unit must be precreated
            if($rootScope.$stateParams.uid == 0){
                var newUnit = _.find(units, function(unit){
                    return unit.id == 0;
                });
                if(!newUnit){
                    $rootScope.go('root.charts.summary');                
                    return;
                }                
            }

            if($rootScope.$stateParams.uid >= 0){

                // get all inheritors
                units = getAllChildren($rootScope.$stateParams.uid, []);

                // add current node as parent for tree to work
                $scope.currentUnit = _.find($scope.originalNodes, function(unit){
                     return unit.id == $rootScope.$stateParams.uid;
                });
                units.splice(0, 0, $scope.currentUnit);

            }
            if(units.length > 1)
                $scope.buildTree(units);
        });


        var destroyMe = $rootScope.$on('create-meter', function (event, node) {

            // TODO: Save new meter into database, (event recieved from chartsCtrl)

            var maxID = _.max(_.pluck($scope.originalNodes, 'id'));
            EnergyUnitFactory.create(node).then(function(result){
                $scope.originalNodes.push(result);
                $scope.buildTree($scope.originalNodes);
                $scope.edit(result);
            },function(err){
                console.log(err);
            })

        });


        // Reset all selected indicators
        $scope.reset = function () {
            for (var i = $scope.checkedNodes.length - 1; i >= 0; i--) {
                $scope.checkedNodes[i].color = null;
                $rootScope.$broadcast('chart-serie-checked', $scope.checkedNodes[i]);
                $scope.checkedNodes.splice(i, 1);
            }
            nextColorIndex = 0;
        };

        var onReset = $rootScope.$on('reset-meters', function(event, meter){

            $scope.reset();

        });

        var onRemoveMeter = $rootScope.$on('remove-meter', function(event, meter){
    
            //	var items = $scope.checkedNodes.filter(function(item) { 
            //		return item.id == meter.id;
            //	 });
    	
            for (var i = $scope.checkedNodes.length - 1; i >= 0; i--) {
        		if(meter.id==$scope.checkedNodes[i].id){
        				
                        $scope.checkedNodes[i].color = null;
                        $rootScope.$broadcast('chart-serie-checked', $scope.checkedNodes[i]);
                        $scope.checkedNodes.splice(i, 1);
        		}
            }

        });



        /********************************************************************
         *
         *
         *  
         *
         *
        *********************************************************************/

        var onNodeSelected = function(node){

            var oldCopy = _.find($scope.checkedNodes, function(checked) {
                return checked.id == node.id; 
            });
            var index = $scope.checkedNodes.indexOf(oldCopy);
            if (oldCopy) {
                node.color = null;
                $scope.checkedNodes.splice(index, 1);
            } else {
                if (node.influxKey) {

                    // Limit selectable nodes
                    if ($scope.checkedNodes.length >= $scope.maxSeries)
                        return;

                    // Apply unique color
                    for (var ci = 0; ci < serieColors.length; ci++) {
                        var items = $scope.checkedNodes.filter(function(item) {
                            return item.color == serieColors[ci];
                        });
                        if (items.length > 0) continue;


                        node.color = serieColors[ci];
                        $scope.checkedNodes.push(node);
                        break;
                    }
                }
            }

            $rootScope.$broadcast('chart-serie-checked', node);

        }



        $scope.loadEnergyUnits = function(parentID){
            
            EnergyUnitFactory.get().then(function(result) {

                // var itemsToShow = _.filter(result.objects, function(item) {
                    
                //     // return root items when nothing selected 
                //     if(parentID == 0 && !item.parent) return true;
                    

                //     // Check whether or not to enable drilling
                //     var children = _.filter(result.objects, function(child) {
                //         return child.parent == item.id; 
                //     });

                //     // disable drilling
                //     if(children.length == 0)
                //         item.hasNoChildren = true;

                //     // apply color (we could introduce another cached collection to avoid reappling color)
                //     var oldCopy = _.find($scope.checkedNodes, function(node) {
                //         return node.id == item.id; 
                //     });
                //     if(oldCopy){
                //         item.color = oldCopy.color;
                //     }

                //     // required in reports.summary.js  
                //     item.euid = item.id;

                //     // is child of given item
                //     return item.parent == parentID;

                // });
                
                // save parentID for later use by navbar
                $scope.parentID = parentID;
            });

        }

        //Navbar event
        $scope.onBack = function(){
            $rootScope.setActiveView('subnav'); 
            if(!$ionicHistory.backView())
                $rootScope.go('root.charts.summary', {}, 'back')
            else
                $ionicHistory.goBack(-1);
        };


        // $scope.onListBackClick = function(){

        //     if($scope.parentID == 0) return;

        //     EnergyUnitFactory.get().then(function(result) {
    
        //         // find parent 
        //         var item = _.find(result.objects, function(item) {
        //             return item.id == $scope.parentID; 
        //         });

        //         // load parent items
        //         $scope.loadEnergyUnits(item.parent ? item.parent : 0);
        //     });
            
        // }


        // first time load
        $scope.loadEnergyUnits(0);



        /********************************************************************
         *
         *
         *  Destroy
         *
         *
        *********************************************************************/


        //Unsubscribe from broadcast on controller destroy event
        $scope.$on('$destroy', function () {
            destroyMe();
            onRemoveMeter();
            onReset();
        });

    }])
