/**
 * Paste on API server as:
 *   /home/ubuntu/billing-erp/src/middleware/platform-admin.middleware.js
 *
 * Then: pm2 restart billing-erp
 */
const db = require("../db/pool");

const ENV_ADMINS = (process.env.PLATFORM_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function platformAdmin(req, res, next) {
  try {
    const email = String(
      req.user?.email || req.user?.user_email || ""
    ).toLowerCase();

    if (!email) {
      return res
        .status(401)
        .json({ success: false, message: "Please sign in again." });
    }

    if (ENV_ADMINS.includes(email)) {
      req.isPlatformAdmin = true;
      return next();
    }

    const uid = req.user?.firebase_uid || req.user?.uid;
    if (uid) {
      const [rows] = await db.query(
        `SELECT is_platform_admin FROM users WHERE firebase_uid = ? LIMIT 1`,
        [uid]
      );
      if (rows[0]?.is_platform_admin) {
        req.isPlatformAdmin = true;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Platform operator access only.",
    });
  } catch (err) {
    console.error("platformAdmin", err);
    return res
      .status(500)
      .json({ success: false, message: "Auth check failed." });
  }
}

module.exports = platformAdmin;
