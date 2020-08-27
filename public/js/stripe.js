import Axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51HGV78D85c4neJaw8FpZrmXk05N03VhZkxY3suGPKA1VDVRKwz4LWCXJI4B9vncZxaFJiGcoLZN5TRdm2KfCRkd800xkr9PUfG'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await Axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch {
    showAlert('error');
  }
};
