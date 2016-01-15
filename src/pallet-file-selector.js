(function(){

angular
  .module('platanus.cordovaPallet')
  .directive('palletFileSelector', palletFileSelector);

function palletFileSelector(trashIcon, $cordovaFileTransfer, $cordovaCamera, $cordovaActionSheet) {
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
    var IMAGE_NAME = 'image.jpg',
        GALLERY_MODE = 'gallery',
        CAMERA_MODE = 'camera',
        VALID_MODES = [GALLERY_MODE, CAMERA_MODE];

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

    function buildMode(_data) {
      if(!(_data instanceof Object)) {
        throw new Error('Mode data needs to be json');
      }

      if(!_data.name) {
        throw new Error('Missing name attribute');
      }

      if(VALID_MODES.indexOf(_data.name) === -1) {
        throw new Error('Invalid name attribute');
      }

      if(!_data.options) {
        _data.options = {};
      }

      var mode = { name: _data.name, label: 'Unknown', options: {} };

      if(mode.name === CAMERA_MODE) {
        mode.label = !!_data.label ? _data.label : 'Camera';
        mode.options.destinationType = Camera.DestinationType.FILE_URI;
        mode.options.sourceType = Camera.PictureSourceType.CAMERA;
        mode.options.encodingType = _data.options.hasOwnProperty('encodingType') ? _data.options.encodingType : Camera.EncodingType.JPEG;
        mode.options.saveToPhotoAlbum = _data.options.hasOwnProperty('saveToPhotoAlbum') ? _data.options.saveToPhotoAlbum : true;
        mode.options.correctOrientation = _data.options.hasOwnProperty('correctOrientation') ? _data.options.correctOrientation : true;

      } else if(mode.name === GALLERY_MODE) {
        mode.label = !!_data.label ? _data.label : 'Gallery';
        mode.options.destinationType = Camera.DestinationType.FILE_URI;
        mode.options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
        mode.options.encodingType = _data.options.hasOwnProperty('encodingType') ? _data.options.encodingType : Camera.EncodingType.JPEG;
      }

      return mode;
    }

    function getModes() {
      var modes = [];

      if(!_scope.modes || !(_scope.modes instanceof Array)) {
        modes.push(buildMode({ name: GALLERY_MODE }));
        return modes;
      }

      var size = _scope.modes.length, i;

      for(i = 0; i < size; i++) {
        modes.push(buildMode(_scope.modes[i]));
      }

      return modes;
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

    function labelsFromModes(_modes) {
      var labels = [], size = _modes.length, i;

      for(i = 0; i < size; i++) {
        labels.push(_modes[i].label);
      }

      return labels;
    }

    function uploadFromModeSelector(_modes) {
      var options = {
        title: 'Get file from...',
        buttonLabels: labelsFromModes(_modes),
        addCancelButtonWithLabel: 'Cancel',
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
        case GALLERY_MODE:
        case CAMERA_MODE:
          uploadFromCamera(_mode);
          break;
      }
    }

    function onUploadButtonClick() {
      var modes = getModes();

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
  '$cordovaActionSheet'
];

})();
