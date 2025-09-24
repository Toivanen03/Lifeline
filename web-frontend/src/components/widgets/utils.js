export const tempToColor = (temp) => {
  const steps = [
    { t: -30, color: 'rgb(0,0,255)' },
    { t: -25, color: 'rgb(40,40,225)' },
    { t: -20, color: 'rgb(60,60,255)' },
    { t: -15, color: 'rgb(80,80,255)' },
    { t: -10, color: 'rgb(100,100,255)' },
    { t: -5,  color: 'rgb(120,120,255)' },
    { t: 0,   color: 'rgb(130,130,255)' },
    { t: 5,   color: 'rgb(255,130,130)' },
    { t: 10,  color: 'rgb(255,115,115)' },
    { t: 15,  color: 'rgb(255,100,100)' },
    { t: 20,  color: 'rgb(255, 80, 80)' },
    { t: 25,  color: 'rgb(255,40,40)' },
    { t: 30,  color: 'rgb(255,0,0)' },
  ]

  let nearest = steps[0].color
  let minDiff = Math.abs(temp - steps[0].t)
  for (let i = 1; i < steps.length; i++) {
    const diff = Math.abs(temp - steps[i].t)
    if (diff < minDiff) {
      minDiff = diff
      nearest = steps[i].color
    }
  }
  return nearest
}

export const getBackgroundColor = (iconCode) => {
  switch(iconCode) {
    case "01d": case "01n": return "#87CEEB"
    case "02d": case "02n": return "#ADD8E6"
    case "03d": case "03n": return "#B0C4DE"
    case "04d": case "04n": return "#778899"
    case "09d": case "09n": return "#00BFFF"
    case "10d": case "10n": return "#1E90FF"
    case "11d": case "11n": return "#FFD700"
    case "13d": case "13n": return "#FFFFFF"
    case "50d": case "50n": return "#D3D3D3"
    default: return "#87CEEB"
  }
}