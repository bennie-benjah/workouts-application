const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

// Google OAuth
router.get('/google', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent'
  })}`;
  res.redirect(authUrl);
});

// Google callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokens.error);

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        authProvider: 'google',
        isVerified: true,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

module.exports = router;
