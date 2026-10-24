/**
 * Pre-configured Accounts for Study Plan Repository (SPR)
 * Single Sign-On (SSO) Portal
 */

export const AUTH_ACCOUNTS = [
  {
    id: 0,
    student_id: 0,
    student_number: 'ADMIN-CHAIR-01',
    first_name: 'Dr. Aris',
    last_name: 'Thorne',
    email: 'academic.chair@pt3solutions.edu.sg',
    username: 'admin',
    aliasCode: 'ADMIN',
    account_category: 'admin',
    aliases: ['admin', 'admin-chair-01', 'academic.chair@pt3solutions.edu.sg', 'dr.aris', 'aris', 'thorne', 'chair'],
    password: 'chair123',
    role: 'chair',
    roleLabel: 'Academic Chair',
    course_name: 'Academic Chair & Governance',
    course_code: 'PT3-ADMIN',
    avatar: 'AT'
  },
  {
    id: 1,
    student_id: 1,
    student_number: '31234561',
    first_name: 'Alex',
    last_name: 'Mercer',
    email: 'alex.mercer@student.pt3solutions.edu.sg',
    username: 'alex',
    aliasCode: 'AI1',
    account_category: 'existing_student',
    aliases: [
      '31234561', 'ai1', 'ai 1', 'ai-1',
      'alex', 'alex.mercer', 'alex.mercer@student.pt3solutions.edu.sg',
      'pt3-2026-001'
    ],
    password: 'alex123',
    role: 'student',
    roleLabel: 'Student (AI) - Existing',
    course_name: 'Bachelor of IT (AI)',
    course_code: 'PT3-BSIT-AI01',
    avatar: 'AM'
  },
  {
    id: 2,
    student_id: 2,
    student_number: '31234562',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@student.pt3solutions.edu.sg',
    username: 'sarah',
    aliasCode: 'CS1',
    account_category: 'existing_student',
    aliases: [
      '31234562', 'cs1', 'cs 1', 'cs-1',
      'sarah', 'sarah.jenkins', 'sarah.jenkins@student.pt3solutions.edu.sg',
      'pt3-2026-002'
    ],
    password: 'sarah123',
    role: 'student',
    roleLabel: 'Student (CS) - Existing',
    course_name: 'Bachelor of IT (CS)',
    course_code: 'PT3-BSIT-CS02',
    avatar: 'SJ'
  },
  {
    id: 3,
    student_id: 3,
    student_number: '31234563',
    first_name: 'Michael',
    last_name: 'Chang',
    email: 'm.chang@student.pt3solutions.edu.sg',
    username: 'michael',
    aliasCode: 'BIS1',
    account_category: 'existing_student',
    aliases: [
      '31234563', 'bis1', 'bis 1', 'bis-1',
      'michael', 'm.chang', 'm.chang@student.pt3solutions.edu.sg',
      'pt3-2026-003'
    ],
    password: 'michael123',
    role: 'student',
    roleLabel: 'Student (BIS) - Existing',
    course_name: 'Bachelor of IT (BIS)',
    course_code: 'PT3-BSIT-BIS03',
    avatar: 'MC'
  },
  {
    id: 4,
    student_id: 4,
    student_number: '31234564',
    first_name: 'Emily',
    last_name: 'Watson',
    email: 'e.watson@student.pt3solutions.edu.sg',
    username: 'emily',
    aliasCode: 'AI2',
    account_category: 'new_student',
    aliases: [
      '31234564', 'ai2', 'ai 2', 'ai-2',
      'emily', 'e.watson', 'e.watson@student.pt3solutions.edu.sg',
      'pt3-2026-004'
    ],
    password: 'emily123',
    role: 'student',
    roleLabel: 'Student (AI) - New',
    course_name: 'Bachelor of IT (AI)',
    course_code: 'PT3-BSIT-AI04',
    avatar: 'EW'
  }
];
