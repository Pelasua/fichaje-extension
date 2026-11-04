// Frappe HR API over the browser's session cookie (shared with the site tab).
const CHECKIN = "/api/resource/Employee%20Checkin";

export const getConfig = async () => (await chrome.storage.local.get("config")).config;
export const saveConfig = (config) => chrome.storage.local.set({ config });
export const clearConfig = () => chrome.storage.local.remove("config");

function serverMessage(data) {
  try {
    const msgs = JSON.parse(data._server_messages || "[]").map((m) => JSON.parse(m).message);
    if (msgs.length) return msgs.join(" ").replace(/<[^>]+>/g, "");
  } catch {}
  return data.message || data.exception;
}

async function request(domain, path, options = {}) {
  const res = await fetch(domain + path, {
    credentials: "include",
    ...options,
    headers: { Accept: "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(serverMessage(data) || `Error HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const login = (domain, usr, pwd) =>
  request(domain, "/api/method/login", { method: "POST", body: new URLSearchParams({ usr, pwd }) });

// Runs fn(domain); if the session expired, logs in again with the stored credentials and retries once.
async function authed(fn) {
  const { domain, usr, pwd } = await getConfig();
  try {
    return await fn(domain);
  } catch (err) {
    if (err.status !== 401 && err.status !== 403) throw err;
    await login(domain, usr, pwd);
    return fn(domain);
  }
}

// The HRMS page embeds the session CSRF token, which POSTs need once the session has one.
async function csrfToken(domain) {
  const html = await (await fetch(`${domain}/hrms`, { credentials: "include" })).text();
  return html.match(/csrf_token\s*=\s*"([^"]+)"/)?.[1] ?? "";
}

export const getEmployee = () =>
  authed(async (d) => (await request(d, "/api/method/hrms.api.get_current_employee_info")).message);

export const getHrSettings = () =>
  authed(async (d) => (await request(d, "/api/method/hrms.api.get_hr_settings")).message);

export function getCheckins(employee, filters, { order = "time asc", limit = 0 } = {}) {
  const q = new URLSearchParams({
    fields: JSON.stringify(["log_type", "time"]),
    filters: JSON.stringify([["employee", "=", employee], ...filters]),
    order_by: order,
    limit_page_length: limit,
  });
  return authed(async (d) => (await request(d, `${CHECKIN}?${q}`)).data);
}

export const createCheckin = (doc) =>
  authed(async (d) =>
    request(d, CHECKIN, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Frappe-CSRF-Token": await csrfToken(d) },
      body: JSON.stringify(doc),
    })
  );
