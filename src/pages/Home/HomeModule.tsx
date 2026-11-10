import { useState, useEffect, useMemo, useRef } from 'react'
import { downloadTrackSheetPdf } from '@/utils/trackSheetPdfGenerator'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Printer, Edit3, Eye, ArrowLeft, FileText, HelpCircle, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type {
    Step,
    Sibling,
    AdditionalChild,
    FatherDetailsState,
    MotherDetailsState,
    GuardianDetailsState,
    CommunicationDetailsState
} from './types'
import { RegistrationPortalView } from './components/RegistrationPortalView'
import { InstructionModal } from './components/InstructionModal'
import { StepSidebar } from './components/StepSidebar'
import { Step1ApplicantDetails, getBranchInitial } from './steps/Step1ApplicantDetails'
import { Step2ParentDetails, validateParentDob, extractBirthYear } from './steps/Step2ParentDetails'
import { Step3GuardianDetails } from './steps/Step3GuardianDetails'
import { Step4CommunicationDetails } from './steps/Step4CommunicationDetails'
import { Step5Declaration } from './steps/Step5Declaration'
import { RegistrationSuccessModal } from './components/RegistrationSuccessModal'
import { ApplicationFormLoader } from '@/components/ApplicationFormLoader'
import { PrintPreviewModal } from '@/components/print'
import { useStudentStore } from '@/store/useStudentStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useMasterStore } from '@/store/useMasterStore'
import { ApiService, type AdmissionDetailsRecord, type HomeContentsRecord } from '@/services/api.service'
import type { StudentRecord } from '@/data/mockStudents'
import { reportConfig } from '@/data/reportConfig'
import { isValidEmail } from '@/utils/validation'

const stepSlugMap: Record<string, number> = {
    'application-details': 1,
    'applicant-details': 1,
    'parent-details': 2,
    'guardian-details': 3,
    'communication-details': 4,
    'declaration': 5,
}

const isOther = (val?: string) => Boolean(val && (val.toLowerCase() === 'others' || val.toLowerCase() === 'other' || val.toLowerCase().startsWith('other')))
const normalizeDropdownValue = (value: string): string => {
    const normalized = value.trim().toLowerCase()
    return normalized.startsWith('other') ? 'other' : normalized
}
const matchesDropdownValue = (option: string | null | undefined, value: string): boolean =>
    Boolean(option && normalizeDropdownValue(option) === normalizeDropdownValue(value))

function findMasterOptionById<T>(
    id: unknown,
    options: readonly T[],
    getId: (option: T) => number,
): T | undefined {
    const numericId = Number(id)
    if (!Number.isInteger(numericId) || numericId <= 0) return undefined
    return options.find((option) => getId(option) === numericId)
}

function getFetchedDropdownValue<T>(
    id: unknown,
    options: readonly T[],
    getId: (option: T) => number,
    getValue: (option: T) => string,
    fetchedValue: string,
    fetchedOtherValue = '',
): { value: string; otherValue: string } {
    const masterOption = findMasterOptionById(id, options, getId)
    const masterValue = masterOption ? getValue(masterOption) : undefined
    const selectedOther = masterValue !== undefined
        ? isOther(masterValue)
        : Boolean(fetchedOtherValue) || isOther(fetchedValue)
    const fetchedValueIsPlaceholder = /^others?$/i.test(fetchedValue.trim())

    return {
        value: selectedOther ? (masterValue || 'Others') : (masterValue || fetchedValue),
        otherValue: selectedOther ? (fetchedOtherValue || (fetchedValueIsPlaceholder ? '' : fetchedValue)) : '',
    }
}
const hasOfficialApplicationNumber = (applicationNo?: string | null): boolean => {
    const normalizedApplicationNo = applicationNo?.trim()
    return Boolean(normalizedApplicationNo && !normalizedApplicationNo.toUpperCase().startsWith('T25-'))
}

const toIsoDateString = (dStr?: string): string => {
    if (!dStr) return ''
    const trimmed = dStr.trim()
    if (!trimmed) return ''
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
    const separatedDate = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed)
    if (!isoDate && !separatedDate) {
        throw new Error(`Unsupported date format: ${dStr}`)
    }

    const toValidIsoDate = (year: number, month: number, day: number): string | undefined => {
        const dateObj = new Date(Date.UTC(year, month - 1, day))
        if (
            dateObj.getUTCFullYear() !== year ||
            dateObj.getUTCMonth() !== month - 1 ||
            dateObj.getUTCDate() !== day
        ) return undefined

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    if (isoDate) {
        const isoValue = toValidIsoDate(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]))
        if (isoValue) return isoValue
    } else if (separatedDate) {
        const year = Number(separatedDate[3])
        const dayFirstValue = toValidIsoDate(year, Number(separatedDate[2]), Number(separatedDate[1]))
        const monthFirstValue = toValidIsoDate(year, Number(separatedDate[1]), Number(separatedDate[2]))
        if (dayFirstValue || monthFirstValue) return dayFirstValue || monthFirstValue || ''
    }

    throw new Error(`Invalid date: ${dStr}`)
}

const stepIdToSlug: Record<number, string> = {
    1: 'application-details',
    2: 'parent-details',
    3: 'guardian-details',
    4: 'communication-details',
    5: 'declaration',
}

export default function HomeModule() {
    const params = useParams<{ id?: string; stepSlug?: string }>()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { getStudentById, addStudent, updateStudent } = useStudentStore()

    // Robust pathname-based route parsing:
    // /admission                           => overview
    // /admission/add                       => new application overview
    // /admission/:id                       => overview for student :id
    // /admission/application-details/add   => new application step 1 form
    // /admission/:stepSlug/add             => new application step form
    // /admission/:stepSlug/:id             => stepForm for student :id
    // /admission/application-details/:id   => stepForm step 1 for student :id
    // /admission/:stepSlug                 => stepForm for new applicant
    const pathSegments = location.pathname.split('/').filter(Boolean)

    let detectedStepSlug: string | undefined = undefined
    let detectedId: string | undefined = undefined

    const { user } = useAuthStore()
    const isAdminUser = user?.role?.toLowerCase() === 'admin'

    const isCreateMode = isAdminUser && (pathSegments.includes('add') || params.id === 'add')

    if (pathSegments.length >= 3) {
        if (stepSlugMap[pathSegments[1]]) {
            detectedStepSlug = pathSegments[1]
            if (pathSegments[2] !== 'add' && !stepSlugMap[pathSegments[2]]) {
                detectedId = pathSegments[2]
            }
        }
    } else if (pathSegments.length === 2) {
        if (stepSlugMap[pathSegments[1]]) {
            detectedStepSlug = pathSegments[1]
        } else if (pathSegments[1] !== 'add' && !stepSlugMap[pathSegments[1]]) {
            detectedId = pathSegments[1]
        }
    }

    // Only treat valid ID (not 'add' and not a stepSlug) as an existing student id
    const isStepSlug = (val?: string) => Boolean(val && stepSlugMap[val])
    const rawId = (!isCreateMode && params.id && params.id !== 'add' && !isStepSlug(params.id)) ? params.id : detectedId
    const id = (rawId && !isStepSlug(rawId)) ? rawId : undefined
    const effectiveStepSlug = detectedStepSlug

    // Mode determination: ?mode=view vs ?mode=edit
    // For regular users, all steps are editable by default (including after submit)
    // Only admin viewing without mode=edit or explicit mode=view is read-only
    const modeParam = searchParams.get('mode')
    const isExplicitView = modeParam === 'view'
    const isReadOnly = !isCreateMode && (
        (isAdminUser && isExplicitView) || (isAdminUser && Boolean(id) && modeParam !== 'edit')
    )

    // Source navigation parameters from Student Master or Reports
    const fromParam = searchParams.get('from')
    const tabParam = searchParams.get('tab') as 'verification' | 'confirmation' | 'master' | null
    const reportKeyParam = searchParams.get('report')
    const reportNameParam = searchParams.get('reportName')

    // Dynamic Source Back Label based on which Student Master tab or Report user came from
    const getSourceBackLabel = (): string => {
        if (fromParam === 'report' || reportKeyParam) {
            const reportName = reportNameParam || (reportKeyParam && reportConfig[reportKeyParam]?.label) || 'Reports'
            return reportName.toLowerCase().startsWith('back to') ? reportName : `Back to ${reportName}`
        }
        if (fromParam === 'student-master' || tabParam) {
            if (tabParam === 'verification') {
                return 'Back to Student Verification Status'
            }
            if (tabParam === 'confirmation') {
                return 'Back to Student Confirmation Status'
            }
            if (tabParam === 'master') {
                return 'Back to Applications Master'
            }
            return 'Back to Student Master'
        }
        return isAdminUser ? 'Back to Student Master' : 'Back to Admission'
    }

    const sourceBackLabel = getSourceBackLabel()

    // Dynamic Source Return URL to return to the exact same tab / report
    const getSourceReturnUrl = (): string => {
        if (fromParam === 'report' || reportKeyParam) {
            return `/admin/reports?report=${reportKeyParam || 'tracksheet-verification'}`
        }
        if (fromParam === 'student-master' || tabParam) {
            return `/admin/students?tab=${tabParam || 'verification'}`
        }
        if (isAdminUser) {
            return '/admin/students'
        }
        return '/admission'
    }

    const handleReturnToSource = () => {
        navigate(getSourceReturnUrl())
    }

    // Preserve query parameters during internal step navigation and mode switches
    const getPreservedQuery = (customMode?: string): string => {
        const sp = new URLSearchParams()

        // Only include mode in the URL for:
        // 1. Explicit view mode (?mode=view)
        // 2. Admin viewing/editing an existing student record (where toggling view vs edit is needed)
        // For new applications or regular user registration, no mode parameter is needed.
        const effectiveMode = customMode !== undefined ? customMode : (modeParam || '')
        if (effectiveMode && (effectiveMode === 'view' || (isAdminUser && id))) {
            sp.set('mode', effectiveMode)
        }

        if (fromParam) sp.set('from', fromParam)
        if (tabParam) sp.set('tab', tabParam)
        if (reportKeyParam) sp.set('report', reportKeyParam)
        if (reportNameParam) sp.set('reportName', reportNameParam)
        const qs = sp.toString()
        return qs ? `?${qs}` : ''
    }

    // If it's a new application case and mode=edit was in URL, clean up the redundant query param smoothly
    useEffect(() => {
        if (!id && !isCreateMode && modeParam === 'edit') {
            const sp = new URLSearchParams(searchParams)
            sp.delete('mode')
            const qs = sp.toString()
            navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true })
        }
    }, [id, isCreateMode, modeParam, location.pathname, searchParams, navigate])

    const [viewMode, setViewMode] = useState<'overview' | 'stepForm'>('overview')
    const [activeStepId, setActiveStepId] = useState<number>(1)

    // Check if coming from Admin section when viewing an existing student record
    const [fromAdmin, setFromAdmin] = useState<boolean>(() => Boolean(id) && isAdminUser)
    const [isStep3Saved, setIsStep3Saved] = useState<boolean>(false)

    // Editing or newly created student references
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
    const [createdStudentId, setCreatedStudentId] = useState<string | null>(null)

    // Helper to format ISO or dd-MM-yyyy date into YYYY-MM-DD for date input
    const formatToInputDate = (d?: string | null): string => {
        if (!d) return ''
        const ddmmyyyy = d.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        if (ddmmyyyy) {
            return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.substring(0, 10)
        const parsed = new Date(d)
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0]
        }
        return d
    }

    // Master store lookups
    const fetchMasters = useMasterStore((s) => s.fetchMasters)
    const mastersLoaded = useMasterStore((s) => s.isLoaded)
    const shouldLoadApplicant = !isCreateMode && mastersLoaded
    const lookups = useMasterStore((s) => s.lookups)
    const castes = useMasterStore((s) => s.castes)
    const motherTongues = useMasterStore((s) => s.motherTongues)
    const distances = useMasterStore((s) => s.distances)
    const schools = useMasterStore((s) => s.applyingSchools)
    const siblingSchools = useMasterStore((s) => s.siblingSchools)
    const parentSchools = useMasterStore((s) => s.parentSchools)
    const incomeRanges = useMasterStore((s) => s.incomeRanges)
    const setAdmissionSchoolAddress = useMasterStore((s) => s.setAdmissionSchoolAddress)
    const admissionSchoolAddress = useMasterStore((s) => s.admissionSchoolAddress)
    const standards = useMasterStore((s) => s.standards)
    const leftYears = useMasterStore((s) => s.leftYears)

    useEffect(() => {
        fetchMasters()
    }, [fetchMasters])

    const getGenderId = (val: string) => {
        if (!val) return 5
        const match = lookups.find(l => (l.LookupName === 'Gender' || l.LookupRefID === 2) && matchesDropdownValue(l.LookupValue, val))
        return match ? match.LookupID : (val.toLowerCase() === 'male' ? 4 : 5)
    }
    const getMotherTongueId = (val: string) => {
        if (!val) return 1
        const match = motherTongues.find(m => matchesDropdownValue(m.MotherTongueName, val))
        return match ? match.MotherTongueID : 1
    }
    const getNationalityId = (val: string) => {
        if (!val) return 7
        const match = lookups.find(l => (l.LookupName === 'Nationality' || l.LookupRefID === 3) && matchesDropdownValue(l.LookupValue, val))
        return match ? match.LookupID : 7
    }
    const getReligionId = (val: string) => {
        if (!val) return 9
        const match = lookups.find(l => (l.LookupName === 'Religion' || l.LookupRefID === 4) && matchesDropdownValue(l.LookupValue, val))
        return match ? match.LookupID : 9
    }
    const getCasteId = (val: string) => {
        if (!val) return 1
        const match = castes.find(c => matchesDropdownValue(c.CasteName, val))
        return match ? match.CasteID : 1
    }
    const getCommunityId = (val: string) => {
        if (!val) return 16
        const match = lookups.find(l => (l.LookupName === 'Community' || l.LookupRefID === 5) && matchesDropdownValue(l.LookupValue, val))
        return match ? match.LookupID : 16
    }
    const getDistanceId = (val: string) => {
        if (!val) return 1
        const match = distances.find(d => d.DistanceName.toLowerCase() === val.toLowerCase() || String(d.DistanceID) === val)
        return match ? match.DistanceID : 1
    }
    const getTransportModeIds = (values: string[]): string | null => {
        const ids = values.map((value) => {
            const match = lookups.find(
                (lookup) =>
                    (lookup.LookupRefID === 7 || lookup.LookupName === 'TransportMode') &&
                    matchesDropdownValue(lookup.LookupValue, value),
            )
            return match?.LookupID
        })

        return ids.every((id): id is number => id !== undefined) ? ids.join(',') : null
    }
    // Resolved actual student ID for the user's application - exact ID only, never pass arbitrary fallbacks!
    const actualStudentId = (id && id !== 'add' && !isStepSlug(id))
        ? id
        : (editingStudentId || createdStudentId || undefined)

    // Dynamic metadata fetched from DB
    const [homeContents, setHomeContents] = useState<HomeContentsRecord | null>(null)
    const [trackSheetDescription, setTrackSheetDescription] = useState('')
    const [submissionDate, setSubmissionDate] = useState<string>('')
    const [timings, setTimings] = useState<string>('')
    const [dbCompletedStepIds, setDbCompletedStepIds] = useState<number[]>([])

    // Print & Preview Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
    const [previewDocType, setPreviewDocType] = useState<'track-sheet-2' | 'registration-form-5'>('track-sheet-2')
    const [previewStudent, setPreviewStudent] = useState<StudentRecord | null>(null)
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState<boolean>(false)

    // Success Modal State
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
    const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
    const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false)
    const [applicationNo, setApplicationNo] = useState<string>('')
    const [applicantAdmissionDetailsId, setApplicantAdmissionDetailsId] = useState<number | undefined>()
    const [declarationContent, setDeclarationContent] = useState<unknown>(null)
    const appDeclaredIdRef = useRef<number | null>(null)

    // Fetch dynamic notices, submission schedule and timings from DB
    useEffect(() => {
        let isMounted = true
        const fetchMetadata = async () => {
            try {
                const contents = await ApiService.fetchHomeContents()
                if (contents && isMounted) {
                    setHomeContents(contents)
                }
            } catch (err) {
                console.warn('Failed to fetch home contents from DB:', err)
            }

        }
        fetchMetadata()
        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        let isMounted = true
        ApiService.getApplicationSections()
            .then((sections) => {
                if (!isMounted) return
                const trackSheetSection = sections.find((section) =>
                    section.ApplicationSectionID === 6 ||
                    section.AppSectionName?.toLowerCase().includes('print track sheet')
                )
                setTrackSheetDescription(trackSheetSection?.Descriptions?.trim() || '')
            })
            .catch((err) => {
                console.error('Failed to fetch track sheet application section description:', err)
            })

        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        if (effectiveStepSlug && stepSlugMap[effectiveStepSlug]) {
            const targetStepId = stepSlugMap[effectiveStepSlug]
            setViewMode('stepForm')
            setActiveStepId(targetStepId)
        } else {
            setViewMode('overview')
        }
    }, [location.pathname, effectiveStepSlug])

    const [isLoadingApplicant, setIsLoadingApplicant] = useState<boolean>(true)
    const lastLoadedKeyRef = useRef<string>('')

    useEffect(() => {
        if (!isCreateMode) return

        setIsLoadingApplicant(false)
        setSelectedSchoolId(0)
        setSelectedSchoolName('')
        setChildName('')
        setDob('')
        setGender('')
        setMotherTongue('')
        setOtherMotherTongue('')
        setNationality('')
        setOtherNationality('')
        setPassportNo('')
        setReligion('')
        setOtherReligion('')
        setCaste('')
        setOtherCaste('')
        setCommunity('')
        setOtherCommunity('')
        setIsTwins(false)
        setTwinsNo('')
        setAdditionalChildren([])
        setChildDeclarations([false, false, false, false])
        setSelectedPrintChildIndex(0)
        setIsHealthy(true)
        setMajorAilment('')
        setChildGoesToSchool(false)
        setPrevSchool('')
        setHasSiblings(false)
        setSiblings([])
        setEditingStudentId(null)
        setCreatedStudentId(null)
        setApplicationNo('')
        setApplicantAdmissionDetailsId(undefined)
        setFatherAppParentId(0)
        setMotherAppParentId(0)
        setGuardianAppParentId(0)
        setAppDeclaredId(0)
        appDeclaredIdRef.current = null
    }, [isCreateMode])

    // Fetch and populate existing application data directly from SQL Server
    useEffect(() => {
        if (isCreateMode) {
            return
        }
        if (!shouldLoadApplicant) return

        const targetId = id
        const numericId = targetId && targetId !== 'add' && !isNaN(Number(targetId)) ? Number(targetId) : null
        const currentUserId = user?.userId && !isNaN(Number(user.userId)) ? Number(user.userId) : null

        // Need either a targetId (from URL) or a logged-in non-admin user ID
        if (!numericId && (isAdminUser || !currentUserId)) {
            setIsLoadingApplicant(false)
            return
        }

        const currentKey = numericId ? `app_${numericId}` : `user_${currentUserId}`
        if (lastLoadedKeyRef.current === currentKey) {
            setIsLoadingApplicant(false)
            return
        }

        const getTransportModeValues = (value: unknown): string[] => {
            if (value == null || String(value).trim() === '') return []

            return [...new Set(String(value).split(',').map((id) => {
                const normalizedId = id.trim()
                const byId = lookups.find(
                    (lookup) =>
                        (lookup.LookupRefID === 7 || lookup.LookupName === 'TransportMode') &&
                        String(lookup.LookupID) === normalizedId,
                )
                if (byId) return byId.LookupValue

                const byValue = lookups.find(
                    (lookup) =>
                        (lookup.LookupRefID === 7 || lookup.LookupName === 'TransportMode') &&
                        matchesDropdownValue(lookup.LookupValue, normalizedId),
                )
                return byValue?.LookupValue
            }).filter((transportMode): transportMode is string => Boolean(transportMode)))]
        }

        let isMounted = true
        setIsLoadingApplicant(true)
        appDeclaredIdRef.current = null

        const loadApplicantData = async () => {
            try {
                let applicantRecord: any = null

                if (numericId && numericId > 0) {
                    const res = await ApiService.fetchApplicant({ applicantId: numericId })
                    const rawList = Array.isArray(res) ? res : (res?.value || res?.data || (res ? [res] : []))
                    applicantRecord = rawList.find((a: any) => Number(a.ApplicantID) === numericId) || rawList[0]
                } else if (!isAdminUser && currentUserId && currentUserId > 0) {
                    const res = await ApiService.fetchApplicant({ userId: currentUserId })
                    const rawList = Array.isArray(res) ? res : (res?.value || res?.data || (res ? [res] : []))
                    if (rawList.length > 0) {
                        // Pick the latest applicant record for this user (highest ApplicantID)
                        const sorted = [...rawList].sort((a: any, b: any) => Number(b.ApplicantID || 0) - Number(a.ApplicantID || 0))
                        applicantRecord = sorted[0]
                    }
                }

                if (applicantRecord && isMounted) {
                    lastLoadedKeyRef.current = currentKey
                    setEditingStudentId(String(applicantRecord.ApplicantID))
                    const applicantUserName = applicantRecord.UserName ?? applicantRecord.userName
                    if (typeof applicantUserName === 'string' && applicantUserName.trim()) {
                        useAuthStore.getState().setApplicantUserName(applicantUserName.trim())
                    }
                    setCreatedStudentId(String(applicantRecord.ApplicantID))
                    const appDeclaredId = Number(applicantRecord.AppDeclaredID ?? applicantRecord.appDeclaredID)
                    appDeclaredIdRef.current = Number.isInteger(appDeclaredId) && appDeclaredId > 0
                        ? appDeclaredId
                        : null
                    setAppDeclaredId(Number.isInteger(appDeclaredId) && appDeclaredId > 0 ? appDeclaredId : 0)
                    // Only set applicationNo if officially generated and returned from DB
                    setApplicationNo(
                        hasOfficialApplicationNumber(applicantRecord.ApplicationNo)
                            ? applicantRecord.ApplicationNo
                            : ''
                    )
                    const admissionDetailsId = Number(applicantRecord.AdmissionDetailsID)
                    setApplicantAdmissionDetailsId(Number.isInteger(admissionDetailsId) && admissionDetailsId > 0 ? admissionDetailsId : undefined)

                    // Check if applicant has actually saved step 1 (child name & DOB present)
                    const isStep1Completed = Boolean(applicantRecord.ChildName?.trim() && applicantRecord.ChildDOB)

                    // Populate fields directly from SP return properties
                    const sid = applicantRecord.SchoolID ? Number(applicantRecord.SchoolID) : undefined
                    const sName = (applicantRecord.School || '').trim()

                    if (isStep1Completed && (sid || sName)) {
                        if (sid) {
                            setSelectedSchoolId(sid)
                        }
                        if (sName) {
                            setSelectedSchoolName(sName)
                        }

                        if (schools.length > 0) {
                            const matchedSchool = schools.find(s =>
                                (sid && s.SchoolID === sid) ||
                                (sName && (
                                    (s.School && s.School.toLowerCase() === sName.toLowerCase()) ||
                                    (s.SchoolShortName && s.SchoolShortName.toLowerCase() === sName.toLowerCase()) ||
                                    (s.SchoolName && s.SchoolName.toLowerCase() === sName.toLowerCase()) ||
                                    (s.School && sName.toLowerCase().includes(s.School.toLowerCase())) ||
                                    (s.SchoolShortName && sName.toLowerCase().includes(s.SchoolShortName.toLowerCase()))
                                ))
                            )
                            if (matchedSchool) {
                                setSelectedSchoolId(matchedSchool.SchoolID)
                                setSelectedSchoolName(matchedSchool.School || matchedSchool.SchoolShortName || matchedSchool.SchoolName || sName || '')
                            }
                        }
                    } else {
                        setSelectedSchoolId(0)
                        setSelectedSchoolName('')
                    }

                    setChildName(applicantRecord.ChildName || '')
                    setDob(formatToInputDate(applicantRecord.ChildDOB))
                    const genderValue = getFetchedDropdownValue(
                        applicantRecord.GenderID,
                        lookups.filter((lookup) => lookup.LookupRefID === 2),
                        (lookup) => lookup.LookupID,
                        (lookup) => lookup.LookupValue,
                        (applicantRecord.Gender || '').trim(),
                    )
                    setGender(genderValue.value)

                    const rawMotherTongue = (applicantRecord.MotherTongue || applicantRecord.motherTongueName || applicantRecord.MotherTongueName || '').trim()
                    const rawOtherMotherTongue = (applicantRecord.OtherMotherTongue || applicantRecord.otherMotherTongue || '').trim()
                    const motherTongueValue = getFetchedDropdownValue(
                        applicantRecord.MotherTongueID,
                        motherTongues,
                        (tongue) => tongue.MotherTongueID,
                        (tongue) => tongue.MotherTongueName,
                        rawMotherTongue,
                        rawOtherMotherTongue,
                    )
                    setMotherTongue(motherTongueValue.value)
                    setOtherMotherTongue(motherTongueValue.otherValue)

                    const rawNationality = (applicantRecord.Nationality || applicantRecord.nationalityName || applicantRecord.NationalityName || '').trim()
                    const rawOtherNationality = (applicantRecord.OtherNationality || applicantRecord.otherNationality || '').trim()
                    const nationalityValue = getFetchedDropdownValue(
                        applicantRecord.NationalityID,
                        lookups.filter((lookup) => lookup.LookupRefID === 3),
                        (lookup) => lookup.LookupID,
                        (lookup) => lookup.LookupValue,
                        rawNationality,
                        rawOtherNationality,
                    )
                    setNationality(nationalityValue.value)
                    setOtherNationality(nationalityValue.otherValue)

                    const rawReligion = (applicantRecord.Religion || applicantRecord.religionName || applicantRecord.ReligionName || '').trim()
                    const rawOtherReligion = (applicantRecord.OtherReligion || applicantRecord.otherReligion || '').trim()
                    const religionValue = getFetchedDropdownValue(
                        applicantRecord.ReligionID,
                        lookups.filter((lookup) => lookup.LookupRefID === 4),
                        (lookup) => lookup.LookupID,
                        (lookup) => lookup.LookupValue,
                        rawReligion,
                        rawOtherReligion,
                    )
                    setReligion(religionValue.value)
                    setOtherReligion(religionValue.otherValue)

                    const rawCaste = (applicantRecord.Caste || applicantRecord.casteName || applicantRecord.CasteName || '').trim()
                    const rawOtherCaste = (applicantRecord.OtherCaste || applicantRecord.otherCaste || '').trim()
                    const casteValue = getFetchedDropdownValue(
                        applicantRecord.CasteID,
                        castes,
                        (casteRecord) => casteRecord.CasteID,
                        (casteRecord) => casteRecord.CasteName,
                        rawCaste,
                        rawOtherCaste,
                    )
                    setCaste(casteValue.value)
                    setOtherCaste(casteValue.otherValue)

                    const rawCommunity = (applicantRecord.Community || applicantRecord.communityName || applicantRecord.CommunityName || '').trim()
                    const rawOtherCommunity = (applicantRecord.OtherCommunity || applicantRecord.otherCommunity || '').trim()
                    const communityValue = getFetchedDropdownValue(
                        applicantRecord.CommunityID,
                        lookups.filter((lookup) => lookup.LookupRefID === 5),
                        (lookup) => lookup.LookupID,
                        (lookup) => lookup.LookupValue,
                        rawCommunity,
                        rawOtherCommunity,
                    )
                    setCommunity(communityValue.value)
                    setOtherCommunity(communityValue.otherValue)
                    setPassportNo(applicantRecord.PassportNo || '')
                    setChildGoesToSchool(applicantRecord.ChildGotoPlaySchool === 'Yes')
                    setPrevSchool(applicantRecord.PlaySchoolName || '')
                    setIsHealthy(applicantRecord.IsNormalChild !== 'No')
                    const isTwinsVal = (
                        applicantRecord.IsTwins === 'Yes' ||
                        applicantRecord.IsTwins === true ||
                        applicantRecord.IsTwins === 1
                    )
                    setIsTwins(isTwinsVal)
                    const rawTwinsNo = applicantRecord.TwinsNo || ''
                    setTwinsNo(rawTwinsNo)

                    let loadedChildren: AdditionalChild[] = []
                    if (Array.isArray(applicantRecord.AdditionalChildren) && applicantRecord.AdditionalChildren.length > 0) {
                        loadedChildren = applicantRecord.AdditionalChildren
                    } else if (Array.isArray((applicantRecord as any).additionalChildren) && (applicantRecord as any).additionalChildren.length > 0) {
                        loadedChildren = (applicantRecord as any).additionalChildren
                    } else {
                        try {
                            const cacheKey = `psbb_additional_children_${applicantRecord.ApplicantID || user?.userId}`
                            const cached = localStorage.getItem(cacheKey)
                            if (cached) {
                                const parsed = JSON.parse(cached)
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    loadedChildren = parsed
                                }
                            }
                        } catch (e) {
                            // Ignore localStorage parse errors
                        }
                    }

                    if (isTwinsVal) {
                        const expectedCount = Math.max(0, Number(rawTwinsNo || 2) - 1)
                        const filled = [...loadedChildren]
                        while (filled.length < expectedCount) {
                            filled.push({ name: '', gender: '', passportNo: '' })
                        }
                        setAdditionalChildren(filled.slice(0, expectedCount))
                    } else {
                        setAdditionalChildren([])
                    }
                    setHasSiblings(
                        applicantRecord.SchoolGoingSibilings === 'Yes' ||
                        applicantRecord.SchoolGoingSibilings === true ||
                        applicantRecord.SchoolGoingSibilings === 1 ||
                        (Array.isArray(applicantRecord.Siblings) && applicantRecord.Siblings.length > 0)
                    )

                    setMajorAilment(applicantRecord.ChildMajorAilment || '')

                    if (Array.isArray(applicantRecord.Siblings) && applicantRecord.Siblings.length > 0) {
                        setSiblings(
                            applicantRecord.Siblings.map((s: any) => {
                                let cls = s.Class || s.classSec || s.Standard || s.StandardName || ''
                                let sec = s.Section || s.section || ''
                                if (cls.includes('-')) {
                                    const parts = cls.split('-').map((p: string) => p.trim())
                                    cls = parts[0]
                                    if (!sec && parts.length > 1) sec = parts[1]
                                }
                                if (!sec && s.SectionID) {
                                    const secMatch = lookups.find(l => (l.LookupName === 'Section' || l.LookupRefID === 10) && l.LookupID === s.SectionID)
                                    if (secMatch) sec = secMatch.LookupValue
                                }
                                const schoolVal = s.School || s.SchoolName || ''
                                const siblingSchoolOption = findMasterOptionById(
                                    s.SchoolID,
                                    siblingSchools,
                                    (school) => school.SchoolID,
                                )
                                const siblingSchoolValue = siblingSchoolOption
                                    ? siblingSchoolOption.School || siblingSchoolOption.SchoolName || siblingSchoolOption.SchoolShortName || schoolVal
                                    : schoolVal
                                const isOtherSiblingSchool = isOther(siblingSchoolValue)
                                const fetchedSiblingSchoolName = (s.SchoolName || s.schoolName || schoolVal).trim()
                                return {
                                    name: s.SiblingName || s.name || '',
                                    school: siblingSchoolValue,
                                    schoolId: s.SchoolID != null ? Number(s.SchoolID) : undefined,
                                    schoolName: isOtherSiblingSchool
                                        ? (/^others?$/i.test(fetchedSiblingSchoolName) ? '' : fetchedSiblingSchoolName)
                                        : '',
                                    leftStudent: (s.IsLeftSchool === 'Yes' || s.IsLeftSchool === true || s.IsLeftSchool === 1 || s.IsLeftSchool === '1') ? 'Yes' : 'No',
                                    usn: s.USN || s.usn || '',
                                    classSec: cls,
                                    classId: s.ClassID != null
                                        ? Number(s.ClassID)
                                        : (s.StandardID != null ? Number(s.StandardID) : undefined),
                                    section: sec || s.SectionName || '',
                                    sectionId: s.SectionID != null ? Number(s.SectionID) : undefined,
                                    yearLeaving: s.LeftYear ? String(s.LeftYear) : (s.LeftYearID ? String(s.LeftYearID) : ''),
                                    SiblingsID: s.SiblingsID,
                                }
                            })
                        )
                    } else {
                        setSiblings([])
                    }

                    const fatherObj = Array.isArray(applicantRecord.Father) ? applicantRecord.Father[0] : applicantRecord.Father
                    if (fatherObj) {
                        const fParentId = Number(fatherObj.AppParentID ?? fatherObj.appParentID ?? 0)
                        setFatherAppParentId(fParentId > 0 ? fParentId : 0)
                        const rawFTitle = (fatherObj.Title || '').trim()
                        const fTitleValue = getFetchedDropdownValue(
                            fatherObj.TitleId ?? fatherObj.TitleID,
                            lookups.filter((lookup) => lookup.LookupRefID === 6),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawFTitle,
                            (fatherObj.OtherTitle || fatherObj.TitleName || '').trim(),
                        )

                        const rawFReason = (fatherObj.ReasonForLeaving || '').trim()
                        const fReasonValue = getFetchedDropdownValue(
                            fatherObj.ReasonForLeavingID,
                            lookups.filter((lookup) => lookup.LookupRefID === 8),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawFReason,
                            (fatherObj.OtherReasonForLeaving || '').trim(),
                        )

                        const rawFCat = (fatherObj.EmployementCategory || '').trim()
                        const fEmploymentValue = getFetchedDropdownValue(
                            fatherObj.EmploymentCategoryID,
                            lookups.filter((lookup) => lookup.LookupRefID === 9),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawFCat,
                            (fatherObj.OtherEmployementCategory || fatherObj.OtherEmploymentCategory || '').trim(),
                        )

                        setFather((prev) => ({
                            ...prev,
                            title: fTitleValue.value || prev.title,
                            otherTitle: fTitleValue.otherValue,
                            initials: fatherObj.Initials || '',
                            name: fatherObj.FullName || prev.name,
                            dob: formatToInputDate(fatherObj.DOB) || prev.dob,
                            isAlumnus: fatherObj.IsAlumnus === 'Yes',
                            yearsStudied: String(fatherObj.TotalYearsStudied ?? ''),
                            classLastStudied: fatherObj.ClassLastStudied || '',
                            yearOfLeaving: String(fatherObj.LeftYear || fatherObj.YearOfLeaving || ''),
                            branch: fatherObj.Branch || '',
                            reasonForLeaving: fReasonValue.value,
                            otherReasonForLeaving: fReasonValue.otherValue,
                            qualification: fatherObj.EducationalQualification || '',
                            university: fatherObj.UniversityOrInstitution || '',
                            occupation: fatherObj.Occupation || '',
                            employmentCategory: fEmploymentValue.value,
                            otherEmploymentCategory: fEmploymentValue.otherValue,
                            designation: fatherObj.Designation || '',
                            companyName: fatherObj.CompanyName || '',
                            officeAddress: fatherObj.CompanyAddress || '',
                            monthlyIncome: fatherObj.IncomeRange || '',
                            phoneOff: fatherObj.CompanyMobileNo || '',
                            mobileNo: fatherObj.MobileNo || '',
                        }))
                    }

                    const motherObj = Array.isArray(applicantRecord.Mother) ? applicantRecord.Mother[0] : applicantRecord.Mother
                    if (motherObj) {
                        const mParentId = Number(motherObj.AppParentID ?? motherObj.appParentID ?? 0)
                        setMotherAppParentId(mParentId > 0 ? mParentId : 0)
                        const rawMTitle = (motherObj.Title || '').trim()
                        const mTitleValue = getFetchedDropdownValue(
                            motherObj.TitleId ?? motherObj.TitleID,
                            lookups.filter((lookup) => lookup.LookupRefID === 6),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawMTitle,
                            (motherObj.OtherTitle || motherObj.TitleName || '').trim(),
                        )

                        const rawMReason = (motherObj.ReasonForLeaving || '').trim()
                        const mReasonValue = getFetchedDropdownValue(
                            motherObj.ReasonForLeavingID,
                            lookups.filter((lookup) => lookup.LookupRefID === 8),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawMReason,
                            (motherObj.OtherReasonForLeaving || '').trim(),
                        )

                        const rawMCat = (motherObj.EmployementCategory || '').trim()
                        const mEmploymentValue = getFetchedDropdownValue(
                            motherObj.EmploymentCategoryID,
                            lookups.filter((lookup) => lookup.LookupRefID === 9),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawMCat,
                            (motherObj.OtherEmployementCategory || motherObj.OtherEmploymentCategory || '').trim(),
                        )

                        setMother((prev) => ({
                            ...prev,
                            title: mTitleValue.value || prev.title,
                            otherTitle: mTitleValue.otherValue,
                            initials: motherObj.Initials || '',
                            name: motherObj.FullName || prev.name,
                            dob: formatToInputDate(motherObj.DOB) || prev.dob,
                            isAlumnus: motherObj.IsAlumnus === 'Yes',
                            yearsStudied: String(motherObj.TotalYearsStudied ?? ''),
                            classLastStudied: motherObj.ClassLastStudied || '',
                            yearOfLeaving: String(motherObj.LeftYear || motherObj.YearOfLeaving || ''),
                            branch: motherObj.Branch || '',
                            reasonForLeaving: mReasonValue.value,
                            otherReasonForLeaving: mReasonValue.otherValue,
                            qualification: motherObj.EducationalQualification || '',
                            university: motherObj.UniversityOrInstitution || '',
                            isEmployed: motherObj.IsEmployed === 'Yes',
                            occupation: motherObj.Occupation || '',
                            employmentCategory: mEmploymentValue.value,
                            otherEmploymentCategory: mEmploymentValue.otherValue,
                            designation: motherObj.Designation || '',
                            companyName: motherObj.CompanyName || '',
                            officeAddress: motherObj.CompanyAddress || '',
                            monthlyIncome: motherObj.IncomeRange || '',
                            phoneOff: motherObj.CompanyMobileNo || '',
                            mobileNo: motherObj.MobileNo || '',
                        }))
                    }

                    const guardianObj = Array.isArray(applicantRecord.Guardian) ? applicantRecord.Guardian[0] : applicantRecord.Guardian
                    if (guardianObj) {
                        const gParentId = Number(guardianObj.AppParentID ?? guardianObj.appParentID ?? 0)
                        setGuardianAppParentId(gParentId > 0 ? gParentId : 0)
                        const rawGTitle = (guardianObj.Title || guardianObj.TitleName || '').trim()
                        const gTitleValue = getFetchedDropdownValue(
                            guardianObj.TitleId ?? guardianObj.TitleID,
                            lookups.filter((lookup) => lookup.LookupRefID === 6),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawGTitle,
                            (guardianObj.OtherTitle || guardianObj.otherTitle || '').trim(),
                        )

                        const rawGGender = (guardianObj.Gender || '').trim()
                        const gGenderValue = getFetchedDropdownValue(
                            guardianObj.RelationGenderID ?? guardianObj.relationGenderID,
                            lookups.filter((lookup) => lookup.LookupRefID === 2),
                            (lookup) => lookup.LookupID,
                            (lookup) => lookup.LookupValue,
                            rawGGender,
                            (guardianObj.OtherGender || guardianObj.otherGender || '').trim(),
                        )

                        const isGApplicable = guardianObj.IsGuardianApplicable === 'Yes' || guardianObj.IsGuardianApplicable === true || guardianObj.IsGuardianApplicable === 1

                        setGuardian((prev) => ({
                            ...prev,
                            isApplicable: isGApplicable,
                            reason: isGApplicable ? (guardianObj.GuardianReason || '') : '',
                            gender: isGApplicable ? gGenderValue.value : '',
                            otherGender: isGApplicable ? gGenderValue.otherValue : '',
                            title: isGApplicable ? gTitleValue.value : '',
                            otherTitle: isGApplicable ? gTitleValue.otherValue : '',
                            initials: isGApplicable ? (guardianObj.Initials || '') : '',
                            name: isGApplicable ? (guardianObj.FullName || '') : '',
                            occupation: isGApplicable ? (guardianObj.Occupation || '') : '',
                            companyName: isGApplicable ? (guardianObj.CompanyName || '') : '',
                            officeAddress: isGApplicable ? (guardianObj.CompanyAddress || '') : '',
                            monthlyIncome: isGApplicable ? (guardianObj.IncomeRange || '') : '',
                            phoneOff: isGApplicable ? (guardianObj.CompanyMobileNo || '') : '',
                            mobileNo: isGApplicable ? (guardianObj.MobileNo || '') : '',
                            isEmployed: isGApplicable && (guardianObj.IsEmployed === 'Yes' || guardianObj.IsEmployed === true || guardianObj.IsEmployed === 1),
                        }))
                    } else {
                        // When guardian is not in DB, default to not applicable
                        setGuardian((prev) => ({
                            ...prev,
                            isApplicable: false,
                            otherGender: '',
                            otherTitle: '',
                        }))
                    }

                    setComm((prev) => ({
                        ...prev,
                        address: applicantRecord.ResAddress || prev.address,
                        pincode: applicantRecord.ResPincode || prev.pincode,
                        residencePhone: applicantRecord.ResPhoneNo || prev.residencePhone,
                        email: applicantRecord.EmailID || applicantRecord.Email || prev.email,
                        landmark: applicantRecord.ResLandmark || prev.landmark,
                        distanceKm: applicantRecord.Distance || prev.distanceKm,
                        commuteMode: applicantRecord.TransportMode
                            ? getTransportModeValues(applicantRecord.TransportMode)
                            : prev.commuteMode,
                        parentAchievements: applicantRecord.ParentsAchivements || prev.parentAchievements,
                        isTransferFromOutside: applicantRecord.TransferfromOutside === 'Yes' || applicantRecord.TransferfromOutside === true || applicantRecord.TransferfromOutside === 1,
                        transferDetails: applicantRecord.TransferDetails || '',
                    }))

                    // Determine completed steps from actual applicant data
                    const hasValidStep1 = Boolean(
                        applicantRecord.ChildName &&
                        applicantRecord.ChildName.trim() &&
                        applicantRecord.ChildDOB &&
                        applicantRecord.Gender
                    )

                    const fName = fatherObj?.FullName?.trim() || ''
                    const fMobile = fatherObj?.MobileNo?.trim() || ''
                    const mName = motherObj?.FullName?.trim() || ''
                    const mMobile = motherObj?.MobileNo?.trim() || ''

                    const hasValidStep2 = Boolean(
                        hasValidStep1 &&
                        fName &&
                        fMobile &&
                        mName &&
                        mMobile
                    )

                    const isGuardApp = Boolean(
                        guardianObj &&
                        (guardianObj.IsGuardianApplicable === 'Yes' || guardianObj.IsGuardianApplicable === true || guardianObj.IsGuardianApplicable === 1)
                    )
                    const gName = guardianObj?.FullName?.trim() || ''
                    const gMobile = guardianObj?.MobileNo?.trim() || ''

                    // Check if Section 3 or Section 5 was explicitly marked as Done in ApplicationSectionStatus from DB
                    const sectionStatusList = Array.isArray(applicantRecord.ApplicationSectionStatus)
                        ? applicantRecord.ApplicationSectionStatus
                        : []
                    const isStep3CompletedInDb = sectionStatusList.some(
                        (sec: any) => (sec.ApplicationSectionID === 3 || sec.applicationSectionID === 3) && String(sec.SectionStatus || sec.sectionStatus).toLowerCase() === 'done'
                    )
                    const isStep5CompletedInDb = sectionStatusList.some(
                        (sec: any) => (sec.ApplicationSectionID === 5 || sec.applicationSectionID === 5) && String(sec.SectionStatus || sec.sectionStatus).toLowerCase() === 'done'
                    )

                    // Step 3 is completed if Step 2 is valid AND:
                    // - If Guardian is applicable, valid guardian name and mobile are required
                    // - If Guardian is NOT applicable (No guardian), Step 3 is satisfied
                    const hasValidStep3 = Boolean(
                        hasValidStep2 &&
                        (isGuardApp
                            ? Boolean(gName && gMobile)
                            : (guardianObj !== undefined || isStep3CompletedInDb || Boolean(applicantRecord.ResAddress?.trim()) || Boolean(applicantRecord.ApplicationNo?.trim()) || true))
                    )

                    const hasValidStep4 = Boolean(
                        hasValidStep2 &&
                        applicantRecord.ResAddress &&
                        applicantRecord.ResAddress.trim() &&
                        applicantRecord.ResPincode &&
                        applicantRecord.ResPincode.trim()
                    )

                    const hasRealAppNo = hasOfficialApplicationNumber(applicantRecord.ApplicationNo)

                    const isApplicantDeclared = Boolean(
                        hasRealAppNo ||
                        isStep5CompletedInDb ||
                        (hasValidStep1 && hasValidStep2 && hasValidStep4 && Boolean(applicantRecord.ApplicationNo?.trim()))
                    )

                    const doneIds: number[] = []
                    if (hasRealAppNo || isApplicantDeclared) {
                        doneIds.push(1, 2, 3, 4, 5)
                    } else {
                        if (hasValidStep1) doneIds.push(1)
                        if (hasValidStep2) doneIds.push(2)
                        if (hasValidStep3) doneIds.push(3)
                        if (hasValidStep4) doneIds.push(4)
                    }

                    setDbCompletedStepIds(doneIds)
                    setIsDeclared(isApplicantDeclared)
                    setApplicationNo(hasRealAppNo ? applicantRecord.ApplicationNo : '')

                    if (hasValidStep3 || isApplicantDeclared) {
                        setIsStep3Saved(true)
                    } else {
                        setIsStep3Saved(false)
                    }

                    setFromAdmin(isAdminUser)
                } else if (targetId && targetId !== 'add') {
                    // Fallback to store
                    const student = getStudentById(targetId)
                    if (student && isMounted) {
                        setEditingStudentId(student.id)
                        setCreatedStudentId(student.id)
                        const hasS1 = Boolean(student.studentName?.trim() && ((student as any).date || (student as any).dob))
                        const hasS2 = Boolean(hasS1 && student.fatherName?.trim() && student.motherName?.trim())
                        const hasS4 = Boolean(hasS2 && student.area?.trim() && student.pincode?.trim())
                        const hasOfficialAppNo = hasOfficialApplicationNumber(student.registrationNumber)
                        const hasRealAppNo = Boolean(
                            hasS1 && hasS2 && hasS4 &&
                            hasOfficialAppNo &&
                            student.applicationStatus === 'Declared'
                        )
                        setApplicationNo(hasOfficialAppNo ? student.registrationNumber : '')
                        const storeDoneIds: number[] = []
                        if (hasS1) storeDoneIds.push(1)
                        if (hasS2) storeDoneIds.push(2)
                        if (hasS2) storeDoneIds.push(3)
                        if (hasS4) storeDoneIds.push(4)
                        if (hasRealAppNo) storeDoneIds.push(5)
                        setDbCompletedStepIds(storeDoneIds)
                        setIsDeclared(hasRealAppNo)
                        setIsStep3Saved(hasS2)
                        setChildName(student.studentName || '')
                        setDob(formatToInputDate((student as any).date || (student as any).dob))
                        setGender(student.gender || '')
                        setMotherTongue(student.motherTongue || '')
                        setReligion(student.religion || '')
                        setCaste(student.caste || '')
                        setCommunity(student.community || '')
                        if ((student as any).schoolId) setSelectedSchoolId(Number((student as any).schoolId))
                        if ((student as any).school) setSelectedSchoolName((student as any).school)
                        if ((student as any).schoolAppliedFor) setSelectedSchoolName((student as any).schoolAppliedFor)
                        if ((student as any).isTwins !== undefined) setIsTwins(Boolean((student as any).isTwins))
                        if ((student as any).twinsNo !== undefined) setTwinsNo((student as any).twinsNo || '')
                        if ((student as any).additionalChildren && Array.isArray((student as any).additionalChildren)) {
                            setAdditionalChildren((student as any).additionalChildren)
                        }
                    }
                }
            } catch (err) {
                console.warn('Error fetching applicant from SQL Server:', err)
            } finally {
                if (isMounted) {
                    setIsLoadingApplicant(false)
                }
            }
        }

        loadApplicantData()
        return () => { isMounted = false }
    }, [id, isCreateMode, isAdminUser, user?.userId, getStudentById, shouldLoadApplicant, schools, siblingSchools, parentSchools, incomeRanges, standards, leftYears, lookups, castes, motherTongues])

    // Step 1 Form States (Applicant Details) - Empty Initial State
    const [selectedSchoolId, setSelectedSchoolId] = useState<number>(0)
    const [selectedSchoolName, setSelectedSchoolName] = useState<string>('')
    const [, setIsLoadingSchoolAddress] = useState<boolean>(false)
    const [, setBranchAcademicYear] = useState<string>('')
    const [admissionDetails, setAdmissionDetails] = useState<AdmissionDetailsRecord | null>(null)
    const [fatherAppParentId, setFatherAppParentId] = useState<number>(0)
    const [motherAppParentId, setMotherAppParentId] = useState<number>(0)
    const [guardianAppParentId, setGuardianAppParentId] = useState<number>(0)
    const [appDeclaredId, setAppDeclaredId] = useState<number>(0)


    const registrationTitle =
        homeContents?.UpperContent
            ?.replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/(?:p|div|li)\s*>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/gi, ' ')
            .trim() || 'PRE-KG ONLINE REGISTRATION'
    const [childName, setChildName] = useState('')
    const [dob, setDob] = useState('')
    const [gender, setGender] = useState('')
    const [motherTongue, setMotherTongue] = useState('')
    const [otherMotherTongue, setOtherMotherTongue] = useState('')
    const [nationality, setNationality] = useState('')
    const [otherNationality, setOtherNationality] = useState('')
    const [passportNo, setPassportNo] = useState('')
    const [religion, setReligion] = useState('')
    const [otherReligion, setOtherReligion] = useState('')
    const [caste, setCaste] = useState('')
    const [otherCaste, setOtherCaste] = useState('')
    const [community, setCommunity] = useState('')
    const [otherCommunity, setOtherCommunity] = useState('')
    const [isTwins, setIsTwins] = useState<boolean>(false)
    const [twinsNo, setTwinsNo] = useState<number | string>('')
    const [additionalChildren, setAdditionalChildren] = useState<AdditionalChild[]>([])
    const [childDeclarations, setChildDeclarations] = useState<boolean[]>([false, false, false, false])
    const [selectedPrintChildIndex, setSelectedPrintChildIndex] = useState<number>(0)

    const parseTwinsCount = (val: any): number => {
        if (!val) return 2
        if (typeof val === 'number') return val >= 2 ? val : 2
        const str = String(val).toLowerCase().trim()
        if (str.includes('quad') || str === '4') return 4
        if (str.includes('trip') || str === '3') return 3
        if (str.includes('twin') || str === '2') return 2
        const parsed = parseInt(str, 10)
        return !isNaN(parsed) && parsed >= 2 ? parsed : 2
    }

    const handleIsTwinsChange = (val: boolean) => {
        setIsTwins(val)
        if (!val) {
            setTwinsNo('')
            setAdditionalChildren([])
            setChildDeclarations([false, false, false, false])
            setSelectedPrintChildIndex(0)
        } else {
            const initialCount = parseTwinsCount(twinsNo)
            setTwinsNo(initialCount)
            const additionalCount = Math.max(0, initialCount - 1)
            setAdditionalChildren((prev) => {
                const next = [...prev]
                while (next.length < additionalCount) {
                    next.push({ name: '', gender: gender || '', passportNo: '' })
                }
                return next.slice(0, additionalCount)
            })
        }
    }

    const handleTwinsNoChange = (val: number | string) => {
        setTwinsNo(val)
        const num = parseTwinsCount(val)
        const additionalCount = Math.max(0, num - 1)
        setAdditionalChildren((prev) => {
            const next = [...prev]
            while (next.length < additionalCount) {
                next.push({ name: '', gender: gender || '', passportNo: '' })
            }
            return next.slice(0, additionalCount)
        })
    }

    const updateAdditionalChild = (index: number, key: keyof AdditionalChild, val: string) => {
        setAdditionalChildren((prev) => {
            const next = [...prev]
            if (!next[index]) {
                next[index] = { name: '', gender: gender || '', passportNo: '' }
            }
            next[index] = { ...next[index], [key]: val }
            return next
        })
    }

    const childrenList = useMemo(() => {
        if (!isTwins) {
            return [{ name: childName?.trim() || '', gender }]
        }
        const totalCount = parseTwinsCount(twinsNo)
        const list = [{ name: childName?.trim() || '', gender }]
        for (let i = 0; i < totalCount - 1; i++) {
            const child = additionalChildren?.[i]
            list.push({
                name: child?.name?.trim() || '',
                gender: child?.gender || gender || '',
            })
        }
        return list
    }, [childName, gender, isTwins, additionalChildren, twinsNo])

    // Automatically guard against index out of bounds when multiple birth changes
    useEffect(() => {
        if (!isTwins) {
            if (selectedPrintChildIndex !== 0) setSelectedPrintChildIndex(0)
        } else if (childrenList.length > 0 && selectedPrintChildIndex >= childrenList.length) {
            setSelectedPrintChildIndex(0)
        }
    }, [isTwins, childrenList.length, selectedPrintChildIndex])

    // Active child name based on selected child index
    const activeChildName = isTwins
        ? (selectedPrintChildIndex === 0 ? childName : (additionalChildren[selectedPrintChildIndex - 1]?.name || ''))
        : childName

    const [isHealthy, setIsHealthy] = useState<boolean>(true)
    const [majorAilment, setMajorAilment] = useState('')
    const [childGoesToSchool, setChildGoesToSchool] = useState<boolean>(false)
    const [prevSchool, setPrevSchool] = useState('')
    const [hasSiblings, setHasSiblings] = useState<boolean>(false)
    const [siblings, setSiblings] = useState<Sibling[]>([])

    // Sync school name and ID whenever master schools load or selection changes
    useEffect(() => {
        if (schools.length > 0 && selectedSchoolId > 0) {
            if (!selectedSchoolName) {
                const found = schools.find(s => s.SchoolID === selectedSchoolId)
                if (found) {
                    setSelectedSchoolName(found.School || found.SchoolShortName || found.SchoolName || '')
                }
            } else {
                const found = schools.find(s =>
                    (s.School && s.School.toLowerCase() === selectedSchoolName.toLowerCase()) ||
                    (s.SchoolShortName && s.SchoolShortName.toLowerCase() === selectedSchoolName.toLowerCase()) ||
                    (s.SchoolName && s.SchoolName.toLowerCase() === selectedSchoolName.toLowerCase())
                )
                if (found && found.SchoolID !== selectedSchoolId) {
                    setSelectedSchoolId(found.SchoolID)
                }
            }
        }
    }, [schools, selectedSchoolId, selectedSchoolName])

    useEffect(() => {
        let isMounted = true
        if (selectedSchoolId <= 0) {
            setAdmissionSchoolAddress('')
        }

        setIsLoadingSchoolAddress(true)
        const fetchSelectedSchoolMetadata = async () => {
            const schoolMaster = schools.find((school) => school.SchoolID === selectedSchoolId)

            if (selectedSchoolId > 0) {
                setAdmissionSchoolAddress('')
                try {
                    const addressRecord = await ApiService.fetchSchoolAddress(selectedSchoolId)
                    if (!isMounted) return

                    const resolvedAddress = addressRecord?.SchoolAddress?.trim() || schoolMaster?.SchoolAddress?.trim() || ''
                    setAdmissionSchoolAddress(resolvedAddress)
                } catch (err) {
                    console.error(`Failed to fetch address for selected school ${selectedSchoolId}:`, err)
                    if (isMounted) setAdmissionSchoolAddress(schoolMaster?.SchoolAddress?.trim() || '')
                }

                try {
                    const stdRecords = await ApiService.getStandards(selectedSchoolId)
                    if (isMounted && stdRecords && stdRecords.length > 0) {
                        useMasterStore.setState({
                            standards: stdRecords,
                            standardNames: stdRecords.map(s => s.StandardName).filter(Boolean)
                        })
                    }
                } catch (stdErr) {
                    console.error(`Failed to fetch standards for selected school ${selectedSchoolId}:`, stdErr)
                }
            }

            try {
                const timeRanges = await ApiService.fetchSubmissionTimeRange(selectedSchoolId > 0 ? selectedSchoolId : undefined)
                if (!isMounted) return

                const matched = timeRanges.length > 0 ? timeRanges[timeRanges.length - 1] : undefined
                setBranchAcademicYear(String(matched?.AcademicYear || ''))
                setSubmissionDate(String(matched?.TracksheetSubmissionDate || matched?.Date || ''))
                setTimings(String(matched?.Timings || matched?.Time || ''))
            } catch (err) {
                console.error(`Failed to fetch admission schedule for selected school ${selectedSchoolId}:`, err)
                if (isMounted) {
                    setBranchAcademicYear('')
                    setSubmissionDate('')
                    setTimings('')
                }
            } finally {
                if (isMounted) setIsLoadingSchoolAddress(false)
            }
        }

        void fetchSelectedSchoolMetadata()
        return () => { isMounted = false }
    }, [selectedSchoolId, schools, setAdmissionSchoolAddress])

    useEffect(() => {
        if (isLoadingApplicant) return

        let isMounted = true
        const fetchAdmissionDetails = async () => {
            try {
                const records = await ApiService.getAdmissionDetails(applicantAdmissionDetailsId)
                if (!isMounted) return
                const selected = applicantAdmissionDetailsId
                    ? records.find((record) => record.AdmissionDetailsID === applicantAdmissionDetailsId)
                    : records.find((record) => record.IsCurrentActive) || records[records.length - 1]
                setAdmissionDetails(selected || null)
            } catch (err) {
                console.error('Failed to fetch admission details:', err)
                if (isMounted) setAdmissionDetails(null)
            }
        }

        void fetchAdmissionDetails()
        return () => { isMounted = false }
    }, [applicantAdmissionDetailsId, isLoadingApplicant])

    // Step 2 Form States (Parent Details) - Empty Initial State
    const [father, setFather] = useState<FatherDetailsState>({
        title: '',
        otherTitle: '',
        initials: '',
        name: '',
        dob: '',
        isAlumnus: false,
        yearsStudied: '',
        classLastStudied: '',
        yearOfLeaving: '',
        branch: '',
        reasonForLeaving: '',
        otherReasonForLeaving: '',
        qualification: '',
        university: '',
        occupation: '',
        employmentCategory: '',
        otherEmploymentCategory: '',
        designation: '',
        companyName: '',
        officeAddress: '',
        monthlyIncome: '',
        phoneOff: '',
        mobileNo: '',
    })

    const [mother, setMother] = useState<MotherDetailsState>({
        title: '',
        otherTitle: '',
        initials: '',
        name: '',
        dob: '',
        isAlumnus: false,
        yearsStudied: '',
        classLastStudied: '',
        yearOfLeaving: '',
        branch: '',
        reasonForLeaving: '',
        otherReasonForLeaving: '',
        qualification: '',
        university: '',
        isEmployed: false,
        occupation: '',
        employmentCategory: '',
        otherEmploymentCategory: '',
        designation: '',
        companyName: '',
        officeAddress: '',
        monthlyIncome: '',
        phoneOff: '',
        mobileNo: '',
    })

    // Step 3 Form States (Guardian Details) - Empty Initial State
    const [guardian, setGuardian] = useState<GuardianDetailsState>({
        isApplicable: false,
        reason: '',
        gender: '',
        otherGender: '',
        title: '',
        otherTitle: '',
        initials: '',
        name: '',
        isEmployed: false,
        occupation: '',
        companyName: '',
        monthlyIncome: '',
        officeAddress: '',
        phoneOff: '',
        phoneRes: '',
        mobileNo: '',
    })

    // Step 4 Form States (Communication & Other Details) - Empty Initial State
    const [comm, setComm] = useState<CommunicationDetailsState>({
        address: '',
        pincode: '',
        residencePhone: '',
        email: '',
        landmark: '',
        distanceKm: '',
        commuteMode: [],
        parentAchievements: '',
        isTransferFromOutside: false,
        transferDetails: '',
    })

    // Step 5 Form States (Declaration) - Empty Initial State
    const [declarantType, setDeclarantType] = useState<'Father' | 'Mother' | 'Guardian'>('Father')
    const [isDeclared, setIsDeclared] = useState(false)

    // Step Validator Functions
    const validateStep1 = () => {
        if (!selectedSchoolId || !selectedSchoolName) return { valid: false, error: "Please select a School Branch in Step 1." }
        if (!childName.trim()) return { valid: false, error: "Please enter Child's Name in Step 1." }
        if (!/^[a-zA-Z\s.]+$/.test(childName.trim()) || !/[a-zA-Z]/.test(childName.trim())) return { valid: false, error: "Name of the child should only contain alphabets, spaces, and initials (dots)." }
        if (!dob) return { valid: false, error: "Please select Child's Date of Birth in Step 1." }
        if (!gender) return { valid: false, error: "Please select Child's Gender in Step 1." }
        if (!motherTongue) return { valid: false, error: "Please select Mother Tongue in Step 1." }
        if (isOther(motherTongue) && !otherMotherTongue.trim()) return { valid: false, error: "Please specify Mother Tongue in Step 1." }
        if (!nationality) return { valid: false, error: "Please select Nationality in Step 1." }
        if (isOther(nationality) && !otherNationality.trim()) return { valid: false, error: "Please specify Nationality in Step 1." }
        if (isOther(nationality) && !passportNo.trim()) return { valid: false, error: "Passport Number is mandatory when Nationality is 'Others' in Step 1." }
        if (!religion) return { valid: false, error: "Please select Religion in Step 1." }
        if (isOther(religion) && !otherReligion.trim()) return { valid: false, error: "Please specify Religion in Step 1." }
        if (!caste) return { valid: false, error: "Please select Caste in Step 1." }
        if (isOther(caste) && !otherCaste.trim()) return { valid: false, error: "Please specify Caste in Step 1." }
        if (!community) return { valid: false, error: "Please select Community in Step 1." }
        if (isOther(community) && !otherCommunity.trim()) return { valid: false, error: "Please specify Community in Step 1." }
        if (isTwins) {
            if (!twinsNo || twinsNo === '' || twinsNo === '0' || twinsNo === 0) {
                return { valid: false, error: "Please select Multiple Birth Type (Twins / Triplets / Quadruplets) in Step 1." }
            }
            const expectedCount = Math.max(0, Number(twinsNo) - 1)
            for (let i = 0; i < expectedCount; i++) {
                const child = additionalChildren[i]
                const childNum = i + 2
                if (!child || !child.name || !child.name.trim()) {
                    return { valid: false, error: `Please enter Child ${childNum}'s Name in Step 1.` }
                }
                if (!/^[a-zA-Z\s.]+$/.test(child.name.trim()) || !/[a-zA-Z]/.test(child.name.trim())) {
                    return { valid: false, error: `Child ${childNum}'s Name should only contain alphabets, spaces, and initials (dots).` }
                }
                if (!child.gender) {
                    if (gender) {
                        child.gender = gender
                    } else {
                        return { valid: false, error: `Please select Child ${childNum}'s Gender in Step 1.` }
                    }
                }
            }
        }
        if (!isHealthy && !majorAilment.trim()) return { valid: false, error: "Please specify Reason / Details for Major Ailment in Step 1." }
        if (childGoesToSchool && !prevSchool.trim()) return { valid: false, error: "Please specify the school the child is currently studying in Step 1." }

        if (hasSiblings) {
            const filledSiblings = siblings.filter(s => s.name && s.name.trim())
            if (filledSiblings.length === 0) {
                return { valid: false, error: "Please add sibling details since 'School-going Siblings' is selected as Yes in Step 1." }
            }
            for (let i = 0; i < filledSiblings.length; i++) {
                const s = filledSiblings[i]
                if (!s.school) return { valid: false, error: `Please select Sibling ${i + 1}'s School in Step 1.` }
                if (isOther(s.school) && (!s.schoolName || !s.schoolName.trim())) {
                    return { valid: false, error: `Please enter Sibling ${i + 1}'s School Name in Step 1.` }
                }
                if (!s.classSec) return { valid: false, error: `Please select Sibling ${i + 1}'s Class in Step 1.` }
                if (s.school !== 'Others' && s.usn && s.usn.trim()) {
                    const branchLetter = getBranchInitial(s.school)
                    const usnRegex = branchLetter ? new RegExp('^' + branchLetter + '\\d{7}$', 'i') : /^[TNSKtnsk]\\d{7}$/
                    if (!usnRegex.test(s.usn.trim())) {
                        return {
                            valid: false,
                            error: branchLetter
                                ? `Sibling ${i + 1}'s USN must start with '${branchLetter}' (1st letter of ${s.school}) followed by 7 digits (e.g. ${branchLetter}1234567).`
                                : `Sibling ${i + 1}'s USN must start with the first letter of the chosen branch followed by 7 digits in Step 1.`
                        }
                    }
                }
                if (s.leftStudent === 'Yes' && !s.yearLeaving) {
                    return { valid: false, error: `Please select Year of Leaving for Sibling ${i + 1} in Step 1.` }
                }
            }
        }
        return { valid: true, error: '' }
    }

    const validateStep2 = () => {
        // Father validations
        if (!father.title) return { valid: false, error: "Please select Father's Name Title in Step 2." }
        if (father.title.toLowerCase().startsWith('other') && !father.otherTitle?.trim()) {
            return { valid: false, error: "Please enter Father's Title in Step 2." }
        }
        if (father.initials && father.initials.length > 5) {
            return { valid: false, error: "Father's Initials cannot exceed 5 characters in Step 2." }
        }
        if (!father.name.trim()) return { valid: false, error: "Please enter Father's Name in Step 2." }
        const fDobVal = validateParentDob(father.dob)
        if (!fDobVal.isValid) return { valid: false, error: `Father's Date of Birth: ${fDobVal.errorText}` }
        if (father.isAlumnus) {
            if (!father.yearsStudied.trim()) return { valid: false, error: "Please enter Father's Total No of years studied in PSBBin Step 2." }
            if (!/^\d+$/.test(father.yearsStudied.trim())) return { valid: false, error: "Father's Years Studied must be a valid number in Step 2." }
            if (!father.classLastStudied) return { valid: false, error: "Please select Father's Class Last Studied in Step 2." }
            if (!father.yearOfLeaving) return { valid: false, error: "Please select Father's Year of Leaving in Step 2." }
            const fDobYear = extractBirthYear(father.dob)
            const fLeavingYear = parseInt(father.yearOfLeaving, 10)
            if (fDobYear !== null && !isNaN(fLeavingYear)) {
                if (fLeavingYear < fDobYear) {
                    return { valid: false, error: "Father's Year of Leaving cannot be earlier than Date of Birth in Step 2." }
                }
                if (fLeavingYear > fDobYear + 17) {
                    return { valid: false, error: "Father's Year of Leaving cannot exceed 18 years from Date of Birth in Step 2." }
                }
            }
            if (!father.branch) return { valid: false, error: "Please select Father's School Branch in Step 2." }
            if (!father.reasonForLeaving) return { valid: false, error: "Please select Father's Reason for Leaving in Step 2." }
            if (father.reasonForLeaving.toLowerCase().startsWith('other') && !father.otherReasonForLeaving?.trim()) {
                return { valid: false, error: "Please enter Father's Reason for Leaving in Step 2." }
            }
        }
        if (!father.qualification.trim()) return { valid: false, error: "Please enter Father's Educational Qualification in Step 2." }
        if (father.qualification.length > 50) return { valid: false, error: "Father's Educational Qualification cannot exceed 50 characters." }
        if (!father.university.trim()) return { valid: false, error: "Please enter Father's University / Institution in Step 2." }
        if (father.employmentCategory.toLowerCase().startsWith('other') && !father.otherEmploymentCategory?.trim()) {
            return { valid: false, error: "Please enter Father's Employment Category in Step 2." }
        }
        if (!father.designation.trim()) return { valid: false, error: "Please enter Father's Designation in Step 2." }
        if (!father.monthlyIncome) return { valid: false, error: "Please select Father's Monthly Income in Step 2." }
        if (!father.mobileNo.trim()) return { valid: false, error: "Please enter Father's Mobile Number in Step 2." }
        if (!/^[6-9]\d{9}$/.test(father.mobileNo.replace(/\D/g, ''))) return { valid: false, error: "Father's Mobile Number must be a valid 10-digit number." }

        // Mother validations
        if (!mother.title) return { valid: false, error: "Please select Mother's Name Title in Step 2." }
        if (mother.title.toLowerCase().startsWith('other') && !mother.otherTitle?.trim()) {
            return { valid: false, error: "Please enter Mother's Title in Step 2." }
        }
        if (mother.initials && mother.initials.length > 5) {
            return { valid: false, error: "Mother's Initials cannot exceed 5 characters in Step 2." }
        }
        if (!mother.name.trim()) return { valid: false, error: "Please enter Mother's Name in Step 2." }
        const mDobVal = validateParentDob(mother.dob)
        if (!mDobVal.isValid) return { valid: false, error: `Mother's Date of Birth: ${mDobVal.errorText}` }
        if (mother.isAlumnus) {
            if (!mother.yearsStudied.trim()) return { valid: false, error: "Please enter Mother's Total No of years studied in PSBB in Step 2." }
            if (!/^\d+$/.test(mother.yearsStudied.trim())) return { valid: false, error: "Mother's Years Studied must be a valid number in Step 2." }
            if (!mother.classLastStudied) return { valid: false, error: "Please select Mother's Class Last Studied in Step 2." }
            if (!mother.yearOfLeaving) return { valid: false, error: "Please select Mother's Year of Leaving in Step 2." }
            const mDobYear = extractBirthYear(mother.dob)
            const mLeavingYear = parseInt(mother.yearOfLeaving, 10)
            if (mDobYear !== null && !isNaN(mLeavingYear)) {
                if (mLeavingYear < mDobYear) {
                    return { valid: false, error: "Mother's Year of Leaving cannot be earlier than Date of Birth in Step 2." }
                }
                if (mLeavingYear > mDobYear + 17) {
                    return { valid: false, error: "Mother's Year of Leaving cannot exceed 18 years from Date of Birth in Step 2." }
                }
            }
            if (!mother.branch) return { valid: false, error: "Please select Mother's School Branch in Step 2." }
            if (!mother.reasonForLeaving) return { valid: false, error: "Please select Mother's Reason for Leaving in Step 2." }
            if (mother.reasonForLeaving.toLowerCase().startsWith('other') && !mother.otherReasonForLeaving?.trim()) {
                return { valid: false, error: "Please enter Mother's Reason for Leaving in Step 2." }
            }
        }
        if (!mother.qualification.trim()) return { valid: false, error: "Please enter Mother's Educational Qualification in Step 2." }
        if (mother.qualification.length > 50) return { valid: false, error: "Mother's Educational Qualification cannot exceed 50 characters." }
        if (!mother.university.trim()) return { valid: false, error: "Please enter Mother's University / Institution in Step 2." }
        if (mother.isEmployed) {
            if (mother.employmentCategory.toLowerCase().startsWith('other') && !mother.otherEmploymentCategory?.trim()) {
                return { valid: false, error: "Please enter Mother's Employment Category in Step 2." }
            }
            if (!mother.designation.trim()) return { valid: false, error: "Please enter Mother's Designation in Step 2." }
            if (!mother.monthlyIncome) return { valid: false, error: "Please select Mother's Monthly Income in Step 2." }
        }
        if (!mother.mobileNo.trim()) return { valid: false, error: "Please enter Mother's Mobile Number in Step 2." }
        if (!/^[6-9]\d{9}$/.test(mother.mobileNo.replace(/\D/g, ''))) return { valid: false, error: "Mother's Mobile Number must be a valid 10-digit number." }

        return { valid: true, error: '' }
    }

    const validateStep3 = () => {
        if (!guardian.isApplicable) {
            return { valid: true, error: '' }
        }
        if (!guardian.reason.trim()) return { valid: false, error: "Please enter Reason for having Guardian in Step 3." }
        if (!guardian.gender) return { valid: false, error: "Please select Guardian's Gender in Step 3." }
        if (isOther(guardian.gender) && !(guardian.otherGender || '').trim()) {
            return { valid: false, error: "Please specify Guardian's Gender in Step 3." }
        }
        if (!guardian.title) return { valid: false, error: "Please select Guardian's Title in Step 3." }
        if (isOther(guardian.title) && !(guardian.otherTitle || '').trim()) {
            return { valid: false, error: "Please specify Guardian's Title in Step 3." }
        }
        if (!guardian.name.trim()) return { valid: false, error: "Please enter Guardian's Name in Step 3." }
        if (!/^[a-zA-Z\s.]+$/.test(guardian.name.trim()) || !/[a-zA-Z]/.test(guardian.name.trim())) {
            return { valid: false, error: "Guardian's Name should only contain alphabets, spaces, and initials (dots) in Step 3." }
        }
        if (guardian.initials && guardian.initials.length > 5) {
            return { valid: false, error: "Guardian's Initials cannot exceed 5 characters in Step 3." }
        }
        if (guardian.isEmployed) {
            if (!guardian.occupation.trim()) return { valid: false, error: "Please enter Guardian's Occupation in Step 3." }
            if (!guardian.companyName.trim()) return { valid: false, error: "Please enter Guardian's Company Name in Step 3." }
            if (!guardian.monthlyIncome) return { valid: false, error: "Please select Guardian's Monthly Income in Step 3." }
        }
        if (!guardian.mobileNo.trim()) return { valid: false, error: "Please enter Guardian's Mobile Number in Step 3." }
        if (!/^[6-9]\d{9}$/.test(guardian.mobileNo.replace(/\D/g, ''))) return { valid: false, error: "Guardian's Mobile Number must be a valid 10-digit number." }
        if (guardian.isEmployed && !guardian.officeAddress.trim()) return { valid: false, error: "Please enter Guardian's Office Address in Step 3." }

        return { valid: true, error: '' }
    }

    const validateStep4 = () => {
        if (!comm.address.trim()) return { valid: false, error: "Please enter Residential Address in Step 4." }
        if (!/^[a-zA-Z0-9\s/.,\-#]+$/.test(comm.address.trim())) return { valid: false, error: "Residential Address contains invalid special characters in Step 4." }
        if (comm.residencePhone && (comm.residencePhone.length > 20 || !/^\d+$/.test(comm.residencePhone))) return { valid: false, error: "Residence Telephone Number must contain only digits and not exceed 20 digits." }
        if (comm.email.trim() && !isValidEmail(comm.email)) return { valid: false, error: "Please enter a valid email address in Step 4." }
        if (!comm.pincode.trim()) return { valid: false, error: "Please enter Pincode in Step 4." }
        if (!/^\d{6}$/.test(comm.pincode.trim())) return { valid: false, error: "Pincode must be exactly 6 numeric digits in Step 4." }
        if (comm.landmark && comm.landmark.length > 50) return { valid: false, error: "Landmark cannot exceed 50 characters in Step 4." }
        if (comm.parentAchievements && comm.parentAchievements.length > 100) return { valid: false, error: "Parent achievements cannot exceed 100 characters in Step 4." }
        if (!comm.distanceKm) return { valid: false, error: "Please select Distance from School in Step 4." }
        if (!comm.commuteMode || comm.commuteMode.length === 0) return { valid: false, error: "Please select Mode of Transport in Step 4." }
        if (comm.isTransferFromOutside && !comm.transferDetails?.trim()) return { valid: false, error: "Please enter Place of Transfer in Step 4." }

        return { valid: true, error: '' }
    }

    const validateStep5 = () => {
        if (!isDeclared) {
            return { valid: false, error: "Please check and agree to the Declaration terms before submitting." }
        }
        const s1 = validateStep1()
        if (!s1.valid) return s1
        const s2 = validateStep2()
        if (!s2.valid) return s2
        const s3 = validateStep3()
        if (!s3.valid) return s3
        const s4 = validateStep4()
        if (!s4.valid) return s4

        return { valid: true, error: '' }
    }

    // Step completion statuses strictly calculated from confirmed saves
    const completedStepIds = useMemo(() => {
        const completed = new Set<number>()

        // 1. All steps confirmed saved via dbCompletedStepIds
        dbCompletedStepIds.forEach((id) => {
            if (id >= 1 && id <= 5) completed.add(id)
        })

        // 2. If Guardian is not applicable or step 3 was saved, step 3 is considered done once step 2 is done
        if ((!guardian.isApplicable || isStep3Saved) && completed.has(2)) {
            completed.add(3)
        }

        // 3. If application is declared or has real application number, all 5 steps are completed
        const hasRealAppNo = hasOfficialApplicationNumber(applicationNo)
        if (isDeclared || hasRealAppNo || completed.has(5)) {
            return [1, 2, 3, 4, 5]
        }

        return Array.from(completed).sort((a, b) => a - b)
    }, [
        dbCompletedStepIds,
        guardian.isApplicable,
        isStep3Saved,
        isDeclared,
        applicationNo,
    ])

    const rawSteps: Omit<Step, 'status'>[] = [
        { id: 1, title: 'Applicant Details' },
        { id: 2, title: 'Parent Details' },
        { id: 3, title: 'Guardian Details' },
        { id: 4, title: 'Communication and Other Details' },
        { id: 5, title: 'Declaration' },
    ]

    const steps: Step[] = rawSteps.map((step) => {
        const isDone = completedStepIds.includes(step.id)
        if (isDone) {
            return { ...step, status: 'COMPLETED' }
        }
        if (step.id === 3 && !id && !guardian.isApplicable) {
            return { ...step, status: 'OPTIONAL' }
        }
        return { ...step, status: 'PENDING' }
    })

    const completedCount = completedStepIds.length
    const isRegistrationComplete = completedStepIds.length === 5 || Boolean(
        completedStepIds.includes(1) &&
        completedStepIds.includes(2) &&
        (completedStepIds.includes(3) || !guardian.isApplicable) &&
        completedStepIds.includes(4) &&
        completedStepIds.includes(5) &&
        isDeclared
    )

    // Route guard: Prevent direct URL access to locked steps
    useEffect(() => {
        if (isLoadingApplicant) return
        if (viewMode === 'stepForm' && activeStepId > 1 && !isReadOnly && !isRegistrationComplete) {
            const isDone = completedStepIds.includes(activeStepId)
            const isPrevDone = completedStepIds.includes(activeStepId - 1) || (activeStepId === 4 && !guardian.isApplicable && completedStepIds.includes(2))
            if (!isDone && !isPrevDone) {
                const firstIncomplete = [1, 2, 3, 4, 5].find((s) => !completedStepIds.includes(s)) || 1
                if (activeStepId > firstIncomplete) {
                    toast.error(`Step ${activeStepId} is locked. Please complete Step ${firstIncomplete} first.`)
                    const safeSlug = stepIdToSlug[firstIncomplete]
                    const currentId = id || editingStudentId || createdStudentId
                    if (currentId && currentId !== 'add') {
                        navigate(`/admission/${safeSlug}/${currentId}${getPreservedQuery()}`, { replace: true })
                    } else {
                        navigate(`/admission/${safeSlug}/add${getPreservedQuery()}`, { replace: true })
                    }
                }
            }
        }
    }, [isLoadingApplicant, activeStepId, viewMode, completedStepIds, isReadOnly, isRegistrationComplete, id, editingStudentId, createdStudentId, guardian.isApplicable, navigate])

    const handleBackNavigation = () => {
        if (!isAdminUser) {
            navigate('/admission')
            return
        }
        if (id) {
            navigate(`/admission/${id}${getPreservedQuery()}`)
        } else if (isCreateMode) {
            if (viewMode === 'stepForm') {
                navigate(`/admission/add${getPreservedQuery()}`)
            } else {
                handleReturnToSource()
            }
        } else {
            handleReturnToSource()
        }
    }

    const handleStepClick = (stepId: number) => {
        if (!isReadOnly && !isRegistrationComplete && stepId > 1) {
            const isDone = completedStepIds.includes(stepId)
            const isPrevDone = completedStepIds.includes(stepId - 1) || (stepId === 4 && !guardian.isApplicable && completedStepIds.includes(2))
            if (!isDone && !isPrevDone) {
                toast.error(`Step ${stepId} is locked. Please complete Step ${stepId - 1} first before proceeding.`)
                return
            }
        }
        setActiveStepId(stepId)
        setViewMode('stepForm')
        const slug = stepIdToSlug[stepId]
        if (slug) {
            const q = getPreservedQuery()
            const targetId = (id && id !== 'add' && !isStepSlug(id)) ? id : (editingStudentId || createdStudentId || actualStudentId)
            if (targetId && targetId !== 'add') {
                navigate(`/admission/${slug}/${targetId}${q}`)
            } else if (isCreateMode) {
                navigate(`/admission/${slug}/add${q}`)
            } else {
                navigate(`/admission/${slug}${q}`)
            }
        }
    }

    const handleOpenApplicationDetails = () => {
        const targetId = actualStudentId || id || editingStudentId || createdStudentId
        const q = isAdminUser ? getPreservedQuery('view') : getPreservedQuery()
        if (targetId && targetId !== 'add') {
            navigate(`/admission/application-details/${targetId}${q}`)
        } else {
            navigate(`/admission/application-details${q}`)
        }
    }

    const saveStudentRecord = (forceCreateNew = false) => {
        const addressParts = (comm.address || '').split(',').map((p) => p.trim()).filter(Boolean)
        const detectedCity = addressParts.length > 1 ? addressParts[addressParts.length - 1] : ''
        const detectedArea = addressParts.length > 1 ? addressParts.slice(0, -1).join(', ') : (comm.address?.trim() || '')

        const payload: Partial<StudentRecord> & Record<string, any> = {
            studentName: childName.trim(),
            gender: (gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
            motherTongue: motherTongue || '',
            fatherName: father.name || '',
            fatherTitle: father.title,
            fatherDob: father.dob,
            fatherQualification: father.qualification,
            fatherUniversity: father.university,
            fatherDesignation: father.designation,
            motherName: mother.name || '',
            motherTitle: mother.title,
            motherDob: mother.dob,
            motherQualification: mother.qualification,
            motherUniversity: mother.university,
            motherMobile: mother.mobileNo,
            guardianApplicable: guardian.isApplicable,
            guardianReason: guardian.reason,
            guardianGender: guardian.gender,
            guardianTitle: guardian.title,
            guardianName: guardian.name,
            guardianMobile: guardian.mobileNo,
            guardianAddress: guardian.isApplicable ? guardian.officeAddress : '',
            mobile: father.mobileNo || mother.mobileNo || guardian.mobileNo || '',
            city: detectedCity,
            area: detectedArea,
            distanceKm: comm.distanceKm || '',
            pincode: comm.pincode,
            commuteMode: comm.commuteMode,
            incomeRange: father.monthlyIncome || mother.monthlyIncome || guardian.monthlyIncome || '',
            religion: religion || '',
            caste: caste || '',
            community: community || '',
            alumni: Boolean(father.isAlumnus || mother.isAlumnus),
            siblingsStudying: Boolean(hasSiblings && siblings.length > 0),
            isTwins: isTwins,
            twinsNo: isTwins ? Number(twinsNo || 2) : 0,
            additionalChildren: isTwins ? additionalChildren : [],
            applicationStatus: isDeclared ? 'Declared' : 'Pending',
            playSchool: Boolean(childGoesToSchool),
            trackSheet: true,
            registrationForm: true,
            status1: true,
            status2: true,
        }

        const currentTargetId = id || editingStudentId || (!isAdminUser ? actualStudentId : null)
        if (currentTargetId && !forceCreateNew) {
            const updated = updateStudent(currentTargetId, payload)
            if (updated) {
                if (hasOfficialApplicationNumber(updated.registrationNumber)) {
                    setApplicationNo(updated.registrationNumber)
                }
                setCreatedStudentId(updated.id)
                return updated
            }
        }

        const created = addStudent(payload)
        setCreatedStudentId(created.id)
        setEditingStudentId(created.id)
        return created
    }

    const saveCurrentSection = async (currentStepId: number): Promise<number | null> => {
        try {
            const currentUserId = user?.userId && !isNaN(Number(user.userId)) ? Number(user.userId) : 1

            // Resolve target applicant ID
            let targetApplicantId: number | undefined = undefined
            if (id && id !== 'add' && !isStepSlug(id)) {
                targetApplicantId = Number(id)
            } else if (editingStudentId && !isNaN(Number(editingStudentId))) {
                targetApplicantId = Number(editingStudentId)
            } else if (createdStudentId && !isNaN(Number(createdStudentId))) {
                targetApplicantId = Number(createdStudentId)
            } else if (!isAdminUser && actualStudentId && !isNaN(Number(actualStudentId))) {
                targetApplicantId = Number(actualStudentId)
            }

            const applicantRecords = (response: any): any[] => (
                Array.isArray(response)
                    ? response
                    : (response?.value || response?.data || (response ? [response] : []))
            )
            const getApplicantId = (record: any): number => Number(
                record?.ApplicantID ?? record?.applicantID ?? record?.applicantId ?? 0
            )

            // Resolve the authoritative ApplicantID from FetchApplicant before saving.
            if (!isAdminUser && currentUserId > 0) {
                let userApps: any[]
                try {
                    userApps = applicantRecords(await ApiService.fetchApplicant({ userId: currentUserId }))
                } catch (error) {
                    console.error('Could not verify applicant for user:', error)
                    toast.error('Could not verify the applicant. Please try again.')
                    return null
                }

                const sortedApps = [...userApps].sort((a: any, b: any) => getApplicantId(b) - getApplicantId(a))
                const routedApplicantId = id && !isNaN(Number(id)) ? Number(id) : undefined
                const currentApplicant = (routedApplicantId
                    ? sortedApps.find((applicant: any) => getApplicantId(applicant) === routedApplicantId)
                    : undefined) || sortedApps[0]
                targetApplicantId = currentApplicant ? getApplicantId(currentApplicant) : undefined
                if (targetApplicantId && targetApplicantId > 0) {
                    setEditingStudentId(String(targetApplicantId))
                    setCreatedStudentId(String(targetApplicantId))
                }
            } else if (targetApplicantId && targetApplicantId > 0) {
                let applicantList: any[]
                try {
                    applicantList = applicantRecords(await ApiService.fetchApplicant({ applicantId: targetApplicantId }))
                } catch (error) {
                    console.error('Could not verify applicant ID:', error)
                    toast.error('Could not verify the applicant. Please try again.')
                    return null
                }
                const verifiedApplicant = applicantList.find((applicant: any) => getApplicantId(applicant) === targetApplicantId)
                targetApplicantId = verifiedApplicant ? getApplicantId(verifiedApplicant) : undefined
            }

            if (currentStepId > 1 && (!targetApplicantId || isNaN(targetApplicantId))) {
                toast.error('Please save Step 1 (Applicant Details) first!')
                return null
            }

            let sectionPayload: any = {}
            // const isExistingApplicant = hasOfficialApplicationNumber(applicationNo)
            // const recordType = isExistingApplicant || currentStepId === 4 ? 2 : 1
            const normalizedApplicationNo = applicationNo?.trim()
            const isExistingApplicant = hasOfficialApplicationNumber(normalizedApplicationNo) && normalizedApplicationNo !== '0'

            const hasExistingRecordId =

                (currentStepId === 1 && Number(targetApplicantId) > 0) ||

                (currentStepId === 2 && (Number(fatherAppParentId) > 0 || Number(motherAppParentId) > 0)) ||

                (currentStepId === 3 && Number(guardianAppParentId) > 0) ||

                (currentStepId === 5 && Number(appDeclaredId) > 0)

            const recordType = currentStepId === 4 || isExistingApplicant || hasExistingRecordId ? 2 : 1

            if (currentStepId === 1) {
                if (!admissionDetails?.AdmissionDetailsID) {
                    toast.error('Admission details could not be loaded. Please try again before saving.')
                    return null
                }

                const isOtherMt = isOther(motherTongue)
                const isOtherNat = isOther(nationality)
                const isOtherRel = isOther(religion)
                const isOtherCas = isOther(caste)
                const isOtherCom = isOther(community)

                const applicantItem: any = {
                    applicantID: targetApplicantId || 0,
                    applicationNo: applicationNo || '',
                    userID: currentUserId,
                    schoolID: selectedSchoolId,
                    admissionDetailsID: admissionDetails.AdmissionDetailsID,
                    childName: childName.trim(),
                    childDOB: toIsoDateString(dob) || null,
                    genderID: getGenderId(gender),
                    motherTongueID: getMotherTongueId(motherTongue),
                    motherTongueName: isOtherMt ? 'Other' : (motherTongue || ''),
                    otherMotherTongue: isOtherMt ? otherMotherTongue.trim() : '',
                    nationalityID: getNationalityId(nationality),
                    nationalityName: isOtherNat ? 'Other' : (nationality || ''),
                    otherNationality: isOtherNat ? otherNationality.trim() : '',
                    religionID: getReligionId(religion),
                    religionName: isOtherRel ? 'Other' : (religion || ''),
                    otherReligion: isOtherRel ? otherReligion.trim() : '',
                    casteID: getCasteId(caste),
                    casteName: isOtherCas ? 'Other' : (caste || ''),
                    otherCaste: isOtherCas ? otherCaste.trim() : '',
                    communityID: getCommunityId(community),
                    communityName: isOtherCom ? 'Other' : (community || ''),
                    otherCommunity: isOtherCom ? otherCommunity.trim() : '',
                    passportNo: passportNo.trim() || '',
                    childGotoPlaySchool: childGoesToSchool,
                    playSchoolName: childGoesToSchool ? (prevSchool.trim() || '') : '',
                    isTwins: isTwins,
                    twinsNo: isTwins ? Number(twinsNo || 2) : 0,
                    schoolGoingSibilings: Boolean(hasSiblings || (Array.isArray(siblings) && siblings.some(s => s.name && s.name.trim()))),
                    isNormalChild: isHealthy,
                    childMajorAilment: !isHealthy ? (majorAilment.trim() || '') : '',
                    additionalChildren: isTwins ? additionalChildren : [],
                    reference: 'Online',
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                if (targetApplicantId || user?.userId) {
                    try {
                        localStorage.setItem(`psbb_additional_children_${targetApplicantId || user?.userId}`, JSON.stringify(isTwins ? additionalChildren : []))
                    } catch (e) {
                        // Ignore
                    }
                }

                const effectiveHasSiblings = Boolean(
                    hasSiblings || (Array.isArray(siblings) && siblings.some(s => s.name && s.name.trim()))
                )
                applicantItem.schoolGoingSibilings = effectiveHasSiblings

                const siblingsList = (effectiveHasSiblings && Array.isArray(siblings))
                    ? siblings.filter(s => s.name && s.name.trim()).map((s) => {
                        const matchedSchool = siblingSchools.find(sc =>
                            matchesDropdownValue(sc.School, s.school) ||
                            matchesDropdownValue(sc.SchoolShortName, s.school) ||
                            matchesDropdownValue(sc.SchoolName, s.school)
                        )
                        const isOtherSchool = isOther(s.school)
                        const schoolId = s.schoolId && s.schoolId > 0 ? s.schoolId : (matchedSchool?.SchoolID ?? 0)
                        const matchedStd = standards.find(
                            (standard) => standard.StandardName.toLowerCase() === s.classSec.trim().toLowerCase()
                        )
                        const classId = s.classId ?? matchedStd?.StandardID ?? 0
                        const matchedSection = lookups.find(
                            (lookup) =>
                                lookup.LookupRefID === 10 &&
                                lookup.LookupValue.toLowerCase() === (s.section || '').trim().toLowerCase()
                        )
                        const sectionId = s.sectionId ?? matchedSection?.LookupID ?? 0

                        let leftYearId = 0
                        if (s.leftStudent === 'Yes' && s.yearLeaving) {
                            const yStr = s.yearLeaving.trim()
                            const matchedY = leftYears.find(y => String(y.YearValue) === yStr || String(y.LeftYearID) === yStr)
                            if (matchedY) {
                                leftYearId = matchedY.LeftYearID
                            } else if (!isNaN(Number(yStr))) {
                                leftYearId = Number(yStr)
                            }
                        }

                        return {
                            siblingsID: s.SiblingsID ? Number(s.SiblingsID) : 0,
                            applicantID: targetApplicantId || 0,
                            siblingName: s.name.trim(),
                            schoolID: schoolId,
                            schoolName: isOtherSchool ? (s.schoolName?.trim() || 'Others') : (matchedSchool ? (matchedSchool.School || matchedSchool.SchoolShortName) : s.school),
                            isLeftSchool: s.leftStudent === 'Yes',
                            usn: !isOtherSchool ? (s.usn?.trim() || '') : '',
                            classID: classId,
                            standardID: classId,
                            sectionID: !isOtherSchool ? sectionId : 0,
                            section: !isOtherSchool ? (s.section?.trim() || '') : '',
                            leftYearID: leftYearId,
                            active: true,
                            createdBy: currentUserId,
                            updatedBy: currentUserId,
                        }
                    })
                    : []

                sectionPayload = {
                    applicantID: targetApplicantId || 0,
                    userID: currentUserId,
                    updatedBy: currentUserId,
                    createdBy: currentUserId,
                    applicationSectionID: 1,
                    recordType: recordType,
                    applicant: [applicantItem],
                    siblings: siblingsList,
                    father: [],
                    mother: [],
                    guardian: [],
                    communication: [],
                    declaration: [],
                }
            } else if (currentStepId === 2) {
                const isFOtherTitle = isOther(father.title)
                const fOtherTitle = isFOtherTitle ? (father.otherTitle?.trim() || '') : ''
                const matchedFTitle = lookups.find(l => (l.LookupName === 'Title' || l.LookupRefID === 6) && matchesDropdownValue(l.LookupValue, father.title || ''))
                const fTitleId = matchedFTitle?.LookupID ?? 0
                const fTitleName = isFOtherTitle ? fOtherTitle : (father.title || '')

                const matchedFClass = standards.find(s => s.StandardName.toLowerCase() === (father.classLastStudied || '').trim().toLowerCase())
                const matchedFYear = leftYears.find(y => String(y.YearValue) === (father.yearOfLeaving || '').trim() || String(y.LeftYearID) === (father.yearOfLeaving || '').trim())
                const matchedFBranch = parentSchools.find(ps => (ps.School && ps.School.toLowerCase() === (father.branch || '').toLowerCase()) || (ps.SchoolShortName && ps.SchoolShortName.toLowerCase() === (father.branch || '').toLowerCase()) || (ps.SchoolName && ps.SchoolName.toLowerCase() === (father.branch || '').toLowerCase()))
                const isFOtherReason = isOther(father.reasonForLeaving)
                const matchedFReason = lookups.find(l => (l.LookupName === 'ReasonForLeaving' || l.LookupRefID === 8) && matchesDropdownValue(l.LookupValue, father.reasonForLeaving || ''))
                const fReasonId = matchedFReason?.LookupID ?? 0
                const fReasonName = isFOtherReason ? 'Others' : (father.reasonForLeaving || '')
                const fOtherReason = isFOtherReason ? (father.otherReasonForLeaving?.trim() || '') : ''

                const isFOtherEmp = isOther(father.employmentCategory)
                const matchedFEmp = lookups.find(l => (l.LookupName === 'EmploymentCategory' || l.LookupRefID === 9) && matchesDropdownValue(l.LookupValue, father.employmentCategory || ''))
                const fOtherEmp = isFOtherEmp ? (father.otherEmploymentCategory?.trim() || '') : ''
                const fEmpId = matchedFEmp?.LookupID ?? 0
                const fEmpName = isFOtherEmp ? fOtherEmp : (father.employmentCategory || '')

                const matchedFIncome = incomeRanges.find(inc => inc.IncomeRange.toLowerCase() === (father.monthlyIncome || '').trim().toLowerCase() || String(inc.IncomeRangeID) === (father.monthlyIncome || '').trim())

                const fatherItem: any = {
                    appParentID: fatherAppParentId || 0,
                    applicantID: targetApplicantId || 0,
                    relationTypeID: 1,
                    titleId: fTitleId,
                    titleName: fTitleName,
                    title: fTitleName,
                    otherTitle: fOtherTitle,
                    initials: father.initials || '',
                    fullName: father.name.trim(),
                    dateOfBirth: toIsoDateString(father.dob) || null,
                    dob: toIsoDateString(father.dob) || null,
                    isAlumnus: Boolean(father.isAlumnus),
                    totalYearsStudied: father.isAlumnus ? Number(father.yearsStudied || 0) : 0,
                    classLastStudiedID: father.isAlumnus ? (matchedFClass?.StandardID ?? null) : null,
                    classLastStudied: father.isAlumnus ? (father.classLastStudied || '') : '',
                    standardID: father.isAlumnus ? (matchedFClass?.StandardID ?? null) : null,
                    yearOfLeavingID: father.isAlumnus ? (matchedFYear ? matchedFYear.LeftYearID : (Number(father.yearOfLeaving) || 0)) : 0,
                    yearOfLeaving: father.isAlumnus ? (father.yearOfLeaving || '') : '',
                    branchID: father.isAlumnus ? (matchedFBranch ? matchedFBranch.SchoolID : 0) : 0,
                    branch: father.isAlumnus ? (father.branch || '') : '',
                    schoolID: father.isAlumnus ? (matchedFBranch ? matchedFBranch.SchoolID : 0) : 0,
                    reasonForLeavingID: father.isAlumnus ? fReasonId : 0,
                    reasonForLeaving: father.isAlumnus ? fReasonName : '',
                    otherReasonForLeaving: father.isAlumnus ? fOtherReason : '',
                    educationalQualification: father.qualification.trim(),
                    universityOrInstitution: father.university.trim(),
                    occupation: father.occupation.trim(),
                    employmentCategoryID: fEmpId,
                    employementCategoryName: fEmpName,
                    employementCategory: fEmpName,
                    otherEmploymentCategory: fOtherEmp,
                    designation: father.designation.trim(),
                    companyName: father.companyName.trim(),
                    companyAddress: father.officeAddress.trim(),
                    incomeRangeID: matchedFIncome?.IncomeRangeID ?? null,
                    incomeRange: father.monthlyIncome || '',
                    companyNo: father.phoneOff.trim(),
                    companyMobileNo: father.phoneOff.trim(),
                    mobileNo: father.mobileNo.trim(),
                    isEmployed: true,
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                // Mother
                const isMOtherTitle = isOther(mother.title)
                const mOtherTitle = isMOtherTitle ? (mother.otherTitle?.trim() || '') : ''
                const matchedMTitle = lookups.find(l => (l.LookupName === 'Title' || l.LookupRefID === 6) && matchesDropdownValue(l.LookupValue, mother.title || ''))
                const mTitleId = matchedMTitle?.LookupID ?? 0
                const mTitleName = isMOtherTitle ? mOtherTitle : (mother.title || '')

                const matchedMClass = standards.find(s => s.StandardName.toLowerCase() === (mother.classLastStudied || '').trim().toLowerCase())
                const matchedMYear = leftYears.find(y => String(y.YearValue) === (mother.yearOfLeaving || '').trim() || String(y.LeftYearID) === (mother.yearOfLeaving || '').trim())
                const matchedMBranch = parentSchools.find(ps => (ps.School && ps.School.toLowerCase() === (mother.branch || '').toLowerCase()) || (ps.SchoolShortName && ps.SchoolShortName.toLowerCase() === (mother.branch || '').toLowerCase()) || (ps.SchoolName && ps.SchoolName.toLowerCase() === (mother.branch || '').toLowerCase()))
                const isMOtherReason = isOther(mother.reasonForLeaving)
                const matchedMReason = lookups.find(l => (l.LookupName === 'ReasonForLeaving' || l.LookupRefID === 8) && matchesDropdownValue(l.LookupValue, mother.reasonForLeaving || ''))
                const mReasonId = matchedMReason?.LookupID ?? 0
                const mReasonName = isMOtherReason ? 'Others' : (mother.reasonForLeaving || '')
                const mOtherReason = isMOtherReason ? (mother.otherReasonForLeaving?.trim() || '') : ''

                const isMOtherEmp = isOther(mother.employmentCategory)
                const matchedMEmp = lookups.find(l => (l.LookupName === 'EmploymentCategory' || l.LookupRefID === 9) && matchesDropdownValue(l.LookupValue, mother.employmentCategory || ''))
                const mOtherEmp = isMOtherEmp ? (mother.otherEmploymentCategory?.trim() || '') : ''
                const mEmpId = matchedMEmp?.LookupID ?? 0
                const mEmpName = isMOtherEmp ? mOtherEmp : (mother.employmentCategory || '')

                const matchedMIncome = incomeRanges.find(inc => inc.IncomeRange.toLowerCase() === (mother.monthlyIncome || '').trim().toLowerCase() || String(inc.IncomeRangeID) === (mother.monthlyIncome || '').trim())

                const motherItem: any = {
                    appParentID: motherAppParentId || 0,
                    applicantID: targetApplicantId || 0,
                    relationTypeID: 2,
                    titleId: mTitleId,
                    titleName: mTitleName,
                    title: mTitleName,
                    otherTitle: mOtherTitle,
                    initials: mother.initials || '',
                    fullName: mother.name.trim(),
                    dateOfBirth: toIsoDateString(mother.dob) || null,
                    dob: toIsoDateString(mother.dob) || null,
                    isAlumnus: Boolean(mother.isAlumnus),
                    totalYearsStudied: mother.isAlumnus ? Number(mother.yearsStudied || 0) : 0,
                    classLastStudiedID: mother.isAlumnus ? (matchedMClass?.StandardID ?? null) : null,
                    classLastStudied: mother.isAlumnus ? (mother.classLastStudied || '') : '',
                    standardID: mother.isAlumnus ? (matchedMClass?.StandardID ?? null) : null,
                    yearOfLeavingID: mother.isAlumnus ? (matchedMYear ? matchedMYear.LeftYearID : (Number(mother.yearOfLeaving) || 0)) : 0,
                    yearOfLeaving: mother.isAlumnus ? (mother.yearOfLeaving || '') : '',
                    branchID: mother.isAlumnus ? (matchedMBranch ? matchedMBranch.SchoolID : 0) : 0,
                    branch: mother.isAlumnus ? (mother.branch || '') : '',
                    schoolID: mother.isAlumnus ? (matchedMBranch ? matchedMBranch.SchoolID : 0) : 0,
                    reasonForLeavingID: mother.isAlumnus ? mReasonId : 0,
                    reasonForLeaving: mother.isAlumnus ? mReasonName : '',
                    otherReasonForLeaving: mother.isAlumnus ? mOtherReason : '',
                    educationalQualification: mother.qualification.trim(),
                    universityOrInstitution: mother.university.trim(),
                    occupation: mother.isEmployed ? mother.occupation.trim() : '',
                    employmentCategoryID: mother.isEmployed ? mEmpId : 0,
                    employementCategoryName: mother.isEmployed ? mEmpName : '',
                    employementCategory: mother.isEmployed ? mEmpName : '',
                    otherEmploymentCategory: mother.isEmployed ? mOtherEmp : '',
                    designation: mother.isEmployed ? mother.designation.trim() : '',
                    companyName: mother.isEmployed ? mother.companyName.trim() : '',
                    companyAddress: mother.isEmployed ? mother.officeAddress.trim() : '',
                    incomeRangeID: mother.isEmployed ? (matchedMIncome?.IncomeRangeID ?? null) : null,
                    incomeRange: mother.isEmployed ? (mother.monthlyIncome || '') : '',
                    companyNo: mother.isEmployed ? mother.phoneOff.trim() : '',
                    companyMobileNo: mother.isEmployed ? mother.phoneOff.trim() : '',
                    mobileNo: mother.mobileNo.trim(),
                    isEmployed: Boolean(mother.isEmployed),
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                sectionPayload = {
                    applicantID: targetApplicantId || 0,
                    userID: currentUserId,
                    updatedBy: currentUserId,
                    createdBy: currentUserId,
                    applicationSectionID: 2,
                    recordType: recordType,
                    applicant: [],
                    siblings: [],
                    father: [fatherItem],
                    mother: [motherItem],
                    guardian: [],
                    communication: [],
                    declaration: [],
                }
            } else if (currentStepId === 3) {
                const isGOtherTitle = isOther(guardian.title)
                const matchedGTitle = lookups.find(l => (l.LookupName === 'Title' || l.LookupRefID === 6) && matchesDropdownValue(l.LookupValue, guardian.title || ''))
                const gOtherTitle = (guardian.isApplicable && isGOtherTitle) ? (guardian.otherTitle?.trim() || '') : ''
                const gTitleId = guardian.isApplicable ? (matchedGTitle?.LookupID ?? 0) : 0
                const gTitleName = guardian.isApplicable ? (isGOtherTitle ? gOtherTitle : (guardian.title || '')) : ''

                const isGOtherGender = isOther(guardian.gender)
                const matchedGGender = lookups.find(l => (l.LookupName === 'Gender' || l.LookupRefID === 2) && matchesDropdownValue(l.LookupValue, guardian.gender || ''))
                const gGenderId = guardian.isApplicable ? (matchedGGender?.LookupID ?? (guardian.gender.toLowerCase() === 'male' ? 4 : 5)) : 0
                const gGenderName = guardian.isApplicable ? (isGOtherGender ? 'Others' : (guardian.gender || '')) : ''
                const gOtherGender = (guardian.isApplicable && isGOtherGender) ? (guardian.otherGender?.trim() || '') : ''

                const matchedGIncome = incomeRanges.find(inc => inc.IncomeRange.toLowerCase() === (guardian.monthlyIncome || '').trim().toLowerCase() || String(inc.IncomeRangeID) === (guardian.monthlyIncome || '').trim())

                const guardianItem: any = {
                    appParentID: guardianAppParentId || 0,
                    applicantID: targetApplicantId || 0,
                    isGuardianApplicable: Boolean(guardian.isApplicable),
                    guardianReason: guardian.isApplicable ? (guardian.reason.trim() || '') : '',
                    gender: gGenderName,
                    otherGender: gOtherGender,
                    relationGenderID: gGenderId,
                    titleId: gTitleId,
                    titleName: gTitleName,
                    title: gTitleName,
                    otherTitle: gOtherTitle,
                    initials: guardian.isApplicable ? (guardian.initials || '') : '',
                    fullName: guardian.isApplicable ? guardian.name.trim() : '',
                    name: guardian.isApplicable ? guardian.name.trim() : '',
                    dateOfBirth: null,
                    dob: null,
                    educationalQualification: '',
                    universityOrInstitution: '',
                    occupation: (guardian.isApplicable && guardian.isEmployed) ? guardian.occupation.trim() : '',
                    employmentCategoryID: 0,
                    employementCategory: '',
                    designation: (guardian.isApplicable && guardian.isEmployed) ? guardian.occupation.trim() : '',
                    companyName: (guardian.isApplicable && guardian.isEmployed) ? guardian.companyName.trim() : '',
                    companyAddress: (guardian.isApplicable && guardian.isEmployed) ? guardian.officeAddress.trim() : '',
                    officeAddress: (guardian.isApplicable && guardian.isEmployed) ? guardian.officeAddress.trim() : '',
                    incomeRangeID: (guardian.isApplicable && guardian.isEmployed) ? (matchedGIncome?.IncomeRangeID ?? null) : null,
                    incomeRange: (guardian.isApplicable && guardian.isEmployed) ? (guardian.monthlyIncome || '') : '',
                    companyNo: (guardian.isApplicable && guardian.isEmployed) ? guardian.phoneOff.trim() : '',
                    companyMobileNo: (guardian.isApplicable && guardian.isEmployed) ? guardian.phoneOff.trim() : '',
                    mobileNo: guardian.isApplicable ? guardian.mobileNo.trim() : '',
                    isEmployed: guardian.isApplicable ? Boolean(guardian.isEmployed) : false,
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                sectionPayload = {
                    applicantID: targetApplicantId || 0,
                    userID: currentUserId,
                    updatedBy: currentUserId,
                    createdBy: currentUserId,
                    applicationSectionID: 3,
                    recordType: recordType,
                    applicant: [],
                    siblings: [],
                    father: [],
                    mother: [],
                    guardian: [guardianItem],
                    communication: [],
                    declaration: [],
                }
            } else if (currentStepId === 4) {
                const transportModeIds = getTransportModeIds(comm.commuteMode)
                if (transportModeIds === null) {
                    toast.error('A selected commute option could not be matched to the transport lookup.')
                    return null
                }

                const commItem: any = {
                    applicantID: targetApplicantId || 0,
                    resAddress: comm.address.trim(),
                    resPincode: comm.pincode.trim(),
                    resPhoneNo: comm.residencePhone?.trim() || '',
                    Email: comm.email?.trim() || '',
                    resLandmark: comm.landmark?.trim() || '',
                    distanceID: getDistanceId(comm.distanceKm),
                    transportMode: transportModeIds,
                    parentsAchivements: comm.parentAchievements?.trim() || '',
                    transferfromOutside: Boolean(comm.isTransferFromOutside),
                    transferDetails: comm.isTransferFromOutside ? (comm.transferDetails?.trim() || '') : '',
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                sectionPayload = {
                    applicantID: targetApplicantId || 0,
                    userID: currentUserId,
                    updatedBy: currentUserId,
                    createdBy: currentUserId,
                    applicationSectionID: 4,
                    recordType: recordType,
                    applicant: [],
                    siblings: [],
                    father: [],
                    mother: [],
                    guardian: [],
                    communication: [commItem],
                    declaration: [],
                }
            } else if (currentStepId === 5) {
                const relationId = declarantType === 'Father' ? 1 : (declarantType === 'Mother' ? 2 : 3)
                const declarationItem: any = {
                    appDeclaredID: appDeclaredId || 0,
                    applicantID: targetApplicantId || 0,
                    declareRelationID: relationId,
                    declaredAt: new Date().toISOString(),
                    submissionTimeRangeID: 0,
                    isTrackSheetSubmitted: false,
                    trackSheetSubmittedAt: '',
                    isCertificatesSubmitted: false,
                    certificatesSubmittedAt: '',
                    isAdmissionApproved: false,
                    admissionApprovedAt: '',
                    createdBy: currentUserId,
                    updatedBy: currentUserId,
                }

                sectionPayload = {
                    applicantID: targetApplicantId || 0,
                    userID: currentUserId,
                    updatedBy: currentUserId,
                    createdBy: currentUserId,
                    applicationSectionID: 5,
                    recordType: recordType,
                    applicant: [],
                    siblings: [],
                    father: [],
                    mother: [],
                    guardian: [],
                    communication: [],
                    declaration: [declarationItem],
                }
            }

            const res = await ApiService.saveApplicantSection(currentStepId, sectionPayload, recordType)
            if (!res || !res.success) {
                toast.error(`Failed to save ${rawSteps[currentStepId - 1].title}. Please verify details.`)
                return null
            }

            let savedApplicantId = targetApplicantId || null
            if (!savedApplicantId) {
                try {
                    if (!isAdminUser && currentUserId > 0) {
                        const savedApplicants = applicantRecords(
                            await ApiService.fetchApplicant({ userId: currentUserId })
                        )
                        const matchingApplicant = savedApplicants.find(
                            (applicant: any) => getApplicantId(applicant) === res.returnVal
                        )
                        const latestApplicant = [...savedApplicants].sort(
                            (a: any, b: any) => getApplicantId(b) - getApplicantId(a)
                        )[0]
                        savedApplicantId = matchingApplicant
                            ? getApplicantId(matchingApplicant)
                            : (latestApplicant ? getApplicantId(latestApplicant) : null)
                    } else if (res.returnVal > 0) {
                        const savedApplicants = applicantRecords(
                            await ApiService.fetchApplicant({ applicantId: res.returnVal })
                        )
                        const savedApplicant = savedApplicants.find(
                            (applicant: any) => getApplicantId(applicant) === res.returnVal
                        )
                        savedApplicantId = savedApplicant ? getApplicantId(savedApplicant) : null
                    }
                } catch (error) {
                    console.error('Could not fetch applicant after saving:', error)
                    toast.error('The section was saved, but the applicant could not be verified. Please reload and try again.')
                    return null
                }
            }

            if (!savedApplicantId || savedApplicantId <= 0) {
                toast.error('The section was saved, but the applicant ID could not be verified. Please reload and try again.')
                return null
            }

            if (savedApplicantId) {
                setEditingStudentId(String(savedApplicantId))
                setCreatedStudentId(String(savedApplicantId))
                lastLoadedKeyRef.current = `app_${savedApplicantId}`

                try {
                    const freshRes = await ApiService.fetchApplicant({ applicantId: savedApplicantId })
                    const freshList = applicantRecords(freshRes)
                    const freshApp = freshList.find((a: any) => getApplicantId(a) === savedApplicantId)
                    if (freshApp) {
                        setApplicationNo(
                            hasOfficialApplicationNumber(freshApp.ApplicationNo)
                                ? freshApp.ApplicationNo
                                : ''
                        )
                        const freshDeclaredId = Number(freshApp.AppDeclaredID ?? freshApp.appDeclaredID ?? 0)
                        if (freshDeclaredId > 0) {
                            setAppDeclaredId(freshDeclaredId)
                            appDeclaredIdRef.current = freshDeclaredId
                        }
                        const fObj = Array.isArray(freshApp.Father) ? freshApp.Father[0] : freshApp.Father
                        if (fObj) {
                            const fId = Number(fObj.AppParentID ?? fObj.appParentID ?? 0)
                            if (fId > 0) setFatherAppParentId(fId)
                        }
                        const mObj = Array.isArray(freshApp.Mother) ? freshApp.Mother[0] : freshApp.Mother
                        if (mObj) {
                            const mId = Number(mObj.AppParentID ?? mObj.appParentID ?? 0)
                            if (mId > 0) setMotherAppParentId(mId)
                        }
                        const gObj = Array.isArray(freshApp.Guardian) ? freshApp.Guardian[0] : freshApp.Guardian
                        if (gObj) {
                            const gId = Number(gObj.AppParentID ?? gObj.appParentID ?? 0)
                            if (gId > 0) setGuardianAppParentId(gId)
                        }
                        if (Array.isArray(freshApp.Siblings) && freshApp.Siblings.length > 0) {
                            setSiblings((prevSiblings) => {
                                return prevSiblings.map((s, idx) => {
                                    const matchedSibling = freshApp.Siblings[idx]
                                    if (matchedSibling && matchedSibling.SiblingsID) {
                                        return { ...s, SiblingsID: matchedSibling.SiblingsID }
                                    }
                                    return s
                                })
                            })
                        }
                    }
                } catch (fetchErr) {
                    console.warn('Could not refetch applicant details after save:', fetchErr)
                }
            }

            // Sync with local student store
            saveStudentRecord(isCreateMode && !targetApplicantId)

            return savedApplicantId
        } catch (e) {
            console.error('saveCurrentSection error:', e)
            toast.error(`Error saving ${rawSteps[currentStepId - 1].title}`)
            return null
        }
    }

    const handleSaveAndNext = async (currentStepId: number) => {
        if (isReadOnly) {
            if (currentStepId < 5) {
                const nextSlug = stepIdToSlug[currentStepId + 1]
                const q = getPreservedQuery('view')
                if (id) {
                    navigate(`/admission/${nextSlug}/${id}${q}`)
                } else if (isCreateMode) {
                    navigate(`/admission/${nextSlug}/add${q}`)
                } else {
                    navigate(`/admission/${nextSlug}${q}`)
                }
            } else {
                if (!isAdminUser) {
                    navigate('/admission')
                } else if (id) {
                    navigate(`/admission/${id}${getPreservedQuery('view')}`)
                } else {
                    handleReturnToSource()
                }
            }
            return
        }

        // Validate mandatory fields BEFORE saving to database
        if (currentStepId === 1) {
            const v1 = validateStep1()
            if (!v1.valid) {
                toast.error(v1.error)
                return
            }
        } else if (currentStepId === 2) {
            const v2 = validateStep2()
            if (!v2.valid) {
                toast.error(v2.error)
                return
            }
        } else if (currentStepId === 3) {
            const v3 = validateStep3()
            if (!v3.valid) {
                toast.error(v3.error)
                return
            }
        } else if (currentStepId === 4) {
            const v4 = validateStep4()
            if (!v4.valid) {
                toast.error(v4.error)
                return
            }
        } else if (currentStepId === 5) {
            const v5 = validateStep5()
            if (!v5.valid) {
                toast.error(v5.error)
                const s1 = validateStep1()
                if (!s1.valid) {
                    handleStepClick(1)
                    return
                }
                const s2 = validateStep2()
                if (!s2.valid) {
                    handleStepClick(2)
                    return
                }
                const s3 = validateStep3()
                if (!s3.valid) {
                    handleStepClick(3)
                    return
                }
                const s4 = validateStep4()
                if (!s4.valid) {
                    handleStepClick(4)
                    return
                }
                return
            }
        }

        const savedId = await saveCurrentSection(currentStepId)
        if (!savedId) return

        if (currentStepId === 3) {
            setIsStep3Saved(true)
        }

        // Add saved step to completed list immediately so next step is unlocked
        setDbCompletedStepIds((prev) => Array.from(new Set([...prev, currentStepId])))

        toast.success(`${rawSteps[currentStepId - 1].title} saved successfully!`)

        if (currentStepId < 5) {
            const nextSlug = stepIdToSlug[currentStepId + 1]
            navigate(`/admission/${nextSlug}/${savedId}${getPreservedQuery()}`)
        } else {
            // Final submission on step 5 (Accept & Submit)
            setIsDeclared(true)
            if (isTwins) {
                setChildDeclarations([true, true, true, true])
            }
            toast.success('All registration steps completed and submitted!')
            const appDeclaredId = appDeclaredIdRef.current
            if (appDeclaredId) await loadDeclarationContent(appDeclaredId)
            else toast.error('Declaration ID was not returned by the applicant fetch.')
            setIsSuccessModalOpen(true)
        }
    }

    const handleConfirmSubmit = async () => {
        if (isSubmittingConfirm) return
        setIsSubmittingConfirm(true)
        try {
            await handleSaveAndNext(5)
        } catch (err) {
            console.error('Declaration submission error:', err)
        } finally {
            setIsSubmittingConfirm(false)
            setIsSubmitConfirmOpen(false)
        }
    }

    const handleSaveAndExit = async () => {
        if (!isReadOnly) {
            // When exiting from Step 5 (Declaration), do NOT submit or save declaration!
            // Step 5 strictly remains PENDING.
            if (activeStepId === 5) {
                toast.info('Exited Declaration. Step remains pending.')
                if (!isAdminUser) {
                    navigate('/admission')
                    return
                }
                const targetId = id || editingStudentId || createdStudentId
                if (targetId) {
                    navigate(`/admission/${targetId}${getPreservedQuery()}`)
                } else {
                    setViewMode('overview')
                }
                return
            }

            // For Steps 1 to 4:
            // If data is valid, save draft so changes are preserved
            let validation = { valid: true, error: '' }
            if (activeStepId === 1) validation = validateStep1()
            else if (activeStepId === 2) validation = validateStep2()
            else if (activeStepId === 3) validation = validateStep3()
            else if (activeStepId === 4) validation = validateStep4()

            if (validation.valid) {
                await saveCurrentSection(activeStepId)
                setDbCompletedStepIds((prev) => Array.from(new Set([...prev, activeStepId])))
                if (activeStepId === 3) {
                    setIsStep3Saved(true)
                }
                toast.success(`${rawSteps[activeStepId - 1].title} saved successfully!`)
            } else {
                setDbCompletedStepIds((prev) => prev.filter((stepId) => stepId < activeStepId))
                if (activeStepId === 3) {
                    setIsStep3Saved(false)
                }
                toast.info(`Progress saved as draft. ${rawSteps[activeStepId - 1].title} remains pending.`)
            }
        }

        if (!isAdminUser) {
            navigate('/admission')
            return
        }
        const targetId = id || editingStudentId || createdStudentId
        if (targetId) {
            navigate(`/admission/${targetId}${getPreservedQuery()}`)
        } else {
            setViewMode('overview')
        }
    }

    const loadDeclarationContent = async (appDeclaredId: number) => {
        setDeclarationContent(null)
        if (!Number.isInteger(appDeclaredId) || appDeclaredId <= 0) {
            toast.error('Unable to load declaration details because the declaration ID is invalid.')
            return
        }

        try {
            const content = await ApiService.fetchDeclarationContent(appDeclaredId)
            if (!content) {
                toast.error('Declaration details could not be loaded. Please try again or contact the school.')
                return
            }
            setDeclarationContent(content)
        } catch (error) {
            console.error('Failed to fetch declaration content:', error)
            toast.error('Declaration details could not be loaded. Please try again or contact the school.')
        }
    }

    const handleOpenSuccessModal = async () => {
        if (declarationContent) {
            setIsSuccessModalOpen(true)
            return
        }

        const appDeclaredId = appDeclaredIdRef.current
        if (!appDeclaredId) {
            setDeclarationContent(null)
            toast.error('Unable to load declaration details because the declaration ID was not found in the applicant record.')
        } else {
            await loadDeclarationContent(appDeclaredId)
        }
        setIsSuccessModalOpen(true)
    }

    const handleCompleteAll = async () => {
        setIsDeclared(true)
        setIsStep3Saved(true)
        setDbCompletedStepIds([1, 2, 3, 4, 5])
        await handleOpenSuccessModal()
        toast.success('All 5 registration steps marked as completed!')
    }

    const handleReset = () => {
        setActiveStepId(1)
        setIsDeclared(false)
        setIsSuccessModalOpen(false)
        setIsStep3Saved(false)
        setDbCompletedStepIds([])
        setApplicationNo('')
        setDeclarationContent(null)
        appDeclaredIdRef.current = null

        // Clear all fields
        setSelectedSchoolId(0)
        setSelectedSchoolName('')
        setChildName('')
        setDob('')
        setGender('')
        setMotherTongue('')
        setOtherMotherTongue('')
        setNationality('')
        setOtherNationality('')
        setPassportNo('')
        setReligion('')
        setOtherReligion('')
        setCaste('')
        setOtherCaste('')
        setCommunity('')
        setOtherCommunity('')
        setIsTwins(false)
        setTwinsNo('')
        setAdditionalChildren([])
        setChildDeclarations([false, false, false, false])
        setSelectedPrintChildIndex(0)
        setIsHealthy(true)
        setMajorAilment('')
        setChildGoesToSchool(false)
        setPrevSchool('')
        setHasSiblings(false)
        setSiblings([])

        setFather({
            title: '', otherTitle: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', otherReasonForLeaving: '', qualification: '',
            university: '', occupation: '', employmentCategory: '', otherEmploymentCategory: '', designation: '', companyName: '',
            officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
        })

        setMother({
            title: '', otherTitle: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', otherReasonForLeaving: '', qualification: '',
            university: '', isEmployed: false, occupation: '', employmentCategory: '', otherEmploymentCategory: '', designation: '',
            companyName: '', officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
        })

        setGuardian({
            isApplicable: false, reason: '', gender: '', otherGender: '', title: '', otherTitle: '', initials: '', name: '',
            isEmployed: false, occupation: '', companyName: '', monthlyIncome: '', officeAddress: '',
            phoneOff: '', phoneRes: '', mobileNo: ''
        })

        setComm({
            address: '', pincode: '', residencePhone: '', email: '', landmark: '', distanceKm: '',
            commuteMode: [], parentAchievements: '', isTransferFromOutside: false, transferDetails: ''
        })

        toast.info('Registration form reset completely.')
    }

    const buildPrintStudentData = async (childIndex: number = selectedPrintChildIndex) => {
        const targetId = actualStudentId || id || editingStudentId || createdStudentId || ''
        const numericTargetId = targetId && !isNaN(Number(targetId)) ? Number(targetId) : 0
        const currentUserId = user?.userId && !isNaN(Number(user.userId)) ? Number(user.userId) : null

        let dbRecord: any = null
        try {
            let res: any = null
            if (numericTargetId > 0) {
                res = await ApiService.fetchApplicant({ applicantId: numericTargetId })
            } else if (!isAdminUser && currentUserId && currentUserId > 0) {
                res = await ApiService.fetchApplicant({ userId: currentUserId })
            }
            const rawList = Array.isArray(res) ? res : (res?.value || res?.data || (res ? [res] : []))
            if (rawList.length > 0) {
                if (numericTargetId > 0) {
                    dbRecord = rawList.find((a: any) => Number(a.ApplicantID) === numericTargetId) || rawList[0]
                } else {
                    const sorted = [...rawList].sort((a: any, b: any) => Number(b.ApplicantID || 0) - Number(a.ApplicantID || 0))
                    dbRecord = sorted[0]
                }
            }
        } catch (e) {
            console.warn('Error fetching applicant from DB for print:', e)
        }

        const baseStudent = (targetId ? getStudentById(String(targetId)) : null) as any

        const isMultipleChild = isTwins && childIndex > 0
        const selectedChildName = isMultipleChild
            ? (additionalChildren[childIndex - 1]?.name?.trim() || `Child ${childIndex + 1}`)
            : (childName?.trim() || dbRecord?.ChildName || baseStudent?.studentName || 'Child 1')
        const selectedChildGender = isMultipleChild
            ? (additionalChildren[childIndex - 1]?.gender || gender || dbRecord?.Gender || (gender as any) || baseStudent?.gender || '')
            : (gender || dbRecord?.Gender || (gender as any) || baseStudent?.gender || '')
        const selectedChildPassport = isMultipleChild
            ? (additionalChildren[childIndex - 1]?.passportNo || passportNo || dbRecord?.PassportNo || '')
            : (passportNo || dbRecord?.PassportNo || '')

        // Merge DB record with live state and baseStudent
        const mergedStudent = {
            ...(baseStudent || {}),
            ...(dbRecord || {}),
            id: String(targetId || dbRecord?.ApplicantID || baseStudent?.id || ''),
            registrationNumber: dbRecord?.ApplicationNo || applicationNo || baseStudent?.registrationNumber || '',
            studentName: selectedChildName,
            ChildName: selectedChildName,
            childName: selectedChildName,
            gender: selectedChildGender,
            Gender: selectedChildGender,
            passportNo: selectedChildPassport,
            PassportNo: selectedChildPassport,
            schoolAppliedFor: dbRecord?.School || selectedSchoolName || baseStudent?.schoolAppliedFor || '',
            schoolAddress: admissionSchoolAddress || (selectedSchoolId ? schools.find(s => s.SchoolID === selectedSchoolId)?.SchoolAddress : '') || '',
            schoolId: selectedSchoolId,
            preferredEmail: comm.email || user?.email || (typeof window !== 'undefined' ? (localStorage.getItem('email') || localStorage.getItem('user_email') || '') : '') || dbRecord?.Email || dbRecord?.EmailID || '',
            class: baseStudent?.class || '',
            academicYear: dbRecord?.AcademicYear || baseStudent?.academicYear || '2026-27',
            date: dbRecord?.ChildDOB || dob || baseStudent?.date || '',
            dob: dbRecord?.ChildDOB || dob || baseStudent?.dob || '',
            submissionDate: submissionDate || baseStudent?.submissionDate || '',
            dateOfSubmission: submissionDate || baseStudent?.dateOfSubmission || '',
            timings: timings || baseStudent?.timings || '',
            submissionTimings: timings || baseStudent?.timings || '',
            // If dbRecord doesn't have Father/Mother/Guardian/Siblings, provide form state
            Father: (Array.isArray(dbRecord?.Father) && dbRecord.Father.length > 0) ? dbRecord.Father : [{
                FullName: father.name,
                Title: father.title,
                Initials: father.initials,
                DOB: father.dob,
                IsAlumnus: father.isAlumnus ? 'Yes' : 'No',
                TotalYearsStudied: father.yearsStudied,
                YearOfLeaving: father.yearOfLeaving,
                LeftYear: father.yearOfLeaving,
                ClassLastStudied: father.classLastStudied,
                Branch: father.branch,
                ReasonForLeaving: father.reasonForLeaving,
                EducationalQualification: father.qualification,
                UniversityOrInstitution: father.university,
                Occupation: father.occupation,
                EmployementCategory: father.employmentCategory,
                Designation: father.designation,
                CompanyName: father.companyName,
                CompanyAddress: father.officeAddress,
                IncomeRange: father.monthlyIncome,
                CompanyMobileNo: father.phoneOff,
                MobileNo: father.mobileNo,
            }],
            Mother: (Array.isArray(dbRecord?.Mother) && dbRecord.Mother.length > 0) ? dbRecord.Mother : [{
                FullName: mother.name,
                Title: mother.title,
                Initials: mother.initials,
                DOB: mother.dob,
                IsAlumnus: mother.isAlumnus ? 'Yes' : 'No',
                TotalYearsStudied: mother.yearsStudied,
                YearOfLeaving: mother.yearOfLeaving,
                LeftYear: mother.yearOfLeaving,
                ClassLastStudied: mother.classLastStudied,
                Branch: mother.branch,
                ReasonForLeaving: mother.reasonForLeaving,
                EducationalQualification: mother.qualification,
                UniversityOrInstitution: mother.university,
                Occupation: mother.occupation,
                EmployementCategory: mother.employmentCategory,
                Designation: mother.designation,
                CompanyName: mother.companyName,
                CompanyAddress: mother.officeAddress,
                IncomeRange: mother.monthlyIncome,
                CompanyMobileNo: mother.phoneOff,
                MobileNo: mother.mobileNo,
                IsEmployed: mother.isEmployed ? 'Yes' : 'No',
            }],
            Guardian: (Array.isArray(dbRecord?.Guardian) && dbRecord.Guardian.length > 0) ? dbRecord.Guardian : [{
                IsGuardianApplicable: guardian.isApplicable ? 'Yes' : 'No',
                FullName: guardian.isApplicable ? guardian.name : '',
                Gender: guardian.isApplicable ? (isOther(guardian.gender) ? (guardian.otherGender?.trim() || 'Others') : guardian.gender) : '',
                OtherGender: (guardian.isApplicable && isOther(guardian.gender)) ? (guardian.otherGender?.trim() || '') : '',
                Title: guardian.isApplicable ? (isOther(guardian.title) ? (guardian.otherTitle?.trim() || 'Others') : guardian.title) : '',
                OtherTitle: (guardian.isApplicable && isOther(guardian.title)) ? (guardian.otherTitle?.trim() || '') : '',
                Occupation: guardian.isApplicable ? guardian.occupation : '',
                CompanyName: guardian.isApplicable ? guardian.companyName : '',
                IncomeRange: guardian.isApplicable ? guardian.monthlyIncome : '',
                CompanyAddress: guardian.isApplicable ? guardian.officeAddress : '',
                CompanyMobileNo: guardian.isApplicable ? guardian.phoneOff : '',
                MobileNo: guardian.isApplicable ? guardian.mobileNo : '',
                DOB: guardian.isApplicable ? ((guardian as any).dob || '') : '',
            }],
            Siblings: (Array.isArray(dbRecord?.Siblings) && dbRecord.Siblings.length > 0)
                ? dbRecord.Siblings
                : (siblings || []).map(s => ({
                    SiblingName: s.name,
                    School: s.school,
                    USN: s.usn,
                    Class: s.classSec?.split('-')[0]?.trim() || s.classSec,
                    Section: s.classSec?.split('-')[1]?.trim() || '',
                    LeftYear: s.yearLeaving,
                    IsLeftSchool: s.leftStudent,
                })),
            father,
            mother,
            guardian,
            comm,
            isHealthy,
            prevSchool,
            twinsNo,
        } as unknown as StudentRecord

        return { mergedStudent, targetId }
    }

    const handleSelectPrintChild = async (childIndex: number) => {
        setSelectedPrintChildIndex(childIndex)
        if (isPreviewModalOpen) {
            const { mergedStudent } = await buildPrintStudentData(childIndex)
            setPreviewStudent(mergedStudent)
        }
    }

    const handlePrintTrackSheet = async () => {
        if (!isRegistrationComplete && !applicationNo) {
            toast.error('Registration must be completed before printing Track Sheet.')
            return
        }
        const { mergedStudent, targetId } = await buildPrintStudentData(selectedPrintChildIndex)

        setPreviewStudent(mergedStudent)
        setPreviewDocType('track-sheet-2')
        setIsPreviewModalOpen(true)
        try {
            if (targetId) await ApiService.generateTrackSheet(targetId, true)
        } catch (e) {
            console.warn('Live track sheet sync warning:', e)
        }
    }

    const handlePrintRegistrationForm = async () => {
        if (!isRegistrationComplete && !applicationNo) {
            toast.error('All required registration steps must be completed before printing.')
            return
        }
        const { mergedStudent, targetId } = await buildPrintStudentData(selectedPrintChildIndex)

        setPreviewStudent(mergedStudent)
        setPreviewDocType('registration-form-5')
        setIsPreviewModalOpen(true)
        try {
            if (targetId) await ApiService.generateRegistrationForm(targetId, true)
        } catch (e) {
            console.warn('Live registration form sync warning:', e)
        }
    }

    const openedFromInstructionRef = useRef<boolean>(false)

    const handleViewSampleRegistrationForm = (instructionAcademicYear: string) => {
        const sampleStudent: any = {
            id: '',
            registrationNumber: '',
            studentName: '',
            academicYear: instructionAcademicYear,
            schoolAppliedFor: selectedSchoolName || 'Padma Seshadri Bala Bhavan Senior Secondary School',
        }
        setPreviewStudent(sampleStudent as StudentRecord)
        setPreviewDocType('registration-form-5')
        openedFromInstructionRef.current = true
        setIsInstructionModalOpen(false)
        setIsPreviewModalOpen(true)
    }

    const handleDownloadTrackSheetFromInstruction = async (instructionAcademicYear: string) => {
        toast.info('Downloading blank Track Sheet PDF...')
        await downloadTrackSheetPdf({ academicYear: instructionAcademicYear })
        toast.success('Blank Track Sheet PDF downloaded successfully!')
    }

    const handleClosePreviewModal = () => {
        setIsPreviewModalOpen(false)
        if (openedFromInstructionRef.current) {
            openedFromInstructionRef.current = false
            setIsInstructionModalOpen(true)
        }
    }

    const addSibling = () => {
        setSiblings((prev) => [
            ...prev,
            { name: '', school: '', schoolName: '', leftStudent: 'No', usn: '', classSec: '', section: '', yearLeaving: '' }
        ])
    }

    const removeSibling = (index: number) => {
        setSiblings((prev) => prev.filter((_, i) => i !== index))
    }

    const updateSibling = (index: number, key: keyof Sibling, val: string | number | undefined) => {
        setSiblings((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [key]: val } : item))
        )
    }

    // Full-page blocking initial application data loading
    if (isLoadingApplicant) {
        return (
            <ApplicationFormLoader
                message="Loading Application Details..."
            />
        )
    }

    return (
        <div className={`space-y-6 mx-auto pb-10 ${viewMode === 'stepForm' ? '-mt-3' : ''}`}>

            {/* Mode Banner when in Create Mode */}
            {isAdminUser && isCreateMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={handleReturnToSource}
                            className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>{sourceBackLabel}</span>
                        </button>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            New Application
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Creating new admission application {activeChildName ? `• ${activeChildName}` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {viewMode === 'overview' && (
                            <button
                                type="button"
                                onClick={() => navigate(`/admission/application-details/add${getPreservedQuery()}`)}
                                className="h-8 px-3 rounded-lg text-xs font-bold   text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                                style={{
                                    background: "var(--app-gradient)"
                                }}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Application Detail</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Mode Banner when viewing/editing existing record */}
            {isAdminUser && id && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={handleReturnToSource}
                            className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>{sourceBackLabel}</span>
                        </button>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${isReadOnly
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                            {isReadOnly ? '👁️ View Mode (Read-Only)' : '✏️ Edit Mode'}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Application ID: <strong className="text-slate-900 dark:text-white">#{id}</strong> {applicationNo ? `(${applicationNo})` : ''} {activeChildName ? `• ${activeChildName}` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {viewMode === 'overview' && (
                            <button
                                type="button"
                                onClick={handleOpenApplicationDetails}
                                className="h-8 px-3 rounded-lg text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Application Detail</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handlePrintRegistrationForm}
                            className="h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Print Application"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Print</span>
                        </button>
                        {isReadOnly ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (viewMode === 'stepForm' && effectiveStepSlug) {
                                        navigate(`/admission/${effectiveStepSlug}/${id}${getPreservedQuery('edit')}`)
                                    } else {
                                        navigate(`/admission/${id}${getPreservedQuery('edit')}`)
                                    }
                                }}
                                className="h-8 px-3.5 rounded-lg text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Switch to Edit</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (viewMode === 'stepForm' && effectiveStepSlug) {
                                        navigate(`/admission/${effectiveStepSlug}/${id}${getPreservedQuery('view')}`)
                                    } else {
                                        navigate(`/admission/${id}${getPreservedQuery('view')}`)
                                    }
                                }}
                                className="h-8 px-3.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Only</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* MODE 1: OVERVIEW SCREEN */}
            {viewMode === 'overview' && (
                <RegistrationPortalView
                    steps={steps}
                    completedCount={completedCount}
                    isRegistrationComplete={isRegistrationComplete}
                    activeStepId={activeStepId}
                    completedStepIds={completedStepIds}
                    isAdminUser={isAdminUser}
                    isFromAdmin={fromAdmin}
                    isReadOnly={isReadOnly}
                    applicationNo={applicationNo}
                    studentId={actualStudentId || id}
                    studentName={activeChildName}
                    registrationTitle={registrationTitle}
                    trackSheetDescription={trackSheetDescription}
                    upperNotice={homeContents?.ApplicationPageUpperContent}
                    lowerNotice={homeContents?.ApplicationPageLowerContent}
                    onStepClick={handleStepClick}
                    onCompleteAll={handleCompleteAll}
                    onReset={handleReset}
                    onPrintTrackSheet={handlePrintTrackSheet}
                    onPrintRegistrationForm={handlePrintRegistrationForm}
                    onViewApplicationDetails={handleOpenApplicationDetails}
                    onOpenSuccessModal={handleOpenSuccessModal}
                    onOpenInstruction={() => setIsInstructionModalOpen(true)}
                    isTwins={isTwins}
                    childrenList={childrenList}
                    selectedChildIndex={selectedPrintChildIndex}
                    onSelectChild={handleSelectPrintChild}
                />
            )}

            {/* MODE 2: SEPARATE STEP FORM SCREEN */}
            {viewMode === 'stepForm' && (
                <div className="space-y-2">
                    {/* Top Navigation Row: Back Button */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={handleBackNavigation}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1677FF] dark:text-blue-400 hover:text-[#0958D9] dark:hover:text-blue-300 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" /> {!isAdminUser ? "Back to Admission" : (id || isCreateMode ? "Back to Admission Overview" : sourceBackLabel)}
                        </button>

                        <div className="flex items-center gap-3">
                            <div
                                className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-3 py-1.5 text-xs text-slate-600 sm:justify-end"
                                title="Branch comes from the applicant's selected SchoolID. Registration year comes from App.ProcFetchSubmissionTimeRange filtered by that SchoolID."
                            >
                                <span className="font-semibold tracking-wide text-slate-500">You are applying for</span>
                                <span className="font-bold text-[#1677FF] blink">{selectedSchoolName || '-'}</span>
                                <span className="text-slate-400" aria-hidden="true">|</span>
                                <span className="font-bold text-[#1677FF]">{registrationTitle}</span>
                            </div>

                            {isTwins && childrenList && childrenList.length > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <label htmlFor="stepFormChildDropdown" className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        Child:
                                    </label>
                                    <select
                                        id="stepFormChildDropdown"
                                        value={selectedPrintChildIndex}
                                        onChange={(e) => handleSelectPrintChild(Number(e.target.value))}
                                        className="h-8 px-2.5 text-xs font-bold rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                                    >
                                        {childrenList.map((child, idx) => (
                                            <option key={idx} value={idx}>
                                                {child.name?.trim() ? child.name.trim() : `Child ${idx + 1} (Name not entered)`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                        {/* Left Steps Progress Sidebar */}
                        <div className="lg:col-span-3">
                            <StepSidebar
                                steps={steps}
                                activeStepId={activeStepId}
                                completedStepIds={completedStepIds}
                                onStepSelect={handleStepClick}
                                isFromAdmin={fromAdmin}
                                isReadOnly={isReadOnly}
                                onOpenInstruction={() => setIsInstructionModalOpen(true)}
                            />
                        </div>

                        {/* Right Step Form Workspace */}
                        <div className="lg:col-span-9 space-y-6">
                            {activeStepId === 1 && (
                                <Step1ApplicantDetails
                                    childName={childName}
                                    setChildName={setChildName}
                                    dob={dob}
                                    setDob={setDob}
                                    gender={gender}
                                    setGender={setGender}
                                    motherTongue={motherTongue}
                                    setMotherTongue={setMotherTongue}
                                    otherMotherTongue={otherMotherTongue}
                                    setOtherMotherTongue={setOtherMotherTongue}
                                    nationality={nationality}
                                    setNationality={setNationality}
                                    otherNationality={otherNationality}
                                    setOtherNationality={setOtherNationality}
                                    passportNo={passportNo}
                                    setPassportNo={setPassportNo}
                                    religion={religion}
                                    setReligion={setReligion}
                                    otherReligion={otherReligion}
                                    setOtherReligion={setOtherReligion}
                                    caste={caste}
                                    setCaste={setCaste}
                                    otherCaste={otherCaste}
                                    setOtherCaste={setOtherCaste}
                                    community={community}
                                    setCommunity={setCommunity}
                                    otherCommunity={otherCommunity}
                                    setOtherCommunity={setOtherCommunity}
                                    isTwins={isTwins}
                                    setIsTwins={handleIsTwinsChange}
                                    twinsNo={twinsNo}
                                    setTwinsNo={handleTwinsNoChange}
                                    additionalChildren={additionalChildren}
                                    setAdditionalChildren={setAdditionalChildren}
                                    updateAdditionalChild={updateAdditionalChild}
                                    isHealthy={isHealthy}
                                    setIsHealthy={setIsHealthy}
                                    majorAilment={majorAilment}
                                    setMajorAilment={setMajorAilment}
                                    childGoesToSchool={childGoesToSchool}
                                    setChildGoesToSchool={setChildGoesToSchool}
                                    prevSchool={prevSchool}
                                    setPrevSchool={setPrevSchool}
                                    hasSiblings={hasSiblings}
                                    setHasSiblings={setHasSiblings}
                                    siblings={siblings}
                                    addSibling={addSibling}
                                    removeSibling={removeSibling}
                                    updateSibling={updateSibling}
                                    selectedSchoolId={selectedSchoolId}
                                    setSelectedSchoolId={setSelectedSchoolId}
                                    selectedSchoolName={selectedSchoolName}
                                    setSelectedSchoolName={setSelectedSchoolName}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(1)}
                                    isReadOnly={isReadOnly}
                                    isSchoolSelectionDisabled={hasOfficialApplicationNumber(applicationNo)}
                                />
                            )}

                            {activeStepId === 2 && (
                                <Step2ParentDetails
                                    father={father}
                                    setFather={setFather}
                                    mother={mother}
                                    setMother={setMother}
                                    onClear={() => {
                                        setFather({
                                            title: '', otherTitle: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
                                            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', otherReasonForLeaving: '', qualification: '',
                                            university: '', occupation: '', employmentCategory: '', otherEmploymentCategory: '', designation: '', companyName: '',
                                            officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
                                        })
                                        setMother({
                                            title: '', otherTitle: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
                                            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', otherReasonForLeaving: '', qualification: '',
                                            university: '', isEmployed: false, occupation: '', employmentCategory: '', otherEmploymentCategory: '', designation: '',
                                            companyName: '', officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
                                        })
                                        toast.info('Parent details cleared')
                                    }}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(2)}
                                    isReadOnly={isReadOnly}
                                />
                            )}

                            {activeStepId === 3 && (
                                <Step3GuardianDetails
                                    guardian={guardian}
                                    setGuardian={setGuardian}
                                    onClear={() => {
                                        setGuardian({
                                            isApplicable: false, reason: '', gender: '', otherGender: '', title: '', otherTitle: '', initials: '', name: '',
                                            isEmployed: false, occupation: '', companyName: '', monthlyIncome: '', officeAddress: '',
                                            phoneOff: '', phoneRes: '', mobileNo: ''
                                        })
                                        toast.info('Guardian details cleared')
                                    }}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(3)}
                                    isReadOnly={isReadOnly}
                                />
                            )}

                            {activeStepId === 4 && (
                                <Step4CommunicationDetails
                                    comm={comm}
                                    setComm={setComm}
                                    onClear={() => {
                                        setComm({
                                            address: '', pincode: '', residencePhone: '', email: '', landmark: '', distanceKm: '',
                                            commuteMode: [], parentAchievements: '', isTransferFromOutside: false, transferDetails: ''
                                        })
                                        toast.info('Communication details cleared')
                                    }}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(4)}
                                    isReadOnly={isReadOnly}
                                />
                            )}

                            {activeStepId === 5 && (
                                <Step5Declaration
                                    declarantType={declarantType}
                                    setDeclarantType={setDeclarantType}
                                    childName={childName}
                                    setChildName={setChildName}
                                    childGender={gender}
                                    isTwins={isTwins}
                                    twinsNo={twinsNo}
                                    additionalChildren={additionalChildren}
                                    childDeclarations={childDeclarations}
                                    setChildDeclarations={setChildDeclarations}
                                    isDeclared={isDeclared}
                                    setIsDeclared={setIsDeclared}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => {
                                        setIsSubmittingConfirm(false)
                                        setIsSubmitConfirmOpen(true)
                                    }}
                                    isReadOnly={isReadOnly}
                                    onBackToMaster={handleReturnToSource}
                                    onPrint={handlePrintRegistrationForm}
                                    backLabel={isAdminUser ? sourceBackLabel : "Back to Admission"}
                                    deadlineNotice={homeContents?.ApplicationPageUpperContent}
                                    hasGuardian={guardian.isApplicable}
                                    selectedSchoolName={selectedSchoolName || (schools.find(s => s.SchoolID === selectedSchoolId)?.School || '')}
                                />
                            )}

                        </div>
                    </div>
                </div>
            )}


            {/* REGISTRATION SUCCESS DETAILS MODAL */}
            <RegistrationSuccessModal
                isOpen={isSuccessModalOpen}
                declarationContent={declarationContent}
                onClose={() => {
                    setIsSuccessModalOpen(false)
                    if (!isAdminUser) {
                        navigate('/admission')
                    } else if (createdStudentId) {
                        navigate(`/admission/${createdStudentId}?mode=view`)
                    } else {
                        handleReturnToSource()
                    }
                }}
                onPrintTrackSheet={handlePrintTrackSheet}
                studentId={createdStudentId || id || undefined}
                onViewDetails={(newId) => navigate(`/admission/application-details/${newId}`)}
                isAdminUser={isAdminUser}
            />

            {/* PRINT PREVIEW MODAL */}
            <PrintPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={handleClosePreviewModal}
                documentType={previewDocType}
                student={previewStudent}
                isTwins={isTwins}
                childrenList={childrenList}
                selectedChildIndex={selectedPrintChildIndex}
                onSelectChild={handleSelectPrintChild}
            />

            {/* INSTRUCTION MODAL */}
            <InstructionModal
                isOpen={isInstructionModalOpen}
                onClose={() => setIsInstructionModalOpen(false)}
                onViewSampleRegistrationForm={handleViewSampleRegistrationForm}
                onDownloadTrackSheet={handleDownloadTrackSheetFromInstruction}
            />

            {/* CONFIRM SUBMISSION MODAL */}
            <Dialog
                open={isSubmitConfirmOpen}
                onOpenChange={(open) => {
                    if (!isSubmittingConfirm) {
                        setIsSubmitConfirmOpen(open)
                    }
                }}
            >
                <DialogContent
                    showCloseButton={!isSubmittingConfirm}
                    overlayClassName="bg-black/60 dark:bg-black/80 backdrop-blur-xs"
                    className="p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl max-w-[calc(100%-2rem)] sm:max-w-md w-full gap-0 overflow-hidden"
                >
                    <DialogHeader className="flex flex-col items-center text-center">
                        {/* Suitable Confirmation Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-[#1677FF] dark:text-blue-400 mb-4 shadow-xs ring-8 ring-blue-50/50 dark:ring-blue-950/30">
                            <HelpCircle className="h-7 w-7" />
                        </div>

                        {/* Highlighted Title */}
                        <DialogTitle className="text-lg sm:text-xl font-bold text-[#0F294A] dark:text-white tracking-tight">
                            Confirm submission
                        </DialogTitle>

                        {/* Confirmation Message with proper spacing */}
                        <DialogDescription className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-sm">
                            You are about to confirm the Declaration. Click &apos;OK&apos; to confirm or &apos;Cancel&apos; to modify the data, if necessary.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Modal Actions Footer */}
                    <DialogFooter className="-mx-6 -mb-6 sm:-mx-7 sm:-mb-7 mt-6 sm:mt-7 px-6 py-4 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 rounded-b-2xl">
                        <button
                            type="button"
                            disabled={isSubmittingConfirm}
                            onClick={() => setIsSubmitConfirmOpen(false)}
                            className="h-10 px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={isSubmittingConfirm}
                            onClick={handleConfirmSubmit}
                            className="h-10 px-6 rounded-xl bg-[#1677FF] hover:bg-[#0958D9] dark:bg-blue-600 dark:hover:bg-blue-500 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmittingConfirm ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <span>OK</span>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
