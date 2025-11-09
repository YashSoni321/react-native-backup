#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (NSURL *__nullable)bundleURL
{
  // Always return a valid URL to prevent base class from throwing exception
  NSURL *url = nil;
  
#if DEBUG
  @try {
    RCTBundleURLProvider *provider = [RCTBundleURLProvider sharedSettings];
    if (provider != nil) {
      // Use jsBundleURLForBundleRoot which automatically handles localhost vs IP address
      url = [provider jsBundleURLForBundleRoot:@"index"];
      NSLog(@"Bundle URL from provider: %@", url);
    }
  } @catch (NSException *exception) {
    // If provider throws, fall back to default
    NSLog(@"Warning: RCTBundleURLProvider threw exception: %@", exception);
  }
  
  // Fallback: Use RCTBundleURLProvider's default behavior which handles IP address correctly
  if (url == nil) {
    RCTBundleURLProvider *provider = [RCTBundleURLProvider sharedSettings];
    url = [provider jsBundleURLForBundleRoot:@"index"];
    NSLog(@"Bundle URL from fallback provider: %@", url);
  }
  
  // Final fallback to localhost (will work on device, but simulator may need IP)
  if (url == nil) {
    url = [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=true"];
    NSLog(@"Using localhost fallback: %@", url);
  }
#else
  url = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  if (url == nil) {
    url = [[NSBundle mainBundle] URLForResource:@"index" withExtension:@"jsbundle"];
  }
  // Final fallback - return localhost even in release if bundle not found
  if (url == nil) {
    url = [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=false"];
  }
#endif
  
  // Ensure we never return nil - this is critical to prevent base class exception
  if (url == nil) {
    NSLog(@"Error: bundleURL is nil, using fallback");
    url = [NSURL URLWithString:@"http://localhost:8081/index.bundle?platform=ios&dev=true"];
  }
  
  NSLog(@"Final bundle URL: %@", url);
  return url;
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
