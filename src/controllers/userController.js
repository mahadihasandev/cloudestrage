const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    const user = await userService.createUser({ username, email, password });
    // If the request came from an HTML form (or expects HTML), we should redirect
    if (req.accepts('html')) {
      return res.redirect('/login.html');
    }
    // Otherwise return JSON for API clients
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await userService.login({ email, password });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
