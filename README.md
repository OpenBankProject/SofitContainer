# SofitContainer
SofitContainer is a Cordova project, Cordova is an open-source mobile development framework. It allows using standard web technologies such as HTML5, CSS3 and JavaScript for cross-platform development. So, basically Sofit web application execute within wrappers targeted to each platform, reply on standards compliant API bindings to access each device's capabilities such as sensors, data, network status, etc. 

## How to run this app

**Install the Cordova CLI**
1. Download and install Node.js. This will allow you to install Cordova and other libraries/packages. You can find the download link here:

  https://nodejs.org/en/download/
  
2. Install the **cordova** module using **npm** utility of Node.js. The **cordova** module will automatically be downloaded by the **npm** utility. 

**on OS X and Linux:**\
$ sudo npm install -g cordova 

**on Windows:**\
c:\>npm install -g cordova

NOTE: The -g flag ablove tells npm to install cordova gloablly. Otherwise, it will be installed in the **node_modules** subdirectory of the current working director.

## Create the App
In the next step, Go to the directory where you maintain your source code, and create a cordova project. 

$ cordova create sofitCotainer com.example.hello SofitCotainer

This creates the required director structure for your cordova app. 

## Add Plateforms

All subsequent commands need to be run within the project’s directory, or any subdirectories:

$ cd sofitConatiner

Add the platforms that you want to target your app. We will add the **"ios"** and **"android"** platform and ensure they get saved to **config.xml** and **package.json**:
$ cordova platform add ios
$ cordova platform add android

To check your current set of platforms:

$ cordova platform ls

## Install pre-requisites for building 
To build and run apps, you need to install SDKs for each platform you wish to target. Alternative, if you are using browser for developemt you can use **browser** platform which does not require any platform SDKs. 

To check if you satisfy requirement for building the platform:

``` cordova requirements
Requirements check results for android:
Java JDK: installed .
Android SDK: installed
Android target: installed android-19,android-21,android-22,android-23,Google Inc.:Google APIs:19,Google Inc.:Google APIs (x86 System Image):19,Google Inc.:Google APIs:23
Gradle: installed

Requirements check results for ios:
Apple OS X: not installed
Cordova tooling for iOS requires Apple OS X
Error: Some of requirements check failed
```

After, satisfied all requirements, clone project from [SofitContainer](https://github.com/OpenBankProject/SofitContainer.git) inside created directory. 

At last but not least, Open your project in **Android Studio** (Note: you can use your favorite IDE like VS Code). Run command **npm install** in the terminal. With the help of this, all required packages will install automatically. 

Run command **cordova run android**, if you are using android phone or andorid amulator for testing purpose. 



# Final words
Be aware of file permission issues and preconfigured paths to executables (system env versus virtual env)!

Have fun, TESOBE


  
