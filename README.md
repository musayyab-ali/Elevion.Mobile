# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Shop branding (name, colours, benefits, contact)

Nothing about one shop is fixed in the code. The app reads `GET /TenantLanding/branding` (written by the shop in the admin under
Settings -> General and Branding & storefront):

- **Name, contact details, benefits, social links**: replace what the app shows as soon as the answer arrives.
- **Theme colours**: the screens' styles are built once when the app starts, so the colours of the last visit are kept on the phone
  (SecureStore, a few hundred bytes) and used from the next start. A shop that changes its theme sees it the next time the app is opened.
  Before the first visit, or when nothing can be read, the app's own colours are used. Whatever colours are picked, buttons and
  the header are darkened until text stays readable.
- **Welcome slides** are the shop's "why shop with us" points; without any they are three plain slides that only use the shop's name.
- The app's name on the home screen and the icon come from `app.json` and are set per build (EAS profile), not at run time.
- Profile -> Contact us shows the shop's contact details and sends a message to the shop (it arrives in the admin under Contact messages).
