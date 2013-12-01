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
 
  $scope.deleteTodo = function(index) {
    $http.delete('/todo/' + $scope.todos[index]._id)
      .success(function (data) {
        $scope.todos = data;
      });
  };
 
  $scope.updateTodo = function(index) {
    $http.put('/todo/' + $scope.todos[index]._id, $scope.todos[index])
      .success(function (data) {
        $scope.todos = data;
      });
  };
 
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
}
