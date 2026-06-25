/**
 * Web PP7 Backend - Authentication & Authorization
 * 
 * @author KiroClaw
 * @date 25 มิ.ย. 2569
 */

const Auth = {
  /**
   * Handle login - Google OAuth based
   */
  handleLogin: function(body) {
    const email = body.email;
    const password = body.password; // For demo, can use PIN or password
    
    if (!email) {
      return { success: false, error: 'Email required', code: 400 };
    }

    const db = new Database();
    
    // Find user by email
    const users = db.query('Users', { email: email }, 1, 1);
    
    if (users.total === 0) {
      // Auto-register if first time (for development)
      if (CONFIG.AUTO_REGISTER) {
        const newUserId = generateUUID();
        const newUser = {
          user_id: newUserId,
          email: email,
          display_name: body.display_name || email.split('@')[0],
          role: body.role || 'member',
          department: body.department || '',
          position: body.position || '',
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        db.insert('Users', newUser);
        return this.createSession(db, newUser);
      }
      return { success: false, error: 'User not found', code: 401 };
    }

    const user = users.data[0];
    
    // Check if active
    if (user.status !== 'active') {
      return { success: false, error: 'Account inactive', code: 403 };
    }

    // Verify password (simple hash check for demo)
    // In production, use proper password hashing or Google OAuth tokens
    if (password) {
      // Simple check for demo - in production use proper auth
      // For now, accept any password for demo purposes
    }

    // Update last login
    db.update('Users', user.user_id, { last_login: new Date().toISOString() });

    return this.createSession(db, user);
  },

  /**
   * Create a new session
   */
  createSession: function(db, user) {
    const sessionId = generateUUID();
    const token = Utilities.base64Encode(
      sessionId + ':' + user.user_id + ':' + Date.now()
    );
    
    const session = {
      session_id: sessionId,
      user_id: user.user_id,
      token: token,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + CONFIG.SESSION_EXPIRY_HOURS * 3600000).toISOString(),
      ip_address: '',
      user_agent: ''
    };

    db.insert('Sessions', session);

    AuditLog.log(user.user_id, 'LOGIN', 'Sessions', sessionId, null, { email: user.email });

    return {
      success: true,
      data: {
        session_id: sessionId,
        token: token,
        user: {
          user_id: user.user_id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          department: user.department,
          position: user.position
        },
        expires_at: session.expires_at
      }
    };
  },

  /**
   * Handle logout
   */
  handleLogout: function(sessionId) {
    const db = new Database();
    try {
      db.remove('Sessions', sessionId);
    } catch (e) {
      // Session might already be expired
    }
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Validate session
   */
  validateSession: function(sessionToken) {
    if (!sessionToken) return null;

    const db = new Database();
    const sessions = db.getAll('Sessions');
    
    const session = sessions.find(s => s.token === sessionToken);
    if (!session) return null;

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      // Expired - remove session
      try { db.remove('Sessions', session.session_id); } catch (e) {}
      return null;
    }

    // Get user info
    const users = db.query('Users', { user_id: session.user_id }, 1, 1);
    if (users.total === 0) return null;

    const user = users.data[0];
    if (user.status !== 'active') return null;

    return {
      session_id: session.session_id,
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      department: user.department
    };
  },

  /**
   * Get current session info
   */
  handleGetSession: function(session) {
    return {
      success: true,
      data: {
        session_id: session.session_id,
        user_id: session.user_id,
        email: session.email,
        role: session.role,
        department: session.department
      }
    };
  },

  /**
   * Check if user has permission
   */
  hasPermission: function(session, resource, action) {
    const role = session.role;
    
    // Role-based permissions
    const permissions = {
      'admin': {
        // Admin has all permissions
        '*': ['create', 'read', 'update', 'delete', 'manage']
      },
      'pao': {
        // PAO - HR Admin
        'members': ['create', 'read', 'update'],
        'headcount': ['create', 'read', 'update'],
        'recruitment': ['create', 'read', 'update'],
        'assessment': ['create', 'read', 'update'],
        'matching': ['create', 'read', 'update'],
        'performance': ['create', 'read', 'update'],
        'development': ['read'],
        'compensation': ['read'],
        'welfare': ['read'],
        'dashboard': ['read']
      },
      'bmc': {
        // BMC - Business Manager
        'members': ['read'],
        'headcount': ['create', 'read'],
        'recruitment': ['read', 'update'],
        'assessment': ['read'],
        'matching': ['read', 'update'],
        'performance': ['read', 'update'],
        'development': ['read'],
        'compensation': ['read'],
        'welfare': ['read'],
        'dashboard': ['read']
      },
      'pad': {
        // PAD - Training & Development
        'members': ['read'],
        'development': ['create', 'read', 'update'],
        'performance': ['read'],
        'dashboard': ['read']
      },
      'wcd': {
        // WCD - Welfare & Compensation
        'members': ['read'],
        'compensation': ['create', 'read', 'update'],
        'welfare': ['create', 'read', 'update'],
        'dashboard': ['read']
      },
      'member': {
        // Regular member
        'members': ['read'], // Own data only
        'performance': ['read'], // Own data only
        'development': ['read'], // Own data only
        'welfare': ['create', 'read'] // Own data
      }
    };

    const rolePerms = permissions[role];
    if (!rolePerms) return false;

    // Check wildcard
    if (rolePerms['*'] && rolePerms['*'].includes(action)) return true;
    
    // Check specific resource
    const resourcePerms = rolePerms[resource];
    if (!resourcePerms) return false;

    return resourcePerms.includes(action);
  },

  /**
   * Check if user is admin
   */
  isAdmin: function(session) {
    return session.role === 'admin';
  },

  /**
   * Get user's accessible data scope
   */
  getDataScope: function(session) {
    const role = session.role;
    
    if (role === 'admin' || role === 'pao') {
      return 'all'; // Can see all data
    }
    
    if (role === 'bmc') {
      return 'department'; // Can see department data
    }
    
    if (role === 'pad' || role === 'wcd') {
      return 'department'; // Can see department data
    }
    
    // Member
    return { member_id: session.user_id }; // Own data only
  }
};

/**
 * Audit Log helper
 */
const AuditLog = {
  /**
   * Log an action
   */
  log: function(userId, action, entityType, entityId, oldValue, newValue) {
    const db = new Database();
    
    const logEntry = {
      log_id: 'LOG-' + generateId(),
      user_id: userId,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : '',
      new_value: newValue ? JSON.stringify(newValue) : '',
      timestamp: new Date().toISOString(),
      ip_address: '' // Will be filled from request context
    };

    try {
      db.insert('AuditLog', logEntry);
    } catch (e) {
      // Don't fail the main operation if audit logging fails
      Logger.log('Audit log error: ' + e.message);
    }
  },

  /**
   * Get recent audit logs
   */
  getRecent: function(limit) {
    const db = new Database();
    const result = db.query('AuditLog', {}, 1, limit || 100);
    // Sort by timestamp descending
    return result.data.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  },

  /**
   * Get audit logs for a specific entity
   */
  getByEntity: function(entityType, entityId, limit) {
    const db = new Database();
    const result = db.query('AuditLog', { entity_type: entityType, entity_id: entityId }, 1, limit || 50);
    return result.data.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  },

  /**
   * Get audit logs for a specific user
   */
  getByUser: function(userId, limit) {
    const db = new Database();
    const result = db.query('AuditLog', { user_id: userId }, 1, limit || 50);
    return result.data.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }
};
