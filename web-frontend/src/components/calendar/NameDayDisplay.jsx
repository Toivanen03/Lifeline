const items = [" 🌷", " 🌹", " 🥳", " 🌼", " ☕", " 🍰"]

const NameDayDisplay = ({ data, firstname }) => {
  if (!data) return null
  const { names, dateStr } = data
  const today = `${new Date().getDate()}.${new Date().getMonth() + 1}.`

  return (
    <div className="text-start">
      <h5 className="nameday-header">Nimipäivä {dateStr === today && <u>tänään </u> }{dateStr}</h5>
      {names.map((name, i) => (
        <span key={i} className={name === firstname ? "ownnameday" : "nameday"} style={{ display: "block" }}>
          {name}{i < names.length - 1 ? "," : ""}{items[Math.floor(Math.random() * items.length)]}
        </span>
      ))}
    </div>
  )
}

export default NameDayDisplay