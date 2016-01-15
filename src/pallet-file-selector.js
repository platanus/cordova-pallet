(function(){

angular
  .module('platanus.cordovaPallet')
  .directive('palletFileSelector', palletFileSelector);

function palletFileSelector(trashIcon, $cordovaFileTransfer, $cordovaCamera, $cordovaActionSheet, palletModesSrv) {
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
      modeSelectorOptions: '=',
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

    function initUpload() {
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

    function uploadFromCamera(_mode) {
      $cordovaCamera.getPicture(_mode.options).then(function(_imageData) {
        initUpload();

        $cordovaFileTransfer.upload(_scope.uploadUrl, _imageData, {
          mimeType: 'image/jpeg',
          fileName: IMAGE_NAME
        }).then(successCallback, errorCallback, progressCallback);
      }, function(_error) {
        console.error(_error);
      });
    }

    function uploadFromModeSelector(_modes) {
      var selectorOptions = palletModesSrv.modeSelectorOptions(_scope.modeSelectorOptions);

      var options = {
        title: selectorOptions.title,
        buttonLabels: palletModesSrv.labelsFromModes(_modes),
        addCancelButtonWithLabel: selectorOptions.cancelBtnLabel,
        androidEnableCancelButton: true
      };

      $cordovaActionSheet.show(options).then(function(_btnIndex) {
        _btnIndex -= 1;

        if(_btnIndex === _modes.length) { // Cancel button
          return;
        }

        uploadFromMode(_modes[_btnIndex]);
      });
    }

    function uploadFromMode(_mode) {
      switch(_mode.name) {
        case palletModesSrv.GALLERY_MODE:
        case palletModesSrv.CAMERA_MODE:
          uploadFromCamera(_mode);
          break;
      }
    }

    function onUploadButtonClick() {
      var modes = palletModesSrv.getModes(_scope.modes);

      if(modes.length > 1) {
        uploadFromModeSelector(modes);

      } else {
        uploadFromMode(modes[0]);
      }
    }
  }
}

palletFileSelector.$inject = [
  'trashIcon',
  '$cordovaFileTransfer',
  '$cordovaCamera',
  '$cordovaActionSheet',
  'palletModesSrv'
];

})();
