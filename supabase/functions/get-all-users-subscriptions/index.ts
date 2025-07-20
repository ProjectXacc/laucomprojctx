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

    // Get all users from auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    // Get all user profiles
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, display_name');

    if (profileError) {
      console.error("Error fetching user profiles:", profileError);
      throw profileError;
    }

    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*');

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    // Combine the data
    const combinedData = authUsers.users.map(authUser => {
      const profile = userProfiles?.find(p => p.user_id === authUser.id);
      const subscription = subscriptions?.find(s => s.user_id === authUser.id);
      
      // Determine subscription status
      let subscriptionStatus = 'none';
      
      if (subscription) {
        const now = new Date();
        
        if (subscription.is_trial && subscription.trial_end) {
          const trialEnd = new Date(subscription.trial_end);
          subscriptionStatus = trialEnd > now ? 'trial' : 'expired';
        } else if (subscription.subscription_end) {
          const subEnd = new Date(subscription.subscription_end);
          subscriptionStatus = subEnd > now ? 'active' : 'expired';
        }
      }

      return {
        user_id: authUser.id,
        user_email: authUser.email || 'No email',
        user_name: profile?.display_name || authUser.email?.split('@')[0] || 'Unknown',
        subscription_status: subscriptionStatus,
        subscription_start: subscription?.subscription_start || null,
        subscription_end: subscription?.subscription_end || null,
        trial_end: subscription?.trial_end || null,
        is_trial: subscription?.is_trial || false,
        amount: subscription?.amount || null,
        payment_reference: subscription?.payment_reference || null,
        created_at: subscription?.created_at || authUser.created_at,
        updated_at: subscription?.updated_at || authUser.updated_at || authUser.created_at
      };
    });

    return new Response(JSON.stringify({ data: combinedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in get-all-users-subscriptions:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to fetch user subscriptions" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});