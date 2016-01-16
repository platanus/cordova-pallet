ngDescribe({
  name: 'File selector directive',
  modules: 'platanus.cordovaPallet',
  inject: ['$cordovaCamera', '$cordovaFileTransfer', '$q', '$cordovaActionSheet', 'palletModesSrv'],
  element:
    '<pallet-file-selector ' +
      'button-label="Upload please" ' +
      'button-classes="button button-positive" ' +
      'modes="modes" ' +
      'mode-selector-options="modeSelectorOpts" ' +
      'init-callback="onInit()" ' +
      'success-callback="setUploadData(uploadData)" ' +
      'progress-callback="setProgress(event)" ' +
      'error-callback="setError(errorData)" ' +
      'remove-callback="onRemoveIdentifier()" ' +
      'upload-url="uploads" ' +
      'ng-model="user.uploadIdentifier">' +
    '</pallet-file-selector>',

  tests: function(deps) {
    it('change custom button label', function() {
      var element = deps.element.find('button');
      expect(element.text()).toBe('Upload please');
    });

    it('adds custom classes to button', function() {
      var element = deps.element.find('button');
      expect(element.hasClass('button')).toBe(true);
      expect(element.hasClass('button-positive')).toBe(true);
      expect(element.hasClass('upload-btn')).toBe(true);
    });

    it('hides remove button', function() {
      var element = deps.element.find('img');
      expect(element.hasClass('ng-hide')).toBe(true);
    });

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

      describe('multiple modes', function() {
        beforeEach(function() {
          deps.parentScope.modes = [
            { name: 'gallery', label: 'Galería' },
            { name: 'camera', options: { saveToPhotoAlbum: false } }
          ];

          deps.parentScope.modeSelectorOpts = {
            title: 'Subir desde...',
            cancelBtnLabel: 'Cancelar!'
          };

          deps.$rootScope.$apply();

          var showQ = deps.$q.defer();
          showQ.resolve(2); // camera tab index
          deps.$cordovaActionSheet.show = jasmine.createSpy('show').and.returnValue(showQ.promise);
          deps.$cordovaFileTransfer.upload = jasmine.createSpy('upload').and.returnValue(deps.$q.defer().promise);

          deps.element.isolateScope().onUploadButtonClick();
          deps.$rootScope.$apply();
        });

        it('calls action sheet show method with correct params', function() {
          var params = {
            title: 'Subir desde...',
            buttonLabels: ['Galería', 'Camera'],
            addCancelButtonWithLabel: 'Cancelar!',
            androidEnableCancelButton: true
          };

          expect(deps.$cordovaActionSheet.show).toHaveBeenCalledWith(params);
        });

        it('calls getPicture method with correct params', function() {
          var params = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };

          expect(deps.$cordovaCamera.getPicture).toHaveBeenCalledWith(params);
        });
      });

      describe('file mode', function() {
        // TODO
      });

      describe('video mode', function() {
        // TODO
      });

      describe('default mode (library)', function() {
        beforeEach(function() {
          deps.parentScope.modes = null;
          deps.$rootScope.$apply();
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

          it('calls getPicture method with correct params', function() {
            var params = {
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG
            };

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
    });
  }
});
