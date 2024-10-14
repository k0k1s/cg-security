# Cryptogem User Awareness application

Admin and User side
User Policy read and learning
Admin Manage

## Screenshots

![preview image](https://github.com/k0k1s/cg-security/blob/master/preview.jpg)

## Installation

To get started with Applicaiton, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/k0k1s/cg-security.git
    cd to file path
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up Firebase**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project.
   - Enable Authentication and Firestore Database.
   - Copy your Firebase config and add it to the project.
   - Create a `.env` file in the root directory:
     ```env
            EXPO_PUBLIC_FIREBASE_CONFIG='{
        "apiKey": "",
        "authDomain": "",
        "projectId": "",
        "storageBucket": "",
        "messagingSenderId": "",
        "appId": ""
        }'

     ```

4. **Run the app**:
    ```bash
    npx expo start
    ```
    This will start the Expo development server. Use the Expo Go app on your phone to scan the QR code and run the app.

