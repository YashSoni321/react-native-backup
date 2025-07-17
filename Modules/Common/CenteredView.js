import React from 'react';
import {View} from 'react-native';

const CenteredView = ({children}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
      {children}
    </View>
  );
};

export default CenteredView;
