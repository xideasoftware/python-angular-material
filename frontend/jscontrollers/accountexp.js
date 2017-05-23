
pdapp.controller('accountexpCtrl', ['AccountService', '$scope', '$rootScope', '$log', '$http', '$mdDialog', 
function(accountService, scope, rootScope, log, http, mdDialog) {
    
    scope.data = {
        'username': "",
        'email': "",
        'repassword': "",
        'password': "",
        'usernamesignin': "",
        'passwordsignin': "",
        iagree: ""
    };
    scope.user = {};
    scope.usernamesignin = {
        'username': "",
        'password': ""
    };
    scope.basepartialurl = basepartialurl;
    scope.isloaded = false;
    
    scope.signmeup = function() {
        
        if (scope.data.password != scope.data.repassword) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "The passwords do not match")
            });
        }
        
        if (!scope.data.iagree) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "Please agree to the Terms and Privacy")
            });
            return;
        }
        
        if (scope.data.username.length < 4) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "Please enter a longer username")
            });
            return;
        }
        
        if (scope.data.password.length < 5) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "Please enter a longer password")
            });
            return;
        }
        
        http(
        {
            method: "POST",
            url: "/account/signmeup",
            data: {
                "username": scope.data.username,
                "email": scope.data.email,
                "password": scope.data.password,
            }
        }).success(
        function(response) {
            var res = response;
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Welcome", response.message)
            });
            username = response.username;
            isloggedin = res.isloggedin;
            scope.isloggedin = isloggedin;
            if (isloggedin) {
                setTimeout(function() {
                    var referrer = document.referrer;
                    window.location.href = referrer;
                }
                , 2000);
                ga('send', 'event', 'RegisterSuccess', 'click', 'account', 1);
            }
        
        }
        );
    }
    
    scope.signin = function() {
        
        if (scope.usernamesignin.username.length < 5) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "Please input the username again")
            });
            return;
        }
        if (scope.usernamesignin.password.length < 6) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Please try again", "Please input the password again")
            });
            return;
        }
        
        http(
        {
            method: "POST",
            url: "/account/signin",
            data: {
                "username": scope.usernamesignin.username,
                "password": scope.usernamesignin.password,
            }
        }).success(
        function(response) {
            var res = response;
            if (response.isloggedin) {
                mdDialog.show({
                    controller: 'defaultPopupCtrl',
                    template: generateModal("Welcome", response.message)
                });
                setTimeout(function() {
                    var referrer = document.referrer;
                    window.location.href = referrer;
                }
                , 2000);
            } 
            else {
                mdDialog.show({
                    controller: 'defaultPopupCtrl',
                    template: generateModal("Sign-in issue", response.message)
                });
            }
        }
        );
    }
    
    scope.tandcs = function() {
        mdDialog.show({
            controller: 'defaultPopupCtrl',
            templateUrl: basepartialurl + 'privacyandterms.html'
        });
    }
    
    scope.resetpassword = function() {
        scope.requestmodal = mdDialog.show({
            templateUrl: basepartialurl + 'requestreset.html',
            controller: 'requestPasswordCtrl'
        });
    }
    
    scope.saveuserdetails = function() {
        if (scope.originalemail != scope.user.email_address)
            if (scope.user.email_address != scope.user.reemail_address) {
                mdDialog.show({
                    controller: 'defaultPopupCtrl',
                    template: generateModal("Please try again", "The new email addresses do not match")
                });
                return;
            }
        
        accountService.saveuserdetails({
            "username": scope.user.username,
            "email": scope.user.email_address,
            "name": scope.user.name,
            "area": scope.user.area
        }, 
        function(response) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                template: generateModal("Account Details", response.message)
            });
        }
        );
    }
    
    if (isloggedin) {
        accountService.detail({}, function(response) {
            scope.user = response["user"];
            scope.originalemail = scope.user.email_address;
        }
        );
    }
    
    scope.isloaded = true;

}
]);
