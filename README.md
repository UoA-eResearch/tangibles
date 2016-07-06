# Tangibles
The Penan people of Malaysian Borneo were traditionally nomads of the rainforest. They would leave messages in the jungle for each other by shaping natural objects into language tokens and arranging these symbols in specific ways -- much like words in a sentence. With settlement, the language is being lost as it is not being used by the younger generation. We report here, a tangible system designed to help the Penan preserve their unique object writing language. The key features of the system are that: its tangibles are made of real objects; it works in the wild; and new tangibles can be fabricated and added to the system by the users. Our evaluations show that the system is engaging and encourages intergenerational knowledge transfer and thus has the potential to help preserve this language.

## Dependencies
* Tangibles is built with [Meteor](https://www.meteor.com/).
* To build the Android apk you need Ubuntu or MacOS along with Android Studio, the Java JDK and correct environment variables. See the [Meteor tutorial](https://www.meteor.com/tutorials/angular/running-on-mobile) for more details.
* To build the iOS version you need MacOS and XCode.
* The user interface is built with [Angular Material](https://material.angularjs.org/latest/).

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

Starting the Meteor app, see the [Meteor tutorial](https://www.meteor.com/tutorials/angular/running-on-mobile) for more details.
* Web: `meteor`
* Android: `meteor run android-device`
* iOS: `meteor run ios-device`

Open the application in your brower [http://localhost:3000](http://localhost:3000).

## Architecture
`tangibles/client` contains the main scss, javascript and html files. The routes are in main.js.
`imports/api/collections` contains the diagrams and libraries collections.
`imports/api/tangibles` contains the recogniser and the tangible visualisation code.
`imports/api/components` contains all of the user interface components. Each component has a controller (the javascript file) and a template (the html file).



