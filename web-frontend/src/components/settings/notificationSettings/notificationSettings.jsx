import { NOTIFICATION_SETTINGS } from "../../../schema/queries"
import { useQuery } from "@apollo/client/react"

const NotificationSettings = ({
  type,
  title,
  updateNotificationSettings,
  setChildPermission,
  currentUser,
  family
  }) => {
    const { data: settingsData, refetch: refetchSettings } = useQuery(NOTIFICATION_SETTINGS, {
      skip: !currentUser
    })

  const settings = settingsData?.notificationSettings

  const usersArray = family?.map((u) => ({
    id: u.id,
    name: u.name,
    enabled: settings?.[type]?.find((e) => e.userId === u.id)?.enabled ?? false,
    canManageOwnNotifications: u.notificationPermissions?.[type] ?? false,
    parent: u.parent ?? false,
  }))

  const isParent = currentUser?.parent
  const masterEnabled = usersArray?.some((u) => u.enabled) ?? false

  const toggleMaster = async () => {
    try {
      if (masterEnabled) {
        await Promise.all(
          usersArray.map((u) =>
            updateNotificationSettings({
              variables: { userId: u.id, type, enabled: false },
            })
          )
        )
      } else {
        await updateNotificationSettings({
          variables: { userId: currentUser.id, type, enabled: true },
        })
      }
      await refetchSettings()
    } catch (err) {
      console.error("Backend update failed", err)
    }
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex justify-content-between align-items-center mb-3 col-10">
        <div className="col-4 text-start">
          <label className="mb-0"><h5>{title}</h5></label>
        </div>

        <div className="col-4 d-flex justify-content-center form-check form-switch text-center">
          <input
            type="checkbox"
            className="form-check-input"
            checked={masterEnabled}
            onChange={toggleMaster}
          />
        </div>

        <div className="col-4 d-flex justify-content-center text-end">
          {isParent && masterEnabled && <small>Lapsi saa hallita itse</small>}
        </div>
      </div>

      {masterEnabled && (
        <div className="d-flex flex-column align-items-center col-12 mb-5">
          {usersArray.map((u) => {
            const isSelf = u.id === currentUser?.id
            const allowed = isParent || (isSelf && u.canManageOwnNotifications)

            return (
              <div key={u.id} className="col-10 d-flex justify-content-between align-items-center">
                <div className="col-4 text-start">
                  <label htmlFor={`${u.name}Switch`} className="form-check-label mb-0">
                    {u.name}
                  </label>
                </div>

                <div className="col-4 d-flex justify-content-center form-check form-switch text-center">
                  <input
                    id={`${u.name}Switch`}
                    type="checkbox"
                    className="form-check-input"
                    checked={u.enabled}
                    disabled={!allowed}
                    onChange={async () => {
                      try {
                        await updateNotificationSettings({
                          variables: { userId: u.id, type, enabled: !u.enabled },
                        })
                        await refetchSettings()
                      } catch (err) {
                        console.error("Backend update failed", err)
                      }
                    }}
                  />
                </div>

                <div className="col-4 d-flex justify-content-center form-check form-switch text-center">
                  {isParent && !u.parent && (
                    <input
                      id={`${u.id}PermissionSwitch`}
                      type="checkbox"
                      className="form-check-input"
                      checked={u.canManageOwnNotifications}
                      onChange={async () => {
                        try {
                          await setChildPermission({
                            variables: { userId: u.id, type, canManage: !u.canManageOwnNotifications },
                          })
                          await refetchSettings()
                        } catch (err) {
                          console.error("Backend update failed", err)
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationSettings