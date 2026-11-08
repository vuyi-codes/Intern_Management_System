export type InternProfileDetails = {
  bio: string
  skills: string[]
  location: string
  university: string
  linkedin: string
  github: string
  emergencyName: string
  emergencyPhone: string
}

export function emptyInternProfileDetails(): InternProfileDetails {
  return {
    bio: "",
    skills: [],
    location: "",
    university: "",
    linkedin: "",
    github: "",
    emergencyName: "",
    emergencyPhone: "",
  }
}

export function parseSkillsInput(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}
