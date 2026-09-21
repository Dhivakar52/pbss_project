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
   * Initial seed records.
   */
  static getInitialStudents(): StudentRecord[] {
    return mockStudents
  }
}
