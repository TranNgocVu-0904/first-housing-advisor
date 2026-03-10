const questions = [
    { id: 'q1', text: "Do you easily impulsively buy things when scrolling through TikTok/social media, forgetting to check the price?" },
    { id: 'q2', text: "Does seeing peers 'flexing' their houses/cars online pressure you into wanting the same?" },
    { id: 'q3', text: "Do you prioritize spending on short-term experiences (traveling, hobbies) over strict financial saving for a house?" },
    { id: 'q4', text: "If you owned a house, would your top priority be an aesthetic, 'slay' design to impress guests?" },
    { id: 'q5', text: "Are you highly confident in your 'sixth sense' to spot a good real estate deal without expert advice?" },
    { id: 'q6', text: "Do your parents frequently remind you to track expenses and save money for emergencies?" },
    { id: 'q7', text: "Does your family have a strong tradition of long-term investing (e.g., buying gold, real estate)?" },
    { id: 'q8', text: "If an AI could transparently predict your 10-year cash flow, would you feel much more confident in making a decision?" },
    { id: 'q9', text: "Do you prefer using a gamified simulation app over doing manual financial calculations?" },
    { id: 'q10', text: "Ultimately, do you prioritize the stability of owning a home over the flexibility of renting?" }
];

// --- HÀM TÍNH TOÁN DÀNH CHO SANDBOX ---
let baseFinancials = { income: 0, capital: 0, price: 0, rent: 0 }; // Lưu trữ dữ liệu gốc

function calcBuySandbox(capital, targetPrice, annualInterest) {
    const downPayment = Math.min(capital, targetPrice * 0.3);
    let loanAmount = Math.max(0, targetPrice - downPayment);
    
    // Đã thay 0.09 bằng biến annualInterest do người dùng tự kéo
    const mr = (annualInterest / 100) / 12; 
    const months = 240; // Vay 20 năm
    
    const data = [];
    for (let yr = 1; yr <= 10; yr++) {
        const houseValue = targetPrice * Math.pow(1.05, yr);
        let remainingLoan = 0;
        if (loanAmount > 0) {
            remainingLoan = loanAmount * (Math.pow(1+mr, months) - Math.pow(1+mr, yr*12)) / (Math.pow(1+mr, months) - 1);
        }
        data.push(Math.max(0, houseValue - Math.max(0, remainingLoan)));
    }
    return data;
}

function calcRentSandbox(income, capital, rent, extraSavings, investRate, rentIncrease) {
    let currentCapital = capital;
    let currentRent = rent;
    const data = [];
    for (let yr = 1; yr <= 10; yr++) {
        // Tiền dư = (Thu nhập - Tiền thuê nhà hiện tại + Tiết kiệm thêm) * 12 tháng
        const surplus = (income - currentRent + extraSavings) * 12;
        
        // Vốn sinh lời
        currentCapital = (currentCapital * (1 + investRate / 100)) + (surplus > 0 ? surplus : 0);
        
        // CHỖ NÀY LÀ MỚI: Hết 1 năm, tiền thuê nhà TĂNG THÊM X Triệu/Tháng
        currentRent += rentIncrease;
        
        data.push(currentCapital);
    }
    return data;
}

function generateQuests(data, financials) {
    const questList = document.getElementById('quest-list');
    const nextLevelTitle = document.getElementById('next-level-title');
    const progress = document.getElementById('quest-progress');
    
    // Làm sạch danh sách cũ
    questList.innerHTML = '';
    
    const archetype = data.archetype; // Lấy từ API
    let quests = [];
    let nextRank = "";

    // LOGIC TẠO NHIỆM VỤ DỰA TRÊN ARCHETYPE
    if (archetype.includes("Accumulating Turtle")) {
        const targetCap = financials.price * 0.3; // 30% down payment
        quests = [
            { text: `Increase your equity to ${targetCap.toFixed(0)} million (Reach 30% down payment)`, icon: '<img src="gif/savings.gif" class="w-8 h-8 object-contain">' },
            { text: "Keep your YOLO score below 3.0 for the next 6 months", icon: '<img src="gif/shield.gif" class="w-8 h-8 object-contain">' },
            { text: "Build an emergency fund equal to 3 months of income", icon: '<img src="gif/safe-deposit-box.gif" class="w-8 h-8 object-contain">' }
        ];
        nextRank = 'Settled Lord <img src="gif/castle.gif" class="w-7 h-7 inline-block mb-2 object-contain">';
    } 
    else if (archetype.includes("Free Eagle")) {
        quests = [
            { text: "Generate passive income to cover 50% of your monthly rent", icon: '<img src="gif/money.gif" class="w-8 h-8 object-contain">' },
            { text: "Invest at least 20% of your monthly income in high-yield assets", icon: '<img src="gif/motivation.gif" class="w-8 h-8 object-contain">' },
            { text: "Scout real estate opportunities with cash-flow potential (Airbnb/Rental)", icon: '<img src="gif/radar.gif" class="w-8 h-8 object-contain">' }
        ];
        nextRank = 'Nomad Tiger <img src="gif/tiger.gif" class="w-7 h-7 inline-block mb-2 object-contain">';
    }
    else {
        // Mặc định cho các nhóm khác (Settled Lord, Nomad Tiger)
        quests = [
            { text: "Optimize your current personal balance sheet", icon: '<img src="gif/scale.gif" class="w-8 h-8 object-contain">' },
            { text: "Deep dive into financial leverage strategies (Mortgage Leverage)", icon: '<img src="gif/spell-book.gif" class="w-8 h-8 object-contain">' },
            { text: "Maintain spending discipline to achieve ultimate financial freedom", icon: '<img src="gif/target.gif" class="w-8 h-8 object-contain">' }
        ];
        nextRank = 'REAL ESTATE TYCOON <img src="gif/crown.gif" class="w-7 h-7 inline-block mb-2 object-contain">';
    }



    // nextLevelTitle.innerHTML = nextRank;

    // nextLevelTitle.className = "text-[#722f37] font-bold";


    
    // JS tự động in chữ Next Rank lúc ban đầu
    nextLevelTitle.innerHTML = `<span class="text-[#722f37] font-bold uppercase">Next Rank:</span> <span class="text-[#6F8A4B] font-bold text-[15px] tracking-normal">${nextRank}</span>`;

    let completedQuests = 0; // Biến đếm số nhiệm vụ đã làm
    const totalQuests = quests.length; // Thường là 3 nhiệm vụ
    
    // Đặt thanh kinh nghiệm về 0% lúc ban đầu
    progress.style.width = "0%";

    // Render Quests lên giao diện
    quests.forEach((q, index) => {
        const div = document.createElement('div');
        
        // Thêm class 'cursor-pointer' để hiện hình bàn tay khi lia chuột vào, báo hiệu có thể click
        div.className = "flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#9BBA74] hover:bg-[#9BBA74]/5 transition-all group shadow-sm cursor-pointer relative overflow-hidden";
        
        div.innerHTML = `
            <div class="quest-icon transition-all duration-300 z-10">${q.icon}</div>
            <p class="quest-text relative text-[15.5px] text-[#B0B9A6] group-hover:text-[#58806B] group-hover:font-bold transition-all duration-300 leading-snug z-10">${q.text}</p>
            <div class="done-overlay absolute inset-0 bg-[#800000]/20 scale-x-0 origin-left transition-transform duration-500"></div>
        `;
        // THÊM SỰ KIỆN CLICK CHO TỪNG NHIỆM VỤ
        div.addEventListener('click', () => {
            const isDone = div.classList.contains('is-done');
            
            if (!isDone) {
                // 1. Đánh dấu hoàn thành
                div.classList.add('is-done', 'border-[#800000]');
                div.querySelector('.quest-text').classList.add('line-through', 'opacity-60', 'decoration-[#800000]', 'decoration-2'); // Gạch ngang chữ
                div.querySelector('.quest-icon').style.filter = "grayscale(100%) opacity(50%)"; // Làm mờ icon
                div.querySelector('.done-overlay').classList.replace('scale-x-0', 'scale-x-100'); // Trải màu nền
                
                completedQuests++;
            } else {
                // 2. Hủy đánh dấu (nếu người dùng đổi ý click lại)
                div.classList.remove('is-done', 'border-[#800000]');
                div.querySelector('.quest-text').classList.remove('line-through', 'opacity-60', 'decoration-[#800000]', 'decoration-2');
                div.querySelector('.quest-icon').style.filter = "none";
                div.querySelector('.done-overlay').classList.replace('scale-x-100', 'scale-x-0');
                
                completedQuests--;
            }

            // 3. Cập nhật thanh Progress Bar
            const percent = (completedQuests / totalQuests) * 100;
            progress.style.width = `${percent}%`;

            // 4. Kiểm tra MỞ KHÓA NEXT RANK
            if (completedQuests === totalQuests) {
                // Hoàn thành 3/3 -> Đổi chữ, thêm hiệu ứng nảy (bounce)
                nextLevelTitle.innerHTML = `<span class="flex items-center gap-1"> <img src="gif/fireworks.gif" class="w-7 h-7 object-contain"> 
                        <span>UNLOCKED:</span> 
                    <span class="text-[#9BBA74] font-bold text-[15px] tracking-normal">${nextRank}</span>
                </span>
                `;
                nextLevelTitle.classList.add('animate-bounce');
                
                setTimeout(() => {
                    nextLevelTitle.classList.remove('animate-bounce');
                }, 1500);
            } else {
                // Chưa hoàn thành đủ -> Trả về trạng thái cũ (Thêm lại chữ Next Rank màu đỏ bị thiếu)
                nextLevelTitle.innerHTML = `<span class="text-[#722f37] font-bold uppercase">Next Rank:</span> <span class="text-[#6F8A4B] font-bold text-[15px] tracking-normal">${nextRank}</span>`;
                nextLevelTitle.classList.remove('animate-bounce');
            }
        });

        questList.appendChild(div);
    });
    

}

// --- HÀM HELPER ---
function customRound(val) {
    const num = parseFloat(val);
    const intPart = Math.floor(num);
    const decimalPart = num - intPart;
    return decimalPart <= 0.5 ? intPart : intPart + 1;
}

// Hàm chuyển cảnh mượt mà và tự động quản lý nút Back
function switchScreen(hideEl, showEl, displayType = 'block') {
    hideEl.classList.remove('opacity-100', 'translate-y-0');
    hideEl.classList.add('opacity-0', '-translate-y-5');

    setTimeout(() => {
        hideEl.classList.add('hidden');
        hideEl.classList.remove('flex'); 
        
        showEl.classList.remove('hidden', '-translate-y-5');
        showEl.classList.add('opacity-0', 'translate-y-5');
        if (displayType === 'flex') showEl.classList.add('flex');

        void showEl.offsetWidth; // Force reflow

        showEl.classList.remove('opacity-0', 'translate-y-5');
        showEl.classList.add('opacity-100', 'translate-y-0');

        // --- LOGIC TỰ ĐỘNG BẬT/TẮT NÚT BACK TRÊN HEADER ---
        const backQBtn = document.getElementById('back-q-btn');
        const backSubmitBtn = document.getElementById('back-from-submit');
        
        if (showEl.id === 'part2-container') {
            if(backQBtn) backQBtn.classList.remove('hidden');
            if(backSubmitBtn) backSubmitBtn.classList.add('hidden');
        } else if (showEl.id === 'submit-container') {
            if(backQBtn) backQBtn.classList.add('hidden');
            if(backSubmitBtn) backSubmitBtn.classList.remove('hidden');
        } else {
            // Các màn hình khác (Intro, Part1, Result) sẽ tự động ẩn nút Back
            if(backQBtn) backQBtn.classList.add('hidden');
            if(backSubmitBtn) backSubmitBtn.classList.add('hidden');
        }
    }, 400); 
}

// Hàm hiệu ứng đếm số
function animateNumber(id, endValue) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const duration = 1200; // 1.2s

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * endValue).toFixed(1);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- STATE QUẢN LÝ ---
let currentStep = 0;
const userAnswers = {}; 

// --- DOM ELEMENTS ---
const introContainer = document.getElementById('intro-container');
const part1Container = document.getElementById('part1-container');
const part2Container = document.getElementById('part2-container');
const submitContainer = document.getElementById('submit-container');
const loadingContainer = document.getElementById('loading-container');
const resultContainer = document.getElementById('result-container');

const qWrapper = document.getElementById('question-wrapper');
const qCounter = document.getElementById('q-counter');
const qText = document.getElementById('q-text');
const currentSlider = document.getElementById('current-slider');
const sliderDisplay = document.getElementById('slider-display');
const nextQBtn = document.getElementById('next-q-btn');

// --- HÀM TẠO THƯỚC ĐO CẢM XÚC (VIBE METER) ---
function updateSliderText(val) {
    const num = customRound(val);
    const displayEl = document.getElementById('slider-display');
    
    // Thêm 'flex justify-center items-center gap-3' để chữ và hình TỰ ĐỘNG nằm ngay ngắn thẳng hàng ngang
    let baseClass = "flex justify-center items-center gap-3 mb-6 font-mono text-3xl md:text-4xl font-bold transition-colors duration-300 ";
    
    if (num === 1) {
        // Đã xóa span mt-7 gây lệch chữ
        displayEl.innerHTML = 'NO WAY <img src="gif/no.gif" alt="Nope" class="w-12 h-12 md:w-12 md:h-12 object-contain">';
        displayEl.className = baseClass + "text-[#EA738D]"; 
    } else if (num === 2) {
        displayEl.innerHTML = 'MEH... <img src="gif/thinking.gif" alt="Meh" class="w-12 h-12 md:w-12 md:h-12 object-contain">';
        displayEl.className = baseClass + "text-[#E58E61]"; 
    } else if (num === 3) {
        displayEl.innerHTML = 'FIFTY-FIFTY <img src="gif/balance.gif" alt="Scale" class="w-12 h-12 md:w-12 md:h-12 object-contain">';
        displayEl.className = baseClass + "text-[#E5BD77]"; 
    } else if (num === 4) {
        displayEl.innerHTML = 'KINDA TRUE <img src="gif/decision-making.gif" alt="Kinda" class="w-12 h-12 md:w-12 md:h-12 object-contain">';
        displayEl.className = baseClass + "text-[#CC7952]"; 
    } else {
        displayEl.innerHTML = 'LITERALLY ME! <img src="gif/fire.gif" alt="Fire" class="w-12 h-12 md:w-12 md:h-12 object-contain">';
        displayEl.className = baseClass + "text-[#8B0000]"; 
    }
}

// --- SỰ KIỆN NÚT BẤM ---

// Intro -> Part 1
document.getElementById('start-test-btn').addEventListener('click', () => {
    switchScreen(introContainer, part1Container);
});

// Part 1 -> Part 2
document.getElementById('next-to-part2-btn').addEventListener('click', () => {
    const inc = document.getElementById('income').value;
    const cap = document.getElementById('capital').value;
    const pri = document.getElementById('price').value;
    const ren = document.getElementById('rent').value;

    if (!inc || !cap || !pri || !ren) {
        showCustomAlert("Please fill in all financial details to continue!");
        return;
    }
    currentStep = 0;
    switchScreen(part1Container, part2Container);
    loadQuestion(0);
});

// Kéo thanh trượt
currentSlider.addEventListener('input', (e) => {
    updateSliderText(e.target.value);
    updateQuizSliderFill();
});

// Hàm Load Câu Hỏi
function loadQuestion(index) {
    qWrapper.classList.remove('opacity-100', 'translate-x-0');
    qWrapper.classList.add('opacity-0', '-translate-x-5');
    
    setTimeout(() => {
        qCounter.innerText = `Challenge ${index + 1}`;
        qText.innerText = questions[index].text;
        
        const currentQId = questions[index].id;
        currentSlider.value = userAnswers[currentQId] !== undefined ? userAnswers[currentQId] : 1;
        updateSliderText(currentSlider.value);

        updateQuizSliderFill();
        
        if (index === questions.length - 1) {
            // 1. Chữ FINISH: Phóng to 10%, giãn khoảng cách chữ và nghiêng nhẹ sang TRÁI (-rotate-3)
            nextQBtn.innerHTML = `<span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:tracking-[6px]">FINISH</span>`;
            
            // 2. Class của nút: Thêm chữ 'group' ở ngay đầu tiên
            nextQBtn.className = "group w-full py-4 rounded-xl font-mono text-sm font-bold tracking-widest text-white transition-all duration-300 bg-[#1F3D2D] hover:-translate-y-[2px]";
        } else {
            // 1. Chữ NEXT: Phóng to 10%, giãn khoảng cách chữ và nghiêng nhẹ sang PHẢI (rotate-3)
            nextQBtn.innerHTML = `<span class="inline-block transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:tracking-[6px]">NEXT</span>`;
            
            // 2. Class của nút: Thêm chữ 'group' ở ngay đầu tiên
            nextQBtn.className = "group w-full py-4 rounded-xl font-mono text-sm font-bold tracking-widest text-white transition-all duration-300 bg-[#58806B] hover:-translate-y-[2px]";
        }
        
        qWrapper.classList.remove('opacity-0', '-translate-x-5');
        qWrapper.classList.add('opacity-100', 'translate-x-0');
    }, 200);
}

// Nút Next Câu Hỏi
nextQBtn.addEventListener('click', () => {
    userAnswers[questions[currentStep].id] = customRound(currentSlider.value);
    if (currentStep < questions.length - 1) {
        currentStep++;
        loadQuestion(currentStep);
    } else {
        switchScreen(part2Container, submitContainer, 'flex');
    }
});

// Nút Back Câu Hỏi
if(document.getElementById('back-q-btn')) {
    document.getElementById('back-q-btn').addEventListener('click', () => {
        userAnswers[questions[currentStep].id] = customRound(currentSlider.value);
        if (currentStep > 0) {
            currentStep--;
            loadQuestion(currentStep);
        } else {
            switchScreen(part2Container, part1Container);
        }
    });
}

// Nút Back Từ Màn Hình Submit
if(document.getElementById('back-from-submit')) {
    document.getElementById('back-from-submit').addEventListener('click', () => {
        currentStep = questions.length - 1;
        switchScreen(submitContainer, part2Container);
        loadQuestion(currentStep);
    });
}

// Submit Form (Gọi API)
document.getElementById('advisorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Mở màn hình Loading
    switchScreen(submitContainer, loadingContainer, 'flex');

    const payload = {
        income: parseFloat(document.getElementById('income').value),
        capital: parseFloat(document.getElementById('capital').value),
        price: parseFloat(document.getElementById('price').value),
        rent: parseFloat(document.getElementById('rent').value),
        ...userAnswers 
    };

    try {
        // Đổi từ fetch('http://localhost:8000/api/analyze') nếu muốn chạy local:
        const response = await fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();

        // Lưu lại dữ liệu gốc để Sandbox có thể chạy được
        baseFinancials = {
            income: payload.income, 
            capital: payload.capital,
            price: payload.price, 
            rent: payload.rent
        };

        // Tách Icon (bây giờ là tên file GIF) và Text từ dữ liệu Python trả về
        const parts = data.archetype.split(' ');
        const iconFilename = parts[0]; // VD: "eagle.gif"
        const text = parts.slice(1).join(' '); // VD: "Free Eagle"

        document.getElementById('archetype-icon').innerHTML = `<img src="${iconFilename}" alt="Archetype" class="w-12 h-12 md:w-16 md:h-16 object-contain inline-block">`;
        document.getElementById('archetype-text').innerText = text;
        document.getElementById('advice-text').innerText = data.advice;

        generateQuests(data, payload);

        // Vẽ biểu đồ
        renderChart(data.buy_data, data.rent_data);

        // Chờ 1 giây cho đẹp rồi chuyển sang màn hình Result
        setTimeout(() => {
            switchScreen(loadingContainer, resultContainer);
            
            // Kích hoạt hiệu ứng đếm số
            setTimeout(() => {
                animateNumber('yolo-display', data.yolo_score);
                animateNumber('safety-display', data.safety_score);
                animateNumber('rational-display', data.rational_score);
            }, 400); 
            
        }, 1200);

    } catch (error) {
        showCustomAlert("AI Brain is sleeping! Mất kết nối server.");
        switchScreen(loadingContainer, submitContainer, 'flex');
    }
});


// --- VẼ BIỂU ĐỒ ---
function renderChart(buyData, rentData) {
    const ctx = document.getElementById('projectionChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'],
            datasets: [
                { 
                    label: 'Buy House Scenario', 
                    data: buyData, 
                    borderColor: '#9E5C5D', // Màu Rose Dust
                    backgroundColor: 'rgba(158, 92, 93, 0.1)', 
                    fill: true, 
                    tension: 0.4, 
                    borderWidth: 2.5, 
                    pointRadius: 4, 
                    pointBackgroundColor: '#9E5C5D', 
                    pointBorderColor: '#9E5C5D', // Viền đặc cùng màu Rose Dust
                    pointBorderWidth: 2 
                },
                { 
                    label: 'Rent + Invest Scenario', 
                    data: rentData, 
                    borderColor: '#353924', // Màu Xám Rêu
                    backgroundColor: 'rgba(53, 57, 36, 0.1)', 
                    fill: true, 
                    tension: 0.4, 
                    borderWidth: 2.5, 
                    pointRadius: 4, 
                    pointBackgroundColor: '#353924', 
                    pointBorderColor: '#353924', // Viền đặc cùng màu Xám Rêu
                    pointBorderWidth: 2 
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: { 
                x: { 
                    ticks: { color: '#6b7280' }, 
                    grid: { display: false } 
                }, 
                y: { 
                    ticks: { color: '#6b7280' }, 
                    grid: { display: false } 
                } 
            },
            plugins: { 
                legend: { 
                    labels: { 
                        color: '#4b5563', 
                        font: { family: "'Space Mono', monospace", weight: 'bold' } 
                    } 
                } 
            }
        }
    });
}

// --- SỰ KIỆN SANDBOX KÉO THẢ (REAL-TIME) ---
const savingsSlider = document.getElementById('sandbox-savings');
const priceSlider = document.getElementById('sandbox-price');
const interestSlider = document.getElementById('sandbox-interest');
const investSlider = document.getElementById('sandbox-invest'); 
const rentIncSlider = document.getElementById('sandbox-rent-inc'); 

function updateSimulation() {
    if (!savingsSlider || !priceSlider || !interestSlider || !investSlider || !rentIncSlider) return;

    const extraSavings = parseFloat(savingsSlider.value);
    const priceShift = parseFloat(priceSlider.value);
    const interestRate = parseFloat(interestSlider.value);
    const investRate = parseFloat(investSlider.value); 
    const rentIncrease = parseFloat(rentIncSlider.value); 

    // Cập nhật chữ hiển thị
    document.getElementById('sandbox-savings-val').innerText = `+${extraSavings} Mil/Mo`;
    document.getElementById('sandbox-price-val').innerText = `${priceShift > 0 ? '+' : ''}${priceShift}%`;
    document.getElementById('sandbox-interest-val').innerText = `${interestRate.toFixed(1)}% / Yr`;
    document.getElementById('sandbox-invest-val').innerText = `${investRate.toFixed(1)}% / Yr`;
    document.getElementById('sandbox-rent-inc-val').innerText = `+${rentIncrease.toFixed(1)} Mil/Mo`;

    // Tính toán lại
    const newTargetPrice = baseFinancials.price * (1 + (priceShift / 100));
    const newBuyData = calcBuySandbox(baseFinancials.capital, newTargetPrice, interestRate);
    const newRentData = calcRentSandbox(baseFinancials.income, baseFinancials.capital, baseFinancials.rent, extraSavings, investRate, rentIncrease);

    if (window.myChart) {
        window.myChart.data.datasets[0].data = newBuyData;
        window.myChart.data.datasets[1].data = newRentData;
        window.myChart.update();
    }
}

if (savingsSlider) savingsSlider.addEventListener('input', updateSimulation);
if (priceSlider) priceSlider.addEventListener('input', updateSimulation);
if (interestSlider) interestSlider.addEventListener('input', updateSimulation);
if (investSlider) investSlider.addEventListener('input', updateSimulation);
if (rentIncSlider) rentIncSlider.addEventListener('input', updateSimulation);


// ==========================================
// HIỆU ỨNG TÔ MÀU THANH TRƯỢT (WHAT-IF SANDBOX)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sliderColors = {
        'sandbox-savings': '#24282B',   
        'sandbox-price': '#36436F',     
        'sandbox-interest': '#D9A05B',  
        'sandbox-invest': '#5B9DA6',    
        'sandbox-rent-inc': '#B6000F'   
    };

    const emptyTrackColor = '#d1d5db'; 

    Object.keys(sliderColors).forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            const color = sliderColors[id];
            
            const updateFill = () => {
                const min = parseFloat(slider.min) || 0;
                const max = parseFloat(slider.max) || 100;
                const val = parseFloat(slider.value);
                const percent = ((val - min) / (max - min)) * 100;
                slider.style.background = `linear-gradient(to right, ${color} ${percent}%, ${emptyTrackColor} ${percent}%)`;
            };

            updateFill(); 
            slider.addEventListener('input', updateFill); 
        }
    });
});

// ==========================================
// HIỆU ỨNG NÚT BẤM (HOVER GIF) & RESTART
// ==========================================

// --- 1. HIỆU ỨNG TRÁO ẢNH HOVER TỰ ĐỘNG CHO MỌI NÚT ---
// Tìm tất cả các nút có class 'hover-gif-btn'
document.querySelectorAll('.hover-gif-btn').forEach(btn => {
    const icon = btn.querySelector('img'); // Tìm thẻ img nằm trong nút đó
    if (icon) {
        const staticSrc = btn.getAttribute('data-static'); // Lấy tên ảnh tĩnh
        const animSrc = btn.getAttribute('data-anim');     // Lấy tên ảnh động

        if (staticSrc && animSrc) {
            btn.addEventListener('mouseenter', () => icon.src = animSrc);
            btn.addEventListener('mouseleave', () => icon.src = staticSrc);
        }
    }
});

// --- 2. SỰ KIỆN CLICK RIÊNG CỦA NÚT RESTART ---
const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        // Reset Form & Xóa câu trả lời cũ
        document.getElementById('advisorForm').reset();
        for (const key in userAnswers) delete userAnswers[key];
        
        // Reset LẠI ĐỦ 5 THANH TRƯỢT SANDBOX VỀ MẶC ĐỊNH
        if(document.getElementById('sandbox-savings')) document.getElementById('sandbox-savings').value = 0;
        if(document.getElementById('sandbox-price')) document.getElementById('sandbox-price').value = 0;
        if(document.getElementById('sandbox-interest')) document.getElementById('sandbox-interest').value = 9.0;
        if(document.getElementById('sandbox-invest')) document.getElementById('sandbox-invest').value = 8.0;
        if(document.getElementById('sandbox-rent-inc')) document.getElementById('sandbox-rent-inc').value = 0.5;

        // Reset lại chữ hiển thị
        if(document.getElementById('sandbox-savings-val')) document.getElementById('sandbox-savings-val').innerText = "+0 Mil/Mo";
        if(document.getElementById('sandbox-price-val')) document.getElementById('sandbox-price-val').innerText = "0%";
        if(document.getElementById('sandbox-interest-val')) document.getElementById('sandbox-interest-val').innerText = "9.0% / Yr";
        if(document.getElementById('sandbox-invest-val')) document.getElementById('sandbox-invest-val').innerText = "8.0% / Yr";
        if(document.getElementById('sandbox-rent-inc-val')) document.getElementById('sandbox-rent-inc-val').innerText = "+0.5 Mil/Mo";

        // Kích hoạt sự kiện "input" ảo để reset lại dải màu
        const inputEvent = new Event('input', { bubbles: true });
        
        // Đổi thành mảng chứa 5 thanh trượt Sandbox trực tiếp
        const sandboxSliders = [
            document.getElementById('sandbox-savings'),
            document.getElementById('sandbox-price'),
            document.getElementById('sandbox-interest'),
            document.getElementById('sandbox-invest'),
            document.getElementById('sandbox-rent-inc')
        ];
        
        sandboxSliders.forEach(slider => {
            if (slider) slider.dispatchEvent(inputEvent);
        });

        // Chuyển về màn hình Intro
        switchScreen(resultContainer, introContainer);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
// ==========================================
// HIỆU ỨNG TÔ MÀU THANH TRƯỢT (CÂU HỎI TRẮC NGHIỆM)
// ==========================================
const quizSlider = document.getElementById('current-slider');
const quizActiveColor = '#990011'; // Màu đỏ chủ đạo của bài test
const quizEmptyColor = '#E8E2D2';  // Màu xám nhạt của rãnh trống

function updateQuizSliderFill() {
    if (!quizSlider) return;
    const min = parseFloat(quizSlider.min) || 1;
    const max = parseFloat(quizSlider.max) || 5;
    const val = parseFloat(quizSlider.value);
    
    // Tính toán phần trăm (từ 1 đến 5)
    const percent = ((val - min) / (max - min)) * 100;
    
    // Đổ màu rãnh
    quizSlider.style.background = `linear-gradient(to right, ${quizActiveColor} ${percent}%, ${quizEmptyColor} ${percent}%)`;
}

// --- HÀM ĐIỀU KHIỂN CUSTOM ALERT ---
function showCustomAlert(message) {
    const alertModal = document.getElementById('custom-alert');
    const alertBox = document.getElementById('custom-alert-box');
    const alertText = document.getElementById('custom-alert-text');
    
    // Gắn câu thông báo vào hộp
    alertText.innerText = message;
    
    // Hiện Modal lên (xóa class hidden)
    alertModal.classList.remove('hidden');
    
    // Kích hoạt hiệu ứng mờ dần và phóng to (delay 10ms để Tailwind kịp nhận class)
    setTimeout(() => {
        alertModal.classList.remove('opacity-0');
        alertModal.classList.add('opacity-100');
        alertBox.classList.remove('scale-90');
        alertBox.classList.add('scale-100');
    }, 10);
}

function hideCustomAlert() {
    const alertModal = document.getElementById('custom-alert');
    const alertBox = document.getElementById('custom-alert-box');
    
    // Chạy ngược lại hiệu ứng: mờ đi và thu nhỏ
    alertModal.classList.remove('opacity-100');
    alertModal.classList.add('opacity-0');
    alertBox.classList.remove('scale-100');
    alertBox.classList.add('scale-90');
    
    // Đợi 300ms cho hiệu ứng chạy xong rồi mới ẩn hẳn (thêm hidden)
    setTimeout(() => {
        alertModal.classList.add('hidden');
    }, 300);
}

// Bắt sự kiện bấm nút "GOT IT" hoặc bấm ra ngoài nền đen để đóng
document.getElementById('close-alert-btn').addEventListener('click', hideCustomAlert);
document.getElementById('custom-alert-backdrop').addEventListener('click', hideCustomAlert);