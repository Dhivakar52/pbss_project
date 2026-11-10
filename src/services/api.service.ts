import axiosClient from './axiosClient'

export { axiosClient }
export const apiClient = axiosClient

const BASE_URL = '/api'

const normalizeDateForApi = (value?: string): string | undefined => {
  if (value == null || value.trim() === '') return value

  const trimmed = value.trim()
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/.exec(trimmed)
  const dayFirstMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed)
  if (!isoMatch && !dayFirstMatch) {
    throw new Error(`Invalid date format: ${value}. Expected YYYY-MM-DD or DD/MM/YYYY.`)
  }

  const toIsoDate = (year: number, month: number, day: number): string | undefined => {
    const date = new Date(Date.UTC(year, month - 1, day))
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return undefined

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  if (isoMatch) {
    const isoDate = toIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]))
    if (isoDate) return isoDate
  } else if (dayFirstMatch) {
    const year = Number(dayFirstMatch[3])
    const dayFirstDate = toIsoDate(year, Number(dayFirstMatch[2]), Number(dayFirstMatch[1]))
    const monthFirstDate = toIsoDate(year, Number(dayFirstMatch[1]), Number(dayFirstMatch[2]))
    if (dayFirstDate || monthFirstDate) return dayFirstDate || monthFirstDate
  }

  throw new Error(`Invalid date: ${value}`)
}

const normalizeDateFields = (
  records: Record<string, unknown>[] | null | undefined,
  fields: readonly string[],
): Record<string, unknown>[] | null | undefined => {
  if (!Array.isArray(records)) return records

  return records.map((record) => {
    if (!record || typeof record !== 'object') return record

    const normalizedRecord: Record<string, unknown> = { ...record }
    for (const field of fields) {
      const value = normalizedRecord[field]
      if (typeof value === 'string') {
        normalizedRecord[field] = normalizeDateForApi(value)
      }
    }

    return normalizedRecord
  })
}


export interface ChartRecord {
  TotalRowCount: number
  SNo: number
  ApplicantID: number
  ApplicationNo: string | null
  ChildName: string
  FatherName: string | null
  FatherEducational: string | null
  FatherDesignation: string | null
  FatherNoYearsStudied: number | null
  FatherIncome: string | null
  MotherName: string | null
  MotherEducational: string | null
  MotherDesignation: string | null
  MotherNoYearsStudied: number | null
  MotherIncome: string | null
  Distance: string | null
  TransportMode: string | null
}

export interface VerificationRecord {
  TotalRowCount: number
  AppDeclaredID: number
  ApplicantID: number
  ApplicationNo: string | null
  StudentName: string
  School: string
  TrackSheetStatus: 'Yes' | 'No'
  CertificateSubmissionStatus: 'Yes' | 'No'
}

export interface ConfirmationRecord {
  TotalRowCount: number
  AppDeclaredID: number
  ApplicantID: number
  ApplicationNo: string | null
  StudentName: string
  School: string
  ApprovalStatus: 'Yes' | 'No'
}

export interface SubmissionTimeRangeRecord {
  TotalRowCount?: number
  SubmissionTimeRangeID?: number
  AcademicYear?: string
  School?: string
  ApplicationNoRangeFrom?: number
  ApplicationNoRangeTo?: number
  TracksheetSubmissionDate?: string
  Timings?: string
  Date?: string
  Time?: string
  [key: string]: any
}

export interface HomeContentsRecord {
  SchoolNameContent: string
  UpperContent: string
  LowerContent: string
  HomePageTime: string
  ApplicationPageUpperContent: string
  ApplicationPageLowerContent: string
  FooterContent: string
}

export interface ApplicationSectionRecord {
  ApplicationSectionID: number
  AppSectionName?: string
  SectionPath?: string | null
  Descriptions?: string | null
}

export class ApiService {
  /**
   * Helper to perform GET requests using configured Axios client
   */
  private static async get<T>(url: string): Promise<T | null> {
    try {
      const response = await axiosClient.get<T>(url)
      return response.data
    } catch (err) {
      console.warn(`GET ${url} failed:`, err)
      return null
    }
  }

  /**
   * Helper to safely extract an array from response data
   */
  private static parseArray<T>(res: any): T[] {
    if (Array.isArray(res)) return res
    if (typeof res === 'string') {
      try {
        const parsed = JSON.parse(res)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    if (res && Array.isArray(res.value)) return res.value
    if (res && Array.isArray(res.data)) return res.data
    return []
  }

  /**
   * Helper to perform POST requests using configured Axios client
   */
  private static async post<T>(url: string, body: any): Promise<T | null> {
    try {
      const response = await axiosClient.post<T>(url, body)
      return response.data
    } catch (err) {
      console.warn(`POST ${url} failed:`, err)
      return null
    }
  }

  /**
   * Helper to perform PUT requests using configured Axios client
   */
  private static async put<T>(url: string, body: any): Promise<T | null> {
    try {
      const response = await axiosClient.put<T>(url, body)
      return response.data
    } catch (err) {
      console.warn(`PUT ${url} failed:`, err)
      return null
    }
  }


  // 1. Dashboard Charts (App.ProcGenerateCharts)
  static async fetchDashboardCharts(
    academicYearId?: number,
    branchId?: number,
    statusId?: number
  ): Promise<ChartRecord[] | null> {
    const params = new URLSearchParams()
    if (academicYearId) params.append('academicYearID', String(academicYearId))
    if (branchId) params.append('branchID', String(branchId))
    if (statusId) params.append('applicationStatusID', String(statusId))

    const url = `${BASE_URL}/generatecharts${params.toString() ? '?' + params.toString() : ''}`
    const res = await this.get<any>(url)
    return this.parseArray<ChartRecord>(res)
  }

  // 2. Admin Reports (All 13 report SPs)
  static async fetchReport(
    reportType: string,
    filters?: Record<string, any>
  ): Promise<any[] | null> {
    const params = new URLSearchParams()
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      }
    }

    const cleanType = reportType.toLowerCase().replace(/[^a-z0-9]/g, '')
    let endpoint = `${BASE_URL}/report/${encodeURIComponent(reportType)}`
    if (cleanType === 'applicant' || cleanType === 'applicantreport') {
      endpoint = `${BASE_URL}/applicantreport`
    } else if (cleanType === 'generalcastewise' || cleanType === 'generalcastewisereport') {
      endpoint = `${BASE_URL}/generalcastewisereport`
    } else if (cleanType === 'userloghistory' || cleanType === 'userloghistoryreports') {
      endpoint = `${BASE_URL}/UserlogHistoryReports`
    }

    const url = `${endpoint}${params.toString() ? '?' + params.toString() : ''}`
    const res = await this.get<any>(url)
    return this.parseArray<any>(res)
  }

  // 3. Application Verification (App.ProcFetchApplicationVerification & App.ProcSaveApplicationVerification)
  static async fetchVerification(options?: {
    academicYearId?: number
    branchId?: number
    schoolId?: number
    appNoFrom?: number
    appNoTo?: number
    searchText?: string
  } | string): Promise<any> {
    const params = new URLSearchParams()
    if (typeof options === 'string') {
      params.append('searchText', options)
    } else if (options) {
      if (options.academicYearId !== undefined && options.academicYearId !== null) {
        params.append('academicYearID', String(options.academicYearId))
      }
      const schoolId = options.schoolId ?? options.branchId
      if (schoolId !== undefined && schoolId !== null) {
        params.append('schoolID', String(schoolId))
      }
      if (options.appNoFrom !== undefined && options.appNoFrom !== null) {
        params.append('appNoFrom', String(options.appNoFrom))
      }
      if (options.appNoTo !== undefined && options.appNoTo !== null) {
        params.append('appNoTo', String(options.appNoTo))
      }
      if (options.searchText) params.append('searchText', options.searchText)
    }
    params.append('pageNo', '1')
    params.append('recordCount', '100')
    const url = `${BASE_URL}/applicationverification${params.toString() ? '?' + params.toString() : ''}`
    const res = await this.get<any>(url)
    return this.parseArray<VerificationRecord>(res)
  }

  static async saveVerification(
    payloadOrAppDeclaredId: number | any[],
    isTrackSheetSubmitted?: boolean,
    isCertificatesSubmitted?: boolean
  ): Promise<boolean> {
    const list = Array.isArray(payloadOrAppDeclaredId)
      ? payloadOrAppDeclaredId
      : [
          {
            AppDeclaredID: payloadOrAppDeclaredId,
            IsTrackSheetSubmitted: !!isTrackSheetSubmitted,
            IsCertificatesSubmitted: !!isCertificatesSubmitted,
            UpdatedBy: 1,
          },
        ]

    let allSuccess = true
    for (const item of list) {
      const model = {
        appDeclaredID: item.AppDeclaredID ?? item.appDeclaredID ?? item.ApplicantID ?? item.applicantID,
        applicantID: item.ApplicantID ?? item.applicantID ?? null,
        isTrackSheetSubmitted: !!(item.IsTrackSheetSubmitted ?? item.isTrackSheetSubmitted ?? item.IsTrackSheetVerified),
        isCertificatesSubmitted: !!(item.IsCertificatesSubmitted ?? item.isCertificatesSubmitted ?? item.IsCertificatesVerified),
        updatedBy: item.UpdatedBy ?? item.updatedBy ?? 1,
        submittedBy: 1,
      }
      const res = await this.post<any>(`${BASE_URL}/applicationverification`, model)
      if (res === null) allSuccess = false
    }
    return allSuccess
  }

  // 4. Application Confirmation (App.ProcFetchApplicationConfirmation & App.ProcSaveApplicationConfirmation)
  static async fetchConfirmation(options?: {
    academicYearId?: number
    branchId?: number
    schoolId?: number
    appNoFrom?: number
    appNoTo?: number
    searchText?: string
  } | string): Promise<any> {
    const params = new URLSearchParams()
    if (typeof options === 'string') {
      params.append('searchText', options)
    } else if (options) {
      if (options.academicYearId !== undefined && options.academicYearId !== null) {
        params.append('academicYearID', String(options.academicYearId))
      }
      const schoolId = options.schoolId ?? options.branchId
      if (schoolId !== undefined && schoolId !== null) {
        params.append('schoolID', String(schoolId))
      }
      if (options.appNoFrom !== undefined && options.appNoFrom !== null) {
        params.append('appNoFrom', String(options.appNoFrom))
      }
      if (options.appNoTo !== undefined && options.appNoTo !== null) {
        params.append('appNoTo', String(options.appNoTo))
      }
      if (options.searchText) params.append('searchText', options.searchText)
    }
    params.append('pageNo', '1')
    params.append('recordCount', '100')
    const url = `${BASE_URL}/applicationconfirmation${params.toString() ? '?' + params.toString() : ''}`
    const res = await this.get<any>(url)
    return this.parseArray<ConfirmationRecord>(res)
  }

  static async saveConfirmation(
    payloadOrAppDeclaredId: number | any[],
    isAdmissionApproved?: boolean
  ): Promise<boolean> {
    const list = Array.isArray(payloadOrAppDeclaredId)
      ? payloadOrAppDeclaredId
      : [
          {
            AppDeclaredID: payloadOrAppDeclaredId,
            IsAdmissionApproved: !!isAdmissionApproved,
            UpdatedBy: 1,
          },
        ]

    let allSuccess = true
    for (const item of list) {
      const model = {
        appDeclaredID: item.AppDeclaredID ?? item.appDeclaredID ?? item.ApplicantID ?? item.applicantID,
        applicantID: item.ApplicantID ?? item.applicantID ?? null,
        isAdmissionApproved: !!(item.IsAdmissionApproved ?? item.isAdmissionApproved),
        updatedBy: item.UpdatedBy ?? item.updatedBy ?? 1,
        submittedBy: 1,
      }
      const res = await this.post<any>(`${BASE_URL}/applicationconfirmation`, model)
      if (res === null) allSuccess = false
    }
    return allSuccess
  }

  // Applicant event listener for notifying store/UI of loaded applicant records
  private static applicantLoadedListeners: Array<(userName: string, record: any) => void> = []

  static onApplicantLoaded(listener: (userName: string, record: any) => void): () => void {
    this.applicantLoadedListeners.push(listener)
    return () => {
      this.applicantLoadedListeners = this.applicantLoadedListeners.filter((l) => l !== listener)
    }
  }

  // 5. Multi-Step Applicant (App.ProcFetchApplicant & App.ProcSaveApplicant)
  static async fetchApplicant(params?: { applicantId?: number; userId?: number } | number): Promise<any | null> {
    const q = new URLSearchParams()
    if (typeof params === 'number') {
      q.append('applicantId', String(params))
    } else if (params) {
      if (params.applicantId !== undefined && params.applicantId !== null) q.append('applicantId', String(params.applicantId))
      if (params.userId !== undefined && params.userId !== null) q.append('userId', String(params.userId))
    }
    const url = `${BASE_URL}/FetchApplicant${q.toString() ? '?' + q.toString() : ''}`
    const res = await this.get<any>(url)
    const list = this.parseArray<any>(res)

    // Extract UserName from the first response array item and notify listeners
    if (Array.isArray(list) && list.length > 0) {
      const firstItem = list[0]
      const rawUserName = firstItem?.UserName ?? firstItem?.userName
      if (typeof rawUserName === 'string' && rawUserName.trim()) {
        const cleanUserName = rawUserName.trim()
        this.applicantLoadedListeners.forEach((listener) => {
          try {
            listener(cleanUserName, firstItem)
          } catch (err) {
            console.warn('Error in onApplicantLoaded listener:', err)
          }
        })
      }
    }

    return list
  }

  static async saveApplicantSection(
    sectionId: number,
    payload: any,
    _recordType: number = 1
  ): Promise<{ success: boolean; returnVal: number }> {
    const applicantId = Number(payload.applicantID ?? payload.ApplicantID ?? 0)
    const userId = Number(payload.userID ?? payload.UserID ?? payload.SubmittedBy ?? payload.submittedBy ?? 1)
    const recordType = Number(payload.recordType ?? payload.RecordType ?? _recordType)
    const applicationSectionId = Number(payload.applicationSectionID ?? payload.ApplicationSectionID ?? sectionId)

    const body = {
      applicantID: applicantId,
      userID: userId,
      updatedBy: Number(payload.updatedBy ?? payload.UpdatedBy ?? userId),
      createdBy: Number(payload.createdBy ?? payload.CreatedBy ?? userId),
      applicationSectionID: applicationSectionId,
      recordType: recordType,
      applicant: normalizeDateFields(
        payload.applicant ?? payload.Applicant ?? [],
        ['childDOB', 'ChildDOB'],
      ),
      siblings: payload.siblings ?? payload.Siblings ?? [],
      father: normalizeDateFields(payload.father ?? payload.Father ?? [], ['dateOfBirth', 'dob', 'DateOfBirth', 'DOB']),
      mother: normalizeDateFields(payload.mother ?? payload.Mother ?? [], ['dateOfBirth', 'dob', 'DateOfBirth', 'DOB']),
      guardian: normalizeDateFields(payload.guardian ?? payload.Guardian ?? [], ['dateOfBirth', 'dob', 'DateOfBirth', 'DOB']),
      communication: payload.communication ?? payload.Communication ?? [],
      declaration: payload.declaration ?? payload.Declaration ?? [],
    }

    const url = recordType === 2
      ? `${BASE_URL}/UpdateApplicant/${encodeURIComponent(applicantId)}?sectionId=${encodeURIComponent(sectionId)}`
      : `${BASE_URL}/SaveApplicant?sectionId=${encodeURIComponent(sectionId)}`
    const res = recordType === 2
      ? applicantId > 0
        ? await this.put<any>(url, body)
        : null
      : await this.post<any>(url, body)
    let returnVal = -1
    if (typeof res === 'number') {
      returnVal = res
    } else if (res && typeof res.returnVal === 'number') {
      returnVal = res.returnVal
    } else if (res && typeof res.applicantId === 'number') {
      returnVal = res.applicantId
    } else if (typeof res === 'string' && !isNaN(Number(res))) {
      returnVal = Number(res)
    }

    return {
      success: returnVal > 0 || (res?.success ?? false),
      returnVal,
    }
  }

  // 6. Registration Form & Track Sheet (App.ProcGenerateRegistrationForm & App.ProcGenerateTrackSheet)
  static async generateRegistrationForm(userId: number | string, useV2 = false): Promise<any | null> {
    const versionQuery = useV2 ? '?useV2=true' : ''
    return await this.get<any>(
      `${BASE_URL}/applicant/registrationform/${encodeURIComponent(userId)}${versionQuery}`,
    )
  }

  static async generateTrackSheet(userId: number | string, useV2 = false): Promise<any | null> {
    const versionQuery = useV2 ? '?useV2=true' : ''
    return await this.get<any>(
      `${BASE_URL}/applicant/tracksheet/${encodeURIComponent(userId)}${versionQuery}`,
    )
  }

  // 7. Declaration & Home Content (App.ProcFetchDeclarationContent & Master.ProcFetchHomeContents)
  static async fetchDeclarationContent(appDeclaredId: number): Promise<any | null> {
    return await this.get<any>(`${BASE_URL}/applicant/declaration-content/${appDeclaredId}`)
  }

  static async fetchHomeContents(): Promise<HomeContentsRecord | null> {
    const res = await this.get<any>(`${BASE_URL}/master/homecontents`)
    const arr = this.parseArray<HomeContentsRecord>(res)
    return arr && arr.length > 0 ? arr[0] : (res?.value?.[0] || res || null)
  }

  static async getApplicationSections(): Promise<ApplicationSectionRecord[]> {
    const url = `${BASE_URL}/master/applicationsection`
    try {
      const response = await axiosClient.get<any>(url)
      return this.parseArray<ApplicationSectionRecord>(response.data)
    } catch (error) {
      console.error(`GET ${url} failed:`, error)
      throw error
    }
  }

  static async fetchSubmissionTimeRange(schoolId?: number): Promise<SubmissionTimeRangeRecord[]> {
    const url = schoolId
      ? `${BASE_URL}/applicant/submission-timerange?schoolId=${schoolId}`
      : `${BASE_URL}/applicant/submission-timerange`
    const res = await this.get<any>(url)
    return this.parseArray<SubmissionTimeRangeRecord>(res)
  }

  static async generateInstruction(): Promise<string> {
    const url = `${BASE_URL}/master/instruction`
    try {
      const response = await axiosClient.get<string>(url, { responseType: 'text' })
      if (typeof response.data !== 'string' || response.data.trim() === '') {
        throw new Error('The instruction API returned empty or invalid HTML.')
      }
      return response.data
    } catch (error) {
      console.error(`GET ${url} failed:`, error)
      throw error
    }
  }

  // 8. User Registration & Password Reset (User.ProcSaveUsers & User.ProcSaveNewPassword)
  static async registerUser(payload: {
    userName?: string
    fullName?: string | null
    email: string
    password: string
    dob?: string
  }): Promise<{ success: boolean; userId?: number; message?: string }> {
    try {
      const response = await axiosClient.post(`${BASE_URL}/user/register`, {
        ...payload,
        dob: normalizeDateForApi(payload.dob),
      })
      return response.data || { success: false }
    } catch (err: any) {
      const data = err.response?.data
      return {
        success: false,
        message: data?.message || data?.error || err?.message || 'Registration failed or user ID already exists.',
      }
    }
  }

  static async checkRegistrationAvailability(payload: {
    userName: string
    email: string
  }): Promise<{ emailAvailable: boolean; userNameAvailable: boolean; message?: string }> {
    const response = await axiosClient.post(`${BASE_URL}/user/checkregistrationavailability`, {
      userName: payload.userName,
      email: payload.email,
    })
    let data: unknown = response.data
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    if (!data || typeof data !== 'object') {
      throw new Error('The server returned an invalid availability response.')
    }
    const result = data as Record<string, unknown>
    return {
      emailAvailable: result.emailAvailable === true || result.EmailAvailable === true,
      userNameAvailable: result.userNameAvailable === true || result.UserNameAvailable === true,
      message: typeof result.message === 'string' ? result.message : undefined,
    }
  }

  static async verifyPasswordReset(payload: {
    userName: string
    dob: string
  }): Promise<{ ResponseCode?: number; Message?: string }> {
    try {
      const response = await axiosClient.post(`${BASE_URL}/user/verifypasswordreset`, {
        userName: payload.userName,
        dob: normalizeDateForApi(payload.dob),
      })
      return this.parsePasswordResetResponse(response.data)
    } catch (error: any) {
      const data = error.response?.data
      return this.parsePasswordResetResponse(data ?? {
        ResponseCode: -1,
        Message: error.message || 'Unable to verify your details right now. Please try again.',
      })
    }
  }

  static async resetPassword(payload: {
    userName?: string
    email?: string
    newPassword: string
    dob?: string
  }): Promise<{ ResponseCode?: number; Message?: string } | null> {
    const body = {
      userName: payload.userName || payload.email || '',
      newPassword: payload.newPassword,
      dob: normalizeDateForApi(payload.dob),
    }
    try {
      const response = await axiosClient.post(`${BASE_URL}/user/resetpassword`, body)
      return this.parsePasswordResetResponse(response.data)
    } catch (error: any) {
      const data = error.response?.data
      return this.parsePasswordResetResponse(data ?? {
        ResponseCode: -1,
        Message: error.message || 'Network error occurred while resetting password.',
      })
    }
  }

  private static parsePasswordResetResponse(data: unknown): { ResponseCode?: number; Message?: string } {
    let payload = data
    if (typeof payload === 'string') {
      const responseText = payload
      try {
        payload = JSON.parse(payload)
      } catch {
        return { ResponseCode: -1, Message: responseText || 'The server returned an invalid response.' }
      }
    }
    if (!payload || typeof payload !== 'object') {
      return { ResponseCode: -1, Message: 'The server returned an invalid response.' }
    }
    const record = payload as Record<string, unknown>
    const code = Number(record.ResponseCode)
    return {
      ResponseCode: Number.isFinite(code) ? code : -1,
      Message: typeof record.Message === 'string' ? record.Message : 'The request could not be completed.',
    }
  }


  // 9. Master Controller Endpoints (Loads all application dropdowns dynamically from SQL Server)
  static async getSchools(dropdownTypeId?: number): Promise<MasterSchool[]> {
    const query = dropdownTypeId == null ? '' : `?dropdownTypeID=${encodeURIComponent(String(dropdownTypeId))}`
    const res = await this.get<any>(`${BASE_URL}/school${query}`)
    return this.parseArray<MasterSchool>(res)
  }

  static async fetchSchoolAddress(schoolId: number): Promise<SchoolAddressRecord | null> {
    try {
      const response = await axiosClient.get<any>(
        `${BASE_URL}/schooladdress?schoolID=${encodeURIComponent(String(schoolId))}`,
      )
      let payload = response.data
      while (typeof payload === 'string') {
        try {
          const parsed = JSON.parse(payload)
          if (parsed === payload) break
          payload = parsed
        } catch {
          const address = payload.trim()
          return address ? { SchoolAddress: address } : null
        }
      }

      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.value)
          ? payload.value
          : Array.isArray(payload?.data)
            ? payload.data
            : payload && typeof payload === 'object'
              ? [payload]
              : []
      const record = records[0]
      if (!record || typeof record !== 'object') return null
      return {
        SchoolID: Number(record.SchoolID ?? schoolId),
        SchoolAddress: typeof record.SchoolAddress === 'string' ? record.SchoolAddress : null,
      }
    } catch (error) {
      console.error(`GET ${BASE_URL}/schooladdress failed:`, error)
      throw error
    }
  }

  static async getAdmissionDetails(admissionDetailsId?: number): Promise<AdmissionDetailsRecord[]> {
    const query = admissionDetailsId ? `?admissionDetailsID=${encodeURIComponent(String(admissionDetailsId))}` : ''
    const res = await this.get<any>(`${BASE_URL}/admissiondetails${query}`)
    return this.parseArray<AdmissionDetailsRecord>(res)
  }

  static async getAcademicYears(): Promise<MasterAcademicYear[]> {
    const res = await this.get<any>(`${BASE_URL}/academicyear`)
    return this.parseArray<MasterAcademicYear>(res)
  }

  static async getDistances(): Promise<MasterDistance[]> {
    const res = await this.get<any>(`${BASE_URL}/distance`)
    return this.parseArray<MasterDistance>(res)
  }

  static async getCastes(): Promise<MasterCaste[]> {
    const res = await this.get<any>(`${BASE_URL}/caste`)
    return this.parseArray<MasterCaste>(res)
  }

  static async getLookups(refId?: number): Promise<MasterLookup[]> {
    const url = refId !== undefined ? `${BASE_URL}/lookup?lookUpRefID=${refId}` : `${BASE_URL}/lookup`
    const res = await this.get<any>(url)
    return this.parseArray<MasterLookup>(res)
  }

  static async getStandards(schoolId?: number): Promise<MasterStandard[]> {
    if (schoolId == null) {
      const res = await this.get<any>(`${BASE_URL}/standard`)
      return this.parseArray<MasterStandard>(res)
    }

    try {
      const response = await axiosClient.get<any>(
        `${BASE_URL}/standard?schoolID=${encodeURIComponent(String(schoolId))}`,
      )
      return this.parseArray<MasterStandard>(response.data)
    } catch (error) {
      console.error(`GET ${BASE_URL}/standard failed:`, error)
      throw error
    }
  }

  static async getSections(schoolId: number, standardId: number): Promise<MasterSection[]> {
    try {
      const query = new URLSearchParams({
        schoolID: String(schoolId),
        standardID: String(standardId),
      })
      const response = await axiosClient.get<any>(`${BASE_URL}/section?${query.toString()}`)
      return this.parseArray<MasterSection>(response.data)
    } catch (error) {
      console.error(`GET ${BASE_URL}/section failed:`, error)
      throw error
    }
  }

  static async getMotherTongues(): Promise<MasterMotherTongue[]> {
    const res = await this.get<any>(`${BASE_URL}/mothertongue`)
    return this.parseArray<MasterMotherTongue>(res)
  }

  static async getIncomeRanges(): Promise<MasterIncomeRange[]> {
    const res = await this.get<any>(`${BASE_URL}/incomerange`)
    return this.parseArray<MasterIncomeRange>(res)
  }

  static async getLeftYears(): Promise<MasterLeftYear[]> {
    const res = await this.get<any>(`${BASE_URL}/leftyear`)
    return this.parseArray<MasterLeftYear>(res)
  }
}

export interface MasterSchool {
  SchoolID: number
  School?: string
  SchoolName?: string
  SchoolShortName?: string
  SchoolAddress?: string | null
}

export interface MasterAcademicYear {
  AcademicYearID: number
  AcademicYear: string
}

export interface SchoolAddressRecord {
  SchoolID?: number
  SchoolAddress?: string | null
}

export interface AdmissionDetailsRecord {
  AdmissionDetailsID: number
  AcademicYear?: string
  Standard?: string
  Title?: string
  IsCurrentActive?: boolean
}

export interface MasterDistance {
  DistanceID: number
  DistanceName: string
  Description?: string | null
}

export interface MasterCaste {
  CasteID: number
  CasteName: string
  Description?: string | null
}

export interface MasterLookup {
  LookupID: number
  LookupRefID: number
  LookupName: string
  LookupValue: string
}

export interface MasterStandard {
  StandardID: number
  StandardName: string
}

export interface MasterSection {
  SectionID: number
  SectionName: string
}

export interface MasterMotherTongue {
  MotherTongueID: number
  MotherTongueName: string
  Descriptions?: string | null
}

export interface MasterIncomeRange {
  IncomeRangeID: number
  IncomeRange: string
}

export interface MasterLeftYear {
  LeftYearID: number
  YearValue: number
}
