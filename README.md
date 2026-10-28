# QuickNotes

A lightweight React Native note-taking app built with Expo for the mobile-app assessment.

## Features
- Create, edit, and delete notes
- Search notes by title or body
- Pin important notes
- Choose note colours
- Store notes locally on the device with AsyncStorage
- Responsive two-column notes layout

## Run locally
1. Install Node.js LTS and VS Code.
2. Extract this project folder.
3. Open a terminal in the folder and run:
   ```bash
   npm install
   npx expo start
   ```
4. Install Expo Go on an Android phone and scan the QR code to preview the app.

## Build an Android APK
Expo Application Services (EAS) can build the APK in the cloud, which avoids needing Android Studio locally.

1. Create an Expo account at https://expo.dev/
2. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
3. Sign in:
   ```bash
   eas login
   ```
4. Configure the project:
   ```bash
   eas build:configure
   ```
5. Create `eas.json` with:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
6. Build:
   ```bash
   eas build -p android --profile preview
   ```

## Assessment note
Use this as an original implementation inspired by common notes-app functionality. In the submission, state which existing app you used as the reference and verify its current 100K+ download count on the relevant app store. Do not claim the app is an exact copy of Google Keep or that it has been published to an app store.
