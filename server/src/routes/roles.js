const express = require('express');
const router = express.Router();
const { getUserRole, recordUserLogin, getAllUsersWithRoles, updateUserRole, deleteUserRole } = require('../services/roles');
const { verifyAuth } = require('../middleware/auth');

router.use(verifyAuth);

/**
 * GET /api/roles/my-role
 * Check role of authenticated caller
 */
router.get('/my-role', async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ error: 'Unauthorized' });

    // Record login
    await recordUserLogin(req.user);

    const role = await getUserRole(userEmail);
    res.json({ email: userEmail, role });
  } catch (err) {
    console.error('[Roles] Error getting my role:', err);
    res.status(500).json({ error: 'Failed to retrieve role' });
  }
});

/**
 * GET /api/roles/users
 * List all users with roles (Developer only)
 */
router.get('/users', async (req, res) => {
  try {
    const callerEmail = req.user?.email;
    const role = await getUserRole(callerEmail);
    if (role !== 'developer') {
      return res.status(403).json({ error: 'Access Denied: Only developers can manage roles' });
    }

    const users = await getAllUsersWithRoles();
    res.json(users);
  } catch (err) {
    console.error('[Roles] Error listing users:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * POST /api/roles/update
 * Update a user role (Developer only)
 */
router.post('/update', async (req, res) => {
  try {
    const callerEmail = req.user?.email;
    const callerRole = await getUserRole(callerEmail);
    if (callerRole !== 'developer') {
      return res.status(403).json({ error: 'Access Denied: Only developers can modify roles' });
    }

    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const updated = await updateUserRole(email, role, callerEmail);
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('[Roles] Error updating user role:', err);
    res.status(400).json({ error: err.message || 'Failed to update role' });
  }
});

/**
 * DELETE /api/roles/:email
 * Remove a user from database (Developer only)
 */
router.delete('/:email', async (req, res) => {
  try {
    const callerEmail = req.user?.email;
    const callerRole = await getUserRole(callerEmail);
    if (callerRole !== 'developer') {
      return res.status(403).json({ error: 'Access Denied: Only developers can delete users' });
    }

    const targetEmail = req.params.email;
    const result = await deleteUserRole(targetEmail);
    res.json(result);
  } catch (err) {
    console.error('[Roles] Error deleting user role:', err);
    res.status(400).json({ error: err.message || 'Failed to delete user' });
  }
});

module.exports = router;
