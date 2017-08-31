# HotS Hero Randomizer
Unoffical Heroes of the Storm, Hero Randomizer Mobile App. A simple and more customize-able way of selecting a hero at random to play.

I wanted to make a way to further customize how I pick heroes at random in HotS for quickplay so I decided to try my hand at making an app.

This app is built on the Ionic Framework using Firebase as a backend, currently I dont have access to a mac so I can't test it on that plaform, however Android has been tested on both a Google Pixel with Android version 5.1+ and on my personal LG G6 running Android version 7.0. 

**This is still a beta and bugs are expected to crop up.**

This app is for the community so its should be by the community so please feel free to contribute in the form of issues and/or pull requests!




## Project setup instructions:
* Use the included FirebaseExport.ts in the root of the project to setup your own personal firebase database by importing its contents on the firebase console.
* Rename the file at */src/app/AppConfigs_TEMPLATE.ts* to *AppConfigs.ts* the update the contents with your firebase information and an endpoint for fetching herostats on random roll, you can leave this as null to just have it not appear in the app.
* Run: `npm install`
* Run: `npm run clean`
* Optional: uncomment the first line of the constructor in HeroDataProvider at */src/providers/hero-data/hero-data.ts* to enable dev mode which will diable network checking that does not work in the browser.
* Run: `npm run ionic:serve` to get a local copy running in dev mode in your browser.


## Runnning on Android
#### Running on pysical device:
* Run: `npm run ionic:build-android`
* Copy the apk contained at */platforms/android/buid/outputs/apk* to your device
* Open the apk and install the app

#### Running on an emulator:
* Start your emulator via android studio
* Run: `ionic cordova run android` you can add a -l to enable live reload on the emulator
* Wait and the app should luanch on your emulated device.

Enjoy!


---


### Legal Info:
THIS APP AND IT'S DEVELOPERS ARE NOT AFFILIATED OR ENDORSED BY BLIZZARD ENTERTAINMENT, INC. HEROES OF THE STORM IS A TRADEMARK, AND BLIZZARD ENTERTAINMENT IS A REGISTERED TRADEMARK OF BLIZZARD ENTERTAINMENT, INC. IN THE U.S. AND/OR OTHER COUNTRIES. ALL OTHER TRADEMARKS REFERENCED HEREIN ARE THE PROPERTIES OF THEIR RESPECTIVE OWNERS.

HERO DATA ADAPTED FROM PUBLIC ENDPOINTS PROVIDED BY HOTSLOGS
