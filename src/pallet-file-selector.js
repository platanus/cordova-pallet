(function(){

angular
  .module('platanus.cordovaPallet')
  .directive('palletFileSelector', palletFileSelector);

function palletFileSelector(trashIcon) {
  var directive = {
    link: link,
  };

  return directive;

  function link(_scope, _element, _attrs, _controller) {
  }
}

palletFileSelector.$inject = ['trashIcon'];

})();
