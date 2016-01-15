# Cordova Pallet

It's an angular directive to perform asynchronous file uploads from your mobile phone. It uses [ng-cordova](https://github.com/driftyco/ng-cordova) plugins such as: [$cordovaCamera](http://ngcordova.com/docs/plugins/camera) and [$cordovaFileTransfer](http://ngcordova.com/docs/plugins/fileTransfer) to achieve the goal. It was created to play with [Rails Pallet](https://github.com/platanus/rails_pallet) gem. Even though, it's not mandatory to use RoR or Rails Pallet. You can always mimic the server functionality.

## Installation

First, you need to **add** the following plugins in your Cordova application:

* [File Transfer](http://ngcordova.com/docs/plugins/fileTransfer)
* [Camera](http://ngcordova.com/docs/plugins/camera)
* [Action Sheet](http://ngcordova.com/docs/plugins/actionSheet)

Then, install ngCordova library:

```bash
bower install ngCordova
```

Finally, install the directive:

```bash
bower install https://github.com/platanus/cordova-pallet --save
```

Include the JS files in your project...

```html
<script src="lib/ngCordova/dist/ng-cordova.min.js"></script>
<script src="lib/cordova-pallet/dist/cordova-pallet.js"></script>
```

and the library as an Angular Dependency:

```javascript
angular.module('yourapp', ['platanus.cordovaPallet']);
```

> The library comes with a proposed stylesheet under `/dist/cordova-pallet.css`. You can use it or
> create your own.

## Usage

To make it simple, I'm going to give a use case example...

Suppose you have a `User` model. This model has the `avatar` attribute. If you send all the user data at once, you will have a rather large payload, and if it fails, all you will have is an angry user. So, from your application, you want to let the user:

1. Upload the avatar. See a preview (a thumbnail maybe), be sure the upload was successful.
3. Submit the form and link all the user data on the server.

In short, you want to perform a request to upload the avatar and then save the user with all the data in a lighter request.

**The advantages of doing this are:**

- You can have feedback after the file is saved.
- You can send to the server all the files you want. The final request (when you save the user), will have a reference to the saved avatar not the file itself, making the request lighter.

So, to achieve this, we can use the Pallet File Selector directive

This directive allows you to perform a `POST` to a given endpoint (`http://platan.us/api/uploads.json` on this example) with a file. The url must return a file identifier. This identifier (that represents the uploaded file), will be stored inside the `user.uploadIdentifier` attribute passed to the `ng-model`.

```html
<pallet-file-selector
  button-label="Upload Avatar"
  modes="captureModes"
  mode-selector-options="modeSelectorOptions"
  button-classes="button button-positive"
  init-callback="onInit()"
  success-callback="setUploadData(uploadData)"
  progress-callback="setProgress(event)"
  error-callback="setError(errorData)"
  upload-url="http://platan.us/api/uploads.json"
  ng-model="user.uploadIdentifier">
</pallet-file-selector>
```

In order to work the `POST /uploads` response must be a json with the following format:

```json
{
  "upload": {
    "identifier": "S0M3H4SH",
  }
}
```
> [Rails Pallet](https://github.com/platanus/rails_pallet) solves the server side for you.

## Directive Options:

### Mandatory

- *ng-model:* to keep the identifier(s) of the uploaded file.
- *upload-url:* must contain the url to perform the `POST` to save files.

### Optional

- *button-label:* you can pass this key as an HTML attribute to customize the upload button label. "Select File..." is the default value.
- *init-callback:* to perform your own operations when upload process begins.
- *success-callback:* to perform your own operations after a successful upload.
- *progress-callback:* it gives you information about upload progress.
- *error-callback:* to perform operations after a failed upload.
- *remove-callback:* to perform operations after click on remove icon.
- *modes*: to enable different capture modes. This modes are: `camera` and `gallery`. You can pass the modes like this:
```javascript
$scope.captureModes = [
  {
    name: 'camera',
    label: 'From Camera',
    options: {
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: true
    }
  },
  {
    name: 'gallery',
    label: 'From Pictures Gallery',
    options: {
      encodingType: Camera.EncodingType.JPEG
    }
  }
];
```
`name` it's the only mandatory attribute. If you don't set a mode, `gallery` will be the default.
- *mode-selector-options*: allows you to set options for mode selector modal.
```javascript
$scope.modeSelectorOptions = {
  title: 'Get Avatar...',
  cancelBtnLabel: 'Cancel'
};
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Credits

Thank you [contributors](https://github.com/platanus/cordova-pallet/graphs/contributors)!

<img src="http://platan.us/gravatar_with_text.png" alt="Platanus" width="250"/>

cordova-pallet is maintained by [platanus](http://platan.us).

## License

cordova-pallet is © 2016 platanus, spa. It is free software and may be redistributed under the terms specified in the LICENSE file.
