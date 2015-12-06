(function(){
  'use strict';

  angular.module('platanus.cordovaPallet', ['ngCordova']);

})();

(function() {
  'use strict';

  angular
    .module('platanus.cordovaPallet')
    .constant('trashIcon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAqCAQAAADhEEisAAAAAmJLR0QA/4eP\nzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffCRQUHjb9AwcJAAAB\nwElEQVRIx+3Wv2sUQRQH8M/snZ4iiWIUsVJQbCJCasH8Cf5ABEGwsrBQ0MbO\nRgT/CAU7CVhY2QiKcAixEQvBKiBGLnB3CRHPQO4ua+He7a7snndaiXkDM7xh\nvvPefvc784Yim/ZEUztpLXUnC9cJhbP3XdPSy6xacrZoYbUQ/tK7DBj6grg8\n+l6zapn5eESmfUuW06ld7rmqom98q7vlE0HkqTPaNgojllnFd+esRC6a19AR\nJ/DR/WDsqblJ5Lz2LzSNa/Oiqude2/JnVv3J5ox9EwI3fU7/+23XJyKOj06n\n8FhDdyJ4I6+6WCwW+E2feiDK7dm1YDHjL1rIZLXi8UBtxZp/5oGKV6bAmht6\ndrgwPEh1dY+yLEU5la+jP+Tjmx62VBNJreOrqaHAcvCQEWTWD0lL8814kb+y\naukRjUuPb+G3hxH3UCjztpPfTv5/S/6fpm5SeCiDxziGgw4l/oz9mE2qAMdx\nKqkIud3uuqQrFqw6qqaZFIMNkROW9ZMt2uas6eCDK2n0t8McDtjUGnq7Tfsy\nfHVEDmvqgPfZ6MFDcxMwsOqyZnqn88IeR+wcA9r1xp1BiQw5GmtjwTNvkR//\nn52kKbQ1VwAAAABJRU5ErkJggg==\n');
})();

(function(){

angular
  .module('platanus.cordovaPallet')
  .directive('palletFileSelector', palletFileSelector);

function palletFileSelector(trashIcon, $cordovaFileTransfer, $cordovaCamera) {
  var directive = {
    template:
      '<div class="pallet-file-selector">' +
        '<button class="{{ getButtonClasses() }}" ' +
          'ng-click="onUploadButtonClick()">' +
          '{{ getButtonLabel() }}' +
        '</button>' +
        '<img class="remove-btn" ' +
          'ng-src="{{ trashIcon }}" ' +
          'ng-click="onRemoveUpload()" ' +
          'ng-hide="emptyIdentifier()" />' +
      '</div>',
    require: 'ngModel',
    replace: true,
    scope: {
      uploadUrl: '@',
      buttonClasses: '@',
      buttonLabel: '@',
      initCallback: '&',
      successCallback: '&',
      progressCallback: '&',
      errorCallback: '&',
      removeCallback: '&',
      doneCallback: '&'
    },
    link: link,
  };

  return directive;

  function link(_scope, _element, _attrs, _controller) {
    var IMAGE_NAME = 'image.jpg';

    _scope.onUploadButtonClick = onUploadButtonClick;
    _scope.getButtonLabel = getButtonLabel;
    _scope.onRemoveUpload = onRemoveUpload;
    _scope.emptyIdentifier = emptyIdentifier;
    _scope.trashIcon = trashIcon;
    _scope.getButtonClasses = getButtonClasses;

    function getButtonClasses() {
      return ['upload-btn', _scope.buttonClasses].join(' ');
    }

    function getButtonLabel() {
      return (_scope.buttonLabel || 'Select file...');
    }

    function emptyIdentifier() {
      return !_controller.$viewValue;
    }

    function onRemoveUpload() {
      (_scope.removeCallback || angular.noop)();
      setIdentifier(null);
    }

    function successCallback(_data) {
      var response = JSON.parse(_data.response),
          successData = (response.upload || response),
          progressData = { localFileName: IMAGE_NAME, loaded: 1, total: 1 };

      setIdentifier(successData.identifier);
      successData.localFileName = IMAGE_NAME;

      (_scope.progressCallback || angular.noop)({ event: progressData });
      (_scope.successCallback || angular.noop)({ uploadData: successData });
    }

    function errorCallback(_error) {
      var progressData = { localFileName: IMAGE_NAME, loaded: 1, total: 1 },
          errorData = { localFileName: IMAGE_NAME, error: _error.exception, status: _error.http_status };

      (_scope.progressCallback || angular.noop)({ event: progressData });
      (_scope.errorCallback || angular.noop)({ errorData: errorData });
    }

    function progressCallback(_event) {
      var progressData = { localFileName: IMAGE_NAME, loaded: (_event.loaded * 0.95), total: _event.total };
      (_scope.progressCallback || angular.noop)({ event: progressData });
    }

    function initupload() {
      setIdentifier(null);
      (_scope.initCallback || angular.noop)();
    }

    function setIdentifier(_identifier) {
      if(!_identifier) {
        _controller.$setViewValue(null);
        return;
      }

      _controller.$setViewValue(_identifier);
    }

    function onUploadButtonClick() {
      var cameraOptions = {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
      };

      $cordovaCamera.getPicture(cameraOptions).then(function(_imageData) {
        initupload();

        $cordovaFileTransfer.upload(_scope.uploadUrl, _imageData, {
          mimeType: 'image/jpeg',
          fileName: IMAGE_NAME
        }).then(successCallback, errorCallback, progressCallback);
      });
    }
  }
}

palletFileSelector.$inject = ['trashIcon', '$cordovaFileTransfer', '$cordovaCamera'];

})();
