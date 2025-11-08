# Xcode Setup Instructions

To configure Xcode 16.4 for command line tools, run:

```bash
sudo xcode-select --switch /Applications/Xcode.app
```

If Xcode is installed in a different location, find it first:
```bash
find /Applications -name "Xcode*.app" -maxdepth 1
```

Then switch to the correct path:
```bash
sudo xcode-select --switch /Applications/Xcode.app
```

After running this command, verify it worked:
```bash
xcodebuild -version
```

You should see something like:
```
Xcode 16.4
Build version 16E232b
```

Then you can run:
```bash
npm run ios
```


