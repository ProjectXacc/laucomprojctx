import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentPromptProps {
  onBack: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentPrompt: React.FC<PaymentPromptProps> = ({ onBack, onPaymentSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-paystack-payment', {
        body: {
          amount: 100000, // 1000 Naira in kobo
          email: user.email,
          metadata: {
            user_id: user.id,
            subscription_type: 'quiz_access'
          }
        }
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Open Paystack checkout in new tab
        window.open(data.authorization_url, '_blank');
        
        // Show success message
        toast({
          title: "Payment Initiated",
          description: "Complete your payment in the new tab to access quiz questions.",
        });
        
        // Simulate payment success for demo (remove in production)
        setTimeout(() => {
          onPaymentSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto mt-20">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Upgrade to Access Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To access quiz questions, you need to upgrade your account. 
              Get unlimited access to all quiz questions for just ₦1,000.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quiz Access</span>
                <span className="font-bold">₦1,000</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Unlimited access to all quiz questions
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Pay ₦1,000 with Paystack'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};