
App.icons({
  // iOS
  'iphone': 'resources/icons/Icon-60.png',
  'iphone_2x': 'resources/icons/Icon-60@2x.png',
  'ipad': 'resources/icons/Icon-76.png',
  'ipad_2x': 'resources/icons/Icon-76@2x.png',

  // Android
  'android_ldpi': 'resources/icons/36.png',
  'android_mdpi': 'resources/icons/48.png',
  'android_hdpi': 'resources/icons/72.png',
  'android_xhdpi': 'resources/icons/96.png'
});

App.launchScreens({
  // iOS
  'iphone': 'resources/splash/apple-320x480.png',
  'iphone_2x': 'resources/splash/apple-320x480@2x.png',
  'iphone5': 'resources/splash/apple-320x568@2x.png',
  'ipad_portrait': 'resources/splash/apple-768x1024.png',
  'ipad_portrait_2x': 'resources/splash/apple-768x1024@2x.png',
  'ipad_landscape': 'resources/splash/apple-1024x768.png',
  'ipad_landscape_2x': 'resources/splash/apple-1024x768@2x.png',

  // Android
  'android_ldpi_portrait': 'resources/splash/android-200x320.png',
  'android_ldpi_landscape': 'resources/splash/android-320x200.png',
  'android_mdpi_portrait': 'resources/splash/android-320x480.png',
  'android_mdpi_landscape': 'resources/splash/android-480x320.png',
  'android_hdpi_portrait': 'resources/splash/android-480x800.png',
  'android_hdpi_landscape': 'resources/splash/android-800x480.png',
  'android_xhdpi_portrait': 'resources/splash/android-720x1280.png',
  'android_xhdpi_landscape': 'resources/splash/android-1280x720.png'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('Orientation', 'landscape');
