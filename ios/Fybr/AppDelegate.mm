#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (NSURL *)bundleURL
{
#if DEBUG
  RCTBundleURLProvider *provider = [RCTBundleURLProvider sharedSettings];
  if (provider == nil) {
    // Fallback if provider is not available
    return [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=true"];
  }
  NSURL *url = [provider jsBundleURLForBundleRoot:@"index"];
  if (url == nil) {
    // Fallback to localhost if Metro bundler URL is not available
    url = [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=true"];
  }
  return url;
#else
  NSURL *url = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  if (url == nil) {
    // Fallback for release builds
    url = [[NSBundle mainBundle] URLForResource:@"index" withExtension:@"jsbundle"];
  }
  return url;
#endif
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"Fybr";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
