export type Patient = {
  id: string
  opNo: string
  title: string
  patientName: string
  fhwo: string
  area: string
  city: string
  department: string
  registrationDate: string
  email?: string
  phone?: string
}

export type PatientFormData = Omit<Patient, 'id'>