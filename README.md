# PetCare (React Native Exam Project)

A simple mobile app to help you manage pet profiles and keep track of appointments (vet visits, vaccines, grooming, medication, etc.).

## APK

 APK Download
 `https://expo.dev/artifacts/eas/wEnFeiNwVEySpH6AfRS8tv.apk`

---

## How to run the project

### 1 Install dependencies
```bash
npm install
```

### 2 Start the app

 `npm start` 
- firewall may block access
- Same internet network required

## Functional Guide 

### App purpose

PetCare helps pet owners store pet profiles and manage a care schedule with reminders.

### User flow

1. **Register / Login**
   - Create an account with email + password, or log in.
   - Only authenticated users can use the app.
   - The app remembers the session (auto-login) after restart.

2. **Pets (List → Details)**
   - View all pets in a list.
   - Tap a pet to open **Pet Details**.
   - Add a new pet or edit an existing pet.
   - Upload a pet photo using the image picker.

3. **Schedule / Appointments**
   - View appointments grouped into Upcoming and Past.
   - Filter by pet and by type.
   - Add a new appointment or edit an existing one.
   - Enable a reminder (local notification) for appointments.

4. **Profile**
   - View account info.
   - Logout.

### Main features checklist

- Authentication: Login / Register / Logout
- Protected routes: Auth screens vs main app screens
- Session persistence: stays logged in after app restart
- Firestore CRUD:
  - Pets: Create / Read / Update / Delete
  - Appointments: Create / Read / Update / Delete
- Master-detail navigation: Pets list → Pet details
- Pull-to-refresh on list screens
- Loading & error states for Firestore data (Pets and Schedule)
- Forms with validation:
  - Email format validation
  - Password rules (required + minimum length)
  - Confirm password matches
  - Pet/Appointment form required fields
- Native features:
  - Image picker + Firebase Storage for pet photos
  - Local notifications for appointment reminders

### Error & edge case handling

- **Authentication errors**: invalid credentials, weak passwords, and duplicate accounts are shown to the user.
- **Data errors**: Pets and Schedule screens show a clear error message and allow retry.
- **Loading states**: Pets and Schedule show a loading card/spinner while waiting for the first Firestore snapshot.
- **Empty states**: friendly empty cards for “no pets” and “no upcoming appointments”.

---

## Tech stack

- React Native + Expo
- React Navigation (Stack + Tabs)
- Firebase Auth, Firestore, Firebase Storage

---

## Notes

- **Notifications**: The app schedules local reminders via `expo-notifications`. Make sure you accept notification permissions when prompted.
- **Images**: Pet photos are stored in Firebase Storage. Firestore stores only the Storage path; download URLs are resolved at runtime.

---

