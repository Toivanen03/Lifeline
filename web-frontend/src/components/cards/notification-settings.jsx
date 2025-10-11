import { useMutation } from '@apollo/client/react'
import { UPDATE_NOTIFICATION_SETTINGS } from '../../schema/queries'
import FamilyNotificationSettings from '../settings/notificationSettings'
import MobileNotificationSettings from '../settings/MobileNotificationSettings'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext } from 'react'
import { motion } from "framer-motion"

const NotificationSettings = ({ familyMembers }) => {
  const { currentUser } = useContext(AuthContext)
  const [updateNotifications] = useMutation(UPDATE_NOTIFICATION_SETTINGS)

  const notificationTypes = [
    { type: "electricity", title: "Sähkön hinta" },
    { type: "calendar", title: "Kalenteri" },
    { type: "todo", title: "Tehtävälistat" },
    { type: "shopping", title: "Ostoslistat" },
    { type: "chores", title: "Kotityöt" }
  ]

  const mobileNotificationTypes = [
    { type: "wilma", title: "Lukujärjestykset" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="d-flex justify-content-center align-items-start mt-5"
    >
      <div className="card shadow-lg" style={{ border: '1px solid black', borderRadius: 20, backgroundColor: 'white', width: '80vw' }}>
          <h2 className="mt-3 mb-2">{currentUser?.name}</h2>
          <div className='row'>
            <div className='col-6'>
              <h4 className='mb-4'>Yleiset ilmoitusasetukset</h4>
              <div style={{ maxHeight: '64vh', overflowY: 'auto', overflowX: 'hidden' }}>
                {notificationTypes.map(n => (
                  <FamilyNotificationSettings
                    key={n.type}
                    type={n.type}
                    title={n.title}
                    currentUser={currentUser}
                    updateNotifications={updateNotifications}
                    familyMembers={familyMembers}
                  />
                ))}
              </div>
            </div>

            <div className='col-6'>
              <h4 className='mb-4'>Mobiili-ilmoitukset</h4>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
                {mobileNotificationTypes.map(n => (
                  <MobileNotificationSettings
                    key={n.type}
                    type={n.type}
                    title={n.title}
                    currentUser={currentUser}
                    updateNotifications={updateNotifications}
                    familyMembers={familyMembers}
                  />
                ))}
              </div>
            </div>
          </div>
      </div>
    </motion.div>
  )
}

export default NotificationSettings