
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Payment reference is required");
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Payment verification failed");
    }

    const transaction = paystackData.data;
    
    if (transaction.status !== "success") {
      throw new Error("Payment was not successful");
    }

    // Update subscription status in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: subError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: transaction.metadata.user_id,
        subscription_status: "active",
        payment_reference: reference,
        amount: transaction.amount / 100, // Convert from kobo to naira
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        updated_at: new Date().toISOString(),
      });

    if (subError) {
      console.error("Subscription update error:", subError);
    }

    console.log("Payment verified successfully:", reference);

    return new Response(
      JSON.stringify({
        status: "success",
        transaction: {
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          customer: transaction.customer,
          metadata: transaction.metadata,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying Paystack payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
