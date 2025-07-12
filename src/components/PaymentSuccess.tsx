
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentSuccessProps {
  onBackToDashboard: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onBackToDashboard }) => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const { updateProfile } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get reference from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');

        if (!reference) {
          setVerificationStatus('failed');
          return;
        }

        const response = await paymentService.verifyPayment(reference);
        
        if (response.status === 'success' && response.transaction.status === 'success') {
          setTransactionDetails(response.transaction);
          setVerificationStatus('success');
          
          // Update user subscription status
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1); // Add 1 month
          
          updateProfile({
            subscriptionStatus: 'active',
            subscriptionExpiry: expiryDate.toISOString()
          });
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
      }
    };

    verifyPayment();
  }, [updateProfile]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-700">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your subscription has been activated successfully.
            </p>
            
            {transactionDetails && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Transaction Details</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono">{transactionDetails.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₦{(transactionDetails.amount / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize text-green-600">{transactionDetails.status}</span>
                  </div>
                </div>
              </div>
            )}
            
            <Button onClick={onBackToDashboard} className="w-full max-w-sm">
              Continue to Dashboard
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-700">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue with your payment. Please try again.
            </p>
            <Button onClick={onBackToDashboard} variant="outline" className="w-full max-w-sm">
              Back to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>
            Confirming your subscription payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
