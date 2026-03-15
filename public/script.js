document.addEventListener("DOMContentLoaded", () => {

// ============================
// Initialize Scanner
// ============================
const html5QrCode = new Html5Qrcode("reader");

// Start scanner
function startScanner() {

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
    ).catch(err => console.log("Scanner start error:", err));
}

// ============================
// Scan Success
// ============================
function onScanSuccess(decodedText) {

    html5QrCode.stop()
    .then(() => handleScanResult(decodedText))
    .catch(err => console.log("Scanner stop error:", err));

}

// ============================
// Scan Failure
// ============================
function onScanFailure(error) {
    // ignored
}

// ============================
// Handle Scan
// ============================
async function handleScanResult(qrCodeId) {

    const resultBox = document.getElementById('scan-result');
    const statusMsg = document.getElementById('status-msg');
    const timeMsg = document.getElementById('time-msg');

    resultBox.classList.remove('hidden');
    statusMsg.innerText = "Processing...";
    timeMsg.innerText = "";

    try {

        const response = await fetch('/api/scan', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ qrCodeId })
        });

        const data = await response.json();

        if(data.success){

            statusMsg.innerText = data.message;
            statusMsg.style.color = "green";

            timeMsg.innerText = "Time: " + data.time;

            refreshLogs();

        }else{

            statusMsg.innerText = data.message;
            statusMsg.style.color = "red";

        }

    }catch(err){

        statusMsg.innerText = "Server Error";
        statusMsg.style.color = "red";

    }

    setTimeout(startScanner,1500);

}

// ============================
// Generate QR Card
// ============================
window.generateCard = async function(){

    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;

    if(!name || !email){
        alert("Please fill all fields");
        return;
    }

    const response = await fetch('/api/generate-card',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name,email})
    });

    const data = await response.json();

    if(data.success){

        document.getElementById('qr-image').src = data.qrCode;
        document.getElementById('generated-card').classList.remove('hidden');

    }

}

// ============================
// Refresh Logs
// ============================
async function refreshLogs(){

    const response = await fetch('/api/logs');
    const logs = await response.json();

    const tbody = document.getElementById('log-table-body');
    tbody.innerHTML = "";

    let insideCount = 0;

    logs.forEach(log => {

        if(log.status === "Inside") insideCount++;

        const row = `
        <tr>
        <td>${log.name}</td>
        <td>${log.status}</td>
        <td>${log.entryTime ? new Date(log.entryTime).toLocaleTimeString() : "-"}</td>
        </tr>
        `;

        tbody.innerHTML += row;

    });

    document.getElementById("total-visitors").innerText = logs.length;
    document.getElementById("current-inside").innerText = insideCount;

}

// Initial Load
refreshLogs();
startScanner();

});