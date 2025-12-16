// nxs_config.js
// Central public configuration for NXS (frontend).
//
// ✅ Goals:
// - Keep all public settings in ONE place.
// - Allow runtime override without editing every page.
// - Provide consistent URLs for Edge Functions.
//
// ⚠️ Security note:
// The anon key is PUBLIC by design. Real security must be enforced by:
// - RLS on all tables
// - Secure RPC/Edge Functions for privileged operations
//
// You can override defaults by setting:
//   window.NXS_PUBLIC_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL_WORKER_URL, ACCOUNT_SETUP_URL }
// before loading this file.

(function (global) {
  'use strict';

  const DEFAULTS = {
    SUPABASE_URL: "https://inuqlhkoaoeiycefvjyj.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludXFsaGtvYW9laXljZWZ2anlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTUxODEsImV4cCI6MjA3ODY5MTE4MX0.DCAY9rN0noaBoE_T-6eDsb_79szK91af989f9TqjEow",
  };

  const runtime =
    (global.NXS_PUBLIC_CONFIG && typeof global.NXS_PUBLIC_CONFIG === 'object')
      ? global.NXS_PUBLIC_CONFIG
      : {};

  const cfg = Object.assign({}, DEFAULTS, runtime);

  // Core
  global.NXS_SUPABASE_URL = cfg.SUPABASE_URL;
  global.NXS_SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;

  // Functions base (standard path)
  const cleanUrl = (cfg.SUPABASE_URL || '').replace(/\/$/, '');
  const functionsBase = cleanUrl ? (cleanUrl + '/functions/v1') : '';

  global.NXS_FUNCTIONS_BASE = cfg.FUNCTIONS_BASE || functionsBase;

  // Named functions
  global.NXS_EMAIL_WORKER_URL =
    cfg.EMAIL_WORKER_URL ||
    (global.NXS_FUNCTIONS_BASE ? global.NXS_FUNCTIONS_BASE + '/nxs-email-worker' : '');

  global.NXS_ACCOUNT_SETUP_URL =
    cfg.ACCOUNT_SETUP_URL ||
    (global.NXS_FUNCTIONS_BASE ? global.NXS_FUNCTIONS_BASE + '/oap-account-setup' : '');

  // Backward compatibility
  global.NXS = global.NXS || {};
  global.NXS.SUPABASE_URL = global.NXS_SUPABASE_URL;
  global.NXS.SUPABASE_ANON_KEY = global.NXS_SUPABASE_ANON_KEY;

  global.SUPABASE_URL = global.NXS_SUPABASE_URL;
  global.SUPABASE_ANON_KEY = global.NXS_SUPABASE_ANON_KEY;
})(window);
