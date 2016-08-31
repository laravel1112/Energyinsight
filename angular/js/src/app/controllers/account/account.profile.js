angular.module('app.controllers.account.profile', [])

    .controller('profileUserCtrl', ['$q', '$scope', '$rootScope', '$timeout', 'UserService', 'CompanyService', 'accountService', '$ionicPopover', 
        function ($q, $scope, $rootScope, $timeout, UserService, CompanyService, accountService, $ionicPopover) {

        // Clones of resources used when the user cancels an edit.
        $scope.originals = {};

        $scope.editEntryConfig = {
            isVisible: false,
            title: 'New record',
            view: "template/dialog.generic.compare.html",
            model: [
                {
                    type: 'email',
                    name: 'value',
                    value: '',
                },
                {
                    type: 'email',
                    name: 'value',
                    value: '',
                }
            ],
            onOk: function(){
                this.hide();
            },
            onCancel: function(){
                this.hide();
            }
        };

        $scope.load = function(){
            $scope.loading = true;
            var promise = $q.all([
                UserService.get(),
                //CompanyService.get()
            ])
            .then(function(result)    {
                $scope.loading = false;

                $scope.entity = result[0];
                $scope.originals.entity = angular.copy($scope.entity);

            })
        }

        $ionicPopover.fromTemplateUrl('template/popover-confirm-email.html', { scope: $scope, focusFirstInput: true }).then(function(popover) {
            $scope.popoverEmail = popover;    
            $scope.popoverEmail.model = {
                type: 'email',
                title: '新邮箱地址',
                confirmTitle: '请再次确认新邮箱地址',
                value: '',
                value2: ''
            };        
            $scope.popoverEmail.onOk = function(){
                $scope.entity.email = $scope.popoverEmail.model.value;
                $scope.editForm.$setDirty();

                $scope.popoverEmail.model.value =   
                $scope.popoverEmail.model.value2 = '';   
                $scope.popoverEmail.hide();
            }
            $scope.popoverEmail.onCancel = function(){
                $scope.popoverEmail.hide();
                $scope.popoverEmail.model.value =   
                $scope.popoverEmail.model.value2 = '';   
            }
        });

        $ionicPopover.fromTemplateUrl('template/popover-confirm-password.html', { scope: $scope }).then(function(popover) {
            $scope.popoverPassword = popover;
            $scope.popoverPassword.model = {
                type: 'email',
                title: '新邮箱地址',
                confirmTitle: '请再次确认新邮箱地址',
                value: '',
                value2: ''
            };
            $scope.popoverPassword.onOk = function(){
                $scope.entity.password = $scope.popoverPassword.model.value;
                $scope.editForm.$setDirty();
                
                $scope.popoverPassword.model.value =   
                $scope.popoverPassword.model.value2 = '';   
                $scope.popoverPassword.hide();
            }
            $scope.popoverPassword.onCancel = function(){
                $scope.popoverPassword.hide();
                $scope.popoverPassword.model.value =   
                $scope.popoverPassword.model.value2 = '';   
            }
        });

        $scope.onEmailChanging = function(e){

            $scope.popoverEmail.show(e);            


            // $scope.editEntryConfig.title = '邮箱';
            // $scope.editEntryConfig.model[0].type =
            // $scope.editEntryConfig.model[1].type = 'email';
            // $scope.editEntryConfig.model[0].name = '新邮箱地址';
            // $scope.editEntryConfig.model[1].name = '请再次确认新邮箱地址';
            // $scope.editEntryConfig.onOk = function(){
            //     $scope.entity.email = $scope.editEntryConfig.model[0].value;
            //     this.hide();
            // }
            // $scope.editEntryConfig.show();
        }

        $scope.onPasswordChanging = function(e){

            $scope.popoverPassword.show(e);            

            // $scope.editEntryConfig.title = '密码';
            // $scope.editEntryConfig.model[0].type = 
            // $scope.editEntryConfig.model[1].type = 'password';
            // $scope.editEntryConfig.model[0].name = '新密码';
            // $scope.editEntryConfig.model[1].name = '请再次确认新密码';
            // $scope.editEntryConfig.onOk = function(){
            //     $scope.entity.password = $scope.editEntryConfig.model[0].value;
            //     this.hide();
            // }
            // $scope.editEntryConfig.show();
        }

        $scope.onAvatarSelected = function (file) {
            UserService.uploadAvatar($scope.originals.entity.id, file).then(function(result){
                //$rootScope.user.avatar = newClientSettings.avatar;
                //$rootScope.loadSettings();
                accountService.reload();
            })
        };

        $scope.saveEntity = function() {
            UserService.save($scope.originals.entity.id, $scope.entity).then(function(result) {
                $scope.entity = angular.copy(result.config.data);
                $scope.originals.entity = angular.copy($scope.entity);
                
                accountService.reload();
                $scope.editForm.$setPristine();
            });
        };

        $scope.resetEntity = function() {
            $scope.editForm.$setPristine();
            $scope.entity = angular.copy($scope.originals.entity);
        }

        $scope.isClean = function(){
            return angular.equals($scope.originals.entity, $scope.entity);
        }

        // Obtain resources
        $scope.load();
}])

    .controller('profileCompanyCtrl', ['$q', '$scope', '$rootScope', '$timeout', 'UserService', 'CompanyService', 'accountService', function ($q, $scope, $rootScope, $timeout, UserService, CompanyService, accountService) {

        $scope.originals = {};

        $scope.load = function(){
            $scope.loading = true;
            var promise = $q.all([
                    //UserService.get(),
                    CompanyService.get()
                ])
                .then(function(result)    {
                    $scope.loading = false;

                    $scope.entity = result[0];
                    $scope.originals.entity = angular.copy($scope.entity);
                })
        }

        $scope.onLogoSelected = function (file) {
            CompanyService.uploadLogo($scope.originals.entity.id, file);
            //$rootScope.loadSettings();
            accountService.reload();
        };

        $scope.isClean = function(){
            return angular.equals($scope.originals.entity, $scope.entity);
        }

        $scope.saveEntity = function() {
            CompanyService.save($scope.originals.entity.id, $scope.entity).then(function(result) {
                $scope.entity = angular.copy(result.config.data);
                $scope.originals.entity = angular.copy($scope.entity);

                accountService.reload();
                $scope.editForm.$setPristine();
            });
        };

        $scope.resetEntity = function() {
            $scope.editForm.$setPristine();
            $scope.entity = angular.copy($scope.originals.entity);
        }

        // Obtain resources
        $scope.load();

}])
