angular.module('app.templates', []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/daterange-datepicker.html",
        '<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)">' +
        '  <uib-daypicker template-url="template/daterange-daypicker.html" ng-switch-when="day" tabindex="0"></uib-daypicker>' +
        '  <uib-monthpicker ng-switch-when="month" tabindex="0"></uib-monthpicker>' +
        '  <uib-yearpicker ng-switch-when="year" tabindex="0"></uib-yearpicker>' +
        '</div>' +
    '');

    $templateCache.put("template/daterange-daypicker.html",
        '<table class="uib-daypicker" role="grid" aria-labelledby="{{::uniqueId}}-title" aria-activedescendant="{{activeDateId}}">' +
        '  <thead>' +
        '    <tr>' +
        '      <th><button type="button" class="btn btn-default btn-sm pull-left uib-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>' +
        '      <th colspan="{{::5 + showWeeks}}"><button id="{{::uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm uib-title" ng-click="toggleMode()" ng-disabled="datepickerMode === maxMode" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>' +
        '      <th><button type="button" class="btn btn-default btn-sm pull-right uib-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>' +
        '    </tr>' +
        '    <tr>' +
        '      <th ng-if="showWeeks" class="text-center"></th>' +
        '      <th ng-repeat="label in ::labels track by $index" class="text-center"><small aria-label="{{::label.full}}">{{::label.abbr}}</small></th>' +
        '    </tr>' +
        '  </thead>' +
        '  <tbody>' +
        '    <tr class="uib-weeks" ng-repeat="row in rows track by $index">' +
        '      <td ng-if="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>' +
        '      <td ng-repeat="dt in row track by dt.date" class="uib-day text-center" role="gridcell" id="{{::dt.uid}}" ng-class="dt.customClass">' +
        '        <button type="button" style="min-width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="::{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{::dt.label}}</span></button>' +
        '      </td>' +
        '    </tr>' +
        '  </tbody>' +
        '</table>' +
    '');

    $templateCache.put("template/rz-slider.html",
        '<span class="rz-bar-wrapper"><span class="rz-bar"></span></span>' + <!-- // 0 The slider bar -->
        '<span class="rz-bar-wrapper"><span class="rz-bar rz-selection"></span></span>' + <!-- // 1 Highlight between two handles -->
        '<span class="rz-pointer"></span>' + <!-- // 2 Left slider handle -->
        '<span class="rz-pointer"></span>' + <!-- // 3 Right slider handle -->
        '<span class="rz-bubble rz-limit"></span>' + <!-- // 4 Floor label -->
        '<span class="rz-bubble rz-limit"></span>' + <!-- // 5 Ceiling label -->
        '<span class="rz-bubble rz-handle-label"></span>' + <!-- // 6 Label above left slider handle -->
        '<span class="rz-bubble rz-label"></span>' + <!-- // 7 Label above right slider handle -->
        '<span class="rz-bubble rz-label"></span>' + <!-- // 8 Range label when the slider handles are close ex. 15 - 17 -->
        '<ul class="rz-ticks"></ul>' + <!-- // 9 The ticks -->
    '');


    $templateCache.put("template/tree-node-2.html",
        '<div ui-tree-handle data-nodrag ng-style="{opacity: node.nodes.length == 0 && (node.type == 2 || node.type == 1) ? \'0.4\' : \'1\' }">' +
        '    <a class="expander" data-nodrag style="position: absolute; left: -21px; top: 0; line-height: 22px;"" ng-show="node.type == 3 && node.nodes.length > 0">' +
        '        <i ng-click="toggle(this)" class="fa" style="font-size:11px;" ng-class="{ \'fa-plus-square-o\': this.collapsed, \'fa-minus-square-o\': !this.collapsed }"></i>' +
        '    </a>' +
        '' +
        '    <a class="icon" data-nodrag>' +
        '        <i ng-click="toggle(this)" class="" ng-class="{ \'icon-building fs14\': node.type == 1, \'icon-building-6 fs16\': node.type == 2, \'icon-gauge-4\': node.type == 3 }" ng-style="{ \'color\': node.color }"></i>' +
        '    </a>' +
        '    <!-- groups & buildings -->' +
        '    <a class="text editable" ng-show="node.nodes.length > 0 && node.type != 3" ng-click="toggle(this);" ng-class="{selected: isSelected(node.id)}">' +
        '        <i class="icon-pencil" ng-click="edit(node, $event);" ng-style="{color: node.color}"></i>' +
        '        <span ng-bind="node.name"></span>' +
        '    </a>' +
        '    <!-- meters -->' +
        '    <a class="text pl25 editable" ng-hide="node.nodes.length > 0 && node.type != 3" ng-click="toggleSeries(node, this)" ng-style="{ \'color\': node.color }">' +
        '        <i class="icon-pencil" ng-click="edit(node, $event);" ng-style="{color: node.color}"></i>' +
        '        <span ng-bind="node.name"></span>' +
        '    </a>' +
        '</div>' +
        '<ol ui-tree-nodes="" ng-model="node.nodes" ng-class="{hidden: collapsed}">' +
        '    <li ng-repeat="node in node.nodes" ui-tree-node ng-include="\'template/tree-node-2.html\'" data-collapsed="true">' +
        '    </li>' +
        '</ol>' +
    '');

    $templateCache.put("template/dialog.prompt.html",
        '<form class="form-horizontal" name="newMeterForm">' + 
        '    <table class="table table-bordered">' + 
        '        <tbody>' + 
        '            <tr >' + 
        '                <td>' + 
        '                    <span ng-bind="config.model[0].name" title="{{config.model[0].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="p0">' + 
        '                    <input type="text" class="form-control" ng-model="config.model[0].value" autofocus>' + 
        '                </td></tr ><tr >' + 
        '                 <td>' + 
        '                    <span ng-bind="config.model[1].name" title="{{config.model[1].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="p0">' + 
        '                    <div  uib-dropdown dropdown-append-to-body>'+
        '                      <a class="dropdown-toggle" uib-dropdown-toggle role="menu" aria-labelledby="single-button">'+
        '                           <span  ng-bind="getType(config.model[1].value)">---</span> <i class="fa fa-caret-down" style="color: #333"></i>'+
        '                       </a>'+
        '                       <ul class="dropdown-menu uib-dropdown-menu">'+
        '                           <li ng-repeat="item in typeOptions">'+
        '                               <a class="" ng-click="config.model[1].value=item.id">{{item.name}}</a>'+
        '                           </li>'+
        '                       </ul>'+
        '                   </div>' + 
        '                </td>' + 
        '            </tr>' + 
        '        </tbody>' + 
        '    </table>' + 
        '</form>' +
    '');

    $templateCache.put("template/dialog.prompt.import.html",
        '<div class="flex">' + 
        '   <button class="btn btn-success flex-resize mb10" ng-click="config.onMerge()">保留现有数据</button>' + 
        '   <button class="btn btn-danger flex-resize" ng-click="config.onReplace()">替换现有数据</button>' + 
        '</div>' +
    '');

    $templateCache.put("template/ui.grid.chart.import.edit.dialog.html",
        '<form class="form-horizontal" name="newEntryForm">' + 
        '    <input type="hidden" ng-model="config.model[1].value">' + 
        '    <table class="table table-bordered">' + 
        '        <tbody>' + 
        '            <tr>' + 
        '                <td>' + 
        '                    <span ng-bind="config.model[0].name" title="{{config.model[0].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="rel p0">' + 
        '                   <div class="flex" uib-dropdown dropdown-append-to-body auto-close="disabled" is-open="config.model[0].isDatePickerOpen">' +
        '                       <div>' +
        '                           <span class="flex-resize" style="padding: 8px 12px;display:block">{{config.model[0].getDate()}}</span>' +
        '                           <button uib-dropdown-toggle class="btn btn-default btn-flat wa m0" style="position: absolute; right: 0; top: 0; border: 0; border-left: solid 1px #ccc; height: 100%; border-radius: 0;">' +
        '                               <i class="icon-pencil"></i>' +
        '                           </button>' +
        '                       </div>' +
        '                       <div class="uib-dropdown-menu datepicker" style="position: absolute; left: 0; top: 0; bottom:auto; border: solid 1px #ccc;">' +
        '                           <div class="flex">' +
        '                               <div class="flex" style="padding: 7.5px; background: #efefef; box-shadow: 0 5px 10px rgba(0,0,0,.05) inset;">' +
        '                                   <div class="flex" style="padding: 7.5px">' +
        '                                       <uib-datepicker template-url="template/daterange-datepicker.html" ng-model="config.model[0].value" starting-day="1" class="datepicker"></uib-datepicker>' +
        '                                   </div>' +
        '                                   <div class="flex flex-center" style="padding: 7.5px">' +
        '                                        <uib-timepicker ng-model="config.model[0].value" hour-step="1" minute-step="1" show-meridian="false"></uib-timepicker>' +
        '                                   </div>' +
        '                               </div>' +
        '                               <div class="flex" style="padding: 7.5px">' +
        '                                   <button class="btn btn-default btn-blue" ng-click="config.model[0].applyDateTime()">Apply</button>' +
        '                               </div>' +
        '                           </div>' +
        '                       </div>' +
        '                   </div>' +
        '                </td>' +
        '            </tr>' +
        '            <tr>' + 
        '                <td>' + 
        '                    <span ng-bind="config.model[1].name" title="{{config.model[1].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="p0">' + 
        '                    <input type="number" class="form-control" ng-model="config.model[1].value" autofocus>' + 
        '                </td>' + 
        '            </tr>' + 
        '        </tbody>' + 
        '    </table>' + 
        '</form>' +
    '');

    $templateCache.put("template/ui.grid.chart.import.edit.dialog.html",
        '<form class="form-horizontal" name="newEntryForm">' + 
        '    <input type="hidden" ng-model="config.model[1].value">' + 
        '    <table class="table table-bordered">' + 
        '        <tbody>' + 
        '            <tr>' + 
        '                <td>' + 
        '                    <span ng-bind="config.model[0].name" title="{{config.model[0].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="rel p0">' + 
        '                   <div class="flex " uib-dropdown dropdown-append-to-body auto-close="disabled" is-open="config.model[0].isDatePickerOpen">' +
        '                       <div>' +
        '                           <span class="flex-resize" style="padding: 8px 12px;display:block">{{config.model[0].getDate()}}</span>' +
        '                           <button uib-dropdown-toggle class="btn btn-default btn-flat wa m0" style="position: absolute; right: 0; top: 0; border: 0; border-left: solid 1px #ccc; height: 100%; border-radius: 0;">' +
        '                               <i class="icon-pencil"></i>' +
        '                           </button>' +
        '                       </div>' +
        '                       <div class="uib-dropdown-menu datepicker" style="position: absolute; left: 0; top: 0; bottom:auto; border: solid 1px #ccc;">' +
        '                           <div class="flex ">' +
        '                               <div class="flex " style="padding: 7.5px; background: #efefef; box-shadow: 0 5px 10px rgba(0,0,0,.05) inset;">' +
        '                                   <div class="flex " style="padding: 7.5px">' +
        '                                       <uib-datepicker template-url="template/daterange-datepicker.html" ng-model="config.model[0].value" starting-day="1" class="datepicker"></uib-datepicker>' +
        '                                   </div>' +
        '                                   <div class="flex  flex-center" style="padding: 7.5px">' +
        '                                        <uib-timepicker ng-model="config.model[0].value" hour-step="1" minute-step="1" show-meridian="false"></uib-timepicker>' +
        '                                   </div>' +
        '                               </div>' +
        '                               <div class="flex " style="padding: 7.5px">' +
        '                                   <button class="btn btn-default btn-blue" ng-click="config.model[0].applyDateTime()">Apply</button>' +
        '                               </div>' +
        '                           </div>' +
        '                       </div>' +
        '                   </div>' +
        '                </td>' +
        '            </tr>' +
        '            <tr>' + 
        '                <td>' + 
        '                    <span ng-bind="config.model[1].name" title="{{config.model[1].name}}" class="green"></span>' + 
        '                </td>' + 
        '                <td class="p0">' + 
        '                    <input type="number" class="form-control" ng-model="config.model[1].value" autofocus>' + 
        '                </td>' + 
        '            </tr>' + 
        '        </tbody>' + 
        '    </table>' + 
        '</form>' +
    '');

   $templateCache.put("template/dialog.generic.compare.html",
        '<form class="form-horizontal" name="newEntryForm" autocomplete="off">' + 
        '   <table class="table table-bordered">' +
        '       <tbody>' +
        '          <tr>' +
        '               <td>' +
        '                   <span ng-bind="config.model[0].name" title="{{config.model[0].name}}" class="green"></span>' + 
        '               </td>' +
        '              <td class="p0">' + 
        '                   <input autocomplete="new-password" type="{{config.model[0].type}}" class="form-control" ng-model="config.model[0].value" mandatory autofocus>' + 
        '               </td>' + 
        '           </tr>' +
        '           <tr>' +
        '               <td>' +
        '                   <span ng-bind="config.model[1].name" title="{{config.model[1].name}}" class="green"></span>' + 
        '               </td>' +
        '              <td class="p0">' + 
        '                   <input autocomplete="new-password" type="{{config.model[1].type}}" class="form-control" ng-model="config.model[1].value" mandatory compare-to="config.model[0].value != config.model[1].value ? \'*\' : \'\' ">' + 
        '               </td>' + 
        '           </tr>' +
        '       <tbody>' +
        '   </table>' +
        '</form>' +
    '');

   $templateCache.put("template/popover-list-menu.html",
        '<ion-popover-view>' + 
        '    <ion-content>' + 
        '       <div class="list m0">' + 
        '           <a class="item" ng-repeat="item in popover.scope.$parent.popData" ng-bind="item.title" ng-click="popSelected(item)">' + 
        '               ' + 
        '           </a>' + 
        '       </div>' + 
        '    </ion-content>' + 
        '</ion-popover-view>' + 
    '');

   $templateCache.put("template/popover-confirm-email.html",
        '<ion-popover-view style="max-width: 350px; height: 200px;">' + 
        '    <ion-content>' + 
        '       <div class="list m0">' + 
        '           <a class="item" ng-repeat="item in popover.scope.$parent.popData" ng-bind="item.title" ng-click="popSelected(item)">' + 
        '               ' + 
        '           </a>' + 
        '       </div>' + 
        '       <form name="emailConfirmForm">' + 
        '           <table class="table table-bordered">' +
        '               <tbody>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <span ng-bind="popoverEmail.model.title" title="{{popoverEmail.model.title}}" class="green wsnw"></span>' + 
        '                       </td>' +
        '                       <td class="p0">' + 
        '                           <input autocomplete="new-password" type="email" class="form-control" ng-model="popoverEmail.model.value" mandatory autofocus>' + 
        '                       </td>' + 
        '                   </tr>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <span ng-bind="popoverEmail.model.confirmTitle" title="{{popoverEmail.model.confirmTitle}}" class="green wsnw"></span>' + 
        '                       </td>' +
        '                       <td class="p0">' + 
        '                           <input autocomplete="new-password" type="email" class="form-control" ng-model="popoverEmail.model.value2" mandatory compare-to="popoverEmail.model.value != popoverEmail.model.value2 ? \'*\' : \'\' ">' + 
        '                       </td>' + 
        '                   </tr>' +
        '               </tbody>' +
        '               <tfoot>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <button class="btn btn-link" ng-click="popoverEmail.onCancel()">Cancel</button>' + 
        '                       </td>' +
        '                       <td>' + 
        '                           <button class="btn btn-link" ng-click="popoverEmail.onOk()" ng-disabled="emailConfirmForm.$invalid">Save</button>' + 
        '                       </td>' + 
        '                   </tr>' +
        '               </tfoot>' +
        '           </table>' +
        '       </form>' +
        '    </ion-content>' + 
        '</ion-popover-view>' + 
    '');

   $templateCache.put("template/popover-confirm-password.html",
        '<ion-popover-view style="max-width: 350px; height: 200px;">' + 
        '    <ion-content>' + 
        '       <div class="list m0">' + 
        '           <a class="item" ng-repeat="item in popover.scope.$parent.popData" ng-bind="item.title" ng-click="popSelected(item)">' + 
        '               ' + 
        '           </a>' + 
        '       </div>' + 
        '       <form name="passwordConfirmForm">' + 
        '           <table class="table table-bordered">' +
        '               <tbody>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <span ng-bind="popoverPassword.model.title" title="{{popoverPassword.model.title}}" class="green wsnw"></span>' + 
        '                       </td>' +
        '                       <td class="p0">' + 
        '                           <input autocomplete="new-password" type="password" class="form-control" ng-model="popoverPassword.model.value" mandatory autofocus>' + 
        '                       </td>' + 
        '                   </tr>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <span ng-bind="popoverPassword.model.confirmTitle" title="{{popoverPassword.model.confirmTitle}}" class="green wsnw"></span>' + 
        '                       </td>' +
        '                       <td class="p0">' + 
        '                           <input autocomplete="new-password" type="password" class="form-control" ng-model="popoverPassword.model.value2" mandatory compare-to="popoverPassword.model.value != popoverPassword.model.value2 ? \'*\' : \'\' ">' + 
        '                       </td>' + 
        '                   </tr>' +
        '               </tbody>' +
        '               <tfoot>' +
        '                   <tr>' +
        '                       <td>' +
        '                           <button class="btn btn-link" ng-click="popoverPassword.onCancel()">Cancel</button>' + 
        '                       </td>' +
        '                       <td>' + 
        '                           <button class="btn btn-link" ng-click="popoverPassword.onOk()" ng-disabled="passwordConfirmForm.$invalid">Save</button>' + 
        '                       </td>' + 
        '                   </tr>' +
        '               </tfoot>' +
        '           </table>' +
        '       </form>' +
        '    </ion-content>' + 
        '</ion-popover-view>' + 
    '');

   $templateCache.put("template/modal.html",
      '<ion-modal-view>' +
      '  <ion-header-bar>' +
      //'    <h1 class="title">TITLE</h1>' +
      '  </ion-header-bar>' +
      '  <ion-content>' +
      '    <div ag-grid="gridOptions" class="ag-fresh flex-absolute" style="top: 70px;"></div>' +
      '  </ion-content>' +
      '</ion-modal-view>' +
    '');

    $templateCache.put("templates/toast.progressbar.html",
        '<div class="toast-progress"></div>'
    );

    $templateCache.put("templates/unit.toast.html",
        '<div class="unit-toast" ng-click="tapToast()">' +  
        '    <i class="svg-building"></i>'+
        '    <div ng-switch on="allowHtml">' + 
        '        <div ng-switch-default ng-if="title" class="{{titleClass}}" aria-label="{{title}}">{{title}}</div>'+
        '        <div ng-switch-default class="{{messageClass}}" aria-label="{{message}}">{{message}}</div>'+
        '        <div ng-switch-when="true" ng-if="title" class="{{titleClass}}" ng-bind-html="title"></div>'+
        '        <div ng-switch-when="true" class="{{messageClass}}" ng-bind-html="message"></div>'+
        '    </div>'+
        '    <progress-bar ng-if="progressBar"></progress-bar>'+
        '</div>');
}]);

