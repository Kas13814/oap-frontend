// nxs_access_api.js
// Shared client for Supabase REST/RPC used by NXS access flows
// (join requests, approvals, rejections, password reset).
//
// ⚠️ IMPORTANT:
// 1) Edit SUPABASE_URL and SUPABASE_ANON_KEY in nxs_config.js
//    or define window.NXS_SUPABASE_URL / window.NXS_SUPABASE_ANON_KEY
//    *before* loading this file.
// 2) This file is designed to be included as a normal <script> tag, not as a module.

(function (global) {
  'use strict';

  function getSupabaseConfig() {
    const url = global.NXS_SUPABASE_URL;
    const anonKey = global.NXS_SUPABASE_ANON_KEY;
    return { url, anonKey };
  }

  function ensureConfigured() {
    const { url, anonKey } = getSupabaseConfig();
    if (!url) {
      throw new Error(
        '[NXSAccessAPI] SUPABASE_URL is not configured. Set window.NXS_SUPABASE_URL before loading NXS pages.'
      );
    }
    if (!anonKey) {
      throw new Error(
        '[NXSAccessAPI] SUPABASE_ANON_KEY is not configured. Set window.NXS_SUPABASE_ANON_KEY before loading NXS pages.'
      );
    }
  }

  async function apiFetch(path, options = {}) {
    ensureConfigured();
    const { url, anonKey } = getSupabaseConfig();

    const headers = Object.assign(
      {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      options.headers || {}
    );

    const fullUrl = url.replace(/\/$/, '') + path;
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        `API error ${res.status}: ${text}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data;
  }

  // ------------------------------------------------------------------
  // 1) Employee sends join request
  //    - Employee enters only employeeId + requestedRole (+ optional note)
  //    - Email is always built as: <employeeId>@saudiags.com
  // ------------------------------------------------------------------
  async function submitJoinRequest({
    tenantId,
    employeeId,
    requestedRole,
    note,
  }) {
    const emp = String(employeeId).trim();
    if (!emp) {
      throw new Error('[NXSAccessAPI] employeeId is required for join request.');
    }

    const corporateEmail = emp + '@saudiags.com';

    const body = {
      tenant_id: tenantId,
      employee_id: emp,
      requested_role: requestedRole,
      email: corporateEmail,
      username: emp,
      // حالياً نستخدم رقم الموظف كاسم مبدئي لتجاوز الـ NOT NULL
      full_name: emp,
    };

    if (note && String(note).trim()) {
      body.note = String(note).trim();
    }

    return apiFetch('/rest/v1/join_requests', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body),
    });
  }

  async function listJoinRequests({ tenantId, status, limit = 100 }) {
    const params = new URLSearchParams();
    params.set('select', '*');
    if (tenantId != null) params.set('tenant_id', `eq.${tenantId}`);
    if (status && status !== 'all') params.set('status', `eq.${status}`);
    params.set('order', 'join_request_id.desc');
    params.set('limit', String(limit));

    return apiFetch('/rest/v1/join_requests?' + params.toString());
  }

  async function callRpc(functionName, payload) {
    return apiFetch(`/rest/v1/rpc/${functionName}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  async function approveJoinRequest({
    joinRequestId,
    approvedByUserId,
    role,
    passwordHash,
  }) {
    return callRpc('approve_join_request', {
      p_join_request_id: joinRequestId,
      p_approved_by_user_id: approvedByUserId,
      p_role: role,
      p_password_hash: passwordHash,
    });
  }

  async function rejectJoinRequest({
    joinRequestId,
    rejectedByUserId,
    reason,
  }) {
    return callRpc('reject_join_request', {
      p_join_request_id: joinRequestId,
      p_rejected_by_user_id: rejectedByUserId,
      p_reason: reason || null,
    });
  }

  async function createPasswordResetRequest({ employeeIdOrEmail }) {
    return callRpc('create_password_reset_request', {
      employee_id_or_email: employeeIdOrEmail,
    });
  }

  async function resetPasswordWithToken({
    resetToken,
    newPasswordHash,
  }) {
    return callRpc('reset_password_with_token', {
      reset_token: resetToken,
      new_password_hash: newPasswordHash,
    });
  }

  const NXSAccessAPI = {
    apiFetch,
    submitJoinRequest,
    listJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    createPasswordResetRequest,
    resetPasswordWithToken,
  };

  global.NXSAccessAPI = NXSAccessAPI;
})(window);
