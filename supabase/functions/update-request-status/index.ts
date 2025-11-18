import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestStatusUpdate {
  requestId: string;
  action: 'approve' | 'reject' | 'cancel' | 'activate' | 'complete';
  handoverCode?: string;
  returnCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { requestId, action, handoverCode, returnCode }: RequestStatusUpdate = await req.json();

    console.log(`Processing ${action} for request ${requestId} by user ${user.id}`);

    // Fetch the current request
    const { data: request, error: fetchError } = await supabaseClient
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Request not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user authorization
    let updateData: any = {};
    let isAuthorized = false;

    switch (action) {
      case 'approve':
        // Only owner can approve, only from pending status
        if (request.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only the owner can approve requests' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (request.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Can only approve pending requests' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const generatedHandoverCode = Math.floor(1000 + Math.random() * 9000).toString();
        updateData = {
          status: 'approved',
          handover_code: generatedHandoverCode,
          updated_at: new Date().toISOString(),
        };
        isAuthorized = true;
        console.log(`Request approved with handover code: ${generatedHandoverCode}`);
        break;

      case 'reject':
        // Only owner can reject, only from pending status
        if (request.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only the owner can reject requests' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (request.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Can only reject pending requests' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          status: 'rejected',
          updated_at: new Date().toISOString(),
        };
        isAuthorized = true;
        console.log('Request rejected');
        break;

      case 'cancel':
        // Only requester can cancel, only from pending or approved status
        if (request.requester_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only the requester can cancel requests' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!['pending', 'approved'].includes(request.status)) {
          return new Response(
            JSON.stringify({ error: 'Can only cancel pending or approved requests' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        };
        isAuthorized = true;
        console.log('Request cancelled');
        break;

      case 'activate':
        // Requester activates with handover code, from approved status
        if (request.requester_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only the requester can activate requests' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (request.status !== 'approved') {
          return new Response(
            JSON.stringify({ error: 'Can only activate approved requests' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!handoverCode || handoverCode !== request.handover_code) {
          return new Response(
            JSON.stringify({ error: 'Invalid handover code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          status: 'active',
          updated_at: new Date().toISOString(),
        };
        isAuthorized = true;
        console.log('Request activated');
        break;

      case 'complete':
        // Owner completes with return code, from active status
        if (request.owner_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Only the owner can complete requests' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (request.status !== 'active') {
          return new Response(
            JSON.stringify({ error: 'Can only complete active requests' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const generatedReturnCode = Math.floor(1000 + Math.random() * 9000).toString();
        updateData = {
          status: 'completed',
          return_code: generatedReturnCode,
          updated_at: new Date().toISOString(),
        };
        isAuthorized = true;
        console.log(`Request completed with return code: ${generatedReturnCode}`);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized action' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the request
    const { error: updateError } = await supabaseClient
      .from('requests')
      .update(updateData)
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update request status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Request ${action}d successfully`,
        handoverCode: action === 'approve' ? updateData.handover_code : undefined,
        returnCode: action === 'complete' ? updateData.return_code : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-request-status function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
