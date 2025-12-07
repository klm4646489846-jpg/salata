// مفاتيح التخزين
const STORAGE_KEY_DONE_COUNT = 'qadaaDoneCount';
const STORAGE_KEY_HISTORY = 'qadaaHistory';

// العناصر الأساسية في الصفحة
const totalRemainingDisplay = document.getElementById('total-remaining-display');
const totalDoneDisplay = document.getElementById('total-done-display');
const addDayBtn = document.getElementById('add-day-btn');
const singlePrayerButtons = document.querySelectorAll('.single-prayer-buttons button');
const historyList = document.getElementById('history-list');

// --- بيانات الصلوات ---
// قيمة كل صلاة (نستخدم 1 كقيمة افتراضية لسهولة الحساب)
const PRAYERS = {
    fajr: 'الصبح',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
};

// --- الدوال الأساسية للعمل ---

// 1. تحميل حالة التطبيق من الذاكرة المحلية
function loadState() {
    // عدد الصلوات المقضية (كل 5 صلوات = يوم قضاء)
    let doneCount = parseInt(localStorage.getItem(STORAGE_KEY_DONE_COUNT) || '0', 10);
    // سجل التواريخ والصلوات
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    
    // يجب أن يحدد المستخدم العدد الكلي المفترض أولاً (نضعه افتراضياً هنا)
    const initialTotalQadaaDays = 365; // مثال: عام كامل = 365 يوم
    
    // تحديث الواجهة
    updateDisplays(doneCount, initialTotalQadaaDays);
    renderHistory(history);
    
    return { doneCount, history };
}

// 2. تحديث شاشات العرض
function updateDisplays(doneCount, initialTotalDays) {
    const totalDoneDays = Math.floor(doneCount / 5); // كل 5 صلوات هي يوم
    const totalRemainingDays = initialTotalDays - totalDoneDays;

    totalDoneDisplay.textContent = `${totalDoneDays} يوم`;
    
    // عرض المتبقي، والتأكد من عدم النزول تحت الصفر
    totalRemainingDisplay.textContent = `${Math.max(0, totalRemainingDays)} يوم`;
    
    // حفظ العدد الجديد
    localStorage.setItem(STORAGE_KEY_DONE_COUNT, doneCount);
}

// 3. إضافة صلاة مقضية جديدة
function addQadaa(prayerKey) {
    let { doneCount, history } = loadState();

    // 1. زيادة العداد
    doneCount += 1; 

    // 2. إضافة إلى السجل
    const now = new Date();
    const formattedDate = now.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const newEntry = {
        id: Date.now(),
        prayer: PRAYERS[prayerKey] || 'يوم كامل', // لتسجيل اليوم الكامل
        date: formattedDate
    };

    // إضافة الإدخال الجديد في بداية القائمة وعرض أحدث 10 فقط
    history.unshift(newEntry);
    history = history.slice(0, 10); // حفظ آخر 10 سجلات

    // 3. حفظ التعديلات
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    
    // 4. تحديث الواجهة
    updateDisplays(doneCount, 365); // نستخدم 365 كعدد افتراضي للمقارنة
    renderHistory(history);
    
    alert(`تمت إضافة قضاء صلاة ${newEntry.prayer} بنجاح!`);
}

// 4. عرض سجل التواريخ
function renderHistory(history) {
    historyList.innerHTML = ''; // تفريغ القائمة أولاً

    if (history.length === 0) {
        historyList.innerHTML = '<li>لا يوجد سجل قضاء بعد. ابدأ اليوم!</li>';
        return;
    }

    history.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-prayer-name">${entry.prayer}</span>
            <span class="history-date">${entry.date}</span>
        `;
        historyList.appendChild(li);
    });
}

// --- ربط الأحداث بالأزرار ---

// 1. زر إضافة يوم قضاء كامل (5 صلوات)
addDayBtn.addEventListener('click', () => {
    // نستخدم 'day' كـ prayerKey خاص ليمثل 5 صلوات
    for(let i = 0; i < 5; i++) {
        addQadaa('day');
    }
    alert('تم إضافة يوم قضاء كامل (5 صلوات) بنجاح!');
});

// 2. أزرار إضافة صلاة واحدة محددة
singlePrayerButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const prayerKey = event.target.getAttribute('data-prayer');
        addQadaa(prayerKey);
    });
});

// --- بدء التطبيق ---
document.addEventListener('DOMContentLoaded', loadState);

// ملاحظة مهمة للمستخدم:
console.log('ملاحظة: لحساب العدد المتبقي بدقة، يجب على المستخدم إدخال العدد الكلي التقديري للصلوات الفائتة. الكود الحالي يستخدم 365 يوماً كقيمة افتراضية.');