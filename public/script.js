// Initialize Scanner
const html5QrCode = new Html5Qrcode("reader");

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning after success
    html5QrCode.stop().then(() => {
        document.getElementById('reader').style.display = 'none';
        handleScanResult(decodedText);
    }).catch(err => console.log(err));
}

function onScanFailure(error) {
    // Handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
}

// Start Camera
html5QrCode.start(
    { facingMode: "environment" }, 
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    onScanFailure
);

// Handle API Response
async function handleScanResult(qrCodeId) {
    const resultBox = document.getElementById('scan-result');
    const statusMsg = document.getElementById('status-msg');
    const timeMsg = document.getElementById('time-msg');
    
    resultBox.classList.remove('hidden');
    statusMsg.innerText = "Processing...";
    timeMsg.innerText = "";

    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrCodeId })
        });

        const data = await response.json();

        if (data.success) {
            statusMsg.innerText = data.message;
            statusMsg.style.color = "green";
            timeMsg.innerText = `Time: ${data.time}`;
            refreshLogs(); // Update dashboard
        } else {
            statusMsg.innerText = data.message;
            statusMsg.style.color = "red";
        }
    } catch (error) {
        statusMsg.innerText = "Error connecting to server";
    }
}

// Generate New Card
async function generateCard() {
    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;

    if(!name || !email) {
        alert("Please fill in all fields");
        return;
    }

    const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    });

    const data = await response.json();
    
    if(data.success) {
        document.getElementById('qr-image').src = data.qrDataUrl;
        document.getElementById('generated-card').classList.remove('hidden');
    }
}

// Refresh Logs
async function refreshLogs() {
    const response = await fetch('/api/logs');
    const logs = await response.json();
    
    const tbody = document.getElementById('log-table-body');
    tbody.innerHTML = '';
    
    let insideCount = 0;

    logs.forEach(log => {
        if(log.status === 'Inside') insideCount++;
        
        const row = `
            <tr>
                <td>${log.name}</td>
                <td><span class="status-badge ${log.status === 'Inside' ? 'status-inside' : 'status-exited'}">${log.status}</span></td>
                <td>${new Date(log.entryTime).toLocaleTimeString()}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('total-visitors').innerText = logs.length;
    document.getElementById('current-inside').innerText = insideCount;
}

// Initial Load
refreshLogs();