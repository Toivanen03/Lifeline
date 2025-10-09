import { createContext, useCallback, useContext, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ACCESS_RULES, USER_ACCESS_RULE, UPSERT_ACCESS_RULE, DELETE_ACCESS_RULE } from '../schema/queries'

const AccessManagementContext = createContext(null)

export const AccessManagementProvider = ({ resourceType, resourceId, creatorId, children }) => {
  const { data, loading, error, refetch } = useQuery(ACCESS_RULES, {
    variables: { resourceType, resourceId, creatorId },
    skip: !resourceType || !resourceId
  })

  const [upsertAccessRule] = useMutation(UPSERT_ACCESS_RULE)
  const [deleteAccessRule] = useMutation(DELETE_ACCESS_RULE)

  const rules = data?.accessRules ?? []

  const DEFAULT_RULE = { canView: true }

  const getUserRule = useCallback(async (userId) => {
    if (!userId || !resourceType || !resourceId) return null
    try {
      const res = await refetch({ resourceType, resourceId, creatorId })
      const list = res?.data?.accessRules ?? []
      return list.find(r => r.userId === userId) ?? DEFAULT_RULE
    } catch {
      return DEFAULT_RULE
    }
  }, [refetch, resourceType, resourceId])

  const canUser = useCallback((userId, action) => {
    const r = rules.find(r => r.userId === userId) || DEFAULT_RULE
    if (action === 'view') return !!r.canView
    return false
  }, [rules])

  const setUserRights = useCallback(async ({ userId, canView }) => {
    await upsertAccessRule({
      variables: { resourceType, resourceId, userId, canView }
    })
    await refetch({ resourceType, resourceId })
  }, [resourceType, resourceId, upsertAccessRule, refetch])

  const removeUserRights = useCallback(async (id) => {
    await deleteAccessRule({ variables: { id } })
    await refetch({ resourceType, resourceId })
  }, [deleteAccessRule, refetch, resourceType, resourceId])

  const value = useMemo(() => ({
    rules,
    loading,
    error,
    getUserRule,
    canUser,
    setUserRights,
    removeUserRights
  }), [rules, loading, error, getUserRule, canUser, setUserRights, removeUserRights])

  return (
    <AccessManagementContext.Provider value={value}>
      {children}
    </AccessManagementContext.Provider>
  )
}

export const useAccessManagement = () => {
  const ctx = useContext(AccessManagementContext)
  if (!ctx) throw new Error('useAccessManagement must be used within AccessManagementProvider')
  return ctx
}


