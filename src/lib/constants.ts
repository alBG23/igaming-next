/**
 * Application Constants
 *
 * Centralized constant values across frontend services, admin consoles, and user profiles.
 * Never hardcode emails, persona names, system IDs, or default values — always import from here.
 */

// System Admin Persona
export const DEFAULT_ADMIN_EMAIL = 'admin@brightgaming.com';
export const DEFAULT_ADMIN_NAME = 'Admin Operator';
export const ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL;
export const ADMIN_NAME = DEFAULT_ADMIN_NAME;

// System Analyst Persona
export const DEFAULT_ANALYST_EMAIL = 'analyst@brightgaming.com';
export const DEFAULT_ANALYST_NAME = 'Analyst Operator';
export const ANALYST_EMAIL = DEFAULT_ANALYST_EMAIL;
export const ANALYST_NAME = DEFAULT_ANALYST_NAME;

// Gemini Log Fixer & PR Generator Defaults
export const DEFAULT_GEMINI_LOG_MODEL = 'gemini-2.5-flash';
export const DEFAULT_PR_BRANCH_PREFIX = 'gemini/fix-';
export const DEFAULT_GITHUB_REPO = 'alBG23/igaming-backend';

