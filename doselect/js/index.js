"use strict";
(function() {
    var gitModule = angular.module('githubAPP', ["ngRoute", "ngCkeditor", "ui.bootstrap"]);
    gitModule.controller('githubIssueCtrl', githubIssueCtrl);
    gitModule.controller('labelsPageController', labelsPageController);
    gitModule.controller('newIssueController', newIssueController);
    gitModule.controller('commentIssueController', commentIssueController);
    gitModule.service('getIssueListService', getIssueListService);
    gitModule.service('sharedProperties', sharedProperties);
    gitModule.directive('ckEditor', ckEditor);
    gitModule.config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "templates/issues_list.html"
            })
            .when("/labels", {
                templateUrl: "templates/labels_list.html",
                controller: "labelsPageController"
            })
            .when("/milestones", {
                templateUrl: "templates/milestones_list.html"
            })
            .when("/newissue", {
                templateUrl: "templates/create_newissue.html",
                controller: "newIssueController"
            })
            .when("/issuedetails/:id", {
                templateUrl: "templates/issue_view.html",
                controller: "commentIssueController"
            });
    });

    function ckEditor() {
        return {
            require: '?ngModel',
            link: function(scope, elm, attr, ngModel) {
                var ck = CKEDITOR.replace(elm[0]);
                if (!ngModel) return;
                ck.on('instanceReady', function() {
                    ck.setData(ngModel.$viewValue);
                });

                function updateModel() {
                    scope.$apply(function() {
                        ngModel.$setViewValue(ck.getData());
                    });
                }
                ck.on('change', updateModel);
                ck.on('key', updateModel);
                ck.on('dataReady', updateModel);

                ngModel.$render = function(value) {
                    ck.setData(ngModel.$viewValue);
                };
            }
        };
    }

    function githubIssueCtrl($scope, $http, getIssueListService, $filter, sharedProperties) {
        var gm = this;
        var filterObject = {};
        $scope.issueSort = ["Most commented", "Least Commented"];
        console.log('hello githubIssueCtrl')
        init();

        function init() {
            getIssueListService.getIssueListData().then(function(response) {
                if (response != 'error') {
                    gm.issueList = response;
                    $scope.issueList = response;
                    $scope.filteredData = $filter('filter')(response);
                    $scope.issueData = response;
                    $scope.filterFlag = false;
                    sharedProperties.setData(response);
                }
            });
        }
        $scope.clearFilter = function() {
            init();
            filterObject = {};
            $scope.searchFilterValues = "";
        }
        $scope.toggleDropdown = {
            'author': false,
            'label': false,
            'projects': false,
            'milestones': false,
            'assignee': false,
            'sort': false,
        };

        $scope.filteredList = function(data, keyword, open) {
            $scope.filterFlag = true;
            if(open==='closed' || open==='open'){
                filterObject[keyword] = open; 
            }else{
                filterObject[keyword] = data[keyword];                
            }

            console.log("filterObject", filterObject);
            convertFilterToString(filterObject)
            $scope.filteredData = $filter('filter')(gm.issueList, filterObject);
            sharedProperties.setData($scope.filteredData);
        }

        function convertFilterToString(filterObject) {
            var str = "";
            for (var obj in filterObject) {
                str += obj + ":" + filterObject[obj] + " ";
            }
            $scope.searchFilterValues = str;
            console.log(str);
        }

        $scope.sortIssueList = function(item) {
            if (item === 0) {
                $scope.filteredData = $filter('orderBy')($scope.filteredData, 'comment', true);
                sharedProperties.setData($scope.filteredData);
            } else if (item === 1) {
                $scope.filteredData = $filter('orderBy')($scope.filteredData, 'comment', false);
                sharedProperties.setData($scope.filteredData);
            }
        }
    }

    function labelsPageController($scope, $filter) {
        var labelsList = [
            { "name": "HTML", "code": "#00abe1", "open": 24 },
            { "name": "CSS", "code": "#b94a48", "open": 3 },
            { "name": "JS", "code": "#563d7c", "open": 20 },
            { "name": "AngularJS", "code": "#4bb14b", "open": 15 }
        ];
        $scope.labels = $filter('orderBy')(labelsList, 'name', false);
        $scope.labelsCount = $scope.labels.length;
        $scope.filterSort = ['Alphabetically', 'Reverse alphabetically', 'Most issues', 'Fewest issues'];
        $scope.sortLabelList = function(item) {
            if (item === 0) {
                $scope.labels = $filter('orderBy')(labelsList, 'name', false);
            } else if (item === 1) {
                $scope.labels = $filter('orderBy')(labelsList, 'name', true);
            } else if (item === 2) {
                $scope.labels = $filter('orderBy')(labelsList, 'open', true);
            } else if (item === 3) {
                $scope.labels = $filter('orderBy')(labelsList, 'open', false);
            }

        }
    }

    function getIssueListService($http) {
        var service = {
            getIssueListData: getIssueListData
        };
        return service;

        function getIssueListData() {
            return $http({
                method: 'GET',
                url: "dropdownFilterModal/dummy_data/author.json"
            }).then(function(response) {
                return response.data;
            }, function(error) {
                console.log("", error.data, error.status);
                return "error";
            });
        }
    }

    function newIssueController($scope) {
        $scope.newIssueContent = "Before opening an issue:<br/>" +
            "- [Search for duplicate or closed issues](https://github.com/twbs/bootstrap/issues?utf8=%E2%9C%93&q=is%3Aissue)<br/>" +
            "- [Validate](https://html5.validator.nu/) and [lint](https://github.com/twbs/bootlint#in-the-browser) any HTML to avoid common problems<br/>" +
            "- Prepare a [reduced test case](https://css-tricks.com/reduced-test-cases/) for any bugs <br/>" +
            "- Read the [contributing guidelines](https://github.com/twbs/bootstrap/blob/master/CONTRIBUTING.md) <br/>";

        //CKEditor setting
        $scope.editorOptions = {
            uiColor: '#E6E6E6',
            resize_enabled: false,
            width: 700,
            height: 250
        }
    }

    function commentIssueController($scope, sharedProperties, $routeParams) {
        $scope.newIssueContent = "Leave a comment";
        //CKEditor setting
        console.log('$routeParams', $routeParams);
        $scope.editorOptions = {
            uiColor: '#E6E6E6',
            resize_enabled: false,
            width: 700,
            height: 100
        }
        $scope.commentData = sharedProperties.getData()[$routeParams.id];
        console.log('dhewjd', sharedProperties.getData()[$routeParams.id]);
    }

    function sharedProperties() {
        var property;
        return {
            getData: function() {
                // console.log('property', property);
                return property;
            },
            setData: function(value) {
                property = value;
            }
        };
    }
})();