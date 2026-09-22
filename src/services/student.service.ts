import { mockStudents, type StudentRecord } from '@/data/mockStudents'

export class StudentService {
  /**
   * Resolve an ID string against student records.
   * Matches by record.id, record.registrationNumber (case-insensitive), or record.slNo.
   */
  static findById(id: string, list: StudentRecord[]): StudentRecord | undefined {
    if (!id) return undefined
    const cleanId = id.trim().toLowerCase()

    return list.find((s) => {
      const matchId = String(s.id).toLowerCase() === cleanId
      const matchReg = s.registrationNumber.toLowerCase() === cleanId
      const matchSlNo = String(s.slNo) === cleanId
      return matchId || matchReg || matchSlNo
    })
  }

  /**
   * Generate next unique sequential ID and Registration Number.
   */
  static generateNextId(existingList: StudentRecord[]): { id: string; slNo: number; registrationNumber: string } {
    const maxSlNo = existingList.reduce((max, s) => Math.max(max, s.slNo || 0), 0)
    const nextSlNo = maxSlNo + 1

    // Determine max numeric ID
    const numericIds = existingList
      .map((s) => parseInt(String(s.id).replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n))

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 1020
    const nextId = String(Math.max(maxId + 1, 1000 + nextSlNo))

    // Form registration number like T25-0021
    const regSeq = String(nextSlNo).padStart(4, '0')
    const registrationNumber = `T25-${regSeq}`

    return {
      id: nextId,
      slNo: nextSlNo,
      registrationNumber,
    }
  }

  /**
   * Build a complete StudentRecord from raw/partial application data.
   */
  static buildRecord(payload: Partial<StudentRecord>, existingList: StudentRecord[]): StudentRecord {
    const { id, slNo, registrationNumber } = this.generateNextId(existingList)

    const now = new Date().toISOString().split('T')[0]

    return {
      id: payload.id || id,
      slNo: payload.slNo || slNo,
      registrationNumber: payload.registrationNumber || registrationNumber,
      studentName: payload.studentName || 'Applicant Child',
      schoolBranch: payload.schoolBranch || 'T.Nagar-PSBB',
      academicYear: payload.academicYear || '2025-26',
      gender: payload.gender || 'Male',
      motherTongue: payload.motherTongue || 'Tamil',
      applicationStatus: payload.applicationStatus || 'Declared',
      date: payload.date || now,
      status1: payload.status1 ?? true,
      status2: payload.status2 ?? true,
      fatherName: payload.fatherName || '',
      motherName: payload.motherName || '',
      mobile: payload.mobile || '',
      city: payload.city || 'Chennai',
      area: payload.area || 'T.Nagar',
      playSchool: payload.playSchool ?? false,
      physicallyChallenged: payload.physicallyChallenged ?? false,
      twinsTriplets: payload.twinsTriplets ?? false,
      alumni: payload.alumni ?? false,
      siblingsStudying: payload.siblingsStudying ?? false,
      distanceKm: payload.distanceKm || '< 2 KM',
      incomeRange: payload.incomeRange || '10-15 Lakhs',
      religion: payload.religion || 'Hindu',
      caste: payload.caste || '',
      community: payload.community || 'FC',
    }
  }

  /**
   * Helper to check if a student record matches any number in the application numbers set.
   */
  static matchesApplnNumber(student: StudentRecord, applnSet: Set<number>): boolean {
    // 1. Check numeric ID
    const numericId = Number(student.id)
    if (!isNaN(numericId) && applnSet.has(numericId)) {
      return true
    }

    // 2. Check slNo
    if (student.slNo && applnSet.has(student.slNo)) {
      return true
    }

    // 3. Check digits extracted from registrationNumber (e.g., T25-0100 -> 100)
    if (student.registrationNumber) {
      const regDigits = student.registrationNumber.replace(/\D/g, '')
      if (regDigits) {
        const num = Number(regDigits)
        if (!isNaN(num) && applnSet.has(num)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Find matching student records for given application numbers.
   */
  static findMatchingStudents(applnNumbers: number[], list: StudentRecord[]): StudentRecord[] {
    if (!applnNumbers || applnNumbers.length === 0) return []
    const applnSet = new Set(applnNumbers)
    return list.filter((s) => this.matchesApplnNumber(s, applnSet))
  }

  /**
   * Perform bulk update on student records for given application numbers and field/value pair.
   */
  static bulkUpdateStudents(
    list: StudentRecord[],
    applnNumbers: number[],
    field: string,
    value: any
  ): { updatedCount: number; updatedList: StudentRecord[] } {
    if (!applnNumbers || applnNumbers.length === 0 || !field) {
      return { updatedCount: 0, updatedList: list }
    }

    const applnSet = new Set(applnNumbers)
    let updatedCount = 0

    const updatedList = list.map((student) => {
      if (this.matchesApplnNumber(student, applnSet)) {
        updatedCount++
        return {
          ...student,
          [field]: value,
        }
      }
      return student
    })

    return { updatedCount, updatedList }
  }

  /**
   * Initial seed records.
   */
  static getInitialStudents(): StudentRecord[] {
    return mockStudents
  }
}

