import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus,
  X,
  Calendar,
  Sparkles,
  Cpu,
  GraduationCap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function getDynamicOfferings(code, layoutType = 'trimester') {
  const c = (code || '').toUpperCase();
  if (layoutType === 'semester') {
    const semMap = {
      'BSC203': ['Sem 1'],
      'ICT100': ['Sem 1'],
      'ICT145': ['Sem 1'],
      'ICT158': ['Sem 1'],
      'ICT159': ['Sem 1'],
      'ICT167': ['Sem 1', 'Sem 2'],
      'ICT169': ['Sem 1', 'Sem 2'],
      'ICT170': ['Sem 2'],
      'ICT201': ['Sem 2'],
      'ICT202': ['Sem 1'],
      'ICT203': ['Sem 1'],
      'ICT206': ['Sem 1'],
      'ICT283': ['Sem 1', 'Sem 2'],
      'ICT284': ['Sem 2'],
      'ICT285': ['Sem 1'],
      'ICT292': ['Sem 1'],
      'ICT301': ['Sem 2'],
      'ICT302': ['Sem 2'],
      'ICT303': ['Sem 2'],
      'ICT304': ['Sem 2'],
      'ICT305': ['Sem 2'],
      'ICT373': ['Sem 2'],
      'ICT374': ['Sem 2'],
      'ICT393': ['Sem 2'],
      'ICT394': ['Sem 2'],
      'MAS162': ['Sem 2'],
      'MAS164': ['Sem 1'],
      'MAS183': ['Sem 2'],
      'MSP200': ['Sem 1', 'Sem 2'],
      'COM203': ['Sem 1', 'Sem 2']
    };
    return semMap[c] || ['Sem 1', 'Sem 2'];
  } else {
    const triMap = {
      'ICT100': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT158': ['Tri 1', 'Tri 3'],
      'ICT159': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT167': ['Tri 1', 'Tri 2'],
      'ICT169': ['Tri 1', 'Tri 2'],
      'ICT170': ['Tri 1', 'Tri 3'],
      'ICT145': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT201': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT202': ['Tri 2', 'Tri 3'],
      'ICT203': ['Tri 1', 'Tri 3'],
      'ICT206': ['Tri 2', 'Tri 3'],
      'ICT283': ['Tri 1', 'Tri 2'],
      'ICT284': ['Tri 1', 'Tri 2'],
      'ICT285': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT292': ['Tri 1', 'Tri 2', 'Tri 3'],
      'BSC203': ['Tri 1', 'Tri 2', 'Tri 3'],
      'MAS162': ['Tri 1', 'Tri 2', 'Tri 3'],
      'MAS164': ['Tri 1', 'Tri 2', 'Tri 3'],
      'MAS183': ['Tri 1', 'Tri 3'],
      'ICT301': ['Tri 1', 'Tri 2'],
      'ICT302': ['Tri 1', 'Tri 2', 'Tri 3'],
      'ICT303': ['Tri 2', 'Tri 3'],
      'ICT304': ['Tri 1', 'Tri 3'],
      'ICT305': ['Tri 2', 'Tri 3'],
      'ICT373': ['Tri 1', 'Tri 3'],
      'ICT374': ['Tri 2', 'Tri 3'],
      'ICT393': ['Tri 1', 'Tri 3'],
      'ICT394': ['Tri 1', 'Tri 2', 'Tri 3'],
      'MSP200': ['Tri 1', 'Tri 2', 'Tri 3'],
      'COM203': ['Tri 1', 'Tri 2', 'Tri 3']
    };
    return triMap[c] || ['Tri 1', 'Tri 2', 'Tri 3'];
  }
}

export default function CourseCatalogPreview({ catalogUnits = [], onOpenImport, onOpenAddUnit }) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'AI' | 'CS' | 'BIS' | 'ELECTIVES'
  const [majorLayout, setMajorLayout] = useState('trimester'); // 'trimester' | 'semester'
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [showAllUnits, setShowAllUnits] = useState(false);
  const INITIAL_LIMIT = 6;

  const defaultUnits = [
    { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100, prereqs: 'ICT159' },
    { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200, prereqs: 'ICT159' },
    { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200, prereqs: 'ICT159' },
    { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300, prereqs: 'ICT292' },
    { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300, prereqs: 'ICT201' },
    { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300, prereqs: 'ICT202' },
    { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300, prereqs: 'ICT203' },
    { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300, prereqs: 'ICT202' },
    { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300, prereqs: 'ICT283' },
    { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300, prereqs: 'ICT283' },
    { unit_id: 27, code: 'ICT393', title: 'Advanced Business Analysis', credit_points: 3, level: 300, prereqs: 'ICT284' },
    { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, level: 300, prereqs: 'ICT285' },
    { unit_id: 29, code: 'MSP200', title: 'Building Employability Skills', credit_points: 3, level: 200, prereqs: 'None' },
    { unit_id: 30, code: 'COM203', title: 'Consulting and Freelancing', credit_points: 3, level: 200, prereqs: 'None' }
  ];

  const unitsList = catalogUnits && catalogUnits.length > 0
    ? catalogUnits.map(u => ({
        unit_id: u.unit_id,
        code: u.code,
        title: u.title,
        credit_points: u.credit_points || 3,
        level: u.level || 100,
        prereqs: u.prerequisites && u.prerequisites.length > 0
          ? u.prerequisites.map(p => p.prereq_code || p).join(', ')
          : (u.prereq_code || u.prereqs || 'None')
      }))
    : defaultUnits;

  const filteredUnits = unitsList.filter(u => {
    const matchesQuery = searchQuery === '' ||
      u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' ||
      (levelFilter === '100' && u.level >= 100 && u.level < 200) ||
      (levelFilter === '200' && u.level >= 200 && u.level < 300) ||
      (levelFilter === '300' && u.level >= 300) ||
      (levelFilter === 'ELECTIVE' && (['MSP200', 'COM203'].includes(u.code)));

    return matchesQuery && matchesLevel;
  });

  const displayedUnits = showAllUnits ? filteredUnits : filteredUnits.slice(0, INITIAL_LIMIT);

  // Detailed Major Presets mapped directly from Excel sheets
  const majorPresets = {
    AI: {
      name: 'Artificial Intelligence (AI Major)',
      description: 'Specialised study plan focusing on Machine Learning, Deep Learning, AI System Design, and Intelligent Agents.',
      totalCP: 72,
      coreCP: 42,
      coreUnitsCount: 14,
      trimester: [
        {
          term: 'Year 1 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT145', title: 'Python Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'MAS183', title: 'Statistical Data Analysis', cp: 3, status: 'Core / Math', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 2 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT283', title: 'Data Structures & Algorithms', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 },
            { code: 'ICT203', title: 'Artificial Intelligence', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT202', title: 'Machine Learning', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 },
            { code: 'ICT206', title: 'Intelligent Systems', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT303', title: 'Advanced Machine Learning', cp: 3, status: 'Major Core', prereq: 'ICT202', level: 300 },
            { code: 'ICT304', title: 'AI System Design', cp: 3, status: 'Major Core', prereq: 'ICT203', level: 300 },
            { code: 'ICT305', title: 'Data Visualisation', cp: 3, status: 'Major Core', prereq: 'ICT202', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ],
      semester: [
        {
          term: 'Year 1 - Semester 1',
          period_id: 1,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT145', title: 'Python Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'MAS183', title: 'Statistical Data Analysis', cp: 3, status: 'Core / Math', prereq: 'None', level: 100 },
            { code: 'ICT283', title: 'Data Structures & Algorithms', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Semester 1',
          period_id: 1,
          units: [
            { code: 'ICT203', title: 'Artificial Intelligence', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 },
            { code: 'ICT202', title: 'Machine Learning', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 },
            { code: 'ICT206', title: 'Intelligent Systems', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT303', title: 'Advanced Machine Learning', cp: 3, status: 'Major Core', prereq: 'ICT202', level: 300 },
            { code: 'ICT304', title: 'AI System Design', cp: 3, status: 'Major Core', prereq: 'ICT203', level: 300 },
            { code: 'ICT305', title: 'Data Visualisation', cp: 3, status: 'Major Core', prereq: 'ICT202', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ]
    },
    CS: {
      name: 'Computer Science (CS Major)',
      description: 'Specialised study plan focusing on Algorithms, Operating Systems, Software Architecture, and Systems Programming.',
      totalCP: 72,
      coreCP: 39,
      coreUnitsCount: 13,
      trimester: [
        {
          term: 'Year 1 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT145', title: 'Python Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT170', title: 'Foundations of Computer Systems', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 2 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT283', title: 'Data Structures & Algorithms', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 },
            { code: 'MAS162', title: 'Discrete Mathematics', cp: 3, status: 'Major Core / Math', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 2 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT285', title: 'Databases', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 },
            { code: 'MAS164', title: 'Fundamentals of Mathematics', cp: 3, status: 'Major Core / Math', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 2 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT373', title: 'Software Architecture', cp: 3, status: 'Major Core', prereq: 'ICT283', level: 300 },
            { code: 'ICT374', title: 'Operating Systems', cp: 3, status: 'Major Core', prereq: 'ICT283', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ],
      semester: [
        {
          term: 'Year 1 - Semester 1',
          period_id: 1,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT145', title: 'Python Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT170', title: 'Foundations of Computer Systems', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'MAS162', title: 'Discrete Mathematics', cp: 3, status: 'Major Core / Math', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 2 - Semester 1',
          period_id: 1,
          units: [
            { code: 'MAS164', title: 'Fundamentals of Mathematics', cp: 3, status: 'Major Core / Math', prereq: 'None', level: 100 },
            { code: 'ICT283', title: 'Data Structures & Algorithms', cp: 3, status: 'Major Core', prereq: 'ICT167', level: 200 },
            { code: 'ICT285', title: 'Databases', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT373', title: 'Software Architecture', cp: 3, status: 'Major Core', prereq: 'ICT283', level: 300 },
            { code: 'ICT374', title: 'Operating Systems', cp: 3, status: 'Major Core', prereq: 'ICT283', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ]
    },
    BIS: {
      name: 'Business Information Systems (BIS Major)',
      description: 'Specialised study plan focusing on IT Project Management, Business Intelligence, Enterprise Architectures, and Systems Analysis.',
      totalCP: 72,
      coreCP: 42,
      coreUnitsCount: 14,
      trimester: [
        {
          term: 'Year 1 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT158', title: 'Introduction to Computer Systems', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT201', title: 'IT Project Management', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Trimester 1',
          period_id: 3,
          units: [
            { code: 'ICT284', title: 'Systems Analysis & Design', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 },
            { code: 'ICT292', title: 'Information Systems Architecture', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Trimester 2',
          period_id: 4,
          units: [
            { code: 'ICT285', title: 'Databases', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 },
            { code: 'BSC203', title: 'Intro to ICT Research Methods', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Trimester 3',
          period_id: 5,
          units: [
            { code: 'ICT301', title: 'Enterprise Architecture', cp: 3, status: 'Major Core', prereq: 'ICT292', level: 300 },
            { code: 'ICT393', title: 'Advanced Business Analysis', cp: 3, status: 'Major Core', prereq: 'ICT284', level: 300 },
            { code: 'ICT394', title: 'Business Intelligence & Analytics', cp: 3, status: 'Major Core', prereq: 'ICT285', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ],
      semester: [
        {
          term: 'Year 1 - Semester 1',
          period_id: 1,
          units: [
            { code: 'ICT100', title: 'Transition to IT', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT158', title: 'Introduction to Computer Systems', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT159', title: 'Foundations of Programming', cp: 3, status: 'Core', prereq: 'None', level: 100 },
            { code: 'ICT169', title: 'Foundations of Data Communications', cp: 3, status: 'Core', prereq: 'None', level: 100 }
          ]
        },
        {
          term: 'Year 1 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT167', title: 'Principles of Computer Science', cp: 3, status: 'Core', prereq: 'ICT159', level: 100 },
            { code: 'ICT201', title: 'IT Project Management', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 },
            { code: 'ICT284', title: 'Systems Analysis & Design', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Semester 1',
          period_id: 1,
          units: [
            { code: 'BSC203', title: 'Intro to ICT Research Methods', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 },
            { code: 'ICT292', title: 'Information Systems Architecture', cp: 3, status: 'Major Core', prereq: 'ICT158', level: 200 },
            { code: 'ICT285', title: 'Databases', cp: 3, status: 'Major Core', prereq: 'ICT159', level: 200 }
          ]
        },
        {
          term: 'Year 2 - Semester 2',
          period_id: 2,
          units: [
            { code: 'ICT301', title: 'Enterprise Architecture', cp: 3, status: 'Major Core', prereq: 'ICT292', level: 300 },
            { code: 'ICT393', title: 'Advanced Business Analysis', cp: 3, status: 'Major Core', prereq: 'ICT284', level: 300 },
            { code: 'ICT394', title: 'Business Intelligence & Analytics', cp: 3, status: 'Major Core', prereq: 'ICT285', level: 300 },
            { code: 'ICT302', title: 'IT Professional Practice', cp: 3, status: 'Core Capstone', prereq: 'ICT201', level: 300 }
          ]
        }
      ]
    }
  };

  const selectedMajorData = majorPresets[activeTab];

  return (
    <section className="py-4 font-sans space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-2xs shrink-0 border border-red-200/60 dark:border-red-900/60">
            <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              Official Course Directory & Major Presets
            </h2>
          </div>
        </div>

        {/* Actions Bar: Add Unit & Dataset Upload */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenAddUnit && (
            <button
              onClick={onOpenAddUnit}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Add Unit Manually</span>
            </button>
          )}

          <button
            onClick={onOpenImport}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            title="Upload or import unit offerings and prerequisites from CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Upload CSV / Excel Dataset</span>
          </button>
        </div>
      </div>

      {/* Main Category Tabs Selector (Umum vs AI / CS / BIS Major Presets) */}
      <div className="bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-2 rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full">
          {[
            {
              id: 'ALL',
              label: 'Master Directory',
              count: `${unitsList.length} Units`,
              icon: Layers,
              activeGradient: 'from-red-700 via-red-800 to-rose-900 text-white shadow-lg shadow-red-900/25 border-red-600/50',
              iconBgInactive: 'bg-red-100/80 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-200/80 dark:border-red-900/60'
            },
            {
              id: 'AI',
              label: 'Artificial Intelligence',
              count: '14 Core Units',
              icon: Cpu,
              activeGradient: 'from-purple-700 via-indigo-800 to-slate-900 text-white shadow-lg shadow-purple-900/25 border-purple-600/50',
              iconBgInactive: 'bg-purple-100/80 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/60'
            },
            {
              id: 'CS',
              label: 'Computer Science',
              count: '13 Core Units',
              icon: Sparkles,
              activeGradient: 'from-blue-700 via-indigo-800 to-slate-900 text-white shadow-lg shadow-blue-900/25 border-blue-600/50',
              iconBgInactive: 'bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/60'
            },
            {
              id: 'BIS',
              label: 'Business Info Systems',
              count: '14 Core Units',
              icon: GraduationCap,
              activeGradient: 'from-amber-600 via-orange-700 to-slate-900 text-white shadow-lg shadow-amber-900/25 border-amber-600/50',
              iconBgInactive: 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60'
            },
            {
              id: 'ELECTIVES',
              label: 'General Electives',
              count: '2 Units',
              icon: ShieldCheck,
              activeGradient: 'from-emerald-600 via-teal-700 to-slate-900 text-white shadow-lg shadow-emerald-900/25 border-emerald-600/50',
              iconBgInactive: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60'
            }
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-between gap-2 cursor-pointer font-heading text-center border relative overflow-hidden group ${
                  isActive
                    ? `bg-gradient-to-r ${tab.activeGradient} scale-[1.02] z-10`
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/20 text-white shadow-inner backdrop-blur-md' : `${tab.iconBgInactive} border shadow-2xs group-hover:scale-110`
                  }`}>
                    <IconComp className="w-4 h-4 shrink-0" />
                  </div>

                  <span className="font-extrabold text-xs tracking-tight leading-tight whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>

                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white backdrop-blur-xs border border-white/20'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: MASTER DIRECTORY (UMUM - ALL 28 UNITS) */}
      {activeTab === 'ALL' && (
        <div className="space-y-4">
          {/* Search Bar, Level Filter & Counter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="course-catalog-search-input"
                type="text"
                placeholder="Search unit by code or title (e.g. ICT159, Machine Learning)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all placeholder:text-slate-400 font-semibold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  title="Clear catalog search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level & Trimester System Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* System Indicator */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl text-xs font-sans font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Trimester Offerings (T1, T2, T3)</span>
              </div>

              {/* Level Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs shrink-0 font-sans">
                {[
                  { id: 'ALL', label: 'All Levels' },
                  { id: '100', label: 'Lvl 100' },
                  { id: '200', label: 'Lvl 200' },
                  { id: '300', label: 'Lvl 300' }
                ].map((filterItem) => (
                  <button
                    key={filterItem.id}
                    type="button"
                    onClick={() => setLevelFilter(filterItem.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      levelFilter === filterItem.id
                        ? 'bg-red-700 text-white shadow-2xs font-heading'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filterItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Counter Badge */}
            <div className="flex items-center gap-2 text-xs shrink-0 self-end md:self-auto">
              <span className="font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Showing <strong className="text-red-700 dark:text-red-400">{displayedUnits.length}</strong> of <strong className="text-slate-900 dark:text-white">{filteredUnits.length}</strong> Units
              </span>
            </div>
          </div>

          {/* Unit Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedUnits.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                <p className="text-xs text-slate-500">No course units match your search query.</p>
              </div>
            ) : (
              displayedUnits.map(unit => (
                <div
                  key={unit.unit_id || unit.code}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-red-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {unit.code}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                          Level {unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {unit.credit_points || 3} CP
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1">
                      {unit.title}
                    </h3>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Prerequisite:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          unit.prereqs === 'None'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {unit.prereqs}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Teaching Periods:</span>
                        <div className="flex gap-1">
                          {getDynamicOfferings(unit.code, 'trimester').map((p, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              ))
            )}
          </div>

          {/* View More / Show Less Button */}
          {filteredUnits.length > INITIAL_LIMIT && (
            <div className="flex justify-center pt-3">
              <button
                onClick={() => setShowAllUnits(!showAllUnits)}
                className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{showAllUnits ? 'Show Less' : `View More Units (${filteredUnits.length - INITIAL_LIMIT} More)`}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${showAllUnits ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2, 3, 4: MAJOR-SPECIFIC DETAILED PATHWAYS (AI, CS, BIS) */}
      {activeTab !== 'ALL' && selectedMajorData && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Major Summary Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100/80 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0 border border-red-200/60 dark:border-red-900/60 shadow-2xs">
                  <GraduationCap className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                    {selectedMajorData.name}
                  </h3>
                </div>
              </div>

              {/* Mode Switcher: Trimester Layout vs Semester Layout */}
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl p-1 text-xs shrink-0 font-sans shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMajorLayout('trimester')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer font-heading ${
                    majorLayout === 'trimester'
                      ? 'bg-red-700 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Trimester Layout (3 Terms/Yr)
                </button>
                <button
                  type="button"
                  onClick={() => setMajorLayout('semester')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer font-heading ${
                    majorLayout === 'semester'
                      ? 'bg-red-700 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Semester Layout (2 Semesters/Yr)
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Term-by-Term Core Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedMajorData[majorLayout].map((termBlock, idx) => {
              const coresCP = termBlock.units.reduce((sum, u) => sum + (u.cp || 3), 0);
              const remainingElectiveCP = 12 - coresCP;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-2xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Term Header */}
                    <div className="bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-heading flex items-center gap-2 tracking-tight">
                        <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>{termBlock.term}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {coresCP} / 12 CP Core
                      </span>
                    </div>

                    {/* Prescribed Core Units List */}
                    <div className="space-y-3">
                      {termBlock.units.map(unit => {
                        const termLabel = termBlock.term.includes('Semester 1') ? 'Sem 1'
                          : termBlock.term.includes('Semester 2') ? 'Sem 2'
                          : termBlock.term.includes('Trimester 1') ? 'Tri 1'
                          : termBlock.term.includes('Trimester 2') ? 'Tri 2'
                          : 'Tri 3';

                        return (
                          <div
                            key={unit.code}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="bg-red-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    {unit.code}
                                  </span>
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                                    Lvl {unit.level}
                                  </span>
                                  {unit.status && !unit.status.includes('Elective') && (
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border font-heading ${
                                      unit.status.includes('Capstone') ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800' :
                                      unit.status.includes('Major') ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800' :
                                      unit.status.includes('Math') ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800' :
                                      'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800'
                                    }`}>
                                      {unit.status}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                                  {unit.cp || 3} CP
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1 leading-snug group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                                {unit.title}
                              </h3>

                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                  <span className="font-semibold">Prerequisite:</span>
                                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                    unit.prereq === 'None'
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono'
                                  }`}>
                                    {unit.prereq}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                  <span className="font-semibold">Teaching Period:</span>
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700 font-mono">
                                    {termLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>


                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: GENERAL ELECTIVES */}
      {activeTab === 'ELECTIVES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span>General Electives Pool</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl font-bold font-heading">
                  2 Units Available
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: 'MSP200', title: 'Building Employability Skills', cp: 3, level: 200, prereq: 'None', type: 'General Elective', offerings: 'Offered for all (Tri 1, 2, 3)' },
              { code: 'COM203', title: 'Consulting and Freelancing', cp: 3, level: 200, prereq: 'None', type: 'General Elective', offerings: 'Offered for all (Tri 1, 2, 3)' }
            ].map(unit => (
              <div
                key={unit.code}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-red-700 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs font-mono">
                        {unit.code}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                        Level {unit.level}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {unit.cp} CP
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    {unit.title}
                  </h4>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Strict Prerequisite:</span>
                      <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {unit.prereq}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Offerings:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {unit.offerings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
