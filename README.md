# One Hour at a Time - Personal Time Management App

A React Native mobile application for managing your hourly schedule with activity groups and local notifications.

## Features

### 📅 Weekly Planning
- **4-column layout**: Always displays 4 columns at a time
- **First view**: Todo List + Mon/Tue/Wed
- **Second view**: Thu/Fri/Sat/Sun (swipe right to access)
- **Multi-week navigation**: Swipe through different weeks
- **Weekend highlighting**: Saturday and Sunday have red borders

### ✅ Todo List
- Simple checkbox-based todo list
- Add, complete, and delete todos
- Persists per week

### ⏰ Hourly Blocks
- 24-hour day divided into hourly segments
- Freely editable text for each hour
- Auto-adjusting font size based on content length
- Multi-selection with long-press
- Clear or populate multiple hours at once

### 🎯 Activity Groups
- Create groups of activities (e.g., "Studies" containing Math, English, Science)
- Add/edit/delete groups and activities
- Multi-select delete for groups
- Rename groups and activities

### 🎲 Smart Populate
- Select multiple hourly blocks
- Choose an activity group
- System randomly assigns activities from the group to selected hours
- Perfect for creating varied schedules

### 🔔 Local Notifications
- Automatic notifications when activities change
- Get notified at the start of each new activity
- Works even when app is closed

### 💾 Data Persistence
- All data saved locally with AsyncStorage
- Week data persists across app restarts
- Activity groups available across all weeks

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)
- iOS Simulator or Android Emulator (optional)

### Installation

1. Navigate to the project directory:
```bash
cd OneHourAtaTime
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

## Usage Guide

### Managing Activity Groups

1. Tap the **☰ Groups** button in the header
2. Create a new group by entering a name and tapping **+**
3. Select a group to add activities to it
4. Add activities by entering text and tapping **+**
5. Long-press groups to multi-select for deletion
6. Tap **Rename** to rename a group

### Planning Your Week

1. **Navigate between weeks** using Prev/Next Week buttons
2. **Edit hourly blocks** by tapping and typing
3. **Multi-select hours**:
   - Long-press an hour block to start selection
   - Tap additional hours to add to selection
   - Selected blocks turn blue
4. **Clear selected hours**: Tap the **Clear** button
5. **Populate with activities**:
   - Tap **Populate**
   - Select an activity group
   - System randomly assigns activities to selected hours

### Managing Todos

1. Type in the input field at the top of the todo column
2. Tap **+** or press Enter to add
3. Tap checkbox to mark complete/incomplete
4. Tap **×** to delete a todo

### Swipe Navigation

- **First view** (default): Todo List, Monday, Tuesday, Wednesday
- **Swipe right**: Shows Thursday, Friday, Saturday, Sunday
- **Swipe left**: Back to first view
- Weekends (Sat/Sun) have red borders for easy identification

## Project Structure

```
OneHourAtaTime/
├── src/
│   ├── components/
│   │   ├── DailyColumn.tsx       # Daily column with hourly blocks
│   │   ├── HourBlockComponent.tsx # Individual hour block
│   │   └── TodoColumn.tsx        # Todo list column
│   ├── screens/
│   │   ├── MainScreen.tsx        # Main app screen
│   │   └── ActivityGroupScreen.tsx # Activity management modal
│   ├── context/
│   │   └── AppContext.tsx        # Global state management
│   ├── utils/
│   │   ├── storage.ts            # AsyncStorage utilities
│   │   ├── dateUtils.ts          # Date helper functions
│   │   └── notifications.ts      # Notification utilities
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── App.tsx                       # App entry point
├── app.json                      # Expo configuration
└── package.json                  # Dependencies
```

## Technical Details

### Technologies Used
- **React Native** with TypeScript
- **Expo** for development and deployment
- **AsyncStorage** for local data persistence
- **Expo Notifications** for local notifications
- **React Navigation** gesture handlers

### Key Components

- **AppContext**: Manages global state including week data, activity groups, and selections
- **MainScreen**: Horizontal scrolling view with week navigation
- **DailyColumn**: Displays a single day with 24 hourly blocks
- **HourBlockComponent**: Individual editable hour with auto-sizing text
- **TodoColumn**: Checkbox-based todo list
- **ActivityGroupScreen**: Modal for managing activity groups

## Building for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Troubleshooting

### Notifications not working
- Ensure notification permissions are granted
- Check device notification settings
- Restart the app after granting permissions

### Data not persisting
- AsyncStorage requires proper initialization
- Check for console errors
- Clear app data and restart if needed

### Swipe navigation issues
- Ensure you're using horizontal swipe gestures
- Try scrolling more than halfway across the screen

## Future Enhancements

Potential features to add:
- Export/import week data
- Cloud sync across devices
- Custom hour ranges (e.g., 6 AM - 11 PM only)
- Statistics and time tracking
- Color coding for different activity types
- Calendar view
- Recurring weekly templates

## License

This project is for personal use.

## Support

For issues or questions, please refer to the React Native and Expo documentation:
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
