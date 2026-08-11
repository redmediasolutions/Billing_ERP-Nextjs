/**
 * HARDENED AUTH MIDDLEWARE
 * Replace middleware/auth.js with this (adjust firebase admin import path if needed).
 *
 * Root cause of cross-tenant data: if req.user.tenant_id is wrong/missing/shared,
 * every SQL filter still "works" but for the wrong tenant.
 *
 * This middleware:
 * 1. Verifies Firebase ID token
 * 2. Looks up the user in YOUR users table by firebase_uid
 * 3. Requires an active tenant_id
 * 4. Never trusts tenant_id from the client body/query
 */

const admin = require("../config/firebase"); // adjust if your path differs
const db = require("../db/pool");

async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing Authorization bearer token",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUid = decoded.uid;

    // Map Firebase user → app user + tenant (STRICT)
    // Adjust table/column names to match your schema.
    const [rows] = await db.query(
      `SELECT
         u.id,
         u.firebase_uid,
         u.email,
         u.tenant_id,
         u.is_active AS user_active,
         t.is_active AS tenant_active
       FROM users u
       INNER JOIN tenants t ON t.id = u.tenant_id
       WHERE u.firebase_uid = ?
       LIMIT 1`,
      [firebaseUid]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User is not linked to any tenant",
      });
    }

    const user = rows[0];

    if (!user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: "Tenant context missing for this user",
      });
    }

    if (Number(user.user_active) === 0 || Number(user.tenant_active) === 0) {
      return res.status(403).json({
        success: false,
        message: "User or tenant is inactive",
      });
    }

    // Only values set here may be used by routes
    req.user = {
      id: user.id,
      firebase_uid: user.firebase_uid,
      email: user.email,
      tenant_id: Number(user.tenant_id),
    };

    return next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = { verifyToken };
