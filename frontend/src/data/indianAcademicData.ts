/**
 * Comprehensive dataset of Indian Universities, Engineering Colleges, and Academic Branches
 * Covers all Tier-1 and premier engineering institutions across India with official domains for logo fetching.
 */

export interface AcademicOption {
  value: string
  label: string
  category?: string
  shortName?: string
  city?: string
  state?: string
  domain?: string
}

export const INDIAN_COLLEGES: AcademicOption[] = [
  // ==========================================
  // IITs — Indian Institutes of Technology (All 23)
  // ==========================================
  { value: 'IIT Bombay (Indian Institute of Technology Bombay)', label: 'IIT Bombay', shortName: 'IITB', city: 'Mumbai', state: 'Maharashtra', category: 'IIT', domain: 'iitb.ac.in' },
  { value: 'IIT Delhi (Indian Institute of Technology Delhi)', label: 'IIT Delhi', shortName: 'IITD', city: 'New Delhi', state: 'Delhi', category: 'IIT', domain: 'iitd.ac.in' },
  { value: 'IIT Madras (Indian Institute of Technology Madras)', label: 'IIT Madras', shortName: 'IITM', city: 'Chennai', state: 'Tamil Nadu', category: 'IIT', domain: 'iitm.ac.in' },
  { value: 'IIT Kanpur (Indian Institute of Technology Kanpur)', label: 'IIT Kanpur', shortName: 'IITK', city: 'Kanpur', state: 'Uttar Pradesh', category: 'IIT', domain: 'iitk.ac.in' },
  { value: 'IIT Kharagpur (Indian Institute of Technology Kharagpur)', label: 'IIT Kharagpur', shortName: 'IITKGP', city: 'Kharagpur', state: 'West Bengal', category: 'IIT', domain: 'iitkgp.ac.in' },
  { value: 'IIT Roorkee (Indian Institute of Technology Roorkee)', label: 'IIT Roorkee', shortName: 'IITR', city: 'Roorkee', state: 'Uttarakhand', category: 'IIT', domain: 'iitr.ac.in' },
  { value: 'IIT Guwahati (Indian Institute of Technology Guwahati)', label: 'IIT Guwahati', shortName: 'IITG', city: 'Guwahati', state: 'Assam', category: 'IIT', domain: 'iitg.ac.in' },
  { value: 'IIT Hyderabad (Indian Institute of Technology Hyderabad)', label: 'IIT Hyderabad', shortName: 'IITH', city: 'Hyderabad', state: 'Telangana', category: 'IIT', domain: 'iith.ac.in' },
  { value: 'IIT (BHU) Varanasi', label: 'IIT (BHU) Varanasi', shortName: 'IIT-BHU', city: 'Varanasi', state: 'Uttar Pradesh', category: 'IIT', domain: 'iitbhu.ac.in' },
  { value: 'IIT Indore (Indian Institute of Technology Indore)', label: 'IIT Indore', shortName: 'IITI', city: 'Indore', state: 'Madhya Pradesh', category: 'IIT', domain: 'iiti.ac.in' },
  { value: 'IIT Gandhinagar', label: 'IIT Gandhinagar', shortName: 'IITGN', city: 'Gandhinagar', state: 'Gujarat', category: 'IIT', domain: 'iitgn.ac.in' },
  { value: 'IIT Ropar', label: 'IIT Ropar', shortName: 'IITRPR', city: 'Rupnagar', state: 'Punjab', category: 'IIT', domain: 'iitrpr.ac.in' },
  { value: 'IIT Patna', label: 'IIT Patna', shortName: 'IITP', city: 'Patna', state: 'Bihar', category: 'IIT', domain: 'iitp.ac.in' },
  { value: 'IIT Bhubaneswar', label: 'IIT Bhubaneswar', shortName: 'IITBBS', city: 'Bhubaneswar', state: 'Odisha', category: 'IIT', domain: 'iitbbs.ac.in' },
  { value: 'IIT Jodhpur', label: 'IIT Jodhpur', shortName: 'IITJ', city: 'Jodhpur', state: 'Rajasthan', category: 'IIT', domain: 'iitj.ac.in' },
  { value: 'IIT Mandi', label: 'IIT Mandi', shortName: 'IITMandi', city: 'Mandi', state: 'Himachal Pradesh', category: 'IIT', domain: 'iitmandi.ac.in' },
  { value: 'IIT Tirupati', label: 'IIT Tirupati', shortName: 'IITTP', city: 'Tirupati', state: 'Andhra Pradesh', category: 'IIT', domain: 'iittp.ac.in' },
  { value: 'IIT Palakkad', label: 'IIT Palakkad', shortName: 'IITPKD', city: 'Palakkad', state: 'Kerala', category: 'IIT', domain: 'iitpkd.ac.in' },
  { value: 'IIT Goa', label: 'IIT Goa', shortName: 'IITGoa', city: 'Ponda', state: 'Goa', category: 'IIT', domain: 'iitgoa.ac.in' },
  { value: 'IIT Jammu', label: 'IIT Jammu', shortName: 'IITJammu', city: 'Jammu', state: 'Jammu & Kashmir', category: 'IIT', domain: 'iitjammu.ac.in' },
  { value: 'IIT Dharwad', label: 'IIT Dharwad', shortName: 'IITDH', city: 'Dharwad', state: 'Karnataka', category: 'IIT', domain: 'iitdh.ac.in' },
  { value: 'IIT Bhilai', label: 'IIT Bhilai', shortName: 'IITBhilai', city: 'Bhilai', state: 'Chhattisgarh', category: 'IIT', domain: 'iitbhilai.ac.in' },
  { value: 'IIT (ISM) Dhanbad', label: 'IIT (ISM) Dhanbad', shortName: 'IIT-ISM', city: 'Dhanbad', state: 'Jharkhand', category: 'IIT', domain: 'iitism.ac.in' },

  // ==========================================
  // BITS Pilani Campuses
  // ==========================================
  { value: 'BITS Pilani (Pilani Campus)', label: 'BITS Pilani (Pilani Campus)', shortName: 'BITS', city: 'Pilani', state: 'Rajasthan', category: 'BITS', domain: 'bits-pilani.ac.in' },
  { value: 'BITS Pilani (Goa Campus - K. K. Birla)', label: 'BITS Pilani (Goa Campus)', shortName: 'BITS-Goa', city: 'Zuarinagar', state: 'Goa', category: 'BITS', domain: 'bits-pilani.ac.in' },
  { value: 'BITS Pilani (Hyderabad Campus)', label: 'BITS Pilani (Hyderabad Campus)', shortName: 'BITS-Hyd', city: 'Hyderabad', state: 'Telangana', category: 'BITS', domain: 'bits-pilani.ac.in' },

  // ==========================================
  // NITs — National Institutes of Technology
  // ==========================================
  { value: 'NIT Trichy (National Institute of Technology Tiruchirappalli)', label: 'NIT Trichy', shortName: 'NITT', city: 'Tiruchirappalli', state: 'Tamil Nadu', category: 'NIT', domain: 'nitt.edu' },
  { value: 'NIT Karnataka (NITK Surathkal)', label: 'NITK Surathkal', shortName: 'NITK', city: 'Mangalore', state: 'Karnataka', category: 'NIT', domain: 'nitk.ac.in' },
  { value: 'NIT Rourkela (National Institute of Technology Rourkela)', label: 'NIT Rourkela', shortName: 'NITR', city: 'Rourkela', state: 'Odisha', category: 'NIT', domain: 'nitrkl.ac.in' },
  { value: 'NIT Warangal (National Institute of Technology Warangal)', label: 'NIT Warangal', shortName: 'NITW', city: 'Warangal', state: 'Telangana', category: 'NIT', domain: 'nitw.ac.in' },
  { value: 'NIT Calicut (National Institute of Technology Calicut)', label: 'NIT Calicut', shortName: 'NITC', city: 'Kozhikode', state: 'Kerala', category: 'NIT', domain: 'nitc.ac.in' },
  { value: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur', label: 'VNIT Nagpur', shortName: 'VNIT', city: 'Nagpur', state: 'Maharashtra', category: 'NIT', domain: 'vnit.ac.in' },
  { value: 'Malaviya National Institute of Technology (MNIT), Jaipur', label: 'MNIT Jaipur', shortName: 'MNIT', city: 'Jaipur', state: 'Rajasthan', category: 'NIT', domain: 'mnit.ac.in' },
  { value: 'Motilal Nehru National Institute of Technology (MNNIT), Allahabad', label: 'MNNIT Allahabad', shortName: 'MNNIT', city: 'Prayagraj', state: 'Uttar Pradesh', category: 'NIT', domain: 'mnnit.ac.in' },
  { value: 'Sardar Vallabhbhai National Institute of Technology (SVNIT), Surat', label: 'SVNIT Surat', shortName: 'SVNIT', city: 'Surat', state: 'Gujarat', category: 'NIT', domain: 'svnit.ac.in' },
  { value: 'NIT Kurukshetra', label: 'NIT Kurukshetra', shortName: 'NITKKR', city: 'Kurukshetra', state: 'Haryana', category: 'NIT', domain: 'nitkkr.ac.in' },
  { value: 'NIT Durgapur', label: 'NIT Durgapur', shortName: 'NITDGP', city: 'Durgapur', state: 'West Bengal', category: 'NIT', domain: 'nitdgp.ac.in' },
  { value: 'NIT Jamshedpur', label: 'NIT Jamshedpur', shortName: 'NITJSR', city: 'Jamshedpur', state: 'Jharkhand', category: 'NIT', domain: 'nitjsr.ac.in' },
  { value: 'NIT Jalandhar (Dr. B. R. Ambedkar NIT)', label: 'NIT Jalandhar', shortName: 'NITJ', city: 'Jalandhar', state: 'Punjab', category: 'NIT', domain: 'nitj.ac.in' },
  { value: 'NIT Silchar', label: 'NIT Silchar', shortName: 'NITS', city: 'Silchar', state: 'Assam', category: 'NIT', domain: 'nits.ac.in' },
  { value: 'Maulana Azad National Institute of Technology (MANIT), Bhopal', label: 'MANIT Bhopal', shortName: 'MANIT', city: 'Bhopal', state: 'Madhya Pradesh', category: 'NIT', domain: 'manit.ac.in' },
  { value: 'NIT Patna', label: 'NIT Patna', shortName: 'NITP', city: 'Patna', state: 'Bihar', category: 'NIT', domain: 'nitp.ac.in' },
  { value: 'NIT Raipur', label: 'NIT Raipur', shortName: 'NITRR', city: 'Raipur', state: 'Chhattisgarh', category: 'NIT', domain: 'nitrr.ac.in' },
  { value: 'NIT Goa', label: 'NIT Goa', shortName: 'NITGoa', city: 'Cuncolim', state: 'Goa', category: 'NIT', domain: 'nitgoa.ac.in' },
  { value: 'NIT Hamirpur', label: 'NIT Hamirpur', shortName: 'NITH', city: 'Hamirpur', state: 'Himachal Pradesh', category: 'NIT', domain: 'nith.ac.in' },
  { value: 'NIT Meghalaya', label: 'NIT Meghalaya', shortName: 'NITM', city: 'Shillong', state: 'Meghalaya', category: 'NIT', domain: 'nitm.ac.in' },
  { value: 'NIT Delhi', label: 'NIT Delhi', shortName: 'NITD', city: 'New Delhi', state: 'Delhi', category: 'NIT', domain: 'nitdelhi.ac.in' },
  { value: 'NIT Srinagar', label: 'NIT Srinagar', shortName: 'NITSRI', city: 'Srinagar', state: 'Jammu & Kashmir', category: 'NIT', domain: 'nitsri.ac.in' },
  { value: 'NIT Uttarakhand', label: 'NIT Uttarakhand', shortName: 'NITUK', city: 'Srinagar', state: 'Uttarakhand', category: 'NIT', domain: 'nituk.ac.in' },
  { value: 'NIT Agartala', label: 'NIT Agartala', shortName: 'NITA', city: 'Agartala', state: 'Tripura', category: 'NIT', domain: 'nita.ac.in' },
  { value: 'NIT Puducherry', label: 'NIT Puducherry', shortName: 'NITPY', city: 'Karaikal', state: 'Puducherry', category: 'NIT', domain: 'nitpy.ac.in' },
  { value: 'NIT Andhra Pradesh', label: 'NIT Andhra Pradesh', shortName: 'NITAP', city: 'Tadepalligudem', state: 'Andhra Pradesh', category: 'NIT', domain: 'nitandhra.ac.in' },

  // ==========================================
  // IIITs — Indian Institutes of Information Technology
  // ==========================================
  { value: 'IIIT Hyderabad (International Institute of Information Technology)', label: 'IIIT Hyderabad', shortName: 'IIITH', city: 'Hyderabad', state: 'Telangana', category: 'IIIT', domain: 'iiit.ac.in' },
  { value: 'IIIT Bangalore (International Institute of Information Technology)', label: 'IIIT Bangalore', shortName: 'IIITB', city: 'Bengaluru', state: 'Karnataka', category: 'IIIT', domain: 'iiitb.ac.in' },
  { value: 'IIIT Delhi (Indraprastha Institute of Information Technology)', label: 'IIIT Delhi', shortName: 'IIITD', city: 'New Delhi', state: 'Delhi', category: 'IIIT', domain: 'iiitd.ac.in' },
  { value: 'IIIT Allahabad', label: 'IIIT Allahabad', shortName: 'IIITA', city: 'Prayagraj', state: 'Uttar Pradesh', category: 'IIIT', domain: 'iiita.ac.in' },
  { value: 'IIITM Gwalior (ABV-IIITM)', label: 'IIITM Gwalior', shortName: 'IIITM', city: 'Gwalior', state: 'Madhya Pradesh', category: 'IIIT', domain: 'iiitm.ac.in' },
  { value: 'IIIT Pune', label: 'IIIT Pune', shortName: 'IIITP', city: 'Pune', state: 'Maharashtra', category: 'IIIT', domain: 'iiitp.ac.in' },
  { value: 'IIIT Lucknow', label: 'IIIT Lucknow', shortName: 'IIITL', city: 'Lucknow', state: 'Uttar Pradesh', category: 'IIIT', domain: 'iiitl.ac.in' },
  { value: 'IIITDM Jabalpur', label: 'IIITDM Jabalpur', shortName: 'IIITDMJ', city: 'Jabalpur', state: 'Madhya Pradesh', category: 'IIIT', domain: 'iiitdmj.ac.in' },
  { value: 'IIITDM Kancheepuram', label: 'IIITDM Kancheepuram', shortName: 'IIITDMK', city: 'Chennai', state: 'Tamil Nadu', category: 'IIIT', domain: 'iiitdm.ac.in' },
  { value: 'IIIT Sri City', label: 'IIIT Sri City', shortName: 'IIITS', city: 'Chittoor', state: 'Andhra Pradesh', category: 'IIIT', domain: 'iiits.ac.in' },
  { value: 'IIIT Vadodara', label: 'IIIT Vadodara', shortName: 'IIITV', city: 'Gandhinagar', state: 'Gujarat', category: 'IIIT', domain: 'iiitvadodara.ac.in' },
  { value: 'IIIT Kota', label: 'IIIT Kota', shortName: 'IIITKota', city: 'Kota', state: 'Rajasthan', category: 'IIIT', domain: 'iiitkota.ac.in' },

  // ==========================================
  // Maharashtra & Pune Hub
  // ==========================================
  { value: 'MIT World Peace University (MIT-WPU), Pune', label: 'MIT World Peace University (MIT-WPU), Pune', shortName: 'MIT-WPU', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'mitwpu.edu.in' },
  { value: 'COEP Technological University, Pune', label: 'COEP Technological University, Pune', shortName: 'COEP', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'coep.org.in' },
  { value: 'Pune Institute of Computer Technology (PICT), Pune', label: 'Pune Institute of Computer Technology (PICT)', shortName: 'PICT', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'pict.edu' },
  { value: 'Vishwakarma Institute of Technology (VIT), Pune', label: 'Vishwakarma Institute of Technology (VIT), Pune', shortName: 'VIT Pune', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'vit.edu' },
  { value: 'Vishwakarma Institute of Information Technology (VIIT), Pune', label: 'VIIT Pune', shortName: 'VIIT', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'viit.ac.in' },
  { value: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', label: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', shortName: 'VJTI', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'vjti.ac.in' },
  { value: 'Sardar Patel Institute of Technology (SPIT), Mumbai', label: 'Sardar Patel Institute of Technology (SPIT), Mumbai', shortName: 'SPIT', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'spit.ac.in' },
  { value: 'D. J. Sanghvi College of Engineering, Mumbai', label: 'D. J. Sanghvi College of Engineering, Mumbai', shortName: 'DJSCE', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'djsce.ac.in' },
  { value: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune', label: 'Pimpri Chinchwad College of Engineering (PCCOE)', shortName: 'PCCOE', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'pccoepune.com' },
  { value: 'Pimpri Chinchwad College of Engineering & Research (PCCOER), Ravet', label: 'PCCOER Ravet, Pune', shortName: 'PCCOER', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'pccoer.com' },
  { value: 'MKSSS Cummins College of Engineering for Women, Pune', label: 'MKSSS Cummins College of Engineering for Women, Pune', shortName: 'Cummins', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'cumminscollege.org' },
  { value: 'Walchand College of Engineering, Sangli', label: 'Walchand College of Engineering, Sangli', shortName: 'WCE', city: 'Sangli', state: 'Maharashtra', category: 'Maharashtra', domain: 'walchandsangli.ac.in' },
  { value: 'Government College of Engineering, Aurangabad', label: 'Government College of Engineering, Aurangabad', shortName: 'GECA', city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', category: 'Maharashtra', domain: 'geca.ac.in' },
  { value: 'Government College of Engineering, Amravati', label: 'Government College of Engineering, Amravati', shortName: 'GCOEA', city: 'Amravati', state: 'Maharashtra', category: 'Maharashtra', domain: 'gcoea.ac.in' },
  { value: 'Government College of Engineering, Karad', label: 'Government College of Engineering, Karad', shortName: 'GCEK', city: 'Karad', state: 'Maharashtra', category: 'Maharashtra', domain: 'gcekarad.ac.in' },
  { value: 'Thadomal Shahani Engineering College (TSEC), Mumbai', label: 'Thadomal Shahani Engineering College (TSEC), Mumbai', shortName: 'TSEC', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'tsec.edu' },
  { value: 'K. J. Somaiya College of Engineering, Mumbai', label: 'K. J. Somaiya College of Engineering, Mumbai', shortName: 'KJSCE', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'kjsce.somaiya.edu' },
  { value: 'Fr. Conceicao Rodrigues College of Engineering (CRCE), Bandra', label: 'Fr. CRCE Bandra, Mumbai', shortName: 'CRCE', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'frcrce.ac.in' },
  { value: 'Vivekanand Education Society Institute of Technology (VESIT), Mumbai', label: 'VESIT Chembur, Mumbai', shortName: 'VESIT', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'vesit.ves.ac.in' },
  { value: 'MIT Academy of Engineering (MITAOE), Alandi, Pune', label: 'MIT Academy of Engineering (MITAOE), Pune', shortName: 'MITAOE', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'mitaoe.ac.in' },
  { value: 'Dr. D. Y. Patil Institute of Technology, Pimpri, Pune', label: 'Dr. D. Y. Patil Institute of Technology, Pimpri', shortName: 'DYP Pimpri', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'engg.dypvp.edu.in' },
  { value: 'Dr. D. Y. Patil College of Engineering, Akurdi, Pune', label: 'Dr. D. Y. Patil College of Engineering, Akurdi', shortName: 'DYP Akurdi', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'dypcoeakurdi.ac.in' },
  { value: 'Bharati Vidyapeeth Deemed University College of Engineering, Pune', label: 'Bharati Vidyapeeth (BVDU COE), Pune', shortName: 'BVUCOE', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'bvucoepune.edu.in' },
  { value: 'Sinhgad College of Engineering (SCOE), Vadgaon, Pune', label: 'Sinhgad College of Engineering (SCOE), Pune', shortName: 'SCOE', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'sinhgad.edu' },
  { value: 'AISSMS College of Engineering, Pune', label: 'AISSMS College of Engineering, Pune', shortName: 'AISSMS', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'aissmscoe.com' },
  { value: 'AISSMS Institute of Information Technology (IOIT), Pune', label: 'AISSMS IOIT, Pune', shortName: 'AISSMS-IOIT', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'aissmsioit.org' },
  { value: 'Army Institute of Technology (AIT), Pune', label: 'Army Institute of Technology (AIT), Pune', shortName: 'AIT', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'aitpune.com' },
  { value: 'Rajarshi Shahu College of Engineering (JSPM RSCOE), Tathawade', label: 'JSPM RSCOE Tathawade, Pune', shortName: 'RSCOE', city: 'Pune', state: 'Maharashtra', category: 'Maharashtra', domain: 'jspmrscoe.edu.in' },
  { value: 'Ramrao Adik Institute of Technology (RAIT), Navi Mumbai', label: 'Ramrao Adik Institute of Technology (RAIT)', shortName: 'RAIT', city: 'Navi Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'dypatil.edu' },
  { value: 'Vidyalankar Institute of Technology (VIT), Wadala, Mumbai', label: 'Vidyalankar Institute of Technology (VIT), Mumbai', shortName: 'VIT Mumbai', city: 'Mumbai', state: 'Maharashtra', category: 'Maharashtra', domain: 'vpt.edu.in' },

  // ==========================================
  // Karnataka & Bengaluru Hub
  // ==========================================
  { value: 'R. V. College of Engineering (RVCE), Bengaluru', label: 'RV College of Engineering (RVCE), Bengaluru', shortName: 'RVCE', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'rvce.edu.in' },
  { value: 'BMS College of Engineering (BMSCE), Bengaluru', label: 'BMS College of Engineering, Bengaluru', shortName: 'BMSCE', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'bmsce.ac.in' },
  { value: 'Ramaiah Institute of Technology (MSRIT), Bengaluru', label: 'Ramaiah Institute of Technology, Bengaluru', shortName: 'MSRIT', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'msrit.edu' },
  { value: 'PES University, Bengaluru', label: 'PES University, Bengaluru', shortName: 'PES', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'pes.edu' },
  { value: 'Manipal Institute of Technology (MAHE), Manipal', label: 'Manipal Institute of Technology (MIT), Manipal', shortName: 'MIT Manipal', city: 'Manipal', state: 'Karnataka', category: 'Karnataka', domain: 'manipal.edu' },
  { value: 'Dayananda Sagar College of Engineering (DSCE), Bengaluru', label: 'Dayananda Sagar College of Engineering', shortName: 'DSCE', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'dayanandasagar.edu' },
  { value: 'BMS Institute of Technology and Management (BMSIT), Bengaluru', label: 'BMSIT Bengaluru', shortName: 'BMSIT', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'bmsit.ac.in' },
  { value: 'Siddaganga Institute of Technology (SIT), Tumkur', label: 'SIT Tumkur', shortName: 'SIT', city: 'Tumkur', state: 'Karnataka', category: 'Karnataka', domain: 'sit.ac.in' },
  { value: 'Bangalore Institute of Technology (BIT), Bengaluru', label: 'Bangalore Institute of Technology (BIT)', shortName: 'BIT', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'bit-bangalore.edu.in' },
  { value: 'New Horizon College of Engineering (NHCE), Bengaluru', label: 'New Horizon College of Engineering', shortName: 'NHCE', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'newhorizonindia.edu' },
  { value: 'Sir M. Visvesvaraya Institute of Technology (SMVIT), Bengaluru', label: 'Sir MVIT Bengaluru', shortName: 'SMVIT', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'sriramainstitutions.com' },
  { value: 'Nitte Meenakshi Institute of Technology (NMIT), Bengaluru', label: 'NMIT Bengaluru', shortName: 'NMIT', city: 'Bengaluru', state: 'Karnataka', category: 'Karnataka', domain: 'nmit.ac.in' },
  { value: 'KLE Technological University, Hubballi', label: 'KLE Technological University, Hubballi', shortName: 'KLE Tech', city: 'Hubballi', state: 'Karnataka', category: 'Karnataka', domain: 'kletech.ac.in' },
  { value: 'The National Institute of Engineering (NIE), Mysuru', label: 'NIE Mysuru', shortName: 'NIE', city: 'Mysuru', state: 'Karnataka', category: 'Karnataka', domain: 'nie.ac.in' },
  { value: 'JSS Science and Technology University (SJCE), Mysuru', label: 'SJCE (JSS STU), Mysuru', shortName: 'SJCE', city: 'Mysuru', state: 'Karnataka', category: 'Karnataka', domain: 'jssstuniv.in' },

  // ==========================================
  // Delhi NCR & North India
  // ==========================================
  { value: 'Delhi Technological University (DTU), Delhi', label: 'Delhi Technological University (DTU)', shortName: 'DTU', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'dtu.ac.in' },
  { value: 'Netaji Subhas University of Technology (NSUT), Delhi', label: 'Netaji Subhas University of Technology (NSUT)', shortName: 'NSUT', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'nsut.ac.in' },
  { value: 'Indira Gandhi Delhi Technical University for Women (IGDTUW)', label: 'IGDTUW Delhi', shortName: 'IGDTUW', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'igdtuw.ac.in' },
  { value: 'Jamia Millia Islamia (Faculty of Engineering), New Delhi', label: 'Jamia Millia Islamia (FET)', shortName: 'JMI', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'jmi.ac.in' },
  { value: 'Jaypee Institute of Information Technology (JIIT), Noida', label: 'Jaypee Institute (JIIT), Noida', shortName: 'JIIT', city: 'Noida', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'jiit.ac.in' },
  { value: 'Maharaja Agrasen Institute of Technology (MAIT), Delhi', label: 'MAIT Delhi', shortName: 'MAIT', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'mait.ac.in' },
  { value: 'Maharaja Surajmal Institute of Technology (MSIT), Delhi', label: 'MSIT Delhi', shortName: 'MSIT', city: 'New Delhi', state: 'Delhi', category: 'Delhi NCR', domain: 'msit.in' },
  { value: 'Shiv Nadar University, Greater Noida', label: 'Shiv Nadar University', shortName: 'SNU', city: 'Greater Noida', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'snu.edu.in' },
  { value: 'Bennett University, Greater Noida', label: 'Bennett University', shortName: 'BU', city: 'Greater Noida', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'bennett.edu.in' },
  { value: 'Thapar Institute of Engineering and Technology, Patiala', label: 'Thapar Institute (TIET), Patiala', shortName: 'TIET', city: 'Patiala', state: 'Punjab', category: 'North India', domain: 'thapar.edu' },
  { value: 'Punjab Engineering College (PEC), Chandigarh', label: 'PEC Chandigarh', shortName: 'PEC', city: 'Chandigarh', state: 'Chandigarh', category: 'North India', domain: 'pec.ac.in' },
  { value: 'Chandigarh University, Mohali', label: 'Chandigarh University', shortName: 'CU', city: 'Mohali', state: 'Punjab', category: 'North India', domain: 'cuchd.in' },
  { value: 'Chitkara University, Rajpura', label: 'Chitkara University', shortName: 'Chitkara', city: 'Rajpura', state: 'Punjab', category: 'North India', domain: 'chitkara.edu.in' },
  { value: 'Lovely Professional University (LPU), Phagwara', label: 'Lovely Professional University (LPU)', shortName: 'LPU', city: 'Phagwara', state: 'Punjab', category: 'North India', domain: 'lpu.in' },
  { value: 'Harcourt Butler Technical University (HBTU), Kanpur', label: 'HBTU Kanpur', shortName: 'HBTU', city: 'Kanpur', state: 'Uttar Pradesh', category: 'North India', domain: 'hbtu.ac.in' },
  { value: 'Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur', label: 'MMMUT Gorakhpur', shortName: 'MMMUT', city: 'Gorakhpur', state: 'Uttar Pradesh', category: 'North India', domain: 'mmmut.ac.in' },
  { value: 'Institute of Engineering and Technology (IET Lucknow)', label: 'IET Lucknow', shortName: 'IET-LKO', city: 'Lucknow', state: 'Uttar Pradesh', category: 'North India', domain: 'ietlucknow.ac.in' },
  { value: 'Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad', label: 'AKGEC Ghaziabad', shortName: 'AKGEC', city: 'Ghaziabad', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'akgec.ac.in' },
  { value: 'JSS Academy of Technical Education, Noida', label: 'JSS Noida', shortName: 'JSS-Noida', city: 'Noida', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'jssaten.ac.in' },
  { value: 'Galgotias University / College, Greater Noida', label: 'Galgotias University', shortName: 'Galgotias', city: 'Greater Noida', state: 'Uttar Pradesh', category: 'Delhi NCR', domain: 'galgotiasuniversity.edu.in' },

  // ==========================================
  // Tamil Nadu & South India
  // ==========================================
  { value: 'Vellore Institute of Technology (VIT), Vellore', label: 'Vellore Institute of Technology (VIT), Vellore', shortName: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'vit.ac.in' },
  { value: 'Vellore Institute of Technology (VIT), Chennai', label: 'Vellore Institute of Technology (VIT), Chennai', shortName: 'VIT Chennai', city: 'Chennai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'vit.ac.in' },
  { value: 'SRM Institute of Science and Technology, Kattankulathur', label: 'SRM Institute of Science and Technology, Chennai', shortName: 'SRM', city: 'Chennai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'srmist.edu.in' },
  { value: 'College of Engineering, Guindy (Anna University CEG), Chennai', label: 'Anna University (CEG), Chennai', shortName: 'CEG', city: 'Chennai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'ceg.annauniv.edu' },
  { value: 'Madras Institute of Technology (Anna University MIT), Chromepet', label: 'Anna University (MIT), Chromepet', shortName: 'MIT Chennai', city: 'Chennai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'mitindia.edu' },
  { value: 'PSG College of Technology, Coimbatore', label: 'PSG College of Technology, Coimbatore', shortName: 'PSG Tech', city: 'Coimbatore', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'psgtech.edu' },
  { value: 'SSN College of Engineering, Chennai', label: 'SSN College of Engineering, Chennai', shortName: 'SSN', city: 'Chennai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'ssn.edu.in' },
  { value: 'Amrita Vishwa Vidyapeetham, Coimbatore', label: 'Amrita Vishwa Vidyapeetham, Coimbatore', shortName: 'Amrita', city: 'Coimbatore', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'amrita.edu' },
  { value: 'Thiagarajar College of Engineering (TCE), Madurai', label: 'Thiagarajar College of Engineering, Madurai', shortName: 'TCE', city: 'Madurai', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'tce.edu' },
  { value: 'Coimbatore Institute of Technology (CIT), Coimbatore', label: 'CIT Coimbatore', shortName: 'CIT', city: 'Coimbatore', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'cit.edu.in' },
  { value: 'Sastra Deemed University, Thanjavur', label: 'Sastra Deemed University, Thanjavur', shortName: 'SASTRA', city: 'Thanjavur', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'sastra.edu' },
  { value: 'Kumaraguru College of Technology (KCT), Coimbatore', label: 'Kumaraguru College of Technology (KCT)', shortName: 'KCT', city: 'Coimbatore', state: 'Tamil Nadu', category: 'Tamil Nadu', domain: 'kct.ac.in' },

  // ==========================================
  // Telangana & Andhra Pradesh
  // ==========================================
  { value: 'Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad', label: 'CBIT Hyderabad', shortName: 'CBIT', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'cbit.ac.in' },
  { value: 'VNR Vignana Jyothi Institute of Engineering & Technology (VNR VJIET), Hyderabad', label: 'VNR VJIET Hyderabad', shortName: 'VNR-VJIET', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'vnrvjiet.ac.in' },
  { value: 'University College of Engineering, Osmania University, Hyderabad', label: 'Osmania University (UCE), Hyderabad', shortName: 'UCE-OU', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'uceou.edu' },
  { value: 'JNTUH University College of Engineering, Hyderabad', label: 'JNTUH College of Engineering, Hyderabad', shortName: 'JNTUH', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'jntuhceh.ac.in' },
  { value: 'Vasavi College of Engineering, Hyderabad', label: 'Vasavi College of Engineering, Hyderabad', shortName: 'VCE', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'vce.ac.in' },
  { value: 'Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Hyderabad', label: 'GRIET Hyderabad', shortName: 'GRIET', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'griet.ac.in' },
  { value: 'BVRIT Hyderabad College of Engineering for Women', label: 'BVRIT Hyderabad', shortName: 'BVRIT', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'bvrit.ac.in' },
  { value: 'CVR College of Engineering, Hyderabad', label: 'CVR College of Engineering, Hyderabad', shortName: 'CVR', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'cvr.ac.in' },
  { value: 'Mahatma Gandhi Institute of Technology (MGIT), Hyderabad', label: 'MGIT Hyderabad', shortName: 'MGIT', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'mgit.ac.in' },
  { value: 'Vardhaman College of Engineering, Hyderabad', label: 'Vardhaman College of Engineering', shortName: 'VCEH', city: 'Hyderabad', state: 'Telangana', category: 'Telangana', domain: 'vardhaman.org' },
  { value: 'K L University (KLEF), Guntur', label: 'K L University, Guntur', shortName: 'KLU', city: 'Guntur', state: 'Andhra Pradesh', category: 'Andhra Pradesh', domain: 'kluniversity.in' },
  { value: 'Gayatri Vidya Parishad College of Engineering (GVPCE), Visakhapatnam', label: 'GVPCE Visakhapatnam', shortName: 'GVPCE', city: 'Visakhapatnam', state: 'Andhra Pradesh', category: 'Andhra Pradesh', domain: 'gvpce.ac.in' },
  { value: 'Andhra University College of Engineering (AUCE), Visakhapatnam', label: 'Andhra University (AUCE)', shortName: 'AUCE', city: 'Visakhapatnam', state: 'Andhra Pradesh', category: 'Andhra Pradesh', domain: 'andhrauniversity.edu.in' },
  { value: 'Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), Vijayawada', label: 'VR Siddhartha Engineering College', shortName: 'VRSEC', city: 'Vijayawada', state: 'Andhra Pradesh', category: 'Andhra Pradesh', domain: 'vrsiddhartha.ac.in' },

  // ==========================================
  // Gujarat & Rajasthan
  // ==========================================
  { value: 'Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT), Gandhinagar', label: 'DA-IICT Gandhinagar', shortName: 'DA-IICT', city: 'Gandhinagar', state: 'Gujarat', category: 'Gujarat', domain: 'daiict.ac.in' },
  { value: 'Nirma University (Institute of Technology), Ahmedabad', label: 'Nirma University, Ahmedabad', shortName: 'Nirma', city: 'Ahmedabad', state: 'Gujarat', category: 'Gujarat', domain: 'nirmauni.ac.in' },
  { value: 'L. D. College of Engineering (LDCE), Ahmedabad', label: 'L. D. College of Engineering (LDCE)', shortName: 'LDCE', city: 'Ahmedabad', state: 'Gujarat', category: 'Gujarat', domain: 'ldce.ac.in' },
  { value: 'Pandit Deendayal Energy University (PDEU), Gandhinagar', label: 'PDEU Gandhinagar', shortName: 'PDEU', city: 'Gandhinagar', state: 'Gujarat', category: 'Gujarat', domain: 'pdeu.ac.in' },
  { value: 'Maharaja Sayajirao University of Baroda (MSU), Vadodara', label: 'MSU Baroda', shortName: 'MSU', city: 'Vadodara', state: 'Gujarat', category: 'Gujarat', domain: 'msubaroda.ac.in' },
  { value: 'The LNM Institute of Information Technology (LNMIIT), Jaipur', label: 'LNMIIT Jaipur', shortName: 'LNMIIT', city: 'Jaipur', state: 'Rajasthan', category: 'Rajasthan', domain: 'lnmiit.ac.in' },
  { value: 'Manipal University Jaipur (MUJ)', label: 'Manipal University Jaipur', shortName: 'MUJ', city: 'Jaipur', state: 'Rajasthan', category: 'Rajasthan', domain: 'jaipur.manipal.edu' },
  { value: 'College of Technology and Engineering (CTAE), Udaipur', label: 'CTAE Udaipur', shortName: 'CTAE', city: 'Udaipur', state: 'Rajasthan', category: 'Rajasthan', domain: 'ctae.ac.in' },

  // ==========================================
  // East & Central India
  // ==========================================
  { value: 'Jadavpur University (Faculty of Engineering), Kolkata', label: 'Jadavpur University, Kolkata', shortName: 'JU', city: 'Kolkata', state: 'West Bengal', category: 'West Bengal', domain: 'jaduniv.edu.in' },
  { value: 'Indian Institute of Engineering Science and Technology (IIEST), Shibpur', label: 'IIEST Shibpur', shortName: 'IIEST', city: 'Howrah', state: 'West Bengal', category: 'West Bengal', domain: 'iiests.ac.in' },
  { value: 'Heritage Institute of Technology, Kolkata', label: 'Heritage Institute of Technology, Kolkata', shortName: 'Heritage', city: 'Kolkata', state: 'West Bengal', category: 'West Bengal', domain: 'heritageit.edu' },
  { value: 'Institute of Engineering and Management (IEM), Kolkata', label: 'IEM Kolkata', shortName: 'IEM', city: 'Kolkata', state: 'West Bengal', category: 'West Bengal', domain: 'iem.edu.in' },
  { value: 'Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar', label: 'KIIT University, Bhubaneswar', shortName: 'KIIT', city: 'Bhubaneswar', state: 'Odisha', category: 'Odisha', domain: 'kiit.ac.in' },
  { value: 'Siksha O Anusandhan (SOA / ITER), Bhubaneswar', label: 'SOA University (ITER), Bhubaneswar', shortName: 'ITER', city: 'Bhubaneswar', state: 'Odisha', category: 'Odisha', domain: 'soa.ac.in' },
  { value: 'Birla Institute of Technology (BIT), Mesra, Ranchi', label: 'BIT Mesra, Ranchi', shortName: 'BIT Mesra', city: 'Ranchi', state: 'Jharkhand', category: 'Jharkhand', domain: 'bitmesra.ac.in' },
  { value: 'Shri Govindram Seksaria Institute of Technology and Science (SGSITS), Indore', label: 'SGSITS Indore', shortName: 'SGSITS', city: 'Indore', state: 'Madhya Pradesh', category: 'Madhya Pradesh', domain: 'sgsits.ac.in' },
  { value: 'Institute of Engineering & Technology (IET DAVV), Indore', label: 'IET DAVV Indore', shortName: 'IET-DAVV', city: 'Indore', state: 'Madhya Pradesh', category: 'Madhya Pradesh', domain: 'ietdavv.edu.in' },
  { value: 'College of Engineering Trivandrum (CET), Thiruvananthapuram', label: 'College of Engineering Trivandrum (CET)', shortName: 'CET', city: 'Thiruvananthapuram', state: 'Kerala', category: 'Kerala', domain: 'cet.ac.in' },
  { value: 'Government Engineering College (GEC), Thrissur', label: 'GEC Thrissur', shortName: 'GECT', city: 'Thrissur', state: 'Kerala', category: 'Kerala', domain: 'gectcr.ac.in' },
  { value: 'Model Engineering College (MEC), Kochi', label: 'Model Engineering College, Kochi', shortName: 'MEC', city: 'Kochi', state: 'Kerala', category: 'Kerala', domain: 'mec.ac.in' },
  { value: 'TKM College of Engineering, Kollam', label: 'TKM College of Engineering, Kollam', shortName: 'TKM', city: 'Kollam', state: 'Kerala', category: 'Kerala', domain: 'tkmce.ac.in' },
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
