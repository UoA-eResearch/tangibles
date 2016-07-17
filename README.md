# Tangibles
The Penan people of Malaysian Borneo were traditionally nomads of the rainforest. They would leave messages in the jungle for each other by shaping natural objects into language tokens and arranging these symbols in specific ways -- much like words in a sentence. With settlement, the language is being lost as it is not being used by the younger generation. We report here, a tangible system designed to help the Penan preserve their unique object writing language. The key features of the system are that: its tangibles are made of real objects; it works in the wild; and new tangibles can be fabricated and added to the system by the users. Our evaluations show that the system is engaging and encourages intergenerational knowledge transfer and thus has the potential to help preserve this language.

## Overview
Tangibles is built with the [Meteor](https://www.meteor.com/) framework. The user interface is created with [Angular JS 1](https://angularjs.org/) and [Angular Material](https://material.angularjs.org/latest/). [Angular UI Router](https://github.com/angular-ui/ui-router) is used to navigate between different pages of the app. Data is stored in MongoDB. The Tangibles app can be deployed as a website, an Android app (4.4 and above) or an iOS app.

### Software dependencies
* To build the Android apk you need a computer with an Ubuntu or MacOS operating system. You also need to install Android Studio and the Java JDK. Make sure your environment variables are set correctly. See the [Meteor tutorial](https://www.meteor.com/tutorials/angular/running-on-mobile) for more details.
* To build the iOS version you need a computer with MacOS and XCode.

### Making physical tangibles
* For instructions on how to make a set of tangibles see [this paper](https://www.irit.fr/recherches/ICS/events/conferences/interact2013/papers/8117509.pdf).

## Running the App
Install [Meteor](https://www.meteor.com/).

Open a terminal, clone the repository and cd into tangibles.
```bash
git clone https://github.com/UoA-eResearch/tangibles.git
cd tangibles
```

Download dependencies.
```bash
meteor npm install
```

Starting the Meteor app, see the [Meteor tutorial](https://www.meteor.com/tutorials/angular/running-on-mobile) for more details. Ensure your device is connected to the network.
* Web: `meteor`
* Android: `meteor run android-device`
* iOS: `meteor run ios-device`

Open the application in your brower [http://localhost:3000](http://localhost:3000).

## Architecture
The files that glue everything together are contained in the `tangibles/client` directory. `main.html` contains the root ui-router view, `main-view`, this is replaced by content when the user navigates to different pages of the app. `main.js` contains the tangibles app module, where the apps dependencies and configuration is defined. This includes the apps colour scheme, icons and the definition of the 'routes' for ui-router.

`tangibles/client` contains the main scss, javascript and html files. The routes are in main.js.
`imports/api/collections` contains the diagrams and libraries collections.
`imports/api/tangibles` contains the recogniser and the tangible visualisation code.
`imports/api/components` contains all of the user interface components. Each component has a controller (the javascript file) and a template (the html file).



