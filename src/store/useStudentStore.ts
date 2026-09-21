import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { mockStudents, type StudentRecord } from '@/data/mockStudents'
import { StudentService } from '@/services/student.service'

interface StudentState {
  students: StudentRecord[]
  isLoading: boolean

  // Selectors / Actions
  getStudentById: (id: string) => StudentRecord | undefined
  addStudent: (payload: Partial<StudentRecord>) => StudentRecord
  updateStudent: (id: string, updates: Partial<StudentRecord>) => StudentRecord | undefined
  deleteStudent: (id: string) => boolean
  resetStudents: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      isLoading: false,

      getStudentById: (id: string) => {
        const { students } = get()
        return StudentService.findById(id, students)
      },

      addStudent: (payload: Partial<StudentRecord>) => {
        const { students } = get()
        const newRecord = StudentService.buildRecord(payload, students)

        set({
          students: [newRecord, ...students], // Add to top so immediately visible in table
        })

        return newRecord
      },

      updateStudent: (id: string, updates: Partial<StudentRecord>) => {
        const { students } = get()
        const existing = StudentService.findById(id, students)
        if (!existing) return undefined

        const updated: StudentRecord = { ...existing, ...updates }

        set({
          students: students.map((s) => (s.id === existing.id ? updated : s)),
        })

        return updated
      },

      deleteStudent: (id: string) => {
        const { students } = get()
        const existing = StudentService.findById(id, students)
        if (!existing) return false

        set({
          students: students.filter((s) => s.id !== existing.id),
        })

        return true
      },

      resetStudents: () => {
        set({ students: mockStudents })
      },
    }),
    {
      name: 'pbss_students_master',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        students: state.students,
      }),
    }
  )
)
