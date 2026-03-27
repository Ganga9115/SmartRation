import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    // Returns base64 PNG string
    const qr = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });
    return qr;
  } catch (err) {
    console.error('QR generation error:', err.message);
    throw new Error('Failed to generate QR code');
  }
};