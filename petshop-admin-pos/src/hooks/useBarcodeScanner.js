import { useEffect, useRef } from 'react';

/**
 * Global Barcode Scanner Listener Hook
 * @param {Function} onScan - Callback function triggered when barcode scan completes
 * @param {Object} options - Configuration options (bufferTimeout, minLength)
 */
export const useBarcodeScanner = (onScan, options = {}) => {
  const { bufferTimeout = 50, minLength = 3 } = options;

  const bufferRef = useRef('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ignore input coming from focused text inputs or textareas (e.g. search boxes)
      const targetTag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // 2. Clear previous timeout on keypress
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 3. Handle 'Enter' key - Barcode scanners send Enter at the end of scan
      if (e.key === 'Enter') {
        if (bufferRef.current.length >= minLength) {
          e.preventDefault();
          const scannedBarcode = bufferRef.current.trim();
          onScan(scannedBarcode); // Trigger Callback
        }
        bufferRef.current = ''; // Reset buffer
        return;
      }

      // 4. Collect alphanumeric characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Reset buffer if delay between keys is too long (human typing vs hardware scanner)
        timeoutRef.current = setTimeout(() => {
          bufferRef.current = '';
        }, bufferTimeout);
      }
    };

    // Attach global listener to window
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onScan, bufferTimeout, minLength]);
};
