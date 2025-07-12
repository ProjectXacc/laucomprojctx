
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
      // Get the current session to ensure we have a valid JWT token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('User not authenticated. Please log in first.');
      }

      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: { 
          amount,
          plan_name: planName 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to initialize payment');
      }

      if (!data) {
        throw new Error('No response data received');
      }

      return data;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  },

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      // Get the current session for verification as well
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('User not authenticated. Please log in first.');
      }

      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
