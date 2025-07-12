
import { supabase } from '@/integrations/supabase/client';

export interface PaymentInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerificationResponse {
  status: string;
  transaction: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    customer: any;
    metadata: any;
  };
}

export const paymentService = {
  async initializePayment(amount: number = 100000, planName: string = "Monthly Subscription"): Promise<PaymentInitResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: { 
          amount,
          plan_name: planName 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  redirectToPayment(authorizationUrl: string) {
    window.location.href = authorizationUrl;
  }
};
