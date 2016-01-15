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
      modes: '=',
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

    function getModes() {
      var validModes = {
            camera: Camera.PictureSourceType.CAMERA,
            gallery: Camera.PictureSourceType.PHOTOLIBRARY
          },
          modes = [];

      if(!_scope.modes || !(_scope.modes instanceof Array)) {
        modes.push(validModes.gallery);
        return modes;
      }

      var size = _scope.modes.length, mode, i;

      for(i = 0; i < size; i++) {
        mode = validModes[_scope.modes[i]];

        if(mode !== undefined) {
          modes.push(mode);
        }
      }

      return modes;
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
