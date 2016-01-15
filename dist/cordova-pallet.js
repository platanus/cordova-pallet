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
      var options = {
        title: 'Get file from...',
        buttonLabels: palletModesSrv.labelsFromModes(_modes),
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

(function(){

angular
  .module('platanus.cordovaPallet')
  .service('palletModesSrv', palletModesSrv);

function palletModesSrv() {
  var GALLERY_MODE = 'gallery',
      CAMERA_MODE = 'camera',
      VALID_MODES = [GALLERY_MODE, CAMERA_MODE];

  this.GALLERY_MODE = GALLERY_MODE;
  this.CAMERA_MODE = CAMERA_MODE;

  this.getModes = getModes;
  this.labelsFromModes = labelsFromModes;

  function setCameraOptions(_mode, _data) {
    _mode.label = !!_data.label ? _data.label : 'Camera';
    _mode.options.destinationType = Camera.DestinationType.FILE_URI;
    _mode.options.sourceType = Camera.PictureSourceType.CAMERA;
    _mode.options.encodingType = _data.options.hasOwnProperty('encodingType') ? _data.options.encodingType : Camera.EncodingType.JPEG;
    _mode.options.saveToPhotoAlbum = _data.options.hasOwnProperty('saveToPhotoAlbum') ? _data.options.saveToPhotoAlbum : true;
    _mode.options.correctOrientation = _data.options.hasOwnProperty('correctOrientation') ? _data.options.correctOrientation : true;
  }

  function setGalleryOptions(_mode, _data) {
    _mode.label = !!_data.label ? _data.label : 'Gallery';
    _mode.options.destinationType = Camera.DestinationType.FILE_URI;
    _mode.options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
    _mode.options.encodingType = _data.options.hasOwnProperty('encodingType') ? _data.options.encodingType : Camera.EncodingType.JPEG;
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
      setCameraOptions(mode, _data);
    } else if(mode.name === GALLERY_MODE) {
      setGalleryOptions(mode, _data);
    }

    return mode;
  }

  function getModes(_modesData) {
    var modes = [];

    if(!_modesData || !(_modesData instanceof Array)) {
      modes.push(buildMode({ name: GALLERY_MODE }));
      return modes;
    }

    var size = _modesData.length, i;

    for(i = 0; i < size; i++) {
      modes.push(buildMode(_modesData[i]));
    }

    return modes;
  }

  function labelsFromModes(_modes) {
    var labels = [], size = _modes.length, i;

    for(i = 0; i < size; i++) {
      labels.push(_modes[i].label);
    }

    return labels;
  }
}

})();
