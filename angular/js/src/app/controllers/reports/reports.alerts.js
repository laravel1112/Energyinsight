angular.module('app.controllers.reports.alerts', [])
.controller('reportsAlertsCtrl', [ 
	'$scope', '$rootScope', '$state', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache', 'AlertService', '$q',
	function ($scope, $rootScope, $state, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache, AlertService, $q) {

			$scope.newsItems = [];
			
            // grouping by date
			$scope.convertTo = function (arr, key, dayWise) {
                var groups = {};
                for (var i=0;l= arr.length, i<l;i++) {
                    arr[i][key] = moment(arr[i][key]).format('MMM DD, YYYY');
                    groups[arr[i][key]] = groups[arr[i][key]] || [];
                    groups[arr[i][key]].push(arr[i]);
                }
                return groups;
            };

            // Alert type color 
            $scope.getCategoryColor = function(categ){
                switch(categ){
                    case 1: return 'orange';
                    case 2: return 'blue';
                    default: return '#eee';
                }
            }

            // Load
            $scope.load = function(){
                
                $timeout(function(){

                    $scope.dateConfig.setRange(moment().subtract(1, 'week'), moment());
                    $scope.applyDateRange();

                })

            }

            // First time load
            $scope.load();


            /*
            *
            *   Date range filter
            *
            */

            $scope.dateConfig = { selected: null, maxDate: moment() };

            $scope.applyDateRange = function () {
                var data1, data2;

                //TODO: Use this daterange for API requests
                //TODO: Fine tune daterange picker
                var dateStart = $scope.dateConfig.getStart();
                var dateEnd = $scope.dateConfig.getEnd();

                var pointStart = dateStart.clone().valueOf();
                var pointEnd = dateEnd.clone().valueOf();

                // Close Compare configuration Popup
                $scope.isCompareOpen = false;

                // 
                AlertService.getByDateRange($rootScope.$stateParams.id, moment(dateStart).startOf('day'), moment(dateEnd).endOf('day'), true).then(function(data){
                    $scope.gridOptions1.data = data;
                });
            }


            /*
            *
            *   Table configuration
            *
            */

            var rowTemplate = '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader, \'new-entry\': row.entity.alertstatus == 0, \'opened-entry\': row.entity.alertstatus == 1, \'checked-entry\': row.entity.alertstatus == 2 }"  ui-grid-cell></div>'

            var statusCellTemplate =
                '<div class="ui-grid-cell-contents icon-contents">' +
                    '<i class="svg-mail-2 svg-25" ng-show="row.entity.alertstatus == 1"></i>' +
                    '<i class="svg-mail-open svg-25" ng-show="row.entity.alertstatus == 2"></i>' +
                    '<i class="svg-checked svg-25" ng-show="row.entity.alertstatus == 3"></i>' +
                '</div>';

            var typeCellTemplate =
                '<div class="ui-grid-cell-contents icon-contents">' +
                        '<button class="btn btn-link flex flex-center flex-noresize jcc p0 tac" style="width: 50px; height: 50px; border-radius: 100%; text-align: center;" ng-style="{background: grid.appScope.getCategoryColor(row.entity.alerttype)}">' +
                        '   <i class="svg-alert svg-30 svg-white" ng-show="row.entity.alerttype == 1"></i>' +
                        '   <i class="svg-bar-chart svg-30 svg-white" ng-show="row.entity.alerttype == 2"></i>' +
                        '</button>' +
                '</div>';

            var descCellTemplate =
                '<div class="ui-grid-cell-contents desc">' +
                    '<h3 class="m0">{{row.entity.title}}</h3>' + 
                    '<div ng-bind="row.entity.description | stripTags">...</div>' + 
                '</div>';


            var ePotentialCellTemplate =
                '<div class="ui-grid-cell-contents">' +
                    '<h3 class="m0">{{row.entity.saving_potential}} <sub>kWh</sub></h3>' + 
                '</div>';
            
            var eSavedCellTemplate =
                '<div class="ui-grid-cell-contents">' +
                    '<h3 class="m0">{{row.entity.energy_saved}} <sub>kWh</sub></h3>' + 
                '</div>';

             $scope.gridOptions1 = {
                enableFiltering: true,
                enablePaging: false,
                enablePaginationControls: false,
                enableRowHeaderSelection: false,
                multiSelect: false,
                enableSelectAll: false,
                rowTemplate: rowTemplate,
                rowHeight: 75,
                treeRowHeaderAlwaysVisible: false,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                columnDefs: [
                    { field: 'alertstatus', displayName: '', width: "100", resizable: true, cellClass: 'cell-icon', enableColumnMenu: false, cellTemplate: statusCellTemplate },
                    { field: 'alerttype', displayName: '', width: "100", resizable: true, cellClass: 'cell-icon', enableColumnMenu: false, cellTemplate: typeCellTemplate },
                    { field: 'title', displayName: 'description', width: "*", resizable: true, cellClass: '', enableColumnMenu: false, cellTemplate: descCellTemplate },
                    { field: 'saving_potential', id: "used", displayName: 'saving_potential', width: '200', resizable: true, cellClass: 'fs24', enableColumnMenu: false, cellTemplate: ePotentialCellTemplate },
                    { field: 'energy_saved', displayName: 'energy_saved', width: '200', resizable: true, cellClass: 'fs24', enableColumnMenu: false, cellTemplate: eSavedCellTemplate },
                    { field: 'alert_time', displayName: 'created', width: '200', resizable: true, cellClass: '', enableColumnMenu: false, type: 'date', /*grouping: { groupPriority: 0 },*/ cellFilter: 'date:"yyyy-MM-dd HH:mm"', sort: { direction: uiGridConstants.DESC } },
                ],
                data: []
            };



            /*
            *
            *   Table row changed handler
            *
            */

            $scope.gridOptions1.onRegisterApi = function(gridApi) {
                
                $scope.gridApi1 = gridApi;
                
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                    // set alert status to "opened"
                    //AlertService.setStatus($rootScope.$stateParams.id, row.entity.id, 2).then(function(){
                        $rootScope.setActiveView('content'); 
                        $rootScope.go('root.home.unit.reports.alerts.details', {id: $rootScope.$stateParams.id, aid: row.entity.id}, 'forward');
                    //}) 

                });
            }


}])
.controller('reportsAlertDetailsCtrl', [ 
	'$scope', '$rootScope', '$state', '$timeout', '$http', '$window', 'uiGridConstants', 'EnergyUnitFactory', 'AllMetersService','MiscSelectionFactory', 'geoService', '$mdSidenav', 'platformService', '$templateCache', 'AlertService', '$ionicPopup', '$compile',
	function ($scope, $rootScope, $state, $timeout, $http, $window, uiGridConstants, EnergyUnitFactory, AllMetersService,MiscSelectionFactory, geoService, $mdSidenav, platformService, $templateCache, AlertService, $ionicPopup, $compile) {


            $scope.chartOptions1 = { options: {} };


            $scope.load = function(){
                AlertService.getByID($rootScope.$stateParams.id, $rootScope.$stateParams.aid).then(function(data){
                    $scope.alertItem = data;

                    // WARNING: TODO: Best way to save valid JSON into DB  
                    $scope.chartOptions1 = $scope.$eval($scope.alertItem.highchart_plot);
                })
            }

            $scope.load();


            $scope.showPopup = function() {
                $scope.data = {};

                // TODO: Translate popup text
                $scope.statusPopup = $ionicPopup.show({
                    template:   '<button ng-click="setStatus(1)" ng-class="{pressed: alertItem.alertstatus == 1}"><i class="svg-mail svg-25"></i> Unread</button>' +
                                '<button ng-click="setStatus(2)" ng-class="{pressed: alertItem.alertstatus == 2}"><i class="svg-mail-open svg-24"></i> Ignore</button>' +
                                '<button ng-click="setStatus(3)" ng-class="{pressed: alertItem.alertstatus == 3}"><i class="svg-checked svg-25"></i> Discmiss</button>',
                    title:      'Change alert status',
                    // subTitle: 'Sub time',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                    //   {
                    //     text: '<b>Save</b>',
                    //     type: 'button-positive',
                    //     onTap: function(e) {
                    //       if (!$scope.data.someVal) {
                    //         e.preventDefault();
                    //       } else {
                    //         return $scope.data.someVal;
                    //       }
                    //     }
                    //   }
                    ]
                });

                // Once closed
                $scope.statusPopup.then(function(res) {
                    
                });

                // Dismiss on timeout
                // $timeout(function() {
                //    myPopup.close(); //close the popup after 3 seconds for some reason
                // }, 3000);
            };


            $scope.setStatus = function(newStatus){
                AlertService.setStatus($rootScope.$stateParams.id, $scope.alertItem.id, newStatus).then(function(){
                    $scope.statusPopup.close();
                    // $rootScope.go('root.home.unit.reports.alerts', {id: $rootScope.$stateParams.id}, 'back');
                })
            };

            var unbindSetStatus = $rootScope.$on('alert:set-status', function(event, data) {
                $scope.showPopup();
            });

            $scope.$on('$destroy', function(){
                unbindSetStatus();
            });


}])
.run(['$rootScope', 'AlertService', function($rootScope) {

    $rootScope.setAlertStatus = function(newStatus){
        $rootScope.$broadcast('alert:set-status', { alertID: $rootScope.$stateParams.aid, newStatus: newStatus });
    }

}]);



                    



                    // TEMP

                    //console.log('$scope.chartOptions1', $scope.chartOptions1);
                    
                    //$scope.chartOptions1 = JSON.parse($scope.alertItem.highchart_plot);



                    // $scope.chartOptions1.options = {
                    //     chart: { type: 'line', animation: false, panning: true, margin: [55, 0, 0, 0] },
                    //     title: null,
                    //     legend: { enabled: false },
                    //     xAxis: {
                    //         type: 'datetime',
                    //         //ordinal: false,
                    //         text: null,
                            
                    //         //marginTop: 50,

                    //         //minPadding: 0,

                    //         lineWidth:1,
                    //         lineColor: "#FFF",

                            
                    //         minorTickInterval: 24 * 3600 * 1000,
                    //         minorTickWidth: 1,
                    //         minorTickLength: 5,
                    //         minorTickColor: '#ccc',
                    //         minorGridLineWidth: 0,
                            
                    //         //tickPixelInterval: 100,
                    //         tickmarkPlacement: 'on',

                    //         tickWidth: 1,
                    //         tickLength: 10,
                    //         tickColor: '#ccc',
                    //         gridLineWidth: 0,

                    //         endOnTick: false,
                    //         startOnTick: false,

                    //         labels: 
                    //         { 
                    //             rotation: 0, 
                    //             align: 'center', 
                    //             y: -25, 
                    //             format: '{value:%b}',
                    //             autoRotation: false,
                    //             style: 
                    //             {
                    //                 textOverflow: 'none'
                    //             },
                    //             formatter: function(args)
                    //             {
                    //                 var min = this.axis.min;
                    //                 var max = this.axis.max;

                    //                 var diffHours = moment(max).diff(moment(min), 'hours');

                    //                 if(diffHours < 24 * 30 * 5)
                    //                 {
                    //                     this.value = moment(this.value).format('MMM<br /><br />D');
                    //                 }
                    //                 else
                    //                 {
                    //                     this.value = moment(this.value).format('MMM');
                    //                 }

                    //                 return this.value; 
                    //             },
                    //             useHtml: true
                    //          },
                    //         showFirstLabel: true,
                    //         showLastLabel: true,

                    //         opposite: true
                    //     },
                    //     yAxis: {
                    //         gridLineColor: "#eee",
                    //         minorGridLineWidth: 0,
                    //         title: null,
                    //         showLastLabel: false,
                    //         endOnTick: false,
                    //         startOnTick: false,
                    //         labels: {
                    //             align: 'left', x: 5, y: -3
                    //         }
                            
                    //     },
                    //     plotOptions: {
                    //         title: null,
                    //         series: {
                    //             pointPadding: 0,
                    //             groupPadding: 0, 
                    //         },
                    //         line: { animation: false, states: { hover: { enabled: false } }, marker: { enabled: false } }
                    //     }
                    // }

                    // $scope.chartOptions1.series = [{ lineWidth: 1, animation: false, color: '#2588E3', 
                    //     data: [[1440190800000,505.34559575036076],[1440277200000,612.96883011544],[1440363600000,606.5574361760462],[1440450000000,342.1636292207792],[1440536400000,354.5245438961039],[1440622800000,650.5888973953823],[1440709200000,688.8129046464646],[1440795600000,613.5637302597402],[1440882000000,634.3740437445889],[1440968400000,664.6148303968253],[1441054800000,344.32588046897547],[1441141200000,364.43460779220777],[1441227600000,333.03053882395375],[1441314000000,649.7186760173159],[1441400400000,640.5012792929293],[1441486800000,610.7399789754691],[1441573200000,629.4322545310246],[1441659600000,334.50017643578644],[1441746000000,321.43771766233766],[1441832400000,548.7486482828282],[1441918800000,558.0549358730158],[1442005200000,599.1159673520924],[1442091600000,560.19053492785],[1442178000000,582.5058713636363],[1442264400000,307.9001796608946],[1442350800000,331.64082949494946],[1442437200000,592.7623219985569],[1442523600000,505.0057433838383],[1442610000000,497.2757017965368],[1442696400000,511.0042191414141],[1442782800000,550.999632085137],[1442869200000,311.1102944444444],[1442955600000,324.0262334559884],[1443042000000,508.24710981240986],[1443128400000,486.82853146464646],[1443214800000,525.9182585353535],[1443301200000,555.191103051948],[1443387600000,579.1271542496393],[1443474000000,370.12038202020204],[1443560400000,311.4876938311688],[1443646800000,513.8767851082251],[1443733200000,433.5395629220779],[1443819600000,474.5473446969697],[1443906000000,442.1087922077922],[1443992400000,511.2527577849928],[1444078800000,298.97135417027414],[1444165200000,264.0818908658008],[1444251600000,435.41763054112556],[1444338000000,403.1344189105339],[1444424400000,439.8354149494949],[1444510800000,361.77505211399705],[1444597200000,421.74244435064935],[1444683600000,283.44025940836934],[1444770000000,251.56555120490617],[1444856400000,464.4063939105339],[1444942800000,453.95905800144294],[1445029200000,419.2116989393939],[1445115600000,455.65955764790755],[1445202000000,358.73855974747465],[1445288400000,274.5691538239538],[1445374800000,253.83438751803746],[1445461200000,273.9875147691197],[1445547600000,386.7901898124098],[1445634000000,456.87621509379505],[1445720400000,516.3543179076478],[1445806800000,475.1644627777777],[1445893200000,305.5114635425685],[1445979600000,301.1114306926407],[1446066000000,412.0632600793651],[1446152400000,422.84798687590177],[1446238800000,408.706617121212],[1446325200000,438.17040924242417],[1446411600000,402.5305871572872],[1446498000000,314.8310083982684],[1446584400000,318.25424283549773],[1446670800000,393.8592391847041],[1446757200000,397.92560797258295],[1446843600000,412.986756017316],[1446930000000,422.7103375396826],[1447016400000,431.43937176767673],[1447102800000,259.3666185281385],[1447189200000,294.5535613492064],[1447275600000,391.4571778499278],[1447362000000,445.0301812698413],[1447448400000,403.4407791774891],[1447534800000,427.35900157287153],[1447621200000,411.685784978355],[1447707600000,251.31691160894658],[1447794000000,301.6930697474747],[1447880400000,318.72050937950934],[1447966800000,328.43070629870124],[1448053200000,307.7136999639249],[1448139600000,233.26834093795088],[1448226000000,261.9196143795093],[1448312400000,259.07357900432896],[1448398800000,319.2443612265512],[1448485200000,400.6169082034631],[1448571600000,442.22857106060604],[1448658000000,462.7990431024531],[1448744400000,410.3582776118326],[1448830800000,410.30046593073587],[1448917200000,267.5939297474747],[1449003600000,277.0155898484848],[1449090000000,413.6792098124098],[1449176400000,408.74658546897547],[1449262800000,447.1666227417027],[1449349200000,398.3856567676768],[1449435600000,387.74959038239535],[1449522000000,279.9326651082251],[1449608400000,220.12152230158733],[1449694800000,372.47162568542575],[1449781200000,377.604425981241],[1449867600000,428.99422862193353],[1449954000000,376.3877497979798],[1450040400000,410.2559895238095],[1450126800000,265.4138887012986],[1450213200000,223.42931692640695],[1450299600000,372.50715442279943],[1450386000000,354.6981808441558],[1450472400000,371.46351138528144],[1450558800000,355.83014306637807],[1450645200000,366.38872658730156],[1450731600000,269.4587221284271],[1450818000000,263.87765119769114],[1450904400000,247.8270772799423],[1450990800000,239.67969051948052],[1451077200000,293.7366026767676],[1451163600000,445.745036933622],[1451250000000,409.7986534415584],[1451336400000,303.01618759740256],[1451422800000,319.1200498412698],[1451509200000,263.6368996536796],[1451595600000,273.9297948629148],[1451682000000,286.721414076479],[1451768400000,399.8302803679653],[1451854800000,481.02527007936504],[1451941200000,463.6293194588745],[1452027600000,381.62262289321785],[1452114000000,300.4720717316017],[1452200400000,304.9431444660894],[1452286800000,417.5643866666667],[1452373200000,414.167783008658],[1452459600000,378.1904962337663],[1452546000000,420.25060677489176],[1452632400000,422.34146939393946],[1452718800000,317.8502034920635],[1452805200000,349.0766727489178],[1452891600000,298.6383547113997],[1452978000000,432.29182514430016],[1453064400000,439.0717698412698],[1453150800000,472.8068181962482],[1453237200000,444.15108143578647],[1453323600000,282.1349015295815],[1453410000000,310.3643756565656],[1453496400000,385.139078059163],[1453582800000,452.742465945166],[1453669200000,416.4099709523809],[1453755600000,381.5249476406925],[1453842000000,431.2439654329004],[1453928400000,278.98991556277053],[1454014800000,312.7175718326117],[1454101200000,446.60641235930734],[1454187600000,412.2586453823954],[1454274000000,430.435967049062],[1454360400000,421.88009253968255],[1454446800000,451.5747493722943],[1454533200000,241.86860696248192],[1454619600000,273.8898349278499],[1454706000000,432.14981267676757],[1454792400000,423.1277068037518],[1454878800000,435.47977361471857],[1454965200000,440.3815508874459],[1455051600000,463.5893939393939],[1455138000000,329.4963045670996],[1455224400000,326.8634309090909],[1455310800000,517.1490766161617],[1455397200000,489.8830633333333],[1455483600000,464.4418633766234],[1455570000000,392.6693884199134],[1455656400000,401.2427521645021],[1455742800000,278.95142670274157],[1455829200000,293.82984252525245],[1455915600000,414.882548044733],[1456002000000,400.5104084126984],[1456088400000,432.7891548124097],[1456174800000,466.488700050505],[1456261200000,411.28626134199123],[1456347600000,345.50247855699854],[1456434000000,327.42282793650793],[1456520400000,478.53443412698414],[1456606800000,434.7871527128427],[1456693200000,462.7679945093794],[1456779600000,467.4608397402598],[1456866000000,311.75853339105333],[1456952400000,349.0589127777778],[1457038800000,462.15974073593077],[1457125200000,469.0638958658008],[1457211600000,451.99655671717176],[1457298000000,439.05844986291487],[1457384400000,419.77536847041847],[1457470800000,284.0085784848484],[1457557200000,301.84402950216446],[1457643600000,405.93166369408357],[1457730000000,477.28690551948046],[1457816400000,502.0885874386724],[1457902800000,498.1414506782107],[1457989200000,514.4273442135642],[1458075600000,285.06973676046175],[1458162000000,301.82182953823957],[1458248400000,495.14410680375175],[1458334800000,502.87906599567106],[1458421200000,542.8388817532466],[1458507600000,484.4529697474748],[1458594000000,498.4566817532467],[1458680400000,315.0796479942279],[1458766800000,280.8917035497835],[1458853200000,468.5844102958153],[1458939600000,482.4638950432901],[1459026000000,537.7239775613276],[1459112400000,514.8225708730159],[1459198800000,492.0008565295815],[1459285200000,292.91076401875887],[1459371600000,281.9661818037518],[1459458000000,426.8395560678211],[1459544400000,417.3113235209235],[1459630800000,444.6083999278499],[1459717200000,402.69913021645016],[1459803600000,309.90261640692637],[1459890000000,291.54768623376617],[1459976400000,279.8127853030302],[1460062800000,444.39529595238093],[1460149200000,452.27632520923527],[1460235600000,480.5545983405483],[1460322000000,455.0557102164503],[1460408400000,423.0477938167388],[1460494800000,320.46535924242426],[1460581200000,286.43725453823953],[1460667600000,509.04163296536797],[1460754000000,487.3433545743145],[1460840400000,445.52751132034626],[1460926800000,486.9127089249638],[1461013200000,478.97845864357856],[1461099600000,345.3159988600289],[1461186000000,292.58664454545453],[1461272400000,416.5299012337663],[1461358800000,446.71298059884555],[1461445200000,452.511636031746],[1461531600000,528.1292124242425],[1461618000000,483.39624305194803],[1461704400000,316.89116505050504],[1461790800000,320.8605186002885],[1461877200000,533.426106991342],[1461963600000,594.103182994228],[1462050000000,591.1726929220779],[1462136400000,597.7127709379508],[1462222800000,539.7619766955266],[1462309200000,365.26932643578635],[1462395600000,380.9336209812409],[1462482000000,527.9071875468975],[1462568400000,560.0883814430014],[1462654800000,519.4578717171718],[1462741200000,539.3312973953824],[1462827600000,517.8372839105339],[1462914000000,303.31366711399704],[1463000400000,304.001865995671],[1463086800000,432.37626913419916],[1463173200000,509.85210582972576],[1463259600000,526.664006010101],[1463346000000,529.5810648268398],[1463432400000,565.38517505772],[1463518800000,325.02523183261184],[1463605200000,381.90153940836933],[1463691600000,547.4520273737373],[1463778000000,561.8598207864358],[1463864400000,513.8013136435787],[1463950800000,480.90094186868686],[1464037200000,460.4769750577201],[1464123600000,276.68703879509377],[1464210000000,360.1589704545454],[1464296400000,480.13283994228],[1464382800000,525.7271258513707],[1464469200000,522.192900007215],[1464555600000,525.8736624386725],[1464642000000,436.65182234487736],[1464728400000,295.8677992135642],[1464814800000,337.72805119047615],[1464901200000,437.0203165079365],[1464987600000,455.801671067821],[1465074000000,441.4470072871573],[1465160400000,404.75050056998566],[1465246800000,423.5892373809523],[1465333200000,336.3205734776334],[1465419600000,315.7278869408369],[1465506000000,472.89991502886005],[1465592400000,449.23043968253967],[1465678800000,499.6687328643578],[1465765200000,396.8161504834055],[1465851600000,418.44770049783546],[1465938000000,336.85781260461766],[1466024400000,315.6302070995671],[1466110800000,446.67743503607505],[1466197200000,406.1534618109668],[1466283600000,485.52300800865805],[1466370000000,465.2145035714285],[1466456400000,428.3757767460317],[1466542800000,360.8071420995671],[1466629200000,338.7626368109668],[1466715600000,445.1008957359307],[1466802000000,391.44342347041845],[1466888400000,398.4717102597403],[1466974800000,409.8027978427129],[1467061200000,416.55629836940835],[1467147600000,422.49662899711404],[1467234000000,399.6352269841269],[1467320400000,502.1906300288601],[1467406800000,400.48774689754686],[1467493200000,386.9590276984127],[1467579600000,473.8545417748917],[1467666000000,475.7948323881674],[1467752400000,388.1042762481962],[1467838800000,423.04718619047617],[1467925200000,427.36790182539687],[1468011600000,421.973080007215],[1468098000000,392.57574399711393],[1468184400000,386.09314306637805],[1468270800000,334.02066524531017],[1468357200000,308.39314543290044],[1468443600000,310.5451416017316],[1468530000000,427.9283382034632],[1468616400000,498.12383334054834],[1468702800000,494.7317886002886],[1468789200000,494.78937963924955],[1468875600000,461.79522501443006],[1468962000000,318.71156209235204],[1469048400000,371.5031099567099],[1469134800000,467.4745983261184],[1469221200000,546.4976289177489],[1469307600000,507.527839011544],[1469394000000,527.4189527705628],[1469480400000,503.0434466810967],[1469566800000,370.56187316738817],[1469653200000,380.91594398989895],[1469739600000,454.24778678210674],[1469826000000,518.0105782323233],[1469912400000,634.3340486291485],[1469998800000,579.970557092352],[1470085200000,551.2260212409813],[1470171600000,332.17366151515154],[1470258000000,377.0044713347764],[1470344400000,506.87492413419915],[1470430800000,570.6421938167388],[1470517200000,568.8928198340548],[1470603600000,567.7783701731602],[1470690000000,569.0171059812408],[1470776400000,350.1289594516594],[1470862800000,329.3542247979798],[1470949200000,587.1589704184703],[1471035600000,514.9425011544012],[1471122000000,555.2709387950938],[1471208400000,0],[1471294800000,0],[1471381200000,0],[1471467600000,0],[1471554000000,0],[1471640400000,0],[1471726800000,0],[1471813200000,0]] 
                    // }]

                    // // JSON.stringify($scope.chartOptions1);
                    // console.log('JSON.stringify($scope.chartOptions1)', JSON.stringify($scope.chartOptions1));


