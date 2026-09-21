/**
 * Legacy storage cleanup utility.
 * Removes obsolete hospital (HMS / SRM) and un-namespaced keys from localStorage.
 */

const TARGETED_LEGACY_KEYS = [
  'srm_patient_users_db',
  'srm_patient_active_id',
  'srm_patient_appointments_db',
  'srm_patient_current_mobile',
  'srm_patient_pending_mobile',
  'hms_lab_orders',
  'hms_op_bills',
  'hms_test_master',
  'user',
  'isAuthenticated',
]

export const cleanLegacyStorage = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return

    // Remove explicitly targeted legacy keys
    TARGETED_LEGACY_KEYS.forEach((key) => {
      localStorage.removeItem(key)
    })

    // Scan and purge any remaining keys starting with srm_ or hms_
    const keysToPurge: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('srm_') || key.startsWith('hms_'))) {
        keysToPurge.push(key)
      }
    }

    keysToPurge.forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (err) {
    console.warn('Storage cleanup encountered an error:', err)
  }
}

// Execute immediately when imported to purge stale keys on application bootstrap
cleanLegacyStorage()
