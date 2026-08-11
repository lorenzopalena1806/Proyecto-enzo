

// Wait, qr-utils.ts is TypeScript. Let's just mock the functions.
const encodeQRPayloadMock = (payload) => {
  const json = JSON.stringify(payload);
  return btoa(encodeURIComponent(json));
};

const decodeQRPayloadMock = (qrString) => {
  try {
    const json = decodeURIComponent(atob(qrString));
    const parsed = JSON.parse(json);
    if (!parsed.userId || !parsed.role || !parsed.token || !['superadmin', 'merchant', 'client'].includes(parsed.role)) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.error("Decode err:", err);
    return null;
  }
};

const payload = {
  userId: "123",
  role: "client",
  token: "abc",
  version: 1,
};

const encoded = encodeQRPayloadMock(payload);
console.log("Encoded:", encoded);

const decoded = decodeQRPayloadMock(encoded);
console.log("Decoded:", decoded);
