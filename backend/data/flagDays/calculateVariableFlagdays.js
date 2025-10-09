import fs from 'fs'
import path from 'path'

const loadJSON = (fileName) => {
  const filePath = path.join(process.cwd(), 'data', 'flagDays', fileName)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const getNthWeekdayOfMonth = (year, month, weekday, nth) => {
  let date = new Date(year, month - 1, 1)
  let count = 0
  while (date.getMonth() === month - 1) {
    if (date.getDay() === weekday) count++
    if (count === nth) return date
    date.setDate(date.getDate() + 1)
  }
  return null
}

const getLastWeekdayOfMonth = (year, month, weekday) => {
  let date = new Date(year, month, 0)
  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1)
  }
  return date
}

const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2,'0')
  const mm = String(date.getMonth()+1).padStart(2,'0')
  return `${dd}-${mm}`
}

export const calculateFlagDays = (year) => {
  const flagDaysRaw = loadJSON('additionalFlagDays.json')

  return flagDaysRaw.variableFlagDays.map(day => {
    let dateObj

    switch(day.name) {
      case 'Äitienpäivä':
        dateObj = getNthWeekdayOfMonth(year, 5, 0, 2)
        break
      case 'Isänpäivä':
        dateObj = getNthWeekdayOfMonth(year, 11, 0, 2)
        break
      case 'Juhannusaatto':
        dateObj = getNthWeekdayOfMonth(year, 6, 5, 3)
        break
      case 'Juhannuspäivä':
        dateObj = getNthWeekdayOfMonth(year, 6, 6, 3)
        break
      case 'Suomen luonnon päivä':
        dateObj = getLastWeekdayOfMonth(year, 8, 6)
        break
      case 'Kaatuneitten muistopäivä':
        dateObj = getNthWeekdayOfMonth(year, 5, 0, 3)
        break
      default:
        dateObj = new Date(day.date)
    }

    return {
      ...day,
      date: formatDate(dateObj),
      type: 'flagDay'
    }
  })
}