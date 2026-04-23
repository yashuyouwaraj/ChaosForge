let payments = [];

const savePayment = (payment) => {
  payments.push(payment);
  return payment;
};

const getPaymentsByUser = (email) => {
  return payments.filter((p) => p.email === email);
};

module.exports = { savePayment, getPaymentsByUser };