# Tangibles
The Penan people of Malaysian Borneo were traditionally nomads of the rainforest. They would leave messages in the jungle for each other by shaping natural objects into language tokens and arranging these symbols in specific ways -- much like words in a sentence. With settlement, the language is being lost as it is not being used by the younger generation. We report here, a tangible system designed to help the Penan preserve their unique object writing language. The key features of the system are that: its tangibles are made of real objects; it works in the wild; and new tangibles can be fabricated and added to the system by the users. Our evaluations show that the system is engaging and encourages intergenerational knowledge transfer and thus has the potential to help preserve this language.

## Overview
Tangibles is built with the [Meteor](https://www.meteor.com/) framework. The user interface is created with [Angular JS 1](https://angularjs.org/) and [Angular Material](https://material.angularjs.org/latest/). The tangibles are drawn and touch points recognised with the [Konva.js](http://konvajs.github.io/) library. [Angular UI Router](https://github.com/angular-ui/ui-router) is used to navigate between different pages of the app. Data is stored in MongoDB. The Tangibles app can be deployed as a website, an Android app (4.4 and above) or an iOS app.

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
### Main view, Angular module and CSS
The files that glue everything together are contained in the `tangibles/client` directory. `main.html` contains the root ui-router view, `main-view`, this is replaced by content when the user navigates to different pages of the app. `main.js` contains the tangibles app module, where the apps dependencies and configuration is defined. This includes the apps colour scheme, icons and the definition of the 'routes' for ui-router. `main.css` contains the css styles.

### Collections and methods
The collections and Meteor methods are stored in `imports/api/collections`. There are two collections used in this application: `diagrams`, which stores diagrams (e.g. the I killed a boar library); and `libraries`, which stores the libraries (e.g. the Oroo library). The diagrams collection and methods are defined in diagrams.js and the libraries collection and methods are defined in libraries.js. Operations on the collections are performed through the Meteor methods defined in each respecitive file for secuirty reasons (since this is a multi user app).

See [`private/default_db`](https://github.com/UoA-eResearch/tangibles/tree/master/private/default_db) for json definitions of the data in the diagrams and libraries collections.

### Drawing and recognition
Drawing, recognition and utility code is stored in `imports/api/tangibles`. The tangibles are drawn and touch points recognised with the [Konva.js](http://konvajs.github.io/) library. See `controller.js` for the drawing controller and `visual.js` for the individual tangible drawing code. The recogniser is a class defined in `recogniser.js`: to create a new recogniser just subclass the `Recogniser` class and override the `predict` method.

### User interface
The user interface views are defined in `imports/api/components`. Each user interface view is defined as an [Angular 1.5 component](https://docs.angularjs.org/guide/component). Each component contains an Angular template (.html) and an Angular controller (.js). These are described below:

* tgDiagram:
* tgDialog:
* tgHome: 
* tgImages:
* tgLibraries:
* tgNew:
* tgOpen: 
* tgSidenav:
* tgToolbar:




