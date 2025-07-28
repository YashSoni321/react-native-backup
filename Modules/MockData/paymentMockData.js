export const PAYMENT_MOCK_DATA = {
  PaymentMethodList: [
    {
      PaymentMethod: 'UPI',
      PaymentMethodID: 3,
      Description: 'PhonePe, Google Pay, etc.',
    },
    {
      PaymentMethod: 'Cash on Delivery',
      PaymentMethodID: 4,
      Description: 'Pay in cash when order is delivered',
    },
  ],
  TipAmountList: [
    {
      TipAmount: 0,
      TipLabel: 'No Tip',
      TipID: 0,
    },
    {
      TipAmount: 10,
      TipLabel: '₹10',
      TipID: 1,
    },
    {
      TipAmount: 20,
      TipLabel: '₹20',
      TipID: 2,
    },
    {
      TipAmount: 50,
      TipLabel: '₹50',
      TipID: 3,
    },
  ],
};
