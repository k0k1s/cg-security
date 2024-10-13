import React from 'react';
import { Modal, View, StyleSheet, Button } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewer = ({ visible, uri, onClose }) => {
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <Pdf
          source={{ uri, cache: true }}
          style={styles.pdf}
        />
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  pdf: {
    flex: 1,
  },
});

export default PdfViewer;
