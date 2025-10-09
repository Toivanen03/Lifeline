import { NOTIFICATION_SETTINGS } from "../../schema/queries"
import { useQuery } from "@apollo/client/react"

const MobileNotificationSettings = ({ type, title, updateNotificationSettings, currentUser, familyMembers }) => {
  const { data: settingsData, refetch: refetchSettings } = useQuery(NOTIFICATION_SETTINGS, {
    skip: !currentUser
  })

  const settings = settingsData?.notificationSettings

  const usersArray = familyMembers?.map(u => {
    const typeSettings = settings?.[type] || []
    const setting = typeSettings.find(e => e.userId === u.id) || {}

    return {
      id: u.id,
      name: u.name,
      enabled: setting.enabled ?? false,
      canManage: setting.canManage ?? true,
      mobileNotifications: setting.mobileNotifications ?? true,
      parent: u.parent ?? false
    }
  })

  const isParent = currentUser?.parent

  const visibleUsers = (currentUser.isOwner || currentUser.parent)
    ? usersArray
    : usersArray.filter(u => u.id === currentUser.id)

  return (
    <div className="d-flex flex-column align-items-center p-2">
      <div className="d-flex justify-content-between align-items-center mb-2 col-7">
        <div className="col-5 text-start">
          <label className="mb-0"><h5>{title}</h5></label>
        </div>
        <div className="col-11 text-center ms-5">
          {isParent && <small><b>Hallintaoikeus</b></small>}
        </div>
      </div>

      <div className="d-flex flex-column align-items-end col-8">
        {visibleUsers.map(u => {
          const isSelf = u.id === currentUser?.id
          const allowed = currentUser.isOwner || (isSelf && u.canManage) || (currentUser.parent && !u.parent)

          return (
            <div key={u.id} className="col-10 d-flex justify-content-between align-items-center mb-2">
              <div className="col-6 text-start">
                <label htmlFor={`${u.id}Switch`} className="form-check-label mb-0">{isParent ? (u.name.split(' ')[0]) : (<span>Lähetä ilmoituksia</span>)}</label>
              </div>

              <div className="col-6 d-flex justify-content-between">
                <div className="form-check form-switch">
                  <input
                    id={`${u.id}Switch`}
                    type="checkbox"
                    className="form-check-input"
                    checked={u.mobileNotifications}
                    disabled={!allowed}
                    onChange={async () => {
                      try {
                        await updateNotificationSettings({
                          variables: {
                            familyId: currentUser.familyId,
                            userId: u.id,
                            type,
                            mobileNotifications: !u.mobileNotifications
                          }
                        })
                        await refetchSettings()
                      } catch (err) {
                        console.error("Backend update failed", err)
                      }
                    }}
                  />
                </div>

                {isParent ? (
                  <div className="form-check form-switch">
                    <input
                      id={`${u.id}PermissionSwitch`}
                      type="checkbox"
                      className="form-check-input"
                      checked={u.canManage}
                      disabled={!allowed || isSelf}
                      onChange={async () => {
                        try {
                          await updateNotificationSettings({
                            variables: {
                              familyId: currentUser.familyId,
                              userId: u.id,
                              type,
                              canManage: !u.canManage
                            }
                          })
                          await refetchSettings()
                        } catch (err) {
                          console.error("Backend update failed", err)
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="me-3">
                    {isParent && <small>Ei ole</small>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNotificationSettings