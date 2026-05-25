/**
 * Idempotent launch demo data — makes dashboards investor-demo ready.
 */
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { db } = require('../database/db')

async function upsertCollection(collectionName, doc) {
  if (!doc?._id) return
  const conn = mongoose.connection
  if (conn?.readyState === 1) {
    await conn.collection(collectionName).updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    )
  }
}

const genId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9)

async function seedLaunchDemo() {
  await db.read()

  const studentEmail = 'jenscodersprivetlimited@gmail.com'
  const promoterEmail = 'mistryjenish1234@gmail.com'
  const adminEmail = 'mistryjenish1003@gmail.com'

  // ── Promoter account (promoters collection — NOT users) ──
  const promoHash = await bcrypt.hash('Promoter@1019', 12)
  let promoter = db.data.promoters?.find(
    (p) => p.email?.toLowerCase().trim() === promoterEmail
  )
  if (!promoter) {
    promoter = {
      _id: 'promoter-demo-profile',
      name: 'Demo Promoter',
      email: promoterEmail,
      phone: '+919876543210',
      password: promoHash,
      referralCode: 'BC-PROMO-DEMO',
      status: 'active',
      commissionRate: 0.2,
      referrals: 12,
      studentsJoined: 8,
      earnings: 24600,
      pendingPayout: 4200,
      totalPaidOut: 18000,
      streak: 14,
      rank: 'Gold',
      createdAt: new Date(Date.now() - 90 * 86400000),
      lastLoginAt: new Date(),
    }
    db.data.promoters = db.data.promoters || []
    db.data.promoters.push(promoter)
  } else {
    promoter.password = promoHash
    promoter.referrals = Math.max(promoter.referrals || 0, 12)
    promoter.studentsJoined = Math.max(promoter.studentsJoined || 0, 8)
    promoter.earnings = Math.max(promoter.earnings || 0, 24600)
    promoter.pendingPayout = Math.max(promoter.pendingPayout || 0, 4200)
    promoter.streak = Math.max(promoter.streak || 0, 14)
    promoter.rank = 'Gold'
  }

  // Remove promoter email from users if it blocks promoter login UX
  db.data.users = (db.data.users || []).filter(
    (u) => u.email !== promoterEmail || u._id === 'admin-default'
  )

  // ── Student account + enrollments ──
  const studentHash = await bcrypt.hash('Student@1019', 12)
  let student = db.data.users?.find(
    (u) => u.email?.toLowerCase().trim() === studentEmail
  )
  const courseIds = (db.data.courses || []).slice(0, 3).map((c) => c._id)

  if (!student) {
    student = {
      _id: 'student-demo',
      name: 'Demo Student',
      email: studentEmail,
      password: studentHash,
      role: 'user',
      status: 'active',
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: courseIds,
      favorites: [],
      emailVerified: true,
      referredByPromoterId: promoter._id,
      referralCode: promoter.referralCode,
      createdAt: new Date(Date.now() - 60 * 86400000),
    }
    db.data.users.push(student)
  } else {
    student.password = studentHash
    student.purchasedCourses = courseIds.length ? courseIds : student.purchasedCourses || []
    student.referredByPromoterId = promoter._id
    student.emailVerified = true
    student.status = 'active'
  }

  // ── Referrals ──
  db.data.referrals = db.data.referrals || []
  if (!db.data.referrals.some((r) => r.userId === student._id)) {
    db.data.referrals.push({
      _id: genId(),
      promoterId: promoter._id,
      referralCode: promoter.referralCode,
      userId: student._id,
      userName: student.name,
      status: 'paid',
      commissionAmount: 1598,
      orderAmount: 7999,
      createdAt: new Date(Date.now() - 14 * 86400000),
      convertedAt: new Date(Date.now() - 10 * 86400000),
    })
  }

  // ── Payouts ──
  db.data.promoterPayouts = db.data.promoterPayouts || []
  if (db.data.promoterPayouts.filter((p) => p.promoterId === promoter._id).length < 2) {
    db.data.promoterPayouts.push(
      {
        _id: genId(),
        promoterId: promoter._id,
        amount: 5000,
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 86400000),
      },
      {
        _id: genId(),
        promoterId: promoter._id,
        amount: 3000,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 86400000),
      }
    )
  }

  // ── Orders (admin revenue) ──
  db.data.orders = db.data.orders || []
  if (db.data.orders.length < 5) {
    for (let i = 0; i < 8; i++) {
      db.data.orders.push({
        _id: genId(),
        userId: student._id,
        courses: courseIds.slice(0, 1),
        totalAmount: 2999 + i * 500,
        status: i % 3 === 0 ? 'pending' : 'completed',
        createdAt: new Date(Date.now() - i * 5 * 86400000),
      })
    }
  }

  // ── Notifications ──
  db.data.notifications = db.data.notifications || []
  if (!db.data.notifications.some((n) => n.userId === student._id)) {
    db.data.notifications.push(
      {
        _id: genId(),
        userId: student._id,
        title: 'Welcome to Beyond Classroom',
        message: 'Your Mathematics learning path is ready.',
        read: false,
        createdAt: new Date(),
      },
      {
        _id: genId(),
        userId: student._id,
        title: 'Live class tomorrow',
        message: 'Join your Grade 10 Mathematics session at 6 PM IST.',
        read: false,
        createdAt: new Date(Date.now() - 86400000),
      }
    )
  }

  // ── Progress ──
  db.data.progress = db.data.progress || []
  for (const cid of courseIds) {
    if (!db.data.progress.some((p) => (p.userId === student._id || p.user === student._id) && p.courseId === cid)) {
      db.data.progress.push({
        _id: genId(),
        userId: student._id,
        user: student._id,
        courseId: cid,
        completionPercentage: 35 + Math.floor(Math.random() * 40),
        quizScores: [{ score: 78 }, { score: 85 }],
        updatedAt: new Date(),
      })
    }
  }

  // ── Activity logs (admin) ──
  db.data.activityLogs = db.data.activityLogs || []
  if (db.data.activityLogs.length < 3) {
    db.data.activityLogs.push(
      {
        _id: genId(),
        userId: student._id,
        userName: student.name,
        action: 'enroll',
        module: 'courses',
        description: 'Enrolled in demo course',
        timestamp: new Date(),
      },
      {
        _id: genId(),
        userId: promoter._id,
        userName: promoter.name,
        action: 'referral',
        module: 'promoters',
        description: 'New referral conversion',
        timestamp: new Date(Date.now() - 86400000),
      }
    )
  }

  // Admin demo password (fixes stale hash when admin already exists in MongoDB)
  const adminHash = await bcrypt.hash('Jenish@1019', 12)
  db.data.users = db.data.users || []
  let adminUser = db.data.users.find((u) => u._id === 'admin-default')
  if (!adminUser) {
    adminUser = db.data.users.find(
      (u) => u.email?.toLowerCase().trim() === adminEmail
    )
  }
  if (adminUser) {
    adminUser._id = adminUser._id || 'admin-default'
    adminUser.email = adminEmail
    adminUser.role = 'admin'
    adminUser.password = adminHash
    adminUser.status = 'active'
  } else {
    adminUser = {
      _id: 'admin-default',
      name: 'Jenish Mistry',
      email: adminEmail,
      password: adminHash,
      role: 'admin',
      status: 'active',
      profilePhoto: '',
      isGuest: false,
      purchasedCourses: [],
      favorites: [],
      emailVerified: true,
      createdAt: new Date(),
    }
    db.data.users.push(adminUser)
  }

  await db.write()

  // Force-sync demo credentials to MongoDB (fixes stale hashes on Render)
  await upsertCollection('promoters', promoter)
  await upsertCollection('users', student)
  await upsertCollection('users', adminUser)

  console.log('✅ Launch demo data seeded (admin, promoter, student, referrals, orders, progress)')
}

module.exports = { seedLaunchDemo }
