// BrandOn Studio: connection settings for your own hosting.
// The anon key is meant to be public. Your data is protected by the studio login.
window.BO_CONFIG = {
  supabaseUrl: "",       // e.g. https://abcdefgh.supabase.co
  supabaseAnonKey: "",   // Supabase > Project Settings > API > anon public key
  studioEmail: "studio@brand-on.mn", // the one studio account you create in Supabase > Authentication
  botUsername: "",       // your Telegram bot's username without @, e.g. BrandOnStudioBot
  financeEmail: "finance@brand-on.mn", // the separate finance login; its password is the finance code
  sampleData: false      // true loads sample projects on first open
};
