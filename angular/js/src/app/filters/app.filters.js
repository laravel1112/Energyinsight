angular.module('app.filters', [])
   // Used to filter editable form fields in Charts section
    // Angular replacement for backbone version of user_admin
    .filter('keyExists', ['$filter', function ($filter) {
        return function (items, keys) {
            if (!items) return false;
            var result = {};
            angular.forEach(items, function (value, key) {
                if (keys.indexOf(key) != -1)
                    result[key] = value;
            });
            return result;
        };
    }])

    // ng-bind-html
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }])