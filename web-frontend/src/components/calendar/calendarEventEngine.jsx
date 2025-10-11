import finFlag from '../../assets/finFlag.png'
import { Modal, Button } from "react-bootstrap"


export const InfoModal = ({ show, handleClose, value, flagDayInfo, flagDayLinks }) => {
  const renderNamesWithDate = (title) => {
    if (!title.includes(':nameday:')) return value

    const [namesStr, dayStr] = title.split(':nameday:')
    const names = namesStr.split(', ')
    const day = dayStr.replace('-', '.') + '.'

    const container = document.createElement("span")

    names.forEach((name, index) => {
      const link = document.createElement("a")
      link.href = `https://nimipalvelu.dvv.fi/etunimihaku?nimi=${name}`
      link.target = "_blank"
      link.style.color = "black"
      link.style.textDecoration = "none"
      link.textContent = name
      link.style.marginRight = "5px"
      link.addEventListener("click", () => {
        handleClose()
      })

      container.appendChild(link)

      if (index < names.length - 1) container.appendChild(document.createTextNode(", "))
    })

    container.appendChild(document.createTextNode(" " + day))

    return container
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {!value.includes(':nameday:') && <img src={finFlag} style={{width: '3vw'}} className='me-5' />}
          {value.includes(':nameday:') ? (<span ref={el => {
            if (!el) return
            el.innerHTML = ''
            const content = renderNamesWithDate(value)
            el.appendChild(content)
          }} />) : (<span>{value}</span>)}
        </Modal.Title>
      </Modal.Header>
      {!value.includes('nameday') ? (<Modal.Body>
        <div className='m-4'>{flagDayInfo}</div>
         {flagDayLinks?.length > 0 && (
          <div className="mt-5">
            <strong>Lisätietoja:</strong>
            <ul>
              {flagDayLinks.map((l, i) => (
                <li key={i}>
                  <a href={l} target="_blank" rel="noopener noreferrer">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal.Body>
      ) : (
        <Modal.Body>
          Klikkaa nimeä nähdäksesi lisätietoja!
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Sulje
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export const insertSolidCalendarEntries = (calendarRef, flagData, nameData, openModal, showFlagdays, showNamedays, currentDate, setNamedayToday, setFlagDayToday, events, addEvent) => {
  const checkFlagday = (date, flagData) => {
    const additionalHolidays = [
      { title: "Uudenvuodenpäivä", start: "2025-01-01", allDay: true, details: "Uudenvuodenpäivä on juhlapäivä, jota vietetään 1. tammikuuta, vuoden ensimmäisenä vuorokautena. Päivää edeltää 31. joulukuuta vietettävä uudenvuodenaatto. Vuoden vaihtumisen sijoitti tammikuun alkuun Julius Caesar vuonna 46 eaa., sitä ennen roomalaiset olivat aloittaneet vuoden maaliskuusta. Uudenvuodenpäivä on Suomessa ja useissa muissa maissa pyhäpäivä. Suomessa uudenvuodenpäivään kuuluu presidentin pitämä uudenvuodenpuhe. Itävallassa pidetään Wienin filharmonikkojen uudenvuoden konsertti." },
      { title: "Juhannusaatto", start: "2025-06-20", allDay: true, details: "Juhannus on valon ja keskikesän juhla, jota vietetään kesäkuussa kesäpäivänseisauksen tienoilla. Suomessa juhannus on yöttömän yön juhla, kun pohjoisen napapiirin pohjoispuolella aurinko ei laske lainkaan kesäpäivänseisauksena. Suomessa juhannus on myös virallinen liputuspäivä, jolloin liputetaan koko juhannusyön ajan." },
    ]

    if (!date || !showFlagdays) return ""

    const match = flagData?.flagDays?.find(item => item.date === date)
    const additional = additionalHolidays.find(item => item.start.slice(5, 10) === date)

      if (match) {
      if (match.date === currentDate.toISOString().split('T')[0].slice(8, 10) + '-' + currentDate.toISOString().split('T')[0].slice(5, 7)) {
        setFlagDayToday(match.name)
      }

      return match
    }

      if (additional) {
      if (additional.date === currentDate.toISOString().split('T')[0].slice(8, 10) + '-' + currentDate.toISOString().split('T')[0].slice(5, 7)) {
        setFlagDayToday(additional.name)
      }

      return additional
    }

    return ""
  }

  const checkNameday = (date, nameData) => {
    if (!date || !nameData?.nameDays || !showNamedays) return ""
    if (calendarRef?.current?.getApi().view.type === "multiMonthYear") return

    const match = nameData.nameDays.find((nameDay) => nameDay.date === date)

    if (!match) return ""
    if (match.date === currentDate.toISOString().split('T')[0].slice(8, 10) + '-' + currentDate.toISOString().split('T')[0].slice(5, 7)) {
      setNamedayToday(match.names)
    }
    // Do not add auto events to the events state; only render decoration
    return match.names.join(", ")
  }

  setTimeout(() => {
    if (!calendarRef.current) return

    const api = calendarRef?.current?.getApi()
    const calendarEl = api.el

    const otherDay = calendarEl.querySelectorAll(".fc-daygrid-day-bg")

    otherDay.forEach((dayEl) => {
      const cellDateStr = dayEl.closest("[data-date]").getAttribute("data-date")

      if (!cellDateStr) return

      const cellDateRaw = new Date(cellDateStr)
      const cellDate = cellDateRaw.toISOString().split('T')[0].slice(8, 10) + '-' + cellDateRaw.toISOString().split('T')[0].slice(5, 7)

      const flagdayText = checkFlagday(cellDate, flagData)
      const namedayText = calendarRef?.current?.getApi().view.type !== "multiMonthYear" ? checkNameday(cellDate, nameData) : ""

      if (flagdayText || namedayText) {
        const value = flagdayText ? (flagdayText.name || flagdayText.title) : ""
        const flagDayInfo = flagdayText 
          ? {
              description: flagdayText.name ? flagdayText.description : (flagdayText.details || ""),
              links: flagdayText.links || []
            }
          : { description: "", links: [] }

        if (value && !dayEl.classList.contains("fc-day-today")) {
          dayEl.innerHTML = `
            <div style="width: 100%; height: 100%; padding: 5px">
              <div class="nameday locked"><a href="#">${namedayText}</a></div>
              <div class="flagday locked">
                <a href="#"><img src=${finFlag} alt="Suomen lippu" width="20" height="12" /> ${value}</a>
              </div>
            </div>
          ` 
        } else {
          dayEl.innerHTML = `
            <div style="width: 100%; height: 100%; padding: 5px">
              <div class="nameday locked"><a href="#">${namedayText}</a></div>
              <div class="flagday locked"><a href="#">${value}</a></div>
            </div>
          `
        }

        const flagLink = dayEl.querySelector(".flagday a")
        if (flagLink) {
          const newFlagLink = flagLink.cloneNode(true)
          newFlagLink.addEventListener("click", (e) => {
            e.preventDefault()
            openModal(value, flagDayInfo.description, flagDayInfo.links)
          })
          flagLink.replaceWith(newFlagLink)
        }

        const nameLink = dayEl.querySelector(".nameday a")
        if (nameLink) {
          const newNameLink = nameLink.cloneNode(true)
          newNameLink.addEventListener("click", (e) => {
            e.preventDefault()
            openModal(namedayText + ':nameday:' + cellDate)
          })
          nameLink.replaceWith(newNameLink)
        }
      }
    })
  }, 10)
}