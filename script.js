/* ==========================================
    1. ESTADO E CONFIGURAÇÕES GLOBAIS
========================================== */
let soundEnabled = true;
let isDarkMode = false;
let isHighContrast = false;
let isLargeText = false;

// Web Audio API para Efeitos Sonoros
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'error') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}

// Alternar Sons
function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.getElementById('soundIcon');
    icon.className = soundEnabled ? "fa-solid fa-volume-high text-lg" : "fa-solid fa-volume-xmark text-lg";
    showToast(soundEnabled ? "Efeitos sonoros ativados" : "Efeitos sonoros desativados");
    playSound('click');
}

// Alternar Modo Escuro
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    const icon = document.getElementById('themeIcon');
    icon.className = isDarkMode ? "fa-solid fa-sun text-lg" : "fa-solid fa-moon text-lg";
    playSound('click');
}

// Alternar Alto Contraste
function toggleContrast() {
    isHighContrast = !isHighContrast;
    document.body.classList.toggle('high-contrast', isHighContrast);
    showToast(isHighContrast ? "Alto contraste ativado" : "Contraste padrão");
    playSound('click');
}

// Alternar Tamanho da Fonte
function toggleFontSize() {
    isLargeText = !isLargeText;
    document.body.classList.toggle('text-large', isLargeText);
    showToast(isLargeText ? "Texto ampliado ativado" : "Tamanho de texto padrão");
    playSound('click');
}

// Toast Notificações
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.innerText = msg;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, 3000);
}

// Navegação por Abas
function switchTab(tabId) {
    playSound('click');
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active-tab'));

    document.getElementById(`sec-${tabId}`).classList.remove('hidden');
    document.getElementById(`tab-${tabId}`).classList.add('active-tab');
}

/* ==========================================
    2. ANALISADOR DE SENHAS & CRITÉRIOS
========================================== */
function togglePwdVisibility() {
    const pwdInput = document.getElementById('pwdInput');
    const icon = document.getElementById('pwdVisibilityIcon');
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.className = "fa-solid fa-eye-slash";
    } else {
        pwdInput.type = 'password';
        icon.className = "fa-solid fa-eye";
    }
}

function analyzePassword() {
    const pwd = document.getElementById('pwdInput').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthLabel = document.getElementById('strengthLabel');
    const crackTime = document.getElementById('crackTime');

    if (!pwd) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'h-full w-0 transition-all duration-500 bg-slate-400';
        strengthLabel.innerText = 'Insira uma senha';
        crackTime.innerText = 'Instantâneo';
        resetCriteria();
        return;
    }

    // Critérios
    const hasLength = pwd.length >= 12;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSym = /[^A-Za-z0-9]/.test(pwd);
    const hasNoCommon = !/(123|abc|qwerty|password|senha|admin)/i.test(pwd);

    updateCriterion('length', hasLength);
    updateCriterion('upper', hasUpper);
    updateCriterion('lower', hasLower);
    updateCriterion('num', hasNum);
    updateCriterion('sym', hasSym);
    updateCriterion('common', hasNoCommon);

    let score = 0;
    if (hasLength) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNum) score++;
    if (hasSym) score++;
    if (hasNoCommon) score++;

    // Barra de força e rótulo
    const percent = (score / 6) * 100;
    strengthBar.style.width = `${percent}%`;

    if (score <= 2) {
        strengthBar.className = 'h-full transition-all duration-500 bg-rose-500';
        strengthLabel.innerText = 'Fraca';
        strengthLabel.className = 'text-sm font-bold text-rose-500';
        crackTime.innerText = 'Alguns segundos';
    } else if (score <= 4) {
        strengthBar.className = 'h-full transition-all duration-500 bg-amber-500';
        strengthLabel.innerText = 'Média';
        strengthLabel.className = 'text-sm font-bold text-amber-500';
        crackTime.innerText = 'Algumas horas / dias';
    } else if (score === 5) {
        strengthBar.className = 'h-full transition-all duration-500 bg-sky-500';
        strengthLabel.innerText = 'Forte';
        strengthLabel.className = 'text-sm font-bold text-sky-500';
        crackTime.innerText = 'Alguns séculos';
    } else {
        strengthBar.className = 'h-full transition-all duration-500 bg-emerald-500';
        strengthLabel.innerText = 'Imbatível (.Senac)';
        strengthLabel.className = 'text-sm font-bold text-emerald-500';
        crackTime.innerText = 'Milhares de anos';
    }
}

function updateCriterion(name, isValid) {
    const item = document.getElementById(`crit-${name}`);
    const icon = document.getElementById(`icon-${name}`);
    if (isValid) {
        item.className = "flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium transition-colors";
        icon.className = "fa-solid fa-circle-check text-emerald-500";
    } else {
        item.className = "flex items-center gap-2 text-slate-400 transition-colors";
        icon.className = "fa-solid fa-circle-xmark text-red-500";
    }
}

function resetCriteria() {
    ['length', 'upper', 'lower', 'num', 'sym', 'common'].forEach(name => {
        updateCriterion(name, false);
    });
}

/* ==========================================
    3. GERADOR DE SENHAS FORTES
========================================== */
function updateGenLength() {
    const val = document.getElementById('genLength').value;
    document.getElementById('genLenVal').innerText = val;
}

function generateSecurePassword() {
    playSound('click');
    const length = parseInt(document.getElementById('genLength').value);
    const useUpper = document.getElementById('genUpper').checked;
    const useLower = document.getElementById('genLower').checked;
    const useNum = document.getElementById('genNum').checked;
    const useSym = document.getElementById('genSym').checked;

    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNum) chars += '0123456789';
    if (useSym) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
        showToast("Selecione pelo menos um tipo de caractere!");
        return;
    }

    let password = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }

    document.getElementById('genPwdOutput').value = password;
    showToast("Senha gerada com sucesso!");
}

function copyGeneratedPwd() {
    const output = document.getElementById('genPwdOutput');
    if (!output.value) return;
    navigator.clipboard.writeText(output.value);
    playSound('success');
    showToast("Senha copiada para a área de transferência!");
}

/* ==========================================
    4. GERADOR DE PASSPHRASES
========================================== */
const wordList = [
    "nuvem", "tigre", "oceano", "planeta", "girassol", "cometa", "piano", "cavalo",
    "montanha", "camelo", "janela", "estrela", "foguete", "bússola", "diamante",
    "neve", "floresta", "arquivo", "cristal", "mochila", "horizonte", "vulcão"
];

function generatePassphrase() {
    playSound('click');
    const count = parseInt(document.getElementById('passWordCount').value);
    const separator = document.getElementById('passSeparator').value;
    const includeNum = document.getElementById('passIncludeNum').checked;

    let selectedWords = [];
    const array = new Uint32Array(count);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < count; i++) {
        selectedWords.push(wordList[array[i] % wordList.length]);
    }

    let phrase = selectedWords.join(separator);
    if (includeNum) {
        const randNum = Math.floor(Math.random() * 90) + 10;
        phrase += separator + randNum;
    }

    document.getElementById('passphraseOutput').innerText = phrase;
    showToast("Frase-Chave gerada!");
}

function copyPassphrase() {
    const text = document.getElementById('passphraseOutput').innerText;
    if (text.includes("Clique")) return;
    navigator.clipboard.writeText(text);
    playSound('success');
    showToast("Frase-Chave copiada!");
}

/* ==========================================
    5. SIMULADOR DE GOLPES (QUIZ)
========================================== */
const quizData = [
    {
        title: "E-mail urgente do Banco .Senac Pay",
        sender: "suporte@banco-senac-seguro.com",
        content: "Prezado cliente, identificamos um acesso suspeito em sua conta. Clique imediatamente no link abaixo para validar sua identidade ou sua conta será bloqueada em 2 hours.",
        isFraud: true,
        explanation: "Fraude clássica de Phishing! Bancos reais nunca enviam links diretos com ameaças de bloqueio urgente por e-mail."
    },
    {
        title: "Confirmação de Pedido de Livraria",
        sender: "pedidos@lojaoficial.com.br",
        content: "Olá! Seu pedido #48921 foi despachado com sucesso. Você pode acompanhar o rastreio diretamente acessando sua conta na nossa plataforma.",
        isFraud: false,
        explanation: "Seguro e legítimo. A mensagem apenas confirma o envio sem solicitar dados confidenciais ou exigir cliques em links suspeitos."
    },
    {
        title: "Sorteio de Smartphone Grátis",
        sender: "premio-imperdivel@promocoes-br.net",
        content: "Parabéns! Você foi selecionado para ganhar o novo iPhone. Preencha seus dados cadastrais e pague apenas o frete de R$ 19,90 para receber em casa.",
        isFraud: true,
        explanation: "Golpe clássico de falsa premiação e roubo de cartão de crédito. Se parece bom demais para ser verdade, desconfie!"
    },
    {
        title: "Aviso de Fatura Disponível no App",
        sender: "nao-responda@cartaooficial.com.br",
        content: "Sua fatura com vencimento para o dia 10 está disponível. Acesse o aplicativo oficial do seu banco ou consulte o extrato com segurança.",
        isFraud: false,
        explanation: "Legítimo. O aviso orienta o uso do aplicativo oficial, sem links externos maliciosos."
    },
    {
        title: "Ligação do 'Falso Sequestro' ou 'Central antifraude'",
        sender: "Telefone: +55 (11) 99888-7766",
        content: "Alô? Aqui é do setor de segurança do seu banco. Precisamos que você digite sua senha de 6 dígitos e confirme o token enviado via SMS agora mesmo.",
        isFraud: true,
        explanation: "Engenharia social por telefone! Bancos e instituições sérias NUNCA pedem senhas ou tokens de segurança por ligação."
    }
];

let currentQuizIndex = 0;
let quizScore = 0;
let answeredCurrent = false;

function loadQuizQuestion() {
    answeredCurrent = false;
    const q = quizData[currentQuizIndex];
    document.getElementById('quizCurrent').innerText = currentQuizIndex + 1;
    document.getElementById('quizFeedback').classList.add('hidden');
    document.getElementById('quizActions').classList.remove('hidden');

    const container = document.getElementById('quizContainer');
    container.innerHTML = `
        <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-400 uppercase">Remetente / Canal:</span>
                <span class="text-xs font-mono text-orange-600 dark:text-orange-400">${q.sender}</span>
            </div>
            <h3 class="font-bold text-base mb-2 text-slate-800 dark:text-slate-100">${q.title}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                "${q.content}"
            </p>
        </div>
    `;
}

function answerQuiz(userGuessIsFraud) {
    if (answeredCurrent) return;
    answeredCurrent = true;

    const q = quizData[currentQuizIndex];
    const isCorrect = (userGuessIsFraud === q.isFraud);

    if (isCorrect) {
        quizScore++;
        playSound('success');
        showToast("Resposta Correta!");
    } else {
        playSound('error');
        showToast("Resposta Incorreta!");
    }

    document.getElementById('quizScore').innerText = quizScore;
    document.getElementById('quizActions').classList.add('hidden');

    const feedback = document.getElementById('quizFeedback');
    feedback.classList.remove('hidden');
    const title = document.getElementById('feedbackTitle');
    const desc = document.getElementById('feedbackDesc');

    if (isCorrect) {
        feedback.className = "mt-6 p-5 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
        title.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> Acertou em cheio!`;
        title.className = "text-lg font-bold mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-300";
    } else {
        feedback.className = "mt-6 p-5 rounded-2xl border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
        title.innerHTML = `<i class="fa-solid fa-circle-xmark text-rose-600"></i> Cuidado! Você caiu no golpe.`;
        title.className = "text-lg font-bold mb-2 flex items-center gap-2 text-rose-700 dark:text-rose-300";
    }

    desc.innerText = q.explanation;
}

function nextQuestion() {
    playSound('click');
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
        loadQuizQuestion();
    } else {
        const container = document.getElementById('quizContainer');
        document.getElementById('quizActions').classList.add('hidden');
        document.getElementById('quizFeedback').classList.add('hidden');
        container.innerHTML = `
            <div class="text-center py-8 space-y-4">
                <i class="fa-solid fa-trophy text-5xl text-amber-500"></i>
                <h3 class="text-2xl font-bold">Simulação Concluída!</h3>
                <p class="text-slate-600 dark:text-slate-300">Você acertou <strong>${quizScore}</strong> de <strong>${quizData.length}</strong> cenários.</p>
                <button onclick="resetQuiz()" class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition shadow">
                    Reiniciar Laboratório
                </button>
            </div>
        `;
    }
}

function resetQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    document.getElementById('quizScore').innerText = '0';
    loadQuizQuestion();
}

/* ==========================================
    6. CHECKLIST DE BOAS PRÁTICAS
========================================== */
const checklistData = [
    { id: 1, text: "Utilizo senhas diferentes e exclusivas para cada conta importante." },
    { id: 2, text: "Ativei a verificação em duas etapas (2FA / MFA) no e-mail e redes sociais." },
    { id: 3, text: "Uso um Gerenciador de Senhas confiável para armazenar credenciais." },
    { id: 4, text: "Desconfio de links urgentes recebidos por SMS, WhatsApp ou e-mail." },
    { id: 5, text: "Mantenho o sistema operacional e os navegadores sempre atualizados." }
];

let checkedItems = {};

function renderChecklist() {
    const container = document.getElementById('checklistItems');
    container.innerHTML = checklistData.map(item => `
        <label class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <input type="checkbox" onchange="toggleCheckItem(${item.id})" ${checkedItems[item.id] ? 'checked' : ''} class="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600">
            <span class="text-sm text-slate-700 dark:text-slate-200 ${checkedItems[item.id] ? 'line-through opacity-60' : ''}">${item.text}</span>
        </label>
    `).join('');
    updateChecklistProgress();
}

function toggleCheckItem(id) {
    playSound('click');
    checkedItems[id] = !checkedItems[id];
    renderChecklist();
}

function updateChecklistProgress() {
    const total = checklistData.length;
    const completed = Object.values(checkedItems).filter(Boolean).length;
    const percent = Math.round((completed / total) * 100);

    document.getElementById('checkPercent').innerText = `${percent}%`;
    document.getElementById('checkProgressBar').style.width = `${percent}%`;
}

// Inicialização Geral ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadQuizQuestion();
    renderChecklist();
});
