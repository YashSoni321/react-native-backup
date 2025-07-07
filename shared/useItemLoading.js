import {useCallback} from 'react';
import {useLoading} from './LoadingContext';

/**
 * Custom hook for managing individual item loading states
 * Useful for cart items, product lists, etc.
 */
export const useItemLoading = () => {
  const {showLoading, hideLoading, isLoading} = useLoading();

  const showItemLoading = useCallback(
    (itemId, message = '') => {
      const key = `item_${itemId}`;
      showLoading(key, message);
    },
    [showLoading],
  );

  const hideItemLoading = useCallback(
    itemId => {
      const key = `item_${itemId}`;
      hideLoading(key);
    },
    [hideLoading],
  );

  const isItemLoading = useCallback(
    itemId => {
      const key = `item_${itemId}`;
      return isLoading(key);
    },
    [isLoading],
  );

  const withItemLoading = useCallback(
    async (itemId, asyncFunction, message = '') => {
      showItemLoading(itemId, message);
      try {
        const result = await asyncFunction();
        return result;
      } catch (error) {
        throw error;
      } finally {
        hideItemLoading(itemId);
      }
    },
    [showItemLoading, hideItemLoading],
  );

  return {
    showItemLoading,
    hideItemLoading,
    isItemLoading,
    withItemLoading,
  };
};

export default useItemLoading;
