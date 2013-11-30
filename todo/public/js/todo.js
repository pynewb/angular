function TodoCtrl($scope, $http) {
  $http.get('/todo')
    .success(function (data) {
      $scope.todos = data;
    });
    
  $scope.addTodo = function() {
    $http.post('/todo', {text:$scope.todoText, done:false})
      .success(function (data){
        $scope.todos = data;
      });
    $scope.todoText = '';
  };
 
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
}
