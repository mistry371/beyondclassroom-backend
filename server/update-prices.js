const { db } = require('./database/db')

async function updatePrices() {
  await db.read()

  console.log('📝 Updating all course prices to ₹1...\n')

  if (db.data.courses && db.data.courses.length > 0) {
    db.data.courses.forEach(course => {
      course.price = 1
      console.log(`✅ Updated: ${course.title} → ₹1`)
    })

    await db.write()
    console.log(`\n✅ Successfully updated ${db.data.courses.length} courses!`)
  } else {
    console.log('❌ No courses found in database')
  }
}

updatePrices().catch(console.error)
