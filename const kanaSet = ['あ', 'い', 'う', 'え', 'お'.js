const kanaSet = ['あ', 'い', 'う', 'え', 'お'];  // 五十音字符
let currentCharIndex = 0;
let currentChar = kanaSet[currentCharIndex];
const canvas = document.getElementById('writing-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// 設置當前字符
function setChar(char) {
    currentChar = char;
    document.getElementById('current-char').innerText = currentChar;
}

// 畫布交互處理
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    checkDrawing();
});

document.getElementById('clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('feedback').innerText = '';
});

// 畫布設置
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

// 手寫識別邏輯
async function recognizeCharacter(imageData) {
    const model = await tf.loadLayersModel('https://example.com/your-trained-model.json'); // 載入模型
    const imgElement = new Image();
    imgElement.src = imageData;
    imgElement.onload = async function() {
        const tensor = tf.browser.fromPixels(imgElement)
            .resizeNearestNeighbor([28, 28])
            .mean(2)
            .expandDims(0)
            .expandDims(-1)
            .toFloat()
            .div(tf.scalar(255.0)); // 正規化
        const prediction = model.predict(tensor);
        const result = prediction.argMax(1).dataSync()[0];
        handlePrediction(result);
    };
}

// 給用戶反饋
function handlePrediction(result) {
    const predictedChar = kanaSet[result];
    if (predictedChar === currentChar) {
        document.getElementById('feedback').innerText = '正確！';
    } else {
        document.getElementById('feedback').innerText = '請再試一次！';
    }
    nextChar();
}

// 進度更新
function nextChar() {
    currentCharIndex++;
    if (currentCharIndex < kanaSet.length) {
        currentChar = kanaSet[currentCharIndex];
        document.getElementById('current-char').innerText = currentChar;
    } else {
        currentCharIndex = 0;
        currentChar = kanaSet[currentCharIndex];
        document.getElementById('current-char').innerText = currentChar;
    }
    updateProgress();
}

function updateProgress() {
    const progress = (currentCharIndex + 1) / kanaSet.length * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('progress-text').innerText = (currentCharIndex + 1) + ' / ' + kanaSet.length;
}
