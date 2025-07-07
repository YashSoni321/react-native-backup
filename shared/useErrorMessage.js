import {useState, useCallback} from 'react';

const useErrorMessage = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [currentError, setCurrentError] = useState({
    type: null,
    customTitle: null,
    customMessage: null,
    customPrimaryAction: null,
    customSecondaryAction: null,
    useModal: false,
  });

  const showError = useCallback((errorType, options = {}) => {
    setCurrentError({
      type: errorType,
      customTitle: options.customTitle,
      customMessage: options.customMessage,
      customPrimaryAction: options.customPrimaryAction,
      customSecondaryAction: options.customSecondaryAction,
      useModal: options.useModal || false,
    });
    setErrorVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setErrorVisible(false);
  }, []);

  const showNetworkError = useCallback(
    onRetry => {
      showError('NETWORK_ERROR', {
        useModal: true,
        onPrimaryAction: onRetry,
      });
    },
    [showError],
  );

  const showEmptyCartError = useCallback(
    onBrowseStores => {
      showError('EMPTY_CART', {
        onPrimaryAction: onBrowseStores,
      });
    },
    [showError],
  );

  const showNoProductsError = useCallback(
    onBrowseOtherStores => {
      showError('NO_PRODUCTS', {
        onPrimaryAction: onBrowseOtherStores,
      });
    },
    [showError],
  );

  const showLocationPermissionError = useCallback(
    (isRegistration = false, onSecondaryAction) => {
      const errorType = isRegistration
        ? 'LOCATION_PERMISSION_REGISTRATION'
        : 'LOCATION_PERMISSION_BROWSING';
      showError(errorType, {
        useModal: isRegistration,
        onSecondaryAction,
      });
    },
    [showError],
  );

  const showNoAddressError = useCallback(
    onAddAddress => {
      showError('NO_ADDRESS', {
        onPrimaryAction: onAddAddress,
      });
    },
    [showError],
  );

  const showNotificationPermissionError = useCallback(
    (onEnableNotifications, onSkip) => {
      showError('NOTIFICATION_PERMISSION', {
        onPrimaryAction: onEnableNotifications,
        onSecondaryAction: onSkip,
      });
    },
    [showError],
  );

  const showPaymentFailureError = useCallback(
    onRetryPayment => {
      showError('PAYMENT_FAILURE', {
        onPrimaryAction: onRetryPayment,
      });
    },
    [showError],
  );

  const showItemOutOfStockError = useCallback(
    onUpdateCart => {
      showError('ITEM_OUT_OF_STOCK', {
        onPrimaryAction: onUpdateCart,
      });
    },
    [showError],
  );

  const showMerchantUnavailableError = useCallback(
    onBrowseOtherStores => {
      showError('MERCHANT_UNAVAILABLE', {
        onPrimaryAction: onBrowseOtherStores,
      });
    },
    [showError],
  );

  const showNoDeliveryPartnersError = useCallback(() => {
    showError('NO_DELIVERY_PARTNERS');
  }, [showError]);

  const showOrderCancelledError = useCallback(
    onBrowseOtherStores => {
      showError('ORDER_CANCELLED', {
        onPrimaryAction: onBrowseOtherStores,
      });
    },
    [showError],
  );

  const showCustomError = useCallback(
    (title, message, primaryAction, secondaryAction, useModal = false) => {
      showError('CUSTOM', {
        customTitle: title,
        customMessage: message,
        customPrimaryAction: primaryAction,
        customSecondaryAction: secondaryAction,
        useModal,
      });
    },
    [showError],
  );

  return {
    errorVisible,
    currentError,
    showError,
    hideError,
    showNetworkError,
    showEmptyCartError,
    showNoProductsError,
    showLocationPermissionError,
    showNoAddressError,
    showNotificationPermissionError,
    showPaymentFailureError,
    showItemOutOfStockError,
    showMerchantUnavailableError,
    showNoDeliveryPartnersError,
    showOrderCancelledError,
    showCustomError,
  };
};

export default useErrorMessage;
