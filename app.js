//
// --- CONFIGURATION ---
//
const GOOGLE_SCRIPT_URL = 'YOhttps://script.google.com/macros/s/AKfycbw_1KQE7NAyzn668yxRxn6fc1CYjfiR02dXo_yXSPTRhE1w57gdP-XGWWCqrZDyVmc/execUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // ⚠️ PASTE YOUR URL HERE

const courseStructure = [
    {
        level: "Niveau 1 : Les Bases",
        videos: [
            { id: "N1-V1", title: "Introduction et prise en main" },
            { id: "N1-V2", title: "Saisie et mise en forme des données" },
            { id: "N1-V3", title: "Formules simples (SOMME, MOYENNE, MIN, MAX)" },
            { id: "N1-V4", title: "Mise en forme conditionnelle" }
        ],
        quizzes: [
            { id: "N1-V1", title: "Quiz - Introduction", file: "quiz-n1-v1.html" },
            { id: "N1-V2", title: "Quiz - Saisie et mise en forme", file: "quiz-n1-v2.html" },
            { id: "N1-V3", title: "Quiz - Formules simples", file: "quiz-n1-v3.html" },
            { id: "N1-V4", title: "Quiz - Mise en forme conditionnelle", file: "quiz-n1-v4.html" }
        ]
    },
    {
        level: "Niveau 2 : Fonctions Avancées",
        videos: [
            { id: "N2-V1", title: "Fonctions logiques (SI, ET, OU)" },
            { id: "N2-V2", title: "Fonctions de recherche (RECHERCHEV)" },
            { id: "N2-V3", title: "Tableaux croisés dynamiques" },
            { id: "N2-V4", title: "Graphiques avancés" },
            { id: "N2-V5", title: "Bases de données et filtres élaborés" },
            { id: "N2-V6", title: "Fonctions texte et date" }
        ],
        quizzes: [
            { id: "N2-V1", title: "Quiz - Fonctions logiques", file: "quiz-n2-v1.html" },
            { id: "N2-V2", title: "Quiz - Fonctions de recherche", file: "quiz-n2-v2.html" },
            { id: "N2-V3", title: "Quiz - TCD", file: "quiz-n2-v3.html" },
            { id: "N2-V4", title: "Quiz - Graphiques avancés", file: "quiz-n2-v4.html" },
            { id: "N2-V5", title: "Quiz - Bases de données", file: "quiz-n2-v5.html" },
            { id: "N2-V6", title: "Quiz - Fonctions texte et date", file: "quiz-n2-v6.html" }
        ]
    },
    {
        level: "Niveau 3 : Pour Aller Plus Loin (Bonus)",
        videos: [
            { id: "N3-V1", title: "Les Macros et VBA" },
            { id: "N3-V2", title: "Power Query" },
            { id: "N3-V3", title: "Power Pivot" }
        ],
        quizzes: []
    }
];

// --- APPLICATION LOGIC ---

let currentStudent = null;
let studentProgress = {};

document.addEventListener('DOMContentLoaded', () => {
    populateStudentSelector();
    document.getElementById('student-selector').addEventListener('change', handleStudentSelection);
    document.getElementById('teacher-view-btn').addEventListener('click', showTeacherView);
});

function populateStudentSelector() {
    const selector = document.getElementById('student-selector');
    // studentNames is defined in students.js
    studentNames.sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selector.appendChild(option);
    });
}

async function handleStudentSelection() {
    currentStudent = this.value;
    if (currentStudent) {
        document.getElementById('student-name-display').textContent = currentStudent;
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('student-view').classList.remove('hidden');
        document.getElementById('teacher-view').classList.add('hidden');
        
        await fetchStudentProgress(currentStudent);
        renderCourseContent();
    } else {
        document.getElementById('main-content').classList.add('hidden');
    }
}

function renderCourseContent() {
    const container = document.getElementById('course-content');
    container.innerHTML = ''; // Clear previous content

    courseStructure.forEach(levelData => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'bg-white rounded-lg shadow-md p-6 mb-6';
        
        let contentHtml = `<h3 class="text-xl font-bold text-gray-700 mb-4">${levelData.level}</h3>`;
        
        // Videos
        if (levelData.videos.length > 0) {
            contentHtml += '<div class="mb-4"><strong>Vidéos à regarder :</strong><ul class="list-disc pl-5 mt-2 space-y-2">';
            levelData.videos.forEach(video => {
                const isChecked = studentProgress.videos && studentProgress.videos.includes(video.id);
                contentHtml += `
                    <li>
                        <label class="flex items-center">
                            <input type="checkbox" data-videoid="${video.id}" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" ${isChecked ? 'checked' : ''}>
                            <span class="ml-2 text-gray-800">${video.title}</span>
                        </label>
                    </li>`;
            });
            contentHtml += '</ul></div>';
        }

        // Quizzes
        if (levelData.quizzes.length > 0) {
            contentHtml += '<div><strong>Quizzes à compléter :</strong><ul class="list-disc pl-5 mt-2 space-y-2">';
            levelData.quizzes.forEach(quiz => {
                const quizResult = studentProgress.quizzes ? studentProgress.quizzes[quiz.id] : null;
                const scoreText = quizResult ? ` - Score: ${quizResult.score}/${quizResult.totalQuestions} (${Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%)` : '';
                const scoreColor = quizResult ? getScoreColor(quizResult.score / quizResult.totalQuestions) : 'text-blue-600';

                contentHtml += `
                    <li>
                        <a href="quizzes/${quiz.file}?nom=${encodeURIComponent(currentStudent)}" target="_blank" class="text-blue-600 hover:underline">
                            ${quiz.title}
                        </a>
                        <span class="font-bold ml-2 ${scoreColor}">${scoreText}</span>
                    </li>`;
            });
            contentHtml += '</ul></div>';
        }

        levelDiv.innerHTML = contentHtml;
        container.appendChild(levelDiv);
    });

    // Add event listeners for checkboxes
    document.querySelectorAll('input[type="checkbox"][data-videoid]').forEach(checkbox => {
        checkbox.addEventListener('change', handleVideoCheck);
    });
}

function getScoreColor(percentage) {
    if (percentage >= 0.8) return 'text-green-600';
    if (percentage >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
}

async function handleVideoCheck(event) {
    const videoId = event.target.dataset.videoid;
    if (event.target.checked) {
        await logAction('Video Watched', videoId);
    }
}

async function logAction(actionType, actionID, score = null, totalQuestions = null) {
    if (!currentStudent) return;

    const data = {
        Timestamp: new Date().toISOString(),
        StudentName: currentStudent,
        ActionType: actionType,
        ActionID: actionID,
        Score: score,
        TotalQuestions: totalQuestions
    };

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error logging action:', error);
    }
}

async function fetchStudentProgress(studentName) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const allProgress = await response.json();
        
        studentProgress = { videos: [], quizzes: {} };

        allProgress.filter(row => row.studentName === studentName).forEach(row => {
            if (row.actionType === 'Video Watched') {
                if (!studentProgress.videos.includes(row.actionID)) {
                    studentProgress.videos.push(row.actionID);
                }
            } else if (row.actionType === 'Quiz Taken') {
                studentProgress.quizzes[row.actionID] = {
                    score: row.score,
                    totalQuestions: row.totalQuestions
                };
            }
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        studentProgress = { videos: [], quizzes: {} };
    }
}

async function showTeacherView() {
    document.getElementById('main-content').classList.remove('hidden');
    document.getElementById('student-view').classList.add('hidden');
    document.getElementById('teacher-view').classList.remove('hidden');
    const container = document.getElementById('teacher-dashboard-content');
    container.innerHTML = '<p class="text-center">Chargement des données...</p>';

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const allProgress = await response.json();
        
        const allItems = [];
        courseStructure.forEach(level => {
            level.videos.forEach(v => allItems.push({ id: v.id, type: 'video' }));
            level.quizzes.forEach(q => allItems.push({ id: q.id, type: 'quiz' }));
        });

        let tableHtml = '<table class="min-w-full divide-y divide-gray-200">';
        tableHtml += '<thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>';
        allItems.forEach(item => {
            tableHtml += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${item.id}</th>`;
        });
        tableHtml += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';

        studentNames.forEach(student => {
            tableHtml += `<tr><td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${student}</td>`;
            
            const studentData = allProgress.filter(row => row.studentName === student);

            allItems.forEach(item => {
                let cellContent = '';
                if (item.type === 'video') {
                    const isCompleted = studentData.some(d => d.actionType === 'Video Watched' && d.actionID === item.id);
                    cellContent = isCompleted ? '<span class="text-green-500">✓</span>' : '';
                } else if (item.type === 'quiz') {
                    const quizResult = studentData.find(d => d.actionType === 'Quiz Taken' && d.actionID === item.id);
                    if (quizResult) {
                        const percentage = quizResult.score / quizResult.totalQuestions;
                        const color = getScoreColor(percentage);
                        cellContent = `<span class="${color} font-bold">${Math.round(percentage * 100)}%</span>`;
                    }
                }
                tableHtml += `<td class="px-6 py-4 whitespace-nowrap text-center">${cellContent}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        container.innerHTML = tableHtml;

    } catch (error) {
        console.error('Error building teacher dashboard:', error);
        container.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des données.</p>';
    }
}