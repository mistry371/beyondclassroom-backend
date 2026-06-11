require('dotenv').config()
const { initDB, models } = require('./database/db')
const mongoose = require('mongoose')

async function fixPackages() {
  await initDB()
  
  console.log('Fetching all courses...')
  const courses = await models.courses.find({}).lean()
  
  const getCourseIds = (grades) => {
    return courses
      .filter(c => grades.includes(c.grade) && !c.isDemo && c.category === 'Mathematics')
      .map(c => c._id)
  }

  const grades1to4 = ['Class 1', 'Class 2', 'Class 3', 'Class 4']
  const grades5to8 = ['Class 5', 'Class 6', 'Class 7', 'Class 8']
  const grades1to8 = [...grades1to4, ...grades5to8]

  const packageUpdates = [
    { id: 'beta', name: 'Beta Package', inr: 499, popular: false, courseIds: getCourseIds(grades1to4) },
    { id: 'basic', name: 'Basic Package', inr: 699, popular: false, courseIds: getCourseIds(grades5to8) },
    { id: 'pro', name: 'Pro Package', inr: 999, popular: true, courseIds: getCourseIds(grades5to8) },
    { id: 'teachers', name: 'Teachers Package', inr: 1999, popular: false, courseIds: getCourseIds(grades1to8) },
    { id: 'school', name: 'School or Institute Package', inr: 9999, popular: false, courseIds: getCourseIds(grades1to8) }
  ]

  console.log('Updating packages...')
  
  for (const update of packageUpdates) {
    const existing = await models.packages.findById(update.id)
    if (existing) {
      await models.packages.findByIdAndUpdate(update.id, { 
        courseIds: update.courseIds,
        popular: update.popular,
        priceINR: update.inr
      })
      console.log(`✅ Updated ${update.id} package with ${update.courseIds.length} courses`)
    } else {
      await models.packages.create({
        _id: update.id,
        name: update.name,
        priceINR: update.inr,
        popular: update.popular,
        courseIds: update.courseIds,
        active: true
      })
      console.log(`✅ Created ${update.id} package with ${update.courseIds.length} courses`)
    }
  }

  console.log('✅ Package update complete!')
  await mongoose.disconnect()
}

fixPackages().catch(console.error)
