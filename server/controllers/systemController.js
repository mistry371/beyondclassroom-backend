const { models } = require('../database/db');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');

exports.checkPayments = async (req, res) => {
  try {
    const payments = await models.payments.find().sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

exports.razorpayDebug = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy'
    });
    const successfulPayments = await models.payments.find({ status: 'success' }).lean();
    const results = [];
    for (const p of successfulPayments) {
      let rzpOrder = null;
      let rzpPayments = null;
      try {
        rzpOrder = await razorpay.orders.fetch(p.razorpayOrderId);
        rzpPayments = await razorpay.orders.fetchPayments(p.razorpayOrderId);
      } catch (e) {
        rzpOrder = { error: e.message };
      }
      results.push({
        dbPayment: p,
        razorpayOrder: rzpOrder,
        razorpayPayments: rzpPayments
      });
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.fixCourses = async (req, res) => {
  try {
    const userId = '1782563847727qxi6dqojq';
    const coursesToRemove = ['course-class-2', 'course-class-3', 'course-class-4'];
    const userBefore = await models.users.findById(userId).lean();
    const result = await models.users.updateOne(
      { _id: userId },
      { $pull: { purchasedCourses: { $in: coursesToRemove } } }
    );
    const userAfter = await models.users.findById(userId).lean();
    res.json({
      success: true,
      removed: coursesToRemove,
      before: userBefore?.purchasedCourses,
      after: userAfter?.purchasedCourses,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const u = await models.users.findById(req.params.id).lean();
    res.json({ success: true, user: u });
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

exports.recoverMissingCourses = async (req, res) => {
  try {
    const successfulPayments = await models.payments.find({ status: 'success' }).lean();
    let affectedPurchasesCount = 0;
    const recoveryActions = [];

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy'
    });

    for (const payment of successfulPayments) {
      let coursesToRestore = [];
      let pId = payment.packageId;
      let cId = payment.courseId;
      let sIds = payment.selectedCourseIds;

      if (!pId && !cId && payment.razorpayOrderId && process.env.RAZORPAY_KEY_ID) {
        try {
          const rzpOrder = await razorpay.orders.fetch(payment.razorpayOrderId);
          if (rzpOrder && rzpOrder.notes) {
            pId = rzpOrder.notes.packageId;
            cId = rzpOrder.notes.courseId;
          }
        } catch (e) {
          console.error('Failed to fetch razorpay order', e.message);
        }
      }

      if (pId) {
        if (!sIds || sIds.length === 0) {
          const pkg = await models.packages.findById(pId).lean();
          if (pkg && pkg.courseIds) {
            sIds = pkg.courseIds;
          }
        }
        if (sIds && sIds.length > 0) {
          coursesToRestore = sIds;
        }
      } else if (cId) {
        coursesToRestore = [cId];
      }

      if (coursesToRestore.length === 0) continue;

      const user = await models.users.findById(payment.userId).lean();
      if (!user) continue;

      const userCourses = user.purchasedCourses || [];
      const missingCourses = coursesToRestore.filter(id => !userCourses.includes(id));

      if (missingCourses.length > 0) {
        affectedPurchasesCount++;
        recoveryActions.push({
          paymentId: payment._id,
          userId: user._id,
          missingCourses
        });
      }
    }

    let restoredCount = 0;
    for (const action of recoveryActions) {
      const result = await models.users.updateOne(
        { _id: action.userId },
        { $addToSet: { purchasedCourses: { $each: action.missingCourses } } }
      );
      if (result.modifiedCount > 0) restoredCount++;
    }

    const User = require('../models/User');
    const allPayments = await models.payments.find().sort({ createdAt: -1 }).limit(500).lean();
    const allUsers = await models.users.find().limit(500).lean();

    res.json({
      success: true,
      affectedPurchasesCount,
      restoredCount,
      recoveryActions,
      debug: {
        recentPayments: allPayments.slice(0, 5),
        usersFound: allUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reseedDemo = async (req, res) => {
  try {
    const key = process.env.DEMO_RESEED_KEY || 'beyondclassroom-reseed';
    if (req.body?.key !== key && req.query?.key !== key) {
      return res.status(403).json({ success: false, message: 'Invalid reseed key' });
    }
    const { seedLaunchDemo } = require('../services/launchDemoSeed');
    await seedLaunchDemo();
    res.json({
      success: true,
      message: 'Demo accounts updated (student, promoter passwords reset)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.healthCheck = (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
};

exports.zoomTest = async (req, res) => {
  try {
    const zoomService = require('../services/zoomService');
    const mode = zoomService.isApiConfigured() ? 'api' : zoomService.isPmiConfigured() ? 'pmi' : 'none';
    if (mode === 'none') {
      return res.json({ success: false, mode, message: 'Zoom not configured. Set ZOOM_PMI_LINK or Server-to-Server OAuth credentials in .env' });
    }
    const result = await zoomService.createMeeting({
      title: 'Test Meeting - Beyond Classroom',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: '30',
      topic: 'Test'
    });
    res.json({ success: result.success, mode: result.mode, message: result.message, zoomLink: result.zoomLink, meetingId: result.meetingId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
