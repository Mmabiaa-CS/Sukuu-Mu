'use strict';

// ✅ removed the broken: const { get } = require('./auth.routes');
const authService = require('./auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const data = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role_name } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const data = await authService.register({ name, email, password, role_name });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const data = await authService.getAllUsers();
    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'current_password and new_password are required.',
      });
    }

    await authService.changePassword(req.user.id, { current_password, new_password });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, getAllUsers, changePassword };