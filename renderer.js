const fs = require('fs');
const amountInput = document.getElementById('amount');
const percentInput = document.getElementById('percent');
const monthsInput = document.getElementById('months');
const errorLog = document.getElementById('errorLog');

const clearError = () => { errorLog.innerText = ""; errorLog.style.color = "#ff5252"; };

const prepareForEdit = (e) => {
    e.target.value = e.target.value.replace(/[\s\u00A0]/g, '').replace('₴', '');
    clearError();
};

const validateInput = (e) => {
    let cursor = e.target.selectionStart;
    let val = e.target.value;
    let cleaned = val.replace(/[^0-9,.]/g, '').replace(/\./g, ',');
    
    if ((cleaned.match(/,/g) || []).length > 1) {
        cleaned = cleaned.replace(/,+$/, "");
    }

    if (val !== cleaned) {
        e.target.value = cleaned;
        // Більш надійний розрахунок позиції курсора
        let diff = val.length - cleaned.length;
        e.target.setSelectionRange(cursor - diff, cursor - diff);
    }
};

const formatN2 = (e) => {
    let raw = e.target.value.replace(/[\s\u00A0]/g, '').replace(',', '.');
    if (raw && !isNaN(raw)) {
        e.target.value = parseFloat(raw).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
};

[amountInput, percentInput, monthsInput].forEach(el => {
    el.addEventListener('focus', prepareForEdit);
    el.addEventListener('input', validateInput);
});
[amountInput, percentInput].forEach(el => el.addEventListener('blur', formatN2));

function calculate() {
    clearError();
    // Скидаємо результат перед новим розрахунком
    const resultDisplay = document.getElementById('lblResultNum');
    
    const get = (id) => {
        let raw = document.getElementById(id).value.replace(/[\s\u00A0]/g, '').replace(',', '.');
        return parseFloat(raw);
    };

    const amount = get('amount'), percentRaw = get('percent'), months = get('months');

    // Перевірка діапазонів
    if (isNaN(amount) || amount < 1 || amount > 50000000) {
        resultDisplay.innerText = "0,00₴"; // Скидання
        return errorLog.innerText = "⚠️ Сума: 1 - 50 000 000";
    }
    if (isNaN(percentRaw) || percentRaw < 0 || percentRaw > 100) {
        resultDisplay.innerText = "0,00₴";
        return errorLog.innerText = "⚠️ Відсоток: 0 - 100";
    }
    if (isNaN(months) || months <= 0) {
        resultDisplay.innerText = "0,00₴";
        return errorLog.innerText = "⚠️ Вкажіть термін";
    }

    const res = amount + (amount * (percentRaw / 100) * (months / 12));
    
    document.getElementById('lblResult').innerText = 
        document.getElementById('rbCredit').checked ? "Вам потрібно сплатити" : "Ви отримаєте";
    
    resultDisplay.innerText = res.toLocaleString('uk-UA', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }) + "₴";
    
    return res;
}

document.getElementById('btnCalc').addEventListener('click', calculate);
document.getElementById('btnSave').addEventListener('click', () => {
    if (!calculate()) return;
    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.writeFileSync(`result_${date}.txt`, `Результат: ${document.getElementById('lblResultNum').innerText}`);
    errorLog.style.color = "#4caf50";
    errorLog.innerText = "✅ Збережено!";
});

document.getElementById('themeToggleBtn').addEventListener('click', () => document.body.classList.toggle('light-theme'));