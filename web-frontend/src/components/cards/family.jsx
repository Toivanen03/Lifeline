import { useQuery, useMutation } from '@apollo/client/react'
import { UPDATE_NOTIFICATION_SETTINGS, SET_CHILD_NOTIFICATION_PERMISSION, ME } from '../../schema/queries'
import NotificationSettings from '../settings/notificationSettings/notificationSettings'
import { motion } from "framer-motion"

const Family = ({ familyMembers }) => {
  const { data: meData } = useQuery(ME)
  const currentUser = meData?.me
  const familyName = currentUser?.name?.split(' ')[1] || ""
  const [updateNotificationSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS)
  const [setChildPermission] = useMutation(SET_CHILD_NOTIFICATION_PERMISSION)

  if (!currentUser) return <div>Ladataan...</div>

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
          <h2 className="mb-4">Perhe {familyName}</h2>
          <h4 className='mb-4'>Ilmoitusasetukset</h4>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {notificationTypes.map(n => (
            <NotificationSettings
              key={n.type}
              type={n.type}
              title={n.title}
              updateNotificationSettings={updateNotificationSettings}
              setChildPermission={setChildPermission}
              currentUser={currentUser}
              familyMembers={familyMembers}
            />
          ))}
          </div>
      </div>
    </motion.div>
  )
}

export default Family