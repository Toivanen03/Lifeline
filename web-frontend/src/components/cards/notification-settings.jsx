import { useMutation } from '@apollo/client/react'
import { UPDATE_NOTIFICATION_SETTINGS } from '../../schema/queries'
import FamilyNotificationSettings from '../settings/notificationSettings'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext } from 'react'
import { motion } from "framer-motion"

const NotificationSettings = ({ familyMembers }) => {
  const { currentUser } = useContext(AuthContext)
  const [updateNotificationSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS)

  const notificationTypes = [
    { type: "electricity", title: "Sähkön hinta" },
    { type: "calendar", title: "Kalenteri" },
    { type: "todo", title: "Tehtävälistat" },
    { type: "shopping", title: "Ostoslistat" },
    { type: "chores", title: "Kotityöt" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="d-flex justify-content-center align-items-start mt-5"
    >
      <div className="card shadow-lg" style={{ border: '1px solid black', borderRadius: 20, backgroundColor: 'white', width: '70%' }}>
          <h2 className="mt-3 mb-2">{currentUser?.name}</h2>
          <h4 className='mb-4'>Ilmoitusasetukset</h4>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {notificationTypes.map(n => (
            <FamilyNotificationSettings
              key={n.type}
              type={n.type}
              title={n.title}
              currentUser={currentUser}
              updateNotificationSettings={updateNotificationSettings}
              familyMembers={familyMembers}
            />
          ))}
          </div>
      </div>
    </motion.div>
  )
}

export default NotificationSettings