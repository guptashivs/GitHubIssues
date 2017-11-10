(function(){
	'use strict';

	function dropdownFilterModal(){
		return {
			restrict: 'E',
			templateUrl: 'dropdownFilterModal/templates/dropdownFilterModal.html',
			scope:{
				label:'@',
				keyword: '@',
				issueList:'=',
				toggleDropdown:'=',
				selected:'&'
			},
			replace:true,
			link:function(scope, element, attrs, controllers){
				scope.$watch('selectedLabelFilter', function(newVal){
					scope.getResults();
				})
			},
			controller: function($scope, $http, $filter){
				var filterObject = {};
				filterObject[$scope.keyword] = "";
				$scope.filteredData = $filter('filter')($scope.issueList, filterObject);
				$scope.getResults = function() {
				    filterObject[$scope.keyword] = $scope.selectedLabelFilter || "";
		            $scope.filteredData = $filter('filter')($scope.issueList, filterObject);
		            // console.log("$scope.filteredData", $scope.filteredData);
				}
				// console.log('toggleDropdown', $scope.toggleDropdown)
				$scope.closeDropdown = function(){
					$scope.toggleDropdown = !$scope.toggleDropdown;
				}
				$scope.selectedItem = function(item){
					// console.log('item', item);
					$scope.closeDropdown();
					$scope.selected({item:item, keyword:$scope.keyword});
				}
				// $scope.appendResultTo = function(){

				// }
			}
		}
	}

	angular.module('githubAPP')
		.directive('dropdownFilterModal', dropdownFilterModal);
})();
