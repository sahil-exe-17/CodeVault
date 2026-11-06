/**
 * Comprehensive dataset of Indian Universities, Engineering Colleges, and Academic Branches
 * Designed for effortless selection and search in student onboarding & profile setup.
 */

export interface AcademicOption {
  value: string
  label: string
  category?: string
}

export const INDIAN_COLLEGES: AcademicOption[] = [
  // Maharashtra & Pune Hub
  { value: 'MIT World Peace University (MIT-WPU), Pune', label: 'MIT World Peace University (MIT-WPU), Pune', category: 'Maharashtra' },
  { value: 'COEP Technological University, Pune', label: 'COEP Technological University, Pune', category: 'Maharashtra' },
  { value: 'Pune Institute of Computer Technology (PICT), Pune', label: 'Pune Institute of Computer Technology (PICT), Pune', category: 'Maharashtra' },
  { value: 'Vishwakarma Institute of Technology (VIT), Pune', label: 'Vishwakarma Institute of Technology (VIT), Pune', category: 'Maharashtra' },
  { value: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', label: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', category: 'Maharashtra' },
  { value: 'Sardar Patel Institute of Technology (SPIT), Mumbai', label: 'Sardar Patel Institute of Technology (SPIT), Mumbai', category: 'Maharashtra' },
  { value: 'D. J. Sanghvi College of Engineering, Mumbai', label: 'D. J. Sanghvi College of Engineering, Mumbai', category: 'Maharashtra' },
  { value: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune', label: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune', category: 'Maharashtra' },
  { value: 'MKSSS Cummins College of Engineering for Women, Pune', label: 'MKSSS Cummins College of Engineering for Women, Pune', category: 'Maharashtra' },
  { value: 'Walchand College of Engineering, Sangli', label: 'Walchand College of Engineering, Sangli', category: 'Maharashtra' },
  { value: 'Government College of Engineering, Aurangabad', label: 'Government College of Engineering, Aurangabad', category: 'Maharashtra' },
  { value: 'Thadomal Shahani Engineering College (TSEC), Mumbai', label: 'Thadomal Shahani Engineering College (TSEC), Mumbai', category: 'Maharashtra' },
  { value: 'K. J. Somaiya College of Engineering, Mumbai', label: 'K. J. Somaiya College of Engineering, Mumbai', category: 'Maharashtra' },

  // IITs (Indian Institutes of Technology)
  { value: 'IIT Bombay (Indian Institute of Technology Bombay)', label: 'IIT Bombay', category: 'IIT' },
  { value: 'IIT Delhi (Indian Institute of Technology Delhi)', label: 'IIT Delhi', category: 'IIT' },
  { value: 'IIT Madras (Indian Institute of Technology Madras)', label: 'IIT Madras', category: 'IIT' },
  { value: 'IIT Kanpur (Indian Institute of Technology Kanpur)', label: 'IIT Kanpur', category: 'IIT' },
  { value: 'IIT Kharagpur (Indian Institute of Technology Kharagpur)', label: 'IIT Kharagpur', category: 'IIT' },
  { value: 'IIT Roorkee (Indian Institute of Technology Roorkee)', label: 'IIT Roorkee', category: 'IIT' },
  { value: 'IIT Guwahati (Indian Institute of Technology Guwahati)', label: 'IIT Guwahati', category: 'IIT' },
  { value: 'IIT Hyderabad (Indian Institute of Technology Hyderabad)', label: 'IIT Hyderabad', category: 'IIT' },
  { value: 'IIT (BHU) Varanasi', label: 'IIT (BHU) Varanasi', category: 'IIT' },
  { value: 'IIT Indore (Indian Institute of Technology Indore)', label: 'IIT Indore', category: 'IIT' },
  { value: 'IIT Gandhinagar', label: 'IIT Gandhinagar', category: 'IIT' },
  { value: 'IIT Ropar', label: 'IIT Ropar', category: 'IIT' },
  { value: 'IIT Patna', label: 'IIT Patna', category: 'IIT' },
  { value: 'IIT Bhubaneswar', label: 'IIT Bhubaneswar', category: 'IIT' },
  { value: 'IIT Jodhpur', label: 'IIT Jodhpur', category: 'IIT' },
  { value: 'IIT Mandi', label: 'IIT Mandi', category: 'IIT' },
  { value: 'IIT Tirupati', label: 'IIT Tirupati', category: 'IIT' },
  { value: 'IIT Palakkad', label: 'IIT Palakkad', category: 'IIT' },
  { value: 'IIT Goa', label: 'IIT Goa', category: 'IIT' },
  { value: 'IIT Jammu', label: 'IIT Jammu', category: 'IIT' },
  { value: 'IIT Dharwad', label: 'IIT Dharwad', category: 'IIT' },
  { value: 'IIT Bhilai', label: 'IIT Bhilai', category: 'IIT' },
  { value: 'IIT (ISM) Dhanbad', label: 'IIT (ISM) Dhanbad', category: 'IIT' },

  // BITS Pilani Campuses
  { value: 'BITS Pilani (Pilani Campus)', label: 'BITS Pilani (Pilani Campus)', category: 'BITS' },
  { value: 'BITS Pilani (Goa Campus - K. K. Birla)', label: 'BITS Pilani (Goa Campus)', category: 'BITS' },
  { value: 'BITS Pilani (Hyderabad Campus)', label: 'BITS Pilani (Hyderabad Campus)', category: 'BITS' },

  // NITs (National Institutes of Technology)
  { value: 'NIT Trichy (National Institute of Technology Tiruchirappalli)', label: 'NIT Trichy', category: 'NIT' },
  { value: 'NIT Karnataka (NITK Surathkal)', label: 'NITK Surathkal', category: 'NIT' },
  { value: 'NIT Rourkela (National Institute of Technology Rourkela)', label: 'NIT Rourkela', category: 'NIT' },
  { value: 'NIT Warangal (National Institute of Technology Warangal)', label: 'NIT Warangal', category: 'NIT' },
  { value: 'NIT Calicut (National Institute of Technology Calicut)', label: 'NIT Calicut', category: 'NIT' },
  { value: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur', label: 'VNIT Nagpur', category: 'NIT' },
  { value: 'Malaviya National Institute of Technology (MNIT), Jaipur', label: 'MNIT Jaipur', category: 'NIT' },
  { value: 'Motilal Nehru National Institute of Technology (MNNIT), Allahabad', label: 'MNNIT Allahabad', category: 'NIT' },
  { value: 'Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat', label: 'SVNIT Surat', category: 'NIT' },
  { value: 'NIT Kurukshetra', label: 'NIT Kurukshetra', category: 'NIT' },
  { value: 'NIT Durgapur', label: 'NIT Durgapur', category: 'NIT' },
  { value: 'NIT Jamshedpur', label: 'NIT Jamshedpur', category: 'NIT' },
  { value: 'NIT Jalandhar (Dr. B. R. Ambedkar NIT)', label: 'NIT Jalandhar', category: 'NIT' },
  { value: 'NIT Silchar', label: 'NIT Silchar', category: 'NIT' },
  { value: 'Maulana Azad National Institute of Technology (MANIT), Bhopal', label: 'MANIT Bhopal', category: 'NIT' },
  { value: 'NIT Patna', label: 'NIT Patna', category: 'NIT' },
  { value: 'NIT Raipur', label: 'NIT Raipur', category: 'NIT' },
  { value: 'NIT Goa', label: 'NIT Goa', category: 'NIT' },
  { value: 'NIT Hamirpur', label: 'NIT Hamirpur', category: 'NIT' },
  { value: 'NIT Meghalaya', label: 'NIT Meghalaya', category: 'NIT' },

  // IIITs (Indian Institutes of Information Technology)
  { value: 'IIIT Hyderabad (International Institute of Information Technology)', label: 'IIIT Hyderabad', category: 'IIIT' },
  { value: 'IIIT Bangalore (International Institute of Information Technology)', label: 'IIIT Bangalore', category: 'IIIT' },
  { value: 'IIIT Delhi (Indraprastha Institute of Information Technology)', label: 'IIIT Delhi', category: 'IIIT' },
  { value: 'IIIT Allahabad', label: 'IIIT Allahabad', category: 'IIIT' },
  { value: 'IIITM Gwalior (ABV-IIITM)', label: 'IIITM Gwalior', category: 'IIIT' },
  { value: 'IIIT Pune', label: 'IIIT Pune', category: 'IIIT' },
  { value: 'IIIT Lucknow', label: 'IIIT Lucknow', category: 'IIIT' },
  { value: 'IIITDM Jabalpur', label: 'IIITDM Jabalpur', category: 'IIIT' },
  { value: 'IIITDM Kancheepuram', label: 'IIITDM Kancheepuram', category: 'IIIT' },

  // Delhi NCR Hub
  { value: 'Delhi Technological University (DTU), Delhi', label: 'Delhi Technological University (DTU)', category: 'Delhi NCR' },
  { value: 'Netaji Subhas University of Technology (NSUT), Delhi', label: 'Netaji Subhas University of Technology (NSUT)', category: 'Delhi NCR' },
  { value: 'Indira Gandhi Delhi Technical University for Women (IGDTUW)', label: 'IGDTUW Delhi', category: 'Delhi NCR' },
  { value: 'Jaypee Institute of Information Technology (JIIT), Noida', label: 'Jaypee Institute (JIIT), Noida', category: 'Delhi NCR' },
  { value: 'Maharaja Agrasen Institute of Technology (MAIT), Delhi', label: 'MAIT Delhi', category: 'Delhi NCR' },
  { value: 'Maharaja Surajmal Institute of Technology (MSIT), Delhi', label: 'MSIT Delhi', category: 'Delhi NCR' },
  { value: 'Shiv Nadar University, Greater Noida', label: 'Shiv Nadar University', category: 'Delhi NCR' },
  { value: 'Bennett University, Greater Noida', label: 'Bennett University', category: 'Delhi NCR' },

  // Karnataka & Bengaluru Hub
  { value: 'R. V. College of Engineering (RVCE), Bengaluru', label: 'RV College of Engineering (RVCE), Bengaluru', category: 'Karnataka' },
  { value: 'BMS College of Engineering (BMSCE), Bengaluru', label: 'BMS College of Engineering, Bengaluru', category: 'Karnataka' },
  { value: 'Ramaiah Institute of Technology (MSRIT), Bengaluru', label: 'Ramaiah Institute of Technology, Bengaluru', category: 'Karnataka' },
  { value: 'PES University, Bengaluru', label: 'PES University, Bengaluru', category: 'Karnataka' },
  { value: 'Manipal Institute of Technology (MAHE), Manipal', label: 'Manipal Institute of Technology (MIT), Manipal', category: 'Karnataka' },
  { value: 'Dayananda Sagar College of Engineering (DSCE), Bengaluru', label: 'Dayananda Sagar College of Engineering', category: 'Karnataka' },
  { value: 'BMS Institute of Technology and Management (BMSIT), Bengaluru', label: 'BMSIT Bengaluru', category: 'Karnataka' },
  { value: 'Siddaganga Institute of Technology (SIT), Tumkur', label: 'SIT Tumkur', category: 'Karnataka' },

  // Tamil Nadu & Chennai Hub
  { value: 'Vellore Institute of Technology (VIT), Vellore', label: 'Vellore Institute of Technology (VIT), Vellore', category: 'Tamil Nadu' },
  { value: 'Vellore Institute of Technology (VIT), Chennai', label: 'Vellore Institute of Technology (VIT), Chennai', category: 'Tamil Nadu' },
  { value: 'SRM Institute of Science and Technology, Kattankulathur', label: 'SRM Institute of Science and Technology, Chennai', category: 'Tamil Nadu' },
  { value: 'College of Engineering, Guindy (Anna University CEG), Chennai', label: 'Anna University (CEG), Chennai', category: 'Tamil Nadu' },
  { value: 'PSG College of Technology, Coimbatore', label: 'PSG College of Technology, Coimbatore', category: 'Tamil Nadu' },
  { value: 'SSN College of Engineering, Chennai', label: 'SSN College of Engineering, Chennai', category: 'Tamil Nadu' },
  { value: 'Amrita Vishwa Vidyapeetham, Coimbatore', label: 'Amrita Vishwa Vidyapeetham, Coimbatore', category: 'Tamil Nadu' },
  { value: 'Thiagarajar College of Engineering (TCE), Madurai', label: 'Thiagarajar College of Engineering, Madurai', category: 'Tamil Nadu' },
  { value: 'Coimbatore Institute of Technology (CIT), Coimbatore', label: 'CIT Coimbatore', category: 'Tamil Nadu' },
  { value: 'Sastra Deemed University, Thanjavur', label: 'Sastra Deemed University, Thanjavur', category: 'Tamil Nadu' },

  // Telangana & Andhra Pradesh
  { value: 'Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad', label: 'CBIT Hyderabad', category: 'Telangana' },
  { value: 'VNR Vignana Jyothi Institute of Engineering & Technology (VNR VJIET), Hyderabad', label: 'VNR VJIET Hyderabad', category: 'Telangana' },
  { value: 'University College of Engineering, Osmania University, Hyderabad', label: 'Osmania University (UCE), Hyderabad', category: 'Telangana' },
  { value: 'JNTUH University College of Engineering, Hyderabad', label: 'JNTUH College of Engineering, Hyderabad', category: 'Telangana' },
  { value: 'Vasavi College of Engineering, Hyderabad', label: 'Vasavi College of Engineering, Hyderabad', category: 'Telangana' },
  { value: 'Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Hyderabad', label: 'GRIET Hyderabad', category: 'Telangana' },
  { value: 'K L University (KLEF), Guntur', label: 'K L University, Guntur', category: 'Andhra Pradesh' },

  // North, Central & East India
  { value: 'Thapar Institute of Engineering and Technology, Patiala', label: 'Thapar Institute (TIET), Patiala', category: 'Punjab' },
  { value: 'Punjab Engineering College (PEC), Chandigarh', label: 'PEC Chandigarh', category: 'Chandigarh' },
  { value: 'Chandigarh University, Mohali', label: 'Chandigarh University', category: 'Punjab' },
  { value: 'Lovely Professional University (LPU), Phagwara', label: 'Lovely Professional University (LPU)', category: 'Punjab' },
  { value: 'Jadavpur University (Faculty of Engineering), Kolkata', label: 'Jadavpur University, Kolkata', category: 'West Bengal' },
  { value: 'Heritage Institute of Technology, Kolkata', label: 'Heritage Institute of Technology, Kolkata', category: 'West Bengal' },
  { value: 'Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar', label: 'KIIT University, Bhubaneswar', category: 'Odisha' },
  { value: 'Siksha O Anusandhan (SOA / ITER), Bhubaneswar', label: 'SOA University (ITER), Bhubaneswar', category: 'Odisha' },
  { value: 'Shri Govindram Seksaria Institute of Technology and Science (SGSITS), Indore', label: 'SGSITS Indore', category: 'Madhya Pradesh' },
  { value: 'Institute of Engineering & Technology (IET DAVV), Indore', label: 'IET DAVV Indore', category: 'Madhya Pradesh' },
  { value: 'Harcourt Butler Technical University (HBTU), Kanpur', label: 'HBTU Kanpur', category: 'Uttar Pradesh' },
  { value: 'Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT), Gandhinagar', label: 'DA-IICT Gandhinagar', category: 'Gujarat' },
  { value: 'Nirma University, Ahmedabad', label: 'Nirma University, Ahmedabad', category: 'Gujarat' },
  { value: 'College of Engineering Trivandrum (CET), Thiruvananthapuram', label: 'College of Engineering Trivandrum (CET)', category: 'Kerala' },
  { value: 'Model Engineering College (MEC), Kochi', label: 'Model Engineering College, Kochi', category: 'Kerala' },
]

export const ENGINEERING_COURSES: AcademicOption[] = [
  { value: 'Computer Science and Engineering (CSE)', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Computer Science & Engineering (AI & Machine Learning)', label: 'CSE (AI & Machine Learning)' },
  { value: 'Computer Science & Engineering (Data Science)', label: 'CSE (Data Science)' },
  { value: 'Computer Science & Engineering (Cyber Security)', label: 'CSE (Cyber Security)' },
  { value: 'Artificial Intelligence and Data Science (AI & DS)', label: 'Artificial Intelligence & Data Science (AI & DS)' },
  { value: 'Information Technology (IT)', label: 'Information Technology (IT)' },
  { value: 'Electronics and Telecommunication Engineering (ENTC / ECE)', label: 'Electronics & Telecommunication (ENTC / ECE)' },
  { value: 'Electrical and Electronics Engineering (EEE)', label: 'Electrical & Electronics Engineering (EEE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Robotics and Automation Engineering', label: 'Robotics & Automation Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Internet of Things (IoT) & Smart Systems', label: 'Internet of Things (IoT) & Systems' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Master of Computer Applications (MCA)', label: 'Master of Computer Applications (MCA)' },
  { value: 'Bachelor of Computer Applications (BCA)', label: 'Bachelor of Computer Applications (BCA)' },
  { value: 'B.Sc. Computer Science / Information Technology', label: 'B.Sc. Computer Science / IT' },
  { value: 'M.Tech / M.E. Computer Science', label: 'M.Tech / M.E. Computer Science' },
]

export const ACADEMIC_SEMESTERS: AcademicOption[] = [
  { value: 'Semester 1 (Year 1)', label: 'Semester 1 (1st Year)' },
  { value: 'Semester 2 (Year 1)', label: 'Semester 2 (1st Year)' },
  { value: 'Semester 3 (Year 2)', label: 'Semester 3 (2nd Year)' },
  { value: 'Semester 4 (Year 2)', label: 'Semester 4 (2nd Year)' },
  { value: 'Semester 5 (Year 3)', label: 'Semester 5 (3rd Year)' },
  { value: 'Semester 6 (Year 3)', label: 'Semester 6 (3rd Year)' },
  { value: 'Semester 7 (Year 4)', label: 'Semester 7 (4th Year)' },
  { value: 'Semester 8 (Year 4)', label: 'Semester 8 (4th Year)' },
]
