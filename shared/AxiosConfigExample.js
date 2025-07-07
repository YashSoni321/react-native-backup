import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useAxiosLoading} from './useAxiosLoading';
import axios from 'axios';

/**
 * Example component showing how to configure axios interceptor loading
 */
const AxiosConfigExample = () => {
  const {
    configureLoading,
    setGlobalLoading,
    excludeUrls,
    setDebounceTime,
    createCustomAxios,
    forceHideLoading,
    checkApiLoading,
    getApiStatus,
  } = useAxiosLoading();

  useEffect(() => {
    // Example configurations

    // 1. Basic configuration - Enable global loading for all API calls
    configureLoading({
      showGlobalLoading: true,
      showIndividualLoading: false,
      debounceTime: 100,
    });

    // 2. Exclude certain URLs from showing loading
    excludeUrls([
      '/api/ProductApi/gFybrCharges', // Don't show loading for charges API
      'analytics', // Don't show loading for any analytics calls
    ]);

    // 3. Set custom debounce time to prevent flicker
    setDebounceTime(150);
  }, []);

  // Example API calls to test the loading
  const handleTestApiCall = async () => {
    try {
      // This will automatically show/hide loading due to interceptors
      const response = await axios.get(
        'https://fybrappapi.benchstep.com/api/ProductApi/gFybrCharges',
      );
      console.log('Test API response:', response.data);
    } catch (error) {
      console.error('Test API error:', error);
    }
  };

  const handleMultipleApiCalls = async () => {
    try {
      // Multiple simultaneous calls - loading will show until all complete
      await Promise.all([
        axios.get(
          'https://fybrappapi.benchstep.com/api/ProductApi/gFybrCharges',
        ),
        axios.get(
          'https://fybrappapi.benchstep.com/api/ProductApi/gFybrCharges',
        ),
        axios.get(
          'https://fybrappapi.benchstep.com/api/ProductApi/gFybrCharges',
        ),
      ]);
      console.log('All API calls completed');
    } catch (error) {
      console.error('Multiple API calls error:', error);
    }
  };

  const handleCustomAxiosInstance = async () => {
    // Create custom axios instance with specific loading behavior
    const customAxios = createCustomAxios(
      {
        baseURL: 'https://fybrappapi.benchstep.com',
        timeout: 10000,
      },
      {
        showGlobalLoading: false,
        showIndividualLoading: true,
        loadingKey: 'custom_api',
      },
    );

    try {
      const response = await customAxios.get('/api/ProductApi/gFybrCharges');
      console.log('Custom axios response:', response.data);
    } catch (error) {
      console.error('Custom axios error:', error);
    }
  };

  const handleForceHideLoading = () => {
    // Emergency function to hide all loading states
    forceHideLoading();
    console.log('Force hidden all API loading');
  };

  const handleCheckApiStatus = () => {
    const isLoading = checkApiLoading();
    const status = getApiStatus();
    console.log('Is API loading:', isLoading);
    console.log('API Status:', status);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Axios Loading Configuration Examples</Text>

      <TouchableOpacity style={styles.button} onPress={handleTestApiCall}>
        <Text style={styles.buttonText}>Test Single API Call</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleMultipleApiCalls}>
        <Text style={styles.buttonText}>Test Multiple API Calls</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCustomAxiosInstance}>
        <Text style={styles.buttonText}>Test Custom Axios Instance</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCheckApiStatus}>
        <Text style={styles.buttonText}>Check API Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.emergencyButton]}
        onPress={handleForceHideLoading}>
        <Text style={styles.buttonText}>Force Hide Loading</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00afb5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#ff4444',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AxiosConfigExample;
