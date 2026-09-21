import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Printer, Edit3, Eye, ArrowLeft, FileText } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import type {
    Step,
    Sibling,
    FatherDetailsState,
    MotherDetailsState,
    GuardianDetailsState,
    CommunicationDetailsState
} from './types'
import { RegistrationOverview } from './components/RegistrationOverview'
import { StepSidebar } from './components/StepSidebar'
import { Step1ApplicantDetails } from './steps/Step1ApplicantDetails'
import { Step2ParentDetails } from './steps/Step2ParentDetails'
import { Step3GuardianDetails } from './steps/Step3GuardianDetails'
import { Step4CommunicationDetails } from './steps/Step4CommunicationDetails'
import { Step5Declaration } from './steps/Step5Declaration'
import { RegistrationSuccessModal } from './components/RegistrationSuccessModal'
import { useStudentStore } from '@/store/useStudentStore'
import { useAuthStore } from '@/store/useAuthStore'
import type { StudentRecord } from '@/data/mockStudents'

const stepSlugMap: Record<string, number> = {
    'application-details': 1,
    'applicant-details': 1,
    'parent-details': 2,
    'guardian-details': 3,
    'communication-details': 4,
    'declaration': 5,
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
    const { getStudentById, addStudent, updateStudent, students } = useStudentStore()

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
    const isAdminUser = user?.role === 'admin'

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
    // For User mode: all steps are editable by default unless explicitly in view mode (?mode=view)
    const modeParam = searchParams.get('mode')
    const isExplicitView = modeParam === 'view'
    const isReadOnly = !isCreateMode && (
        isExplicitView || (isAdminUser && Boolean(id) && modeParam !== 'edit')
    )
    const mode = isReadOnly ? 'view' : 'edit'

    const [viewMode, setViewMode] = useState<'overview' | 'stepForm'>('overview')
    const [activeStepId, setActiveStepId] = useState<number>(1)

    // Check if coming from Admin section when viewing an existing student record
    const [fromAdmin, setFromAdmin] = useState<boolean>(() => Boolean(id) && isAdminUser)
    const [isStep3Saved, setIsStep3Saved] = useState<boolean>(() => Boolean(id) && !isCreateMode)

    // Editing or newly created student references
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
    const [createdStudentId, setCreatedStudentId] = useState<string | null>(null)

    // Resolved actual student ID for the user's application
    const actualStudentId = (id && id !== 'add' && !isStepSlug(id))
        ? id
        : (editingStudentId || createdStudentId || students[0]?.id || '1001')

    // Success Modal State
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
    const [applicationNo, setApplicationNo] = useState<string>('T25-0003')

    useEffect(() => {
        if (effectiveStepSlug && stepSlugMap[effectiveStepSlug]) {
            const targetStepId = stepSlugMap[effectiveStepSlug]
            setViewMode('stepForm')
            setActiveStepId(targetStepId)
        } else {
            setViewMode('overview')
        }
    }, [location.pathname, effectiveStepSlug])

    // Fetch and populate existing application data when ID is in URL
    useEffect(() => {
        const targetId = id
        if (!targetId || targetId === 'add' || isCreateMode) return

        const student = getStudentById(targetId)
        if (student) {
            setEditingStudentId(student.id)
            setCreatedStudentId(student.id)
            setApplicationNo(student.registrationNumber)

            // Populate all existing form fields directly from fetched record
            setChildName(student.studentName || '')
            setGender(student.gender || '')
            setMotherTongue(student.motherTongue || '')
            setReligion(student.religion || '')
            setCaste(student.caste || '')
            setCommunity(student.community || '')
            setDob(student.date || '')
            setChildGoesToSchool(Boolean(student.playSchool))
            setFather((prev) => ({
                ...prev,
                title: (student as any).fatherTitle || prev.title || '',
                name: student.fatherName || prev.name || '',
                dob: (student as any).fatherDob || prev.dob || '',
                qualification: (student as any).fatherQualification || prev.qualification || '',
                university: (student as any).fatherUniversity || prev.university || '',
                designation: (student as any).fatherDesignation || prev.designation || '',
                mobileNo: student.mobile || prev.mobileNo || '',
                monthlyIncome: student.incomeRange || prev.monthlyIncome || '',
                isAlumnus: student.alumni || false,
            }))
            setMother((prev) => ({
                ...prev,
                title: (student as any).motherTitle || prev.title || '',
                name: student.motherName || prev.name || '',
                dob: (student as any).motherDob || prev.dob || '',
                qualification: (student as any).motherQualification || prev.qualification || '',
                university: (student as any).motherUniversity || prev.university || '',
                mobileNo: (student as any).motherMobile || prev.mobileNo || '',
            }))
            setGuardian((prev) => ({
                ...prev,
                isApplicable: (student as any).guardianApplicable !== undefined ? (student as any).guardianApplicable : false,
                reason: (student as any).guardianReason || prev.reason || '',
                gender: (student as any).guardianGender || prev.gender || '',
                title: (student as any).guardianTitle || prev.title || '',
                name: (student as any).guardianName || prev.name || '',
                mobileNo: (student as any).guardianMobile || prev.mobileNo || '',
                officeAddress: (student as any).guardianAddress || prev.officeAddress || '',
            }))
            setComm((prev) => ({
                ...prev,
                address: student.area && student.city ? `${student.area}, ${student.city}` : (student.area || student.city || ''),
                distanceKm: student.distanceKm || '',
                pincode: (student as any).pincode || prev.pincode || '',
                commuteMode: (student as any).commuteMode || prev.commuteMode || [],
            }))
            setIsDeclared(student.applicationStatus === 'Declared')
            setFromAdmin(isAdminUser)
        } else if (id) {
            toast.error(`Application #${id} not found`)
        }
    }, [id, students, getStudentById, isCreateMode, isAdminUser])

    // Step 1 Form States (Applicant Details) - Empty Initial State
    const [childName, setChildName] = useState('')
    const [dob, setDob] = useState('')
    const [gender, setGender] = useState('')
    const [motherTongue, setMotherTongue] = useState('')
    const [nationality, setNationality] = useState('Indian')
    const [religion, setReligion] = useState('')
    const [caste, setCaste] = useState('')
    const [community, setCommunity] = useState('')
    const [isHealthy, setIsHealthy] = useState<boolean>(true)
    const [majorAilment, setMajorAilment] = useState('')
    const [childGoesToSchool, setChildGoesToSchool] = useState<boolean>(false)
    const [prevSchool, setPrevSchool] = useState('')
    const [hasSiblings, setHasSiblings] = useState<boolean>(false)
    const [siblings, setSiblings] = useState<Sibling[]>([])

    // Step 2 Form States (Parent Details) - Empty Initial State
    const [father, setFather] = useState<FatherDetailsState>({
        title: '',
        initials: '',
        name: '',
        dob: '',
        isAlumnus: false,
        yearsStudied: '',
        classLastStudied: '',
        yearOfLeaving: '',
        branch: '',
        reasonForLeaving: '',
        qualification: '',
        university: '',
        occupation: '',
        employmentCategory: '',
        designation: '',
        companyName: '',
        officeAddress: '',
        monthlyIncome: '',
        phoneOff: '',
        mobileNo: '',
    })

    const [mother, setMother] = useState<MotherDetailsState>({
        title: '',
        initials: '',
        name: '',
        dob: '',
        isAlumnus: false,
        yearsStudied: '',
        classLastStudied: '',
        yearOfLeaving: '',
        branch: '',
        reasonForLeaving: '',
        qualification: '',
        university: '',
        isEmployed: false,
        occupation: '',
        employmentCategory: '',
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
        title: '',
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
        landmark: '',
        distanceKm: '',
        commuteMode: [],
        parentAchievements: '',
        isTransferFromOutside: false,
    })

    // Step 5 Form States (Declaration) - Empty Initial State
    const [declarantType, setDeclarantType] = useState<'Father' | 'Mother' | 'Guardian'>('Father')
    const [isDeclared, setIsDeclared] = useState(false)

    // Step completion statuses calculated directly from actual fetched & saved form data
    const completedStepIds = useMemo(() => {
        const completed: number[] = []

        // Step 1: Application Details (Mandatory: childName, dob, gender, motherTongue, religion, caste, community)
        const isStep1Done = Boolean(
            childName.trim() &&
            dob &&
            gender &&
            motherTongue &&
            religion &&
            caste &&
            community
        )
        if (isStep1Done) completed.push(1)

        // Step 2: Parent Details (Requires Step 1 completed first, plus mandatory parent fields)
        const isStep2Done = Boolean(
            isStep1Done &&
            father.title &&
            father.name.trim() &&
            father.dob &&
            father.qualification.trim() &&
            father.university.trim() &&
            father.designation.trim() &&
            father.monthlyIncome &&
            father.mobileNo.trim() &&
            mother.title &&
            mother.name.trim() &&
            mother.dob &&
            mother.qualification.trim() &&
            mother.university.trim() &&
            mother.mobileNo.trim()
        )
        if (isStep2Done) completed.push(2)

        // Step 3: Guardian Details (Requires Step 1 and Step 2 completed first)
        // If applicable: mandatory guardian fields must be filled
        // If not applicable: must have been explicitly confirmed/saved (or existing declared record)
        const isGuardianFilled = Boolean(
            guardian.reason.trim() &&
            guardian.gender &&
            guardian.title &&
            guardian.name.trim() &&
            guardian.mobileNo.trim() &&
            guardian.officeAddress.trim()
        )
        const isStep3Done = Boolean(
            isStep1Done &&
            isStep2Done &&
            (
                (guardian.isApplicable && isGuardianFilled) ||
                (!guardian.isApplicable && (isStep3Saved || (Boolean(id) && !isCreateMode) || isDeclared))
            )
        )
        if (isStep3Done) completed.push(3)

        // Step 4: Communication and Other Details (Requires Step 3 completed first, plus mandatory fields)
        const isStep4Done = Boolean(
            isStep3Done &&
            comm.address.trim() &&
            comm.pincode.trim() &&
            comm.distanceKm &&
            comm.commuteMode &&
            comm.commuteMode.length > 0
        )
        if (isStep4Done) completed.push(4)

        // Step 5: Declaration (Must be declared and all previous required steps completed)
        const isStep5Done = Boolean(
            isDeclared &&
            isStep1Done &&
            isStep2Done &&
            isStep3Done &&
            isStep4Done
        )
        if (isStep5Done) completed.push(5)

        return completed
    }, [
        childName, dob, gender, motherTongue, religion, caste, community,
        father, mother,
        guardian,
        comm,
        isDeclared,
        isStep3Saved,
        id,
        isCreateMode
    ])

    const rawSteps: Omit<Step, 'status'>[] = [
        { id: 1, title: 'Application Details' },
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
    const isRegistrationComplete = completedCount === 5

    const handleBackNavigation = () => {
        if (!isAdminUser) {
            navigate('/admission')
            return
        }
        if (id) {
            navigate(`/admission/${id}?mode=${mode}`)
        } else if (isCreateMode) {
            if (viewMode === 'stepForm') {
                navigate('/admission/add')
            } else {
                navigate('/admin/students')
            }
        } else if (fromAdmin) {
            navigate('/admin/students')
        } else {
            navigate('/admission')
        }
    }

    const handleStepClick = (stepId: number) => {
        if (stepId > 1 && !fromAdmin && !isRegistrationComplete) {
            const isPrevDone = stepId === 1 || completedStepIds.includes(stepId - 1)
            if (!isPrevDone) {
                toast.error(`Please complete Step ${stepId - 1} first before proceeding to Step ${stepId}`)
                return
            }
        }
        setActiveStepId(stepId)
        setViewMode('stepForm')
        const slug = stepIdToSlug[stepId]
        if (slug) {
            if (isAdminUser && id) {
                navigate(`/admission/${slug}/${id}?mode=${mode}`)
            } else if (isCreateMode) {
                navigate(`/admission/${slug}/add`)
            } else {
                navigate(`/admission/${slug}`)
            }
        }
    }

    const handleOpenApplicationDetails = () => {
        navigate(`/admission/application-details/${actualStudentId}?mode=view`)
    }

    const saveStudentRecord = (forceCreateNew = false) => {
        const addressParts = (comm.address || '').split(',').map((p) => p.trim()).filter(Boolean)
        const detectedCity = addressParts.length > 1 ? addressParts[addressParts.length - 1] : 'Chennai'
        const detectedArea = addressParts.length > 1 ? addressParts[0] : (comm.address?.trim() || 'T.Nagar')

        const payload: Partial<StudentRecord> & Record<string, any> = {
            studentName: childName.trim() || 'New Applicant',
            gender: (gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
            motherTongue: motherTongue || 'Tamil',
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
            guardianAddress: guardian.officeAddress,
            mobile: father.mobileNo || mother.mobileNo || guardian.mobileNo || '9876543210',
            city: detectedCity,
            area: detectedArea,
            distanceKm: comm.distanceKm || '< 2 KM',
            pincode: comm.pincode,
            commuteMode: comm.commuteMode,
            incomeRange: father.monthlyIncome || mother.monthlyIncome || guardian.monthlyIncome || '10-15 Lakhs',
            religion: religion || 'Hindu',
            caste: caste || '',
            community: community || 'FC',
            alumni: Boolean(father.isAlumnus || mother.isAlumnus),
            siblingsStudying: Boolean(hasSiblings && siblings.length > 0),
            applicationStatus: isDeclared ? 'Declared' : 'Pending',
            playSchool: Boolean(childGoesToSchool),
            status1: true,
            status2: true,
        }

        const currentTargetId = id || editingStudentId || (!isAdminUser ? actualStudentId : null)
        if (currentTargetId && !forceCreateNew) {
            const updated = updateStudent(currentTargetId, payload)
            if (updated) {
                setApplicationNo(updated.registrationNumber)
                setCreatedStudentId(updated.id)
                toast.success(`Application #${updated.id} (${updated.registrationNumber}) updated successfully!`)
                return updated
            }
        }

        const created = addStudent(payload)
        setApplicationNo(created.registrationNumber)
        setCreatedStudentId(created.id)
        setEditingStudentId(created.id)
        toast.success(`Application created: ID #${created.id} (${created.registrationNumber})`)
        return created
    }

    const handleSaveAndNext = (currentStepId: number) => {
        if (isReadOnly) {
            if (currentStepId < 5) {
                const nextSlug = stepIdToSlug[currentStepId + 1]
                if (id) {
                    navigate(`/admission/${nextSlug}/${id}?mode=view`)
                } else if (isCreateMode) {
                    navigate(`/admission/${nextSlug}/add`)
                } else {
                    navigate(`/admission/${nextSlug}`)
                }
            } else {
                if (!isAdminUser) {
                    navigate('/admission')
                } else if (id) {
                    navigate(`/admission/${id}?mode=view`)
                } else {
                    navigate('/admin/students')
                }
            }
            return
        }

        // In Create Mode: intermediate steps (1-4) should NOT create a record in the Master list yet
        if (!isCreateMode && (id || editingStudentId)) {
            saveStudentRecord()
        }

        if (currentStepId === 3) {
            setIsStep3Saved(true)
        }

        toast.success(`${rawSteps[currentStepId - 1].title} saved successfully!`)
        if (currentStepId < 5) {
            const nextSlug = stepIdToSlug[currentStepId + 1]
            if (id) {
                navigate(`/admission/${nextSlug}/${id}?mode=edit`)
            } else if (isCreateMode) {
                navigate(`/admission/${nextSlug}/add`)
            } else {
                navigate(`/admission/${nextSlug}`)
            }
        } else {
            // Final submission on step 5 (Accept & Submit)
            // const saved = saveStudentRecord(isCreateMode)
            toast.success('All registration steps completed and submitted!')
            setIsSuccessModalOpen(true)
        }
    }

    const handleSaveAndExit = () => {
        if (!isReadOnly && !isCreateMode && (id || editingStudentId)) {
            saveStudentRecord()
        }
        if (activeStepId === 3) {
            setIsStep3Saved(true)
        }
        if (!isAdminUser) {
            navigate('/admission')
            return
        }
        if (id) {
            navigate(`/admission/${id}?mode=${mode}`)
        } else if (isCreateMode) {
            navigate('/admission/add')
        } else {
            setViewMode('overview')
        }
    }

    const handleCompleteAll = () => {
        setFather((prev) => ({
            ...prev,
            title: prev.title || 'Mr.',
            name: prev.name || 'Roopan S',
            dob: prev.dob || '1985-05-15',
            qualification: prev.qualification || 'B.Tech',
            university: prev.university || 'Anna University',
            designation: prev.designation || 'Software Engineer',
            monthlyIncome: prev.monthlyIncome || '10-15 Lakhs',
            mobileNo: prev.mobileNo || '9876543210',
        }))
        setMother((prev) => ({
            ...prev,
            title: prev.title || 'Mrs.',
            name: prev.name || 'Deepa R',
            dob: prev.dob || '1988-08-20',
            qualification: prev.qualification || 'M.Sc',
            university: prev.university || 'Madras University',
            mobileNo: prev.mobileNo || '9876543211',
        }))
        setComm((prev) => ({
            ...prev,
            address: prev.address || 'T.Nagar, Chennai',
            pincode: prev.pincode || '600017',
            distanceKm: prev.distanceKm || '< 2 KM',
            commuteMode: prev.commuteMode && prev.commuteMode.length > 0 ? prev.commuteMode : ['Car'],
        }))
        setIsDeclared(true)
        setIsStep3Saved(true)

        // For Create Mode or standard mode, final completion creates/saves the record
        // const saved = saveStudentRecord(isCreateMode)
        setIsSuccessModalOpen(true)
        toast.success('All 5 registration steps completed!')
    }

    const handleReset = () => {
        setActiveStepId(1)
        setIsDeclared(false)
        setIsSuccessModalOpen(false)
        setIsStep3Saved(false)

        // Clear all fields
        setChildName('')
        setDob('')
        setGender('')
        setMotherTongue('')
        setReligion('')
        setCaste('')
        setCommunity('')
        setIsHealthy(true)
        setMajorAilment('')
        setChildGoesToSchool(false)
        setPrevSchool('')
        setHasSiblings(false)
        setSiblings([])

        setFather({
            title: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', qualification: '',
            university: '', occupation: '', employmentCategory: '', designation: '', companyName: '',
            officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
        })

        setMother({
            title: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', qualification: '',
            university: '', isEmployed: false, occupation: '', employmentCategory: '', designation: '',
            companyName: '', officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
        })

        setGuardian({
            isApplicable: false, reason: '', gender: '', title: '', initials: '', name: '',
            isEmployed: false, occupation: '', companyName: '', monthlyIncome: '', officeAddress: '',
            phoneOff: '', phoneRes: '', mobileNo: ''
        })

        setComm({
            address: '', pincode: '', residencePhone: '', landmark: '', distanceKm: '',
            commuteMode: [], parentAchievements: '', isTransferFromOutside: false
        })

        toast.info('Registration form reset completely.')
    }

    const handlePrintTrackSheet = () => {
        if (!isRegistrationComplete) {
            toast.error('Registration must be completed before printing Track Sheet.')
            return
        }
        toast.success('Printing Track Sheet...')
        window.print()
    }

    const handlePrintRegistrationForm = () => {
        if (!isRegistrationComplete) {
            toast.error('All required registration steps must be completed before printing.')
            return
        }
        toast.success('Printing Registration Form...')
        window.print()
    }

    const addSibling = () => {
        setSiblings((prev) => [
            ...prev,
            { name: '', school: 'PSBB', leftStudent: 'No', usn: '', classSec: '', yearLeaving: '' }
        ])
    }

    const removeSibling = (index: number) => {
        setSiblings((prev) => prev.filter((_, i) => i !== index))
    }

    const updateSibling = (index: number, key: keyof Sibling, val: string) => {
        setSiblings((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [key]: val } : item))
        )
    }

    return (
        <div className="space-y-6 mx-auto pb-10">

            {/* Mode Banner when in Create Mode */}
            {isAdminUser && isCreateMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/students')}
                            className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Student Master</span>
                        </button>
                        <span className="px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                            ✨ New Application
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Creating new admission application {childName ? `• ${childName}` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {viewMode === 'overview' && (
                            <button
                                type="button"
                                onClick={() => navigate('/admission/application-details/add')}
                                className="h-8 px-3 rounded-lg text-xs font-bold bg-[#1677FF] hover:bg-[#0958D9] text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
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
                        {(fromAdmin || id) && (
                            <button
                                type="button"
                                onClick={() => navigate('/admin/students')}
                                className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Student Master</span>
                            </button>
                        )}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider ${isReadOnly
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                            }`}>
                            {isReadOnly ? '👁️ View Mode (Read-Only)' : '✏️ Edit Mode'}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Application ID: <strong className="text-slate-900 dark:text-white">#{id}</strong> ({applicationNo}) {childName ? `• ${childName}` : ''}
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
                                        navigate(`/admission/${effectiveStepSlug}/${id}?mode=edit`)
                                    } else {
                                        navigate(`/admission/${id}?mode=edit`)
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
                                        navigate(`/admission/${effectiveStepSlug}/${id}?mode=view`)
                                    } else {
                                        navigate(`/admission/${id}?mode=view`)
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
                <RegistrationOverview
                    steps={steps}
                    completedCount={completedCount}
                    isRegistrationComplete={isRegistrationComplete}
                    activeStepId={activeStepId}
                    completedStepIds={completedStepIds}
                    isFromAdmin={fromAdmin}
                    isAdminUser={isAdminUser}
                    onStepClick={handleStepClick}
                    onCompleteAll={handleCompleteAll}
                    onReset={handleReset}
                    onPrintTrackSheet={handlePrintTrackSheet}
                    onPrintRegistrationForm={handlePrintRegistrationForm}
                    onOpenSuccessModal={() => setIsSuccessModalOpen(true)}
                    onViewApplicationDetails={handleOpenApplicationDetails}
                />
            )}

            {/* MODE 2: SEPARATE STEP FORM SCREEN */}
            {viewMode === 'stepForm' && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                        {/* Left Steps Progress Sidebar */}
                        <div className="lg:col-span-3">
                            <StepSidebar
                                steps={steps}
                                activeStepId={activeStepId}
                                completedStepIds={completedStepIds}
                                onBackToDashboard={handleBackNavigation}
                                backLabel={!isAdminUser ? "Back to Admission" : (id || isCreateMode ? "Back to Admission Overview" : fromAdmin ? "Back to Student Master" : "Back to Dashboard")}
                                onStepSelect={handleStepClick}
                                isFromAdmin={fromAdmin}
                            />
                        </div>

                        {/* Right Step Form Workspace */}
                        <div className="lg:col-span-9 space-y-5">
                            <h1 className="text-lg font-bold text-[#0F294A] dark:text-white">{steps[activeStepId - 1].title}</h1>

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
                                    nationality={nationality}
                                    setNationality={setNationality}
                                    religion={religion}
                                    setReligion={setReligion}
                                    caste={caste}
                                    setCaste={setCaste}
                                    community={community}
                                    setCommunity={setCommunity}
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
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(1)}
                                    isReadOnly={isReadOnly}
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
                                            title: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
                                            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', qualification: '',
                                            university: '', occupation: '', employmentCategory: '', designation: '', companyName: '',
                                            officeAddress: '', monthlyIncome: '', phoneOff: '', mobileNo: ''
                                        })
                                        setMother({
                                            title: '', initials: '', name: '', dob: '', isAlumnus: false, yearsStudied: '',
                                            classLastStudied: '', yearOfLeaving: '', branch: '', reasonForLeaving: '', qualification: '',
                                            university: '', isEmployed: false, occupation: '', employmentCategory: '', designation: '',
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
                                            isApplicable: false, reason: '', gender: '', title: '', initials: '', name: '',
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
                                            address: '', pincode: '', residencePhone: '', landmark: '', distanceKm: '',
                                            commuteMode: [], parentAchievements: '', isTransferFromOutside: false
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
                                    isDeclared={isDeclared}
                                    setIsDeclared={setIsDeclared}
                                    onSaveAndExit={handleSaveAndExit}
                                    onSaveAndNext={() => handleSaveAndNext(5)}
                                    isReadOnly={isReadOnly}
                                    onBackToMaster={handleBackNavigation}
                                    onPrint={handlePrintRegistrationForm}
                                    backLabel={isAdminUser ? "Back to Student Master" : "Back to Admission"}
                                />
                            )}

                        </div>
                    </div>
                </div>
            )}


            {/* REGISTRATION SUCCESS DETAILS MODAL */}
            <RegistrationSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false)
                    if (!isAdminUser) {
                        navigate('/admission')
                    } else if (createdStudentId) {
                        navigate(`/admission/${createdStudentId}?mode=view`)
                    } else {
                        navigate('/admin/students')
                    }
                }}
                onPrintTrackSheet={handlePrintTrackSheet}
                registrationNo={applicationNo}
                studentId={createdStudentId || undefined}
                onViewDetails={(newId) => navigate(`/admission/application-details/${newId}`)}
                submissionDate="14/09/2025"
                timings="9:00 AM - 11:00 AM"
                isAdminUser={isAdminUser}
            />

        </div>
    )
}