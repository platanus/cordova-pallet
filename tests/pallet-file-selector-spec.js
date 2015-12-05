ngDescribe({
  name: 'Async upload directive',
  modules: 'platanus.cordovaPallet',
  inject: ['$cordovaCamera', '$cordovaFileTransfer', '$q'],
  element:
    '<pallet-file-selector ' +
      'button-label="Upload please" ' +
      'init-callback="onInit()" ' +
      'success-callback="setUploadData(uploadData)" ' +
      'progress-callback="setProgress(event)" ' +
      'error-callback="setError(errorData)" ' +
      'remove-callback="onRemoveIdentifier()" ' +
      'upload-url="uploads" ' +
      'ng-model="user.uploadIdentifier">' +
    '</pallet-file-selector>',

    tests: function (deps) {
      describe('loading a file', function() {
        var imageData = 'content://com.android.providers.media.documents/document/image%3A25650';

        beforeEach(function() {
          var getPictureQ = deps.$q.defer();
          getPictureQ.resolve(imageData);

          deps.$cordovaCamera.getPicture = jasmine.createSpy('getPicture').and.returnValue(getPictureQ.promise);

          deps.parentScope.onInit = jasmine.createSpy('onInit');
          deps.parentScope.setUploadData = jasmine.createSpy('setUploadData');
          deps.parentScope.setProgress = jasmine.createSpy('setProgress');
          deps.parentScope.setError = jasmine.createSpy('setError');
          deps.parentScope.onRemoveIdentifier = jasmine.createSpy('onRemoveIdentifier');
        });

        describe('with successful response', function() {
          beforeEach(function() {
            var stringResponse = JSON.stringify({ upload: { identifier: 'OjynOLMx2h', id: '84' } });
            var successCallbackResponse = { response: stringResponse };
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

          it('calls defined init callback on parent scope', function() {
            expect(deps.parentScope.onInit).toHaveBeenCalled();
            expect(deps.parentScope.onInit.calls.count()).toEqual(1);
          });

          it('calls defined upload callback on parent scope with upload data', function() {
            var response = { identifier: 'OjynOLMx2h', id: '84', localFileName: 'image.jpg' };
            expect(deps.parentScope.setUploadData).toHaveBeenCalledWith(response);
            expect(deps.parentScope.setUploadData.calls.count()).toEqual(1);
          });

          it('calls defined progress callback on successful upload', function() {
            var progressEvent = { localFileName: 'image.jpg', loaded: 1, total: 1 };
            expect(deps.parentScope.setProgress).toHaveBeenCalledWith(progressEvent);
            expect(deps.parentScope.setProgress.calls.count()).toEqual(1);
          });

          it('sets upload identifier from response', function() {
            var scope = deps.element.scope();
            expect(scope.user.uploadIdentifier).toEqual('OjynOLMx2h');
          });

          it('shows remove button', function() {
            var element = deps.element.find('img');
            expect(element.hasClass('ng-hide')).toBe(false);
          });

          describe('clicking on remove button', function() {
            beforeEach(function() {
              deps.element.isolateScope().onRemoveUpload();
            });

            it('cleans identifier', function() {
              var scope = deps.element.scope();
              expect(scope.user.uploadIdentifier).toEqual(null);
            });

            it('hides remove button', function() {
              var element = deps.element.find('img');
              expect(element.hasClass('ng-hide')).toBe(true);
            });

            it('calls defined remove callback on parent scope', function() {
              expect(deps.parentScope.onRemoveIdentifier).toHaveBeenCalled();
              expect(deps.parentScope.onRemoveIdentifier.calls.count()).toEqual(1);
            });
          });
        });

        describe('with error response', function() {
          beforeEach(function() {
            var scope = deps.element.scope();
            scope.user = { uploadIdentifier: 'old identifier' };

            var errorCallbackResponse = { http_status: 500, exception: 'error :-(' };
            var uploadQ = deps.$q.defer();
            uploadQ.reject(errorCallbackResponse);

            deps.$cordovaFileTransfer.upload = jasmine.createSpy('upload').and.returnValue(uploadQ.promise);

            deps.element.isolateScope().onUploadButtonClick();
            deps.$rootScope.$apply();
          });

          it('calls defined error callback on parent scope with error data', function() {
            var response = { error: 'error :-(', status: 500, localFileName: 'image.jpg' };
            expect(deps.parentScope.setError).toHaveBeenCalledWith(response);
            expect(deps.parentScope.setError.calls.count()).toEqual(1);
          });

          it('hides remove button', function() {
            var element = deps.element.find('img');
            expect(element.hasClass('ng-hide')).toBe(true);
          });

          it('cleans uploadIdentifier from ng-model', function() {
            var scope = deps.element.scope();
            expect(scope.user.uploadIdentifier).toBeNull();
          });
        });
      });
    }
});
