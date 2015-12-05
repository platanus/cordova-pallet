ngDescribe({
  name: 'Async upload directive',
  modules: 'platanus.cordovaPallet',
  inject: ['$cordovaCamera', '$cordovaFileTransfer', '$q'],
  element:
    '<pallet-file-selector ' +
      'button-label="Upload please" ' +
      'success-callback="setUploadData(uploadData)" ' +
      'progress-callback="setProgress(event)" ' +
      'error-callback="setError(errorData)" ' +
      'upload-url="uploads" ' +
      'ng-model="user.uploadIdentifier">' +
    '</pallet-file-selector>',

    tests: function (deps) {
      describe('loading a file', function(){
        describe('with successful response', function() {
          var imageData = 'content://com.android.providers.media.documents/document/image%3A25650';

          beforeEach(function() {
            var getPictureQ = deps.$q.defer();
            getPictureQ.resolve(imageData);

            deps.$cordovaCamera.getPicture = jasmine.createSpy('getPicture').and.returnValue(getPictureQ.promise);

            var successCallbackResponse = { response: { upload: { identifier: 'OjynOLMx2h', id: '84' } } };
            var uploadQ = deps.$q.defer();
            uploadQ.resolve(successCallbackResponse);

            deps.$cordovaFileTransfer.upload = jasmine.createSpy('upload').and.returnValue(uploadQ.promise);

            deps.element.isolateScope().onUploadButtonClick();
            deps.$rootScope.$apply();
          });

          it('change custom button label', function() {
            var element = deps.element.find('button');
            expect(element.text()).toBe('Upload please');
          });

          it('calls getPicture method with correct params', function() {
            var params = { destinationType: 1, sourceType: 0, encodingType: 0 };
            expect(deps.$cordovaCamera.getPicture).toHaveBeenCalledWith(params);
          });

          it('calls upload method with correct params', function() {
            expect(deps.$cordovaFileTransfer.upload).toHaveBeenCalledWith(
              'uploads', imageData, { mimeType: 'image/jpeg', fileName: 'image.jpg' });
          });
        });
      });
    }
});
