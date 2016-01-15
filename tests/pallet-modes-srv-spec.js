ngDescribe({
  name: 'Modes Service',
  modules: 'platanus.cordovaPallet',
  inject: 'palletModesSrv',
  tests: function(deps) {
    describe('labelsFromModes method', function() {
      it('returns labels', function() {
        var modes = [{ label: 'Camera' }, { label: 'Gallery'}];
        result = deps.palletModesSrv.labelsFromModes(modes);
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual('Camera');
        expect(result[1]).toEqual('Gallery');
      });
    });

    describe('getModes method', function() {
      it('returns default mode passing invalid data', function() {
        var invalidData = { needsTo: 'be Array'};
        result = deps.palletModesSrv.getModes(invalidData);
        expect(result.length).toEqual(1);
        expect(result[0].name).toEqual('gallery');
      });

      it('creates valid modes from given data', function() {
        var modes = [{ name: 'camera' }, { name: 'gallery'}];
        result = deps.palletModesSrv.getModes(modes);
        var camera = result[0], gallery = result[1];
        expect(result.length).toEqual(2);
        expect(camera.name).toEqual('camera');
        expect(camera.label).toEqual('Camera');
        expect(camera.options).toEqual({
          destinationType: 1,
          sourceType: 2,
          encodingType: 1,
          saveToPhotoAlbum: true,
          correctOrientation: true
        });
        expect(gallery.name).toEqual('gallery');
        expect(gallery.label).toEqual('Gallery');
        expect(gallery.options).toEqual({
          destinationType: 1,
          sourceType: 1,
          encodingType: 1
        });
      });

      it('allows custom label', function() {
        var modes = [{ name: 'camera', label: 'Desde la camara' }];
        result = deps.palletModesSrv.getModes(modes);
        expect(result[0].label).toEqual('Desde la camara');
      });

      it('overrides default options', function() {
        var cameraOptions = {
          destinationType: 6,
          sourceType: 6,
          encodingType: 6,
          saveToPhotoAlbum: false,
          correctOrientation: false
        }

        var galleryOptions = {
          destinationType: 6,
          sourceType: 6,
          encodingType: 6
        }

        var modes = [
          { name: 'camera', options: cameraOptions },
          { name: 'gallery', options: galleryOptions }
        ];

        result = deps.palletModesSrv.getModes(modes);
        var camera = result[0], gallery = result[1];

        expect(camera.options).toEqual({
          destinationType: 1, // can't be edited
          sourceType: 2, // can't be edited
          encodingType: 6,
          saveToPhotoAlbum: false,
          correctOrientation: false
        });

        expect(gallery.options).toEqual({
          destinationType: 1, // can't be edited
          sourceType: 1, // can't be edited
          encodingType: 6,
        });
      });

      it('raises error when mode data is not a json', function() {
        var modes = ['not a json'];
        expect(function() { deps.palletModesSrv.getModes(modes); }).toThrow(
          new Error('Mode data needs to be json'));
      });

      it('raises error when mode name is missing', function() {
        var modes = [{ notNameAttr: 'gallery' }];
        expect(function() { deps.palletModesSrv.getModes(modes); }).toThrow(
          new Error('Missing name attribute'));
      });

      it('raises error when mode name is invalid', function() {
        var modes = [{ name: 'invalid mode name' }];
        expect(function() { deps.palletModesSrv.getModes(modes); }).toThrow(
          new Error('Invalid name attribute'));
      });
    });
  }
});
