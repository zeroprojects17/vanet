/* global __initial_auth_token, __app_id, __firebase_config */ // Declare global variables for ESLint

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth'; // Added signInWithCustomToken
import { getFirestore } from 'firebase/firestore'; // Import getFirestore if needed for future data storage

// The UNIMAP knowledge base data, including Malay translations for patterns and responses.
const uniselData = {
  "intents": [
    {
      "section": "General Greetings",
      "intents": [
        {
          "tag": "greeting",
          "patterns": ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening", "hai", "selamat pagi", "selamat tengah hari", "selamat petang", "apa khabar"],
          "responses": ["Hello! How can I assist you with UNIMAP today?", "Hi there! What can I help you with regarding UNIMAP?", "Greetings! How may I help you learn about UNIMAP?"],
          "responses_malay": ["Hai! Bagaimana saya boleh membantu anda dengan UNIMAP hari ini?", "Hai! Apa yang boleh saya bantu anda tentang UNIMAP?", "Salam sejahtera! Bagaimana saya boleh bantu anda mengetahui tentang UNIMAP?"],
          "metadata": {}
        }
      ]
    },
    {
      "section": "Language Control",
      "intents": [
        {
          "tag": "set_language_english",
          "patterns": ["english please", "respond in english", "only english", "switch to english", "english"],
          "responses": ["Okay, I will respond in English from now on."],
          "responses_malay": ["Baik, saya akan menjawab dalam bahasa Inggeris mulai sekarang."],
          "metadata": { "language_mode": "english" }
        },
        {
          "tag": "set_language_malay",
          "patterns": ["malay please", "respond in malay", "only malay", "switch to malay", "malay", "bahasa melayu", "dalam bahasa melayu"],
          "responses": ["Baik, saya akan menjawab dalam bahasa Melayu mulai sekarang."],
          "responses_malay": ["Baik, saya akan menjawab dalam bahasa Melayu mulai sekarang."],
          "metadata": { "language_mode": "malay" }
        },
        {
          "tag": "set_language_bilingual",
          "patterns": ["bilingual please", "respond in both languages", "english and malay", "dwibahasa", "dalam dua bahasa", "bi-langual"],
          "responses": ["Okay, I will respond in both English and Malay from now on. / Baik, saya akan menjawab dalam bahasa Inggeris dan Melayu mulai sekarang."],
          "responses_malay": ["Baik, saya akan menjawab dalam bahasa Inggeris dan Melayu mulai sekarang. / Okay, I will respond in both English and Malay from now on."],
          "metadata": { "language_mode": "bilingual" }
        }
      ]
    },
    {
      "section": "About UNIMAP",
      "intents": [
        {
          "tag": "about_unisel_overview",
          "patterns": ["about UNIMAP", "who is UNIMAP", "UNIMAP history", "background of UNIMAP", "tentang UNIMAP", "siapa UNIMAP", "sejarah UNIMAP",
"latar belakang UNIMAP"],
          "responses": ["Universiti Malaysia Perlis (UNIMAP) was established on 25th May 2002. It is Malaysia's 17th public university and the first to be established in Perlis. UNIMAP focuses on engineering and technology, aiming to produce highly skilled engineers and technologists."],
          "responses_malay": ["Universiti Malaysia Perlis (UNIMAP) ditubuhkan pada 25 Mei 2002. Ia merupakan universiti awam ke-17 di Malaysia dan yang pertama ditubuhkan di Perlis. UNIMAP memberi tumpuan kepada bidang kejuruteraan dan teknologi, bertujuan untuk melahirkan jurutera dan teknologis berkemahiran tinggi."],
          "metadata": {
            "established_date": "25th May 2002",
            "campuses": ["Main Campus (Pauh Putra)", "City Campus (Kangar)"],
            "special_status": "Malaysia's 17th public university, first in Perlis"
          }
        },
        {
          "tag": "about_us_sections",
          "patterns": ["about us sections", "what's in about us", "bahagian tentang kami", "apa ada dalam tentang kami"],
          "responses": ["Under 'About Us', you can find information on 'VISION & MISSION', 'MANAGEMENT', and 'WORDS FROM VICE-CHANCELLOR'."],
          "responses_malay": ["Di bawah 'Tentang Kami', anda boleh mendapatkan maklumat mengenai 'VISI & MISI', 'PENGURUSAN', dan 'KATA-KATA DARI NAIB CANSELOR'."],
          "metadata": {}
        },
        {
          "tag": "why_choose_unisel",
          "patterns": ["why choose UNIMAP", "benefits of UNIMAP", "advantages UNIMAP", "reason to study UNIMAP", "kenapa pilih UNIMAP", "kelebihan UNIMAP", "faedah UNIMAP", "sebab belajar di UNIMAP"],
          "responses": ["Reasons to choose UNIMAP:"],
          "responses_malay": ["Sebab-sebab memilih UNIMAP:"],
          "metadata": {
            "advantages": [
              "Focus on engineering and technology / Tumpuan kepada kejuruteraan dan teknologi",
              "Industry-relevant programs / Program yang relevan dengan industri",
              "Conducive learning environment / Persekitaran pembelajaran yang kondusif",
              "Modern facilities and labs / Kemudahan dan makmal moden",
              "Experienced academicians / Ahli akademik berpengalaman",
              "High quality programmes recognised by the MQA / Program berkualiti tinggi yang diiktiraf oleh MQA"
            ]
          }
        }
      ]
    },
    {
      "section": "Contact Information",
      "intents": [
        {
          "tag": "contact_phone",
          "patterns": ["phone number", "contact number", "call UNIMAP", "UNIMAP phone", "nombor telefon", "nombor hubungan", "hubungi UNIMAP", "telefon UNIMAP"],
          "responses": ["You can contact UNIMAP by phone at +604 988 5000."],
          "responses_malay": ["Anda boleh menghubungi UNIMAP melalui telefon di +604 988 5000."],
          "metadata": {}
        },
        {
          "tag": "contact_email_admission",
          "patterns": ["admission email", "email for admission", "apply email", "emel kemasukan", "emel untuk kemasukan", "emel permohonan"],
          "responses": ["For admissions inquiries, you can email admission@unimap.edu.my."],
          "responses_malay": ["Untuk pertanyaan kemasukan, anda boleh menghantar emel ke admission@unimap.edu.my."],
          "metadata": {}
        },
        {
          "tag": "contact_whatsapp",
          "patterns": ["whatsapp", "chat", "message UNIMAP", "mesej UNIMAP", "berbual", "whatsapp UNIMAP"],
          "responses": ["You can initiate a WhatsApp chat with UNIMAP via the 'WhatsApp Us Now' link on their website."],
          "responses_malay": ["Anda boleh memulakan sembang WhatsApp dengan UNIMAP melalui pautan 'WhatsApp Kami Sekarang' di laman web mereka."],
          "metadata": {}
        }
      ]
    },
    {
      "section": "Vision & Mission",
      "intents": [
        {
          "tag": "unisel_vision",
          "patterns": ["UNIMAP vision", "university vision", "what is UNIMAP's vision", "visi UNIMAP", "visi universiti", "apa visi UNIMAP"],
          "responses": ["UNIMAP's Vision is: To be an internationally competitive university that produces human capital excellence and contributes to the nation's development."],
          "responses_malay": ["Visi UNIMAP adalah: Menjadi universiti bertaraf antarabangsa yang melahirkan modal insan cemerlang dan menyumbang kepada pembangunan negara."],
          "metadata": {}
        },
        {
          "tag": "unisel_mission",
          "patterns": ["UNIMAP mission", "university mission", "what is UNIMAP's mission", "UNIMAP's commitment", "misi UNIMAP", "misi universiti", "apa misi UNIMAP", "komitmen UNIMAP"],
          "responses": ["UNIMAP's Mission is: To provide quality education and conduct impactful research in engineering and technology for the benefit of society."],
          "responses_malay": ["Misi UNIMAP adalah: Menyediakan pendidikan berkualiti dan menjalankan penyelidikan berimpak dalam bidang kejuruteraan dan teknologi demi manfaat masyarakat."],
          "metadata": {}
        }
      ]
    },
    {
      "section": "Management",
      "intents": [
        {
          "tag": "management_overview",
          "patterns": ["UNIMAP management", "leadership UNIMAP", "who runs UNIMAP", "management structure", "pengurusan UNIMAP", "kepimpinan UNIMAP", "siapa yang mengurus UNIMAP", "struktur pengurusan"],
          "responses": ["UNIMAP's management comprises several key bodies including the Chancellery, Board of Directors, Executive, Senate, and Management Committee."],
          "responses_malay": ["Pengurusan UNIMAP terdiri daripada beberapa badan utama termasuk Canselori, Lembaga Pengarah, Eksekutif, Senat, dan Jawatankuasa Pengurusan."],
          "metadata": {
            "management_teams": [
              "Chancellery / Canselori",
              "Board of Directors / Lembaga Pengarah",
              "Executive / Eksekutif",
              "Senate / Senat",
              "Management Committee / Jawatankuasa Pengurusan"
            ]
          }
        },
        {
          "tag": "chancellery_info",
          "patterns": ["chancellor UNIMAP", "pro chancellor UNIMAP", "chancellery members", "canselor UNIMAP", "pro canselor UNIMAP", "ahli canselori", "siapakah canselor"],
          "responses": ["UNIMAP Chancellery members:"],
          "responses_malay": ["Ahli-ahli Canselori UNIMAP:"],
          "metadata": {
            "members": [
              {
                "title": "CHANCELLOR",
                "name": "Duli Yang Maha Mulia Raja Muda Perlis Tuanku Syed Faizuddin Putra Ibni Tuanku Syed Sirajuddin Jamalullail"
              },
              {
                "title": "PRO CHANCELLOR",
                "name": "Y.Bhg. Dato' Sri Haji Azizan bin Haji Abdul Rahman"
              }
            ]
          }
        },
        {
          "tag": "president_message",
          "patterns": ["vice-chancellor's message", "message from vice-chancellor", "UNIMAP vice-chancellor statement", "mesej naib canselor", "kata-kata dari naib canselor", "kenyataan naib canselor UNIMAP"],
          "responses": ["Message from the Vice-Chancellor: \"UNIMAP is committed to providing a holistic education that prepares students for the challenges of the future...\""],
          "responses_malay": ["Mesej daripada Naib Canselor: \"UNIMAP komited untuk menyediakan pendidikan holistik yang mempersiapkan pelajar menghadapi cabaran masa depan...\""],
          "metadata": {
            "speaker": "Prof. Ts. Dr. Zaliman bin Sauli",
            "position": "Vice-Chancellor / Naib Canselor"
          }
        }
      ]
    },
    {
      "section": "Faculties",
      "intents": [
        {
          "tag": "faculties_overview",
          "patterns": ["list of faculties", "UNIMAP faculties", "what faculties does UNIMAP have", "senarai fakulti", "fakulti UNIMAP", "apa fakulti yang ada di UNIMAP"],
          "responses": ["UNIMAP offers these faculties:"],
          "responses_malay": ["UNIMAP menawarkan fakulti-fakulti berikut:"],
          "metadata": {
            "faculties": [
              {
                "name": "Faculty of Electronic Engineering Technology (FTKEN) / Fakulti Teknologi Kejuruteraan Elektronik (FTKEN)",
                "link": "https://ftken.unimap.edu.my/",
                "description": "Focuses on electronic engineering technology programs"
              },
              {
                "name": "Faculty of Electrical Engineering Technology (FTKEE) / Fakulti Teknologi Kejuruteraan Elektrik (FTKEE)",
                "link": "https://ftkee.unimap.edu.my/",
                "description": "Offers programs in electrical engineering technology"
              },
              {
                "name": "Faculty of Mechanical Engineering Technology (FTKEM) / Fakulti Teknologi Kejuruteraan Mekanikal (FTKEM)",
                "link": "https://ftkem.unimap.edu.my/",
                "description": "Specializes in mechanical engineering technology programs"
              },
              {
                "name": "Faculty of Civil Engineering Technology (FTKAC) / Fakulti Teknologi Kejuruteraan Awam (FTKAC)",
                "link": "https://ftkac.unimap.edu.my/",
                "description": "Provides civil engineering technology programs"
              },
              {
                "name": "Faculty of Chemical Engineering Technology (FTKK) / Fakulti Teknologi Kejuruteraan Kimia (FTKK)",
                "link": "https://ftkk.unimap.edu.my/",
                "description": "Offers chemical engineering technology programs"
              },
              {
                "name": "Faculty of Bioresources and Food Industry (FIMT) / Fakulti Industri Makanan dan Teknologi Bio-Sumber (FIMT)",
                "link": "https://fimt.unimap.edu.my/",
                "description": "Focuses on bioresources and food industry technologies"
              },
              {
                "name": "Faculty of Business and Communication (FBK) / Fakulti Perniagaan dan Komunikasi (FBK)",
                "link": "https://fbk.unimap.edu.my/",
                "description": "Provides programs in business and communication"
              },
              {
                "name": "Centre for Graduate Studies (CGS) / Pusat Pengajian Siswazah (CGS)",
                "link": "https://cgs.unimap.edu.my/",
                "description": "Handles postgraduate studies and research programs"
              }
            ]
          }
        },
        {
          "tag": "fess_info", // Renamed to ftken_info for UNIMAP context
          "patterns": ["about FTKEN", "Faculty of Electronic Engineering Technology", "FTKEN programs", "tentang FTKEN", "Fakulti Teknologi Kejuruteraan Elektronik", "program FTKEN"],
          "responses": ["The Faculty of Electronic Engineering Technology (FTKEN) focuses on electronic engineering technology programs, preparing students for the industry."],
          "responses_malay": ["Fakulti Teknologi Kejuruteraan Elektronik (FTKEN) memberi tumpuan kepada program teknologi kejuruteraan elektronik, mempersiapkan pelajar untuk industri."],
          "metadata": {
            "programs": {
              "diploma": [
                "Diploma in Electronic Engineering Technology / Diploma Teknologi Kejuruteraan Elektronik"
              ],
              "bachelor": [
                "Bachelor of Electronic Engineering Technology (Hons) / Sarjana Muda Teknologi Kejuruteraan Elektronik (Kepujian)"
              ],
              "foundation": [
                "Foundation in Engineering Technology / Asasi Teknologi Kejuruteraan"
              ]
            },
            "employment_rate": "High graduate employment",
            "link": "https://ftken.unimap.edu.my/"
          }
        }
      ]
    },
    {
      "section": "Programmes",
      "intents": [
        {
          "tag": "foundation_programmes",
          "patterns": ["foundation programs", "UNIMAP foundation", "program asasi", "asasi UNIMAP"],
          "responses": ["UNIMAP offers various foundation programmes, primarily in engineering and technology fields."],
          "responses_malay": ["UNIMAP menawarkan pelbagai program asasi, terutamanya dalam bidang kejuruteraan dan teknologi."],
          "metadata": {
            "programs": [
              "Foundation in Engineering Technology / Asasi Teknologi Kejuruteraan",
              "Foundation in Science / Asasi Sains"
            ],
            "apply_link": "https://apply.unimap.edu.my/"
          }
        },
        {
          "tag": "diploma_programmes",
          "patterns": ["diploma programs", "UNIMAP diplomas", "program diploma", "diploma UNIMAP"],
          "responses": ["UNIMAP offers diploma programmes across its engineering and technology faculties. Some examples:"],
          "responses_malay": ["UNIMAP menawarkan program diploma di semua fakulti kejuruteraan dan teknologinya. Beberapa contoh:"],
          "metadata": {
            "sample_programs": [
              {
                "faculty": "FTKEN",
                "programs": [
                  "Diploma in Electronic Engineering Technology / Diploma Teknologi Kejuruteraan Elektronik"
                ]
              },
              {
                "faculty": "FTKEE",
                "programs": [
                  "Diploma in Electrical Engineering Technology / Diploma Teknologi Kejuruteraan Elektrik"
                ]
              }
            ],
            "apply_link": "https://apply.unimap.edu.my/"
          }
        },
        {
          "tag": "degree_programmes",
          "patterns": ["bachelor degrees", "undergraduate programs", "ijazah sarjana muda", "program sarjana muda"],
          "responses": ["UNIMAP offers bachelor's degree programmes with a strong focus on engineering and technology, including:"],
          "responses_malay": ["UNIMAP menawarkan program ijazah sarjana muda dengan tumpuan kuat pada kejuruteraan dan teknologi, termasuk:"],
          "metadata": {
            "sample_programs": [
              {
                "faculty": "FTKEM",
                "programs": [
                  "Bachelor of Mechanical Engineering Technology (Hons) / Sarjana Muda Teknologi Kejuruteraan Mekanikal (Kepujian)"
                ]
              },
              {
                "faculty": "FTKAC",
                "programs": [
                  "Bachelor of Civil Engineering Technology (Hons) / Sarjana Muda Teknologi Kejuruteraan Awam (Kepujian)"
                ]
              }
            ],
            "apply_link": "https://apply.unimap.edu.my/"
          }
        },
        {
          "tag": "postgraduate_programmes",
          "patterns": ["master programs", "phd programs", "postgraduate studies", "program sarjana", "program phd", "pengajian pascasiswazah"],
          "responses": ["UNIMAP offers these postgraduate programmes, emphasizing advanced research in engineering and technology:"],
          "responses_malay": ["UNIMAP menawarkan program pascasiswazah ini, menekankan penyelidikan lanjutan dalam kejuruteraan dan teknologi:"],
          "metadata": {
            "masters": [
              "Master of Engineering Technology / Sarjana Teknologi Kejuruteraan",
              "Master of Science (by Research) / Sarjana Sains (secara Penyelidikan)"
            ],
            "phd": [
              "Doctor of Philosophy in Computing / Doktor Falsafah dalam Pengkomputeran",
              "Doctor of Philosophy in Engineering / Doktor Falsafah dalam Kejuruteraan",
              "Doctor of Philosophy in Technology / Doktor Falsafah dalam Teknologi"
            ],
            "apply_link": "https://apply.unimap.edu.my/"
          }
        }
      ]
    },
    {
      "section": "International Students",
      "intents": [
        {
          "tag": "international_student_info",
          "patterns": ["international student admission", "studying at UNIMAP as international student", "kemasukan pelajar antarabangsa", "belajar di UNIMAP sebagai pelajar antarabangsa"],
          "responses": ["International students can find admission information and guidebooks at these links:"],
          "responses_malay": ["Pelajar antarabangsa boleh mendapatkan maklumat kemasukan dan buku panduan di pautan ini:"],
          "metadata": {
            "links": {
              "admission": "https://www.unimap.edu.my/index.php/en/international-students/admission",
              "guidebook": "https://www.unimap.edu.my/index.php/en/international-students/guidebook",
              "visa_info": "https://www.unimap.edu.my/index.php/en/international-students/visa-pass"
            }
          }
        }
      ]
    },
    {
      "section": "Facilities",
      "intents": [
        {
          "tag": "campus_facilities",
          "patterns": ["UNIMAP facilities", "campus amenities", "kemudahan UNIMAP", "kemudahan kampus"],
          "responses": ["UNIMAP campuses offer these facilities:"],
          "responses_malay": ["Kampus UNIMAP menawarkan kemudahan ini:"],
          "metadata": {
            "facilities": [
              "Libraries / Perpustakaan",
              "Computer labs / Makmal komputer",
              "Cafeterias / Kafeteria",
              "Auditoriums / Auditorium",
              "Student lounges / Ruang rehat pelajar",
              "Sports facilities / Kemudahan sukan",
              "On-campus accommodation / Penginapan di kampus"
            ],
            "campuses": [
              {
                "name": "Pauh Putra",
                "location": "Perlis",
                "type": "Main Campus"
              },
              {
                "name": "Kangar",
                "location": "Perlis",
                "type": "City Campus"
              }
            ]
          }
        }
      ]
    },
    {
      "section": "Application",
      "intents": [
        {
          "tag": "apply_info",
          "patterns": ["how to apply", "application process", "cara memohon", "proses permohonan"],
          "responses": ["You can apply to UNIMAP programs through the online portal:"],
          "responses_malay": ["Anda boleh memohon program UNIMAP melalui portal dalam talian:"],
          "metadata": {
            "apply_link": "https://apply.unimap.edu.my/",
            "contact_email": "admission@unimap.edu.my",
            "contact_phone": "+604 988 5000"
          }
        }
      ]
    }
  ],
  "metadata": {
    "university_name": "Universiti Malaysia Perlis (UNIMAP)",
    "established": "2002",
    "campuses": [
      {
        "name": "Pauh Putra",
        "location": "Perlis",
        "type": "Main Campus"
      },
      {
        "name": "Kangar",
        "location": "Perlis",
        "type": "City Campus"
      }
    ],
    "contact": {
      "phone": "+604 988 5000",
      "email": "admission@unimap.edu.my",
      "website": "https://www.unimap.edu.my"
    },
    "unique_facts": [
      "Malaysia's 17th public university / universiti awam ke-17 Malaysia",
      "First public university in Perlis / universiti awam pertama di Perlis",
      "Strong focus on engineering and technology / Tumpuan kuat pada kejuruteraan dan teknologi"
    ]
  }
};

// Helper function to format the entire JSON data into a readable string for the LLM context
const formatEntireDataForLlm = (uniselData) => {
  let formattedStr = "";
  // Add general metadata - these parts might still be primarily in English for prompt context
  formattedStr += `University Name: ${uniselData.metadata.university_name}\n`;
  formattedStr += `Established: ${uniselData.metadata.established}\n`;
  formattedStr += "Campuses:\n";
  for (const campus of uniselData.metadata.campuses) {
    formattedStr += `- ${campus.name} (${campus.type}, ${campus.location})\n`;
  }
  formattedStr += `Contact Phone: ${uniselData.metadata.contact.phone}\n`;
  formattedStr += `Contact Email: ${uniselData.metadata.contact.email}\n`;
  formattedStr += `Website: ${uniselData.metadata.website}\n`;
  formattedStr += `Unique Facts: ${uniselData.metadata.unique_facts.join('; ')}\n\n`; // Use semicolon for clarity

  // Iterate through each section and its intents
  for (const sectionObj of uniselData.intents) {
    formattedStr += `--- Section: ${sectionObj.section} ---\n`;
    for (const intentObj of sectionObj.intents) {
      formattedStr += `Tag: ${intentObj.tag}\n`;
      if (intentObj.patterns) {
        formattedStr += `  Patterns (EN/MY): ${intentObj.patterns.join(', ')}\n`;
      }
      if (intentObj.responses) {
        formattedStr += `  English Responses: ${intentObj.responses.join('; ')}\n`;
      }
      if (intentObj.responses_malay) {
        formattedStr += `  Malay Responses: ${intentObj.responses_malay.join('; ')}\n`;
      }
      if (intentObj.metadata) {
        formattedStr += "  Details:\n";
        for (const key in intentObj.metadata) {
          const value = intentObj.metadata[key];
          if (Array.isArray(value)) {
            if (value.every(item => typeof item === 'object' && item !== null)) {
              const formattedListItems = [];
              if (intentObj.tag === 'faculties_overview') {
                for (const item of value) {
                  formattedListItems.push(`    - ${item.name || ''}: ${item.description || ''}`);
                }
              } else if (intentObj.tag === 'chancellery_info') {
                for (const item of value) {
                  formattedListItems.push(`    - ${item.title || ''}: ${item.name || ''}`);
                }
              } else if (['diploma_programmes', 'degree_programmes'].includes(intentObj.tag)) {
                for (const item of value) {
                  const facultyName = item.faculty || 'N/A';
                  const programsList = (item.programs || []).join(', ');
                  formattedListItems.push(`    ${facultyName}: ${programsList}`);
                }
              } else { // generic list of objects
                for (const item of value) {
                  formattedListItems.push(`    - ${JSON.stringify(item)}`);
                }
              }
              formattedStr += `    ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:\n` + formattedListItems.join("\n") + "\n";
            } else { // list of strings
              formattedStr += `    ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${value.join(', ')}\n`;
            }
          } else if (typeof value === 'object' && value !== null) {
            if (key === 'programs' && intentObj.tag === 'fess_info') {
              for (const progType in value) {
                formattedStr += `    ${progType.charAt(0).toUpperCase() + progType.slice(1)} Programs: ${value[progType].join(', ')}\n`;
              }
            } else if (key === 'links' && intentObj.tag === 'international_student_info') {
              for (const linkType in value) {
                formattedStr += `    ${linkType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Link: ${value[linkType]}\n`;
              }
            } else { // generic object
              formattedStr += `    ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${JSON.stringify(value)}\n`;
            }
          } else { // simple key-value
            formattedStr += `    ${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${value}\n`;
          }
        }
      }
      formattedStr += "\n"; // Blank line after each intent
    }
  }
  return formattedStr.trim();
};

// Pre-format the entire dataset once outside the component
const fullDataContextForLlm = formatEntireDataForLlm(uniselData);

// Main React App component
const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false); // State for voice input active
  const [voiceLang, setVoiceLang] = useState('en-US'); // State for voice input language: 'en-US' or 'ms-MY'
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null); // Ref for SpeechRecognition object

  // State to manage chatbot response language preference: 'english' (default), 'malay', or 'bilingual'
  const [languagePreference, setLanguagePreference] = useState('english');

  // Firebase states
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // New state for auth readiness
  // const [db, setDb] = useState(null); // Uncomment if Firestore is used for data storage

  // Firebase Config (provided by user)
  const firebaseConfig = {
    apiKey: "AIzaSyCIiJAlG6M8ohCFqxXwSSW60l2ourIm5-Y",
    authDomain: "school-car-8f60b.firebaseapp.com",
    databaseURL: "https://school-car-8f60b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "school-car-8f60b",
    storageBucket: "school-car-8f60b.appspot.com",
    messagingSenderId: "318759538145",
    appId: "1:318759538145:web:dummyid" // This will be overridden by __app_id
  };

  useEffect(() => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    setAuth(authInstance);
    // setDb(getFirestore(app)); // Uncomment if Firestore is used for data storage

    // Sign in with custom token or anonymously
    const initializeAuth = async () => {
      try {
        // Only attempt sign-in if no user is currently authenticated
        if (!authInstance.currentUser) {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(authInstance, __initial_auth_token);
            console.log("Signed in with custom token.");
          } else {
            await signInAnonymously(authInstance);
            console.log("Signed in anonymously.");
          }
        } else {
          console.log("User already authenticated:", authInstance.currentUser.email || "Anonymous");
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
        setLoginError(`Authentication failed: ${error.message}`);
      } finally {
        setIsAuthReady(true); // Ensure auth readiness is set even if there's an error
      }
    };

    initializeAuth();

    // Set up auth state observer
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User is logged in:", currentUser.email || "Anonymous");
      } else {
        console.log("User is logged out.");
      }
    });

    return () => unsubscribe(); // Cleanup auth observer on unmount
  }, []); // Empty dependency array means this runs once on mount

  // Define event handlers using useCallback at the top level
  const handleResult = useCallback((event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    setInput(transcript);
  }, []); // No dependencies for handleResult as it only uses setInput

  const handleEnd = useCallback(() => {
    if (isListening) { // If it was actively listening and stopped unexpectedly
      setIsListening(false);
      console.log("Voice input ended unexpectedly or due to silence timeout.");
    }
  }, [isListening]); // Depends on isListening to know if it was an unexpected stop

  const handleError = useCallback((event) => {
    setIsListening(false);
    console.error('Speech recognition error:', event.error);
    let errorMessage = "Voice input error. Please try again or type your message.";
    if (event.error === 'not-allowed') {
      errorMessage = "Microphone access denied. Please allow microphone access in your browser settings to use voice input.";
    } else if (event.error === 'no-speech') {
      errorMessage = "No speech detected. Please try speaking louder or clearer.";
    } else if (event.error === 'language-not-supported') {
      errorMessage = `The requested language (${voiceLang === 'en-US' ? 'English' : 'Malay'}) might not be fully supported by your browser's voice recognition. Please try the other language or type your message.`;
    }

    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      // Debounce error messages: only add if the last message isn't already a voice input error
      if (lastMessage && lastMessage.sender === 'bot' && lastMessage.text.includes("Voice input error")) {
        return prevMessages;
      }
      return [...prevMessages, { sender: 'bot', text: errorMessage }];
    });
  }, [voiceLang]); // Depends on voiceLang for the error message content


  // Effect for scrolling messages and SpeechRecognition setup
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Voice input is not supported in your browser." }
      ]);
      return; // Exit if not supported
    }

    // Initialize recognition object only once
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }

    const recognition = recognitionRef.current;

    // Attach event listeners
    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;
    recognition.lang = voiceLang; // Update language if voiceLang state changes

    // Cleanup function
    return () => {
      // Detach listeners to prevent memory leaks if component unmounts
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [voiceLang, isListening, handleResult, handleEnd, handleError]); // Added memoized callbacks to dependencies

  // Function to determine the intent based on user input
  const getIntent = (text) => {
    const lowerText = text.toLowerCase();
    for (const section of uniselData.intents) {
      for (const intent of section.intents) {
        if (intent.patterns && intent.patterns.some(pattern => lowerText.includes(pattern))) {
          return intent.tag;
        }
      }
    }
    return null; // No matching intent
  };

  const handleSendMessage = async (event, voiceInputText = null) => {
    if (event) event.preventDefault();

    const userMessageText = voiceInputText !== null ? voiceInputText : input.trim();
    if (userMessageText === '') return;

    const userMessage = { sender: 'user', text: userMessageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(''); // Clear input after sending message
    setIsTyping(true);

    let currentLanguageMode = languagePreference;
    let botResponseText = '';
    let forceLlmGeneration = false; // New flag to force LLM

    const lowerText = userMessageText.toLowerCase();
    let matchedIntent = null;

    // First, check for language control intents
    const languageControlSection = uniselData.intents.find(section => section.section === "Language Control");
    if (languageControlSection) {
      const languageControlIntent = languageControlSection.intents.find(intent => intent.patterns.some(pattern => lowerText.includes(pattern)));
      if (languageControlIntent) {
        currentLanguageMode = languageControlIntent.metadata.language_mode;
        setLanguagePreference(currentLanguageMode);
        // Direct language control responses should always be in the specified language
        botResponseText = currentLanguageMode === 'malay' ? languageControlIntent.responses_malay[0] : languageControlIntent.responses[0];
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botResponseText }]);
        setIsTyping(false);
        return; // Handled directly, no LLM call needed
      }
    }

    // Then, try to match other intents
    for (const section of uniselData.intents) {
      // Skip Language Control section as it's handled above
      if (section.section === "Language Control") continue;

      for (const intent of section.intents) {
        if (intent.patterns && intent.patterns.some(pattern => lowerText.includes(pattern))) {
          matchedIntent = intent;
          break;
        }
      }
      if (matchedIntent) break;
    }

    // Determine if LLM generation is needed for this intent
    // Force LLM for any intent that has complex metadata that needs to be translated or formatted by LLM
    if (matchedIntent && (matchedIntent.tag === 'chancellery_info' || matchedIntent.tag === 'apply_info' || matchedIntent.tag === 'why_choose_unisel' || matchedIntent.tag === 'faculties_overview' || matchedIntent.tag === 'fess_info' || matchedIntent.tag === 'international_student_info' || matchedIntent.tag === 'campus_facilities' || matchedIntent.tag === 'foundation_programmes' || matchedIntent.tag === 'diploma_programmes' || matchedIntent.tag === 'degree_programmes' || matchedIntent.tag === 'postgraduate_programmes' || matchedIntent.tag === 'management_overview' || matchedIntent.tag === 'president_message')) {
      forceLlmGeneration = true;
    }

    // If not forcing LLM and a direct match is found, try to construct direct response
    if (!forceLlmGeneration && matchedIntent) {
      if (currentLanguageMode === 'malay' && matchedIntent.responses_malay && matchedIntent.responses_malay.length > 0) {
        botResponseText = matchedIntent.responses_malay[0];
      } else if (currentLanguageMode === 'english' && matchedIntent.responses && matchedIntent.responses.length > 0) {
        botResponseText = matchedIntent.responses[0];
      }
      // Removed the 'bilingual' case here as per new requirement: only one language at a time

      // Append metadata if available and not handled by LLM
      // NOTE: Metadata appending here is for simple cases only. Complex metadata will be handled by LLM.
      if (botResponseText) { // If a direct response was successfully constructed
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botResponseText }]);
        setIsTyping(false);
        return;
      }
    }

    // Fallback to LLM if no direct response found or if forced for LLM generation
    let languageInstruction = "Answer the user's question clearly and concisely in English only.";
    if (currentLanguageMode === 'malay') {
      // Emphasize strict Malay output for LLM when Malay is preferred
      languageInstruction = "Answer the user's question clearly and concisely in **Malay only**. All information, including names, titles, and details from the provided UNIMAP Knowledge Base, must be presented as part of a fully Malay response. If a proper noun does not have a Malay equivalent, embed it directly into the Malay sentence without any English surrounding text. Do not use any English phrases or sentences.";
    }
    // Removed the 'bilingual' instruction here as per new requirement: only one language at a time

    try {
      const prompt = `You are a helpful chatbot providing information about Universiti Malaysia Perlis (UNIMAP).
Your knowledge is strictly limited to the provided JSON data about UNIMAP below.
${languageInstruction}
If the information is not sufficient to fully answer the question, or if the question is outside the scope of the provided data, politely state that you don't have enough information on that specific topic in the requested language(s). Do not make up answers.
Be tolerant of spelling mistakes and slight variations in phrasing in both English and Malay.

---
UNIMAP Knowledge Base:
${fullDataContextForLlm}
---

User's Question: "${userMessage.text}"

Your Answer:`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const API_KEY = "AIzaSyAYA_6-LODOtcvI0CfOBfuXGKPDd4MLzso"; // Leave as empty string for Canvas to provide it.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();

      let llmBotResponseText = "I'm sorry, I couldn't get a response from the AI at this moment.";
      if (currentLanguageMode === 'malay') {
         llmBotResponseText = "Maaf, saya tidak dapat mendapatkan respons daripada AI pada masa ini.";
      }
      // Removed the 'bilingual' fallback message as per new requirement: only one language at a time

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        llmBotResponseText = result.candidates[0].content.parts[0].text;
      }

      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: llmBotResponseText }]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      let errorMessage = `Sorry, there was an error processing your request: ${error.message}`;
      if (currentLanguageMode === 'malay') {
        errorMessage = `Maaf, terdapat ralat semasa memproses permintaan anda: ${error.message}`;
      }
      // Removed the 'bilingual' error message as per new requirement: only one language at a time
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: errorMessage }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to toggle voice input
  const toggleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop(); // Stop listening
        setIsListening(false);
        console.log("Voice input stopped by user.");
        // When stopped by user, send the current input as a message
        if (input.trim() !== '') {
          handleSendMessage(null, input.trim());
        }
      } else {
        setInput(''); // Clear input before starting new voice input
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
        console.log(`Voice input started. Listening in ${voiceLang === 'en-US' ? 'English' : 'Malay'}...`);
      }
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: "Voice input is not supported in your browser." }
      ]);
    }
  };

  // Function to toggle the voice input language
  const toggleVoiceLanguage = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setVoiceLang(prevLang => {
      const newLang = prevLang === 'en-US' ? 'ms-MY' : 'en-US';
      // Set languagePreference based on the new voice input language
      // If newLang is Malay, set preference to 'malay' (single language)
      // If newLang is English, set preference to 'english' (single language)
      const newPref = newLang === 'ms-MY' ? 'malay' : 'english'; // Changed to 'malay'
      setLanguagePreference(newPref); // Update overall language preference

      // Add a system message to the chat confirming the language change
      const confirmationMessage = newLang === 'ms-MY'
        ? "Baik, saya akan menjawab dalam bahasa Melayu mulai sekarang." // Changed to single language
        : "Okay, saya akan menjawab dalam bahasa Inggeris mulai sekarang.";

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: confirmationMessage }
      ]);

      console.log(`Voice input language toggled to ${newLang === 'en-US' ? 'English' : 'Malay'}`);
      return newLang;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setLoginError(error.message);
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        setMessages([]); // Clear messages on logout
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthReady) { // Render loading state until auth is ready
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Loading Firebase...</h2>
          <p className="text-gray-600">Please wait while the application initializes.</p>
        </div>
      </div>
    );
  }

  if (!user || user.isAnonymous) { // If user is not logged in or is anonymous
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">Login to UNIMAP Chatbot</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render chat interface if user is logged in (not anonymous)
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 p-4 sm:p-6 md:p-8">
      {/* Chat header */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-4 text-center">
        <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">UNIMAP Chatbot</h1>
        <p className="text-gray-600 mt-1">Ask me anything about Universiti Malaysia Perlis! / Tanya saya apa sahaja tentang Universiti Malaysia Perlis!</p>
        {user && user.email && (
          <div className="mt-2 text-sm text-gray-700 flex justify-center items-center">
            Logged in as: <span className="font-semibold ml-1">{user.email}</span>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Chat messages display area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-xl shadow-lg mb-4 flex flex-col space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-500 italic">
            <p>Type or speak a message to start your conversation with the UNIMAP Chatbot! / Taip atau bercakap mesej untuk memulakan perbualan anda dengan UNIMAP Chatbot!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-200 text-gray-900 rounded-bl-none">
              <div className="flex items-center space-x-1">
                <span className="animate-bounce-dot w-2 h-2 bg-gray-500 rounded-full inline-block"></span>
                <span className="animate-bounce-dot animation-delay-200 w-2 h-2 bg-gray-500 rounded-full inline-block"></span>
                <span className="animate-bounce-dot animation-delay-400 w-2 h-2 bg-gray-500 rounded-full inline-block"></span>
                <span className="ml-2">Typing... / Menaip...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex p-4 bg-white rounded-xl shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? `Listening in ${voiceLang === 'en-US' ? 'English' : 'Malay'}...` : "Type your message... / Taip mesej anda..."}
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          disabled={isTyping}
        />
        {/* Language Toggle Button */}
        <button
          type="button"
          onClick={toggleVoiceLanguage}
          className="p-3 rounded-none bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Switch Voice Input Language to ${voiceLang === 'en-US' ? 'Malay' : 'English'}`}
        >
          {voiceLang === 'en-US' ? 'EN' : 'BM'}
        </button>

        {/* Microphone button for voice input */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-none ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isTyping}
          title={isListening ? "Stop Voice Input" : "Start Voice Input"}
        >
          {/* Microphone icon (using inline SVG for simplicity) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-mic"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
        <button
          type="submit"
          className="bg-blue-700 text-white p-3 rounded-r-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out flex items-center justify-center
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isTyping}
        >
          {/* Send icon (using inline SVG for simplicity) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-send"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <span className="hidden sm:inline ml-2">Send / Hantar</span>
        </button>
      </form>
    </div>
  );
};

export default App;
