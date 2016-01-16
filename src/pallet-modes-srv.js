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
  this.modeSelectorOptions = modeSelectorOptions;

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

  function modeSelectorOptions(_data) {
    if(!_data) {
      _data = {};
    }

    if(!(_data instanceof Object)) {
      throw new Error('model selector options needs to be a json');
    }

    return {
      title: !!_data.title ? _data.title : 'Get file from...',
      cancelBtnLabel: !!_data.cancelBtnLabel ? _data.cancelBtnLabel : 'Cancel'
    };
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
