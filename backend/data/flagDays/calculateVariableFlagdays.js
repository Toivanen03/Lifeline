import fs from 'fs'
import path from 'path'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${dd}-${mm}`
}

const loadJSON = (fileName) => {
  const filePath = path.join(process.cwd(), fileName)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const main = () => {
  const flagDaysRaw = loadJSON('additionalFlagDays.json')

  const variableFlagDaysEntries = flagDaysRaw.variableFlagDays.map(day => ({
    name: day.name,
    date: formatDate(day.date),
    description: day.description || '',
    official: day.official || false,
    links: day.links || [],
    type: 'flagDay'
  }))

  console.log(variableFlagDaysEntries)
}

main()