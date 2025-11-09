import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import AppContainer from './navigation';
import AppWrapper from './shared/AppWrapper';

// Error Boundary
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  static getDerivedStateFromError(error: any) {
    return {hasError: true, error};
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('🚀 [ErrorBoundary] Error caught:', error);
    console.error('🚀 [ErrorBoundary] Error Info:', errorInfo);
    this.setState({errorInfo});
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.toString()}
          </Text>
          {this.state.errorInfo && (
            <Text style={styles.errorDetails}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('🚀 [App] Component rendering START');

  try {
    console.log(
      '🚀 [App] About to render ErrorBoundary > AppWrapper > AppContainer',
    );
    return (
      <ErrorBoundary>
        <AppWrapper>
          <AppContainer />
        </AppWrapper>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('🚀 [App] RENDER ERROR:', error);
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>App Render Error</Text>
        <Text style={styles.errorDetails}>{error?.toString()}</Text>
        <Text style={styles.errorDetails}>{(error as any)?.stack}</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
