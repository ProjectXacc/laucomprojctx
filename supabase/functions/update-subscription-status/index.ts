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
    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { user_id, status, subscription_end_date } = await req.json();

    if (!user_id || !status) {
      throw new Error("Missing required fields: user_id and status");
    }

    console.log(`Updating subscription for user ${user_id} to status: ${status}`);

    // Check if subscription exists - get the latest one
    const { data: existingSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching existing subscriptions:", fetchError);
      throw fetchError;
    }

    const existingSubscription = existingSubscriptions && existingSubscriptions.length > 0 
      ? existingSubscriptions[0] 
      : null;

    let subscriptionData: any = {
      user_id,
      subscription_status: status,
      updated_at: new Date().toISOString()
    };

    // Handle different status changes
    switch (status) {
      case 'active':
        subscriptionData.subscription_start = new Date().toISOString();
        if (subscription_end_date) {
          subscriptionData.subscription_end = subscription_end_date;
        } else {
          // Default to 30 days from now
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          subscriptionData.subscription_end = endDate.toISOString();
        }
        subscriptionData.is_trial = false;
        subscriptionData.trial_end = null;
        break;

      case 'trial':
        subscriptionData.subscription_start = new Date().toISOString();
        subscriptionData.is_trial = true;
        // Set trial to 3 days from now
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 3);
        subscriptionData.trial_end = trialEnd.toISOString();
        subscriptionData.subscription_end = null;
        break;

      case 'expired':
        // Keep existing dates but mark as expired
        if (existingSubscription) {
          subscriptionData.subscription_start = existingSubscription.subscription_start;
          subscriptionData.subscription_end = existingSubscription.subscription_end || new Date().toISOString();
          subscriptionData.is_trial = existingSubscription.is_trial;
          subscriptionData.trial_end = existingSubscription.trial_end;
        }
        break;

      case 'none':
        subscriptionData.subscription_start = null;
        subscriptionData.subscription_end = null;
        subscriptionData.is_trial = false;
        subscriptionData.trial_end = null;
        subscriptionData.amount = null;
        subscriptionData.payment_reference = null;
        break;
    }

    let result;
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
      result = data;
    } else {
      // Create new subscription
      subscriptionData.created_at = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error("Error creating subscription:", error);
        throw error;
      }
      result = data;
    }

    console.log(`Successfully updated subscription for user ${user_id}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      message: `Subscription status updated to ${status}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in update-subscription-status:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to update subscription status" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
