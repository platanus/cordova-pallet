(function(){

angular
  .module('platanus.cordovaPallet')
  .directive('palletFileSelector', palletFileSelector);

function palletFileSelector(trashIcon, $cordovaFileTransfer, $cordovaCamera) {
  var directive = {
    template:
      '<div class="pallet-file-selector">' +
        '<div class="upload-btn" ' +
          'ng-click="onUploadButtonClick()"> ' +
          '<button>{{ getButtonLabel() }}</button> ' +
        '</div>' +
      '</div>',
    require: 'ngModel',
    scope: {
      uploadUrl: '@',
      buttonLabel: '@'
    },
    link: link,
  };

  return directive;

  function link(_scope) {
    _scope.onUploadButtonClick = onUploadButtonClick;
    _scope.getButtonLabel = getButtonLabel;

    function getButtonLabel() {
      return (_scope.buttonLabel || 'Select file...');
    }

    function onUploadButtonClick() {
      function uploadSuccess(_result) {
        console.info('SUCCESS', _result);
      }

      function uploadError(_error) {
        console.info('ERROR', _error);
      }

      function uploadProgress(_progress) {
        console.info('PROGRESS', _progress);
      }

      var cameraOptions = {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
      };

      $cordovaCamera.getPicture(cameraOptions).then(function(_imageData) {
        $cordovaFileTransfer.upload(_scope.uploadUrl, _imageData, {
          mimeType: 'image/jpeg',
          fileName: 'image.jpg'
        }).then(uploadSuccess, uploadError, uploadProgress);
      });
    }
  }
}

palletFileSelector.$inject = ['trashIcon', '$cordovaFileTransfer', '$cordovaCamera'];

})();
