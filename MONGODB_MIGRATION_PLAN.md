# 🔄 MONGODB MIGRATION PLAN
## From JSON (LowDB) to MongoDB Atlas

**Status**: Ready to Execute  
**Timeline**: 4 Weeks  
**Risk Level**: Medium  
**Rollback Plan**: Available

---

## MIGRATION STRATEGY

### Approach: Blue-Green Deployment with Dual-Write

```
Phase 1: Setup (Week 1)
├── Provision MongoDB Atlas
├── Create schemas & indexes
├── Write migration scripts
└── Test environment setup

Phase 2: Dual-Write (Week 2-3)
├── Write to both databases
├── Validate data consistency
├── Monitor performance
└── Fix discrepancies

Phase 3: Cutover (Week 4)
├── Switch reads to MongoDB
├── Stop JSON writes
├── Final data sync
└── Archive JSON backup
```

---

## WEEK 1: SETUP & PREPARATION

### Step 1: MongoDB Atlas Setup

**Connection String** (Already provided):
```
mongodb+srv://admin:admin@cluster0.iqoanfx.mongodb.net/elite-digital-card
```

### Step 2: Create Mongoose Models

We'll create proper Mongoose schemas for all collections:

1. **User Model** (Enhanced)
2. **Course Model** (Enhanced)
3. **Module Model** (New - proper schema)
4. **Lesson Model** (New - proper schema)
5. **Practice Question Model** (New)
6. **Quiz Model** (Enhanced)
7. **Progress Model** (Enhanced)
8. **Notification Model** (Enhanced)
9. **Order Model** (Enhanced)
10. **Subscription Model** (Enhanced)
11. **Activity Log Model** (New)
12. **Setting Model** (New)

### Step 3: Migration Scripts

Create scripts to:
- Export data from JSON
- Transform data format
- Import to MongoDB
- Validate integrity

---

## IMPLEMENTATION CHECKLIST

### Database Setup
- [ ] Connect to MongoDB Atlas
- [ ] Create database: `elite_math_platform`
- [ ] Create all collections
- [ ] Add indexes
- [ ] Test connection

### Model Creation
- [ ] Update User model
- [ ] Update Course model
- [ ] Create Module model (Mongoose)
- [ ] Create Lesson model (Mongoose)
- [ ] Create PracticeQuestion model
- [ ] Update Quiz model
- [ ] Update Progress model
- [ ] Update Notification model
- [ ] Update Order model
- [ ] Update Subscription model
- [ ] Create ActivityLog model
- [ ] Create Setting model

### Migration Scripts
- [ ] Create data export script
- [ ] Create data transform script
- [ ] Create data import script
- [ ] Create validation script
- [ ] Create rollback script

### API Updates
- [ ] Update database connection
- [ ] Update all controllers
- [ ] Update all services
- [ ] Add error handling
- [ ] Add logging

### Testing
- [ ] Unit tests for models
- [ ] Integration tests for APIs
- [ ] Load testing
- [ ] Data integrity checks
- [ ] Performance benchmarks

### Deployment
- [ ] Backup JSON database
- [ ] Run migration script
- [ ] Validate data
- [ ] Switch to MongoDB
- [ ] Monitor for 48 hours
- [ ] Archive JSON backup

---

## DATA TRANSFORMATION RULES

### Users
```javascript
// JSON Format
{
  _id: "string",
  email: "string",
  role: "admin" | "user"
}

// MongoDB Format
{
  _id: ObjectId,
  email: "string",
  role: "super_admin" | "student",
  grade: Number (5-12),
  learningStreak: Number,
  totalTimeSpent: Number
}
```

### Courses
```javascript
// Add new fields
{
  slug: generateSlug(title),
  grade: [9, 10], // Extract from title/description
  totalLessons: count(modules.lessons),
  totalQuizzes: count(modules.quizzes),
  publishedAt: createdAt
}
```

### Progress
```javascript
// Enhance tracking
{
  lessonsCompleted: [{
    lessonId: ObjectId,
    completedAt: Date,
    timeSpent: Number
  }],
  quizzesAttempted: [{
    quizId: ObjectId,
    score: Number,
    percentage: Number,
    attemptedAt: Date
  }]
}
```

---

## ROLLBACK PLAN

### If Migration Fails:

1. **Stop all writes** to MongoDB
2. **Revert API** to use JSON database
3. **Restore JSON backup** if corrupted
4. **Analyze failure** logs
5. **Fix issues** and retry

### Rollback Script:
```bash
# Stop server
pm2 stop all

# Restore JSON backup
cp server/database/db.json.backup server/database/db.json

# Revert code to previous commit
git revert HEAD

# Restart server
pm2 start all
```

---

## PERFORMANCE BENCHMARKS

### Target Metrics:

| Operation | JSON (Current) | MongoDB (Target) |
|-----------|----------------|------------------|
| User Login | 50ms | 30ms |
| Course List | 100ms | 40ms |
| Progress Update | 80ms | 25ms |
| Quiz Submit | 150ms | 50ms |

### Load Testing:
- 1,000 concurrent users
- 10,000 requests/minute
- 99th percentile < 200ms

---

## MONITORING & ALERTS

### Metrics to Track:
- Database connection pool
- Query execution time
- Error rates
- Data consistency
- Disk usage
- Memory usage

### Alerts:
- Connection failures
- Slow queries (>1s)
- High error rate (>1%)
- Disk usage >80%

---

## POST-MIGRATION TASKS

### Week 5-6: Optimization
- [ ] Analyze slow queries
- [ ] Add missing indexes
- [ ] Optimize aggregations
- [ ] Implement caching
- [ ] Fine-tune connection pool

### Week 7-8: Enhancement
- [ ] Add full-text search
- [ ] Implement aggregation pipelines
- [ ] Add geospatial queries (future)
- [ ] Setup change streams (real-time)
- [ ] Configure backup strategy

---

## SUCCESS CRITERIA

✅ **Zero data loss**  
✅ **<5% performance degradation**  
✅ **100% API compatibility**  
✅ **No downtime** (blue-green deployment)  
✅ **Successful rollback test**  

---

## NEXT STEPS

1. **Review this plan** with team
2. **Get approval** from stakeholders
3. **Schedule migration** window
4. **Execute Week 1** tasks
5. **Daily standup** during migration

---

**Migration Lead**: CTO  
**Start Date**: March 11, 2026  
**Target Completion**: April 8, 2026  
**Status**: READY TO BEGIN
