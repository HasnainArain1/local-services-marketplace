import { Alert, Platform } from 'react-native';

export const customAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmAction = buttons.find((b) => b.style !== 'cancel' && b.text !== 'Cancel');
      const cancelAction = buttons.find((b) => b.style === 'cancel' || b.text === 'Cancel');
      
      const isConfirmed = window.confirm(`${title ? title + ': ' : ''}${message || ''}`);
      if (isConfirmed && confirmAction?.onPress) {
        confirmAction.onPress();
      } else if (!isConfirmed && cancelAction?.onPress) {
        cancelAction.onPress();
      }
    } else {
      if (title || message) {
        window.alert(`${title ? title + '\n\n' : ''}${message || ''}`);
      }
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
