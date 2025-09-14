// Admin middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // Check if user is the admin email
    const adminEmail = 'gauravdeepgd12007@gmail.com';
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (req.user.email !== adminEmail) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin verification'
    });
  }
};
