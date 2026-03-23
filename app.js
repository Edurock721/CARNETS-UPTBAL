document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const inputs = {
        nombres: document.getElementById('nombres'),
        apellidos: document.getElementById('apellidos'),
        fechaNac: document.getElementById('fecha-nac'),
        rol: document.getElementById('rol'),
        encabezadoFront: document.getElementById('encabezado-front'),
        infoBack: document.getElementById('info-back'),
        contactoEmergencia: document.getElementById('contacto-emergencia'),
        alergico: document.getElementById('alergico'),
        cedula: document.getElementById('cedula'),
        jerarquia: document.getElementById('jerarquia')
    };

    const previews = {
        nombres: document.getElementById('preview-nombres'),
        apellidos: document.getElementById('preview-apellidos'),
        fechaNac: document.getElementById('preview-fecha'),
        rol: document.getElementById('preview-rol'),
        encabezadoFront: document.getElementById('preview-encabezado'),
        infoBack: document.getElementById('preview-info-back'),
        foto: document.getElementById('preview-foto'),
        logo: document.getElementById('preview-logo'),
        firma: document.getElementById('preview-firma'),
        cedula: document.getElementById('preview-cedula'),
        jerarquia: document.getElementById('preview-jerarquia')
    };

    // --- 1. Real-time Text Binding ---
    function updatePreviews() {
        previews.nombres.textContent = inputs.nombres.value || 'Nombres';
        previews.apellidos.textContent = inputs.apellidos.value || 'Apellidos';
        
        // Format Date
        let dateVal = inputs.fechaNac.value;
        if(dateVal){
            const [y, m, d] = dateVal.split('-');
            previews.fechaNac.textContent = `${d}/${m}/${y}`;
        } else {
            previews.fechaNac.textContent = '-';
        }

        previews.rol.textContent = inputs.rol.value || 'Estudiante';
        previews.cedula.textContent = inputs.cedula.value || '-';
        previews.jerarquia.textContent = inputs.jerarquia.value || 'N/A';
        previews.encabezadoFront.textContent = inputs.encabezadoFront.value || 'REPUBLICA BOLIVARIANA DE VENEZUELA';
        previews.infoBack.textContent = inputs.infoBack.value || 'Este carnet es personal e intransferible. Identifica al portador como miembro activo de la institución. En caso de emergencia favor contactarse al número escaneable en el código QR.';
        
        generateQR();
    }

    Object.values(inputs).forEach(input => {
        input.addEventListener('input', updatePreviews);
    });

    // --- 2. QR Code Generator ---
    let qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "Sin datos",
        width: 64,
        height: 64,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });

    function generateQR() {
        const contact = inputs.contactoEmergencia.value || 'N/A';
        const allergy = inputs.alergico.value || 'N/A';
        const name = inputs.nombres.value + " " + inputs.apellidos.value;
        const qrData = `Nombre: ${name}\nEmergencia: ${contact}\nAlergias: ${allergy}`;
        
        qrcode.clear(); 
        qrcode.makeCode(qrData);
    }
    generateQR(); // Init Default

    // --- 3. Image Uploads (Logo & User Photo) ---
    function handleImageUpload(inputEl, previewEl) {
        inputEl.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewEl.src = e.target.result;
                    previewEl.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    handleImageUpload(document.getElementById('foto-upload'), previews.foto);
    handleImageUpload(document.getElementById('logo-upload'), previews.logo);
    handleImageUpload(document.getElementById('firma-upload'), previews.firma);

    // --- 4. Camera Implementation ---
    const btnCamara = document.getElementById('btn-camara');
    const cameraModal = document.getElementById('camera-modal');
    const closeCameraBtn = document.getElementById('close-camera');
    const captureBtn = document.getElementById('capture-btn');
    const videoStream = document.getElementById('video-stream');
    let stream = null;

    btnCamara.addEventListener('click', async () => {
        cameraModal.style.display = 'flex';
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            videoStream.srcObject = stream;
        } catch (err) {
            alert("No se pudo acceder a la cámara. Asegúrate de dar los permisos correspondientes.");
            cameraModal.style.display = 'none';
        }
    });

    function closeCamera() {
        cameraModal.style.display = 'none';
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    closeCameraBtn.addEventListener('click', closeCamera);

    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoStream.videoWidth;
        canvas.height = videoStream.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
        
        previews.foto.src = canvas.toDataURL('image/png');
        closeCamera();
    });

    // --- 5. Signature Canvas Impl ---
    const canvasSig = document.getElementById('signature-pad');
    const ctxSig = canvasSig.getContext('2d');
    let isDrawing = false;
    let lastX = 0; let lastY = 0;

    // Set line styles
    ctxSig.strokeStyle = '#000000';
    ctxSig.lineWidth = 2;
    ctxSig.lineJoin = 'round';
    ctxSig.lineCap = 'round';

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); // prevent scrolling on touch
        
        // Get correct coords for mouse or touch
        const rect = canvasSig.getBoundingClientRect();
        let clientX = e.clientX || e.touches[0].clientX;
        let clientY = e.clientY || e.touches[0].clientY;
        
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        ctxSig.beginPath();
        ctxSig.moveTo(lastX, lastY);
        ctxSig.lineTo(currentX, currentY);
        ctxSig.stroke();

        lastX = currentX;
        lastY = currentY;
    }

    // Mouse Events
    canvasSig.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvasSig.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    });
    canvasSig.addEventListener('mousemove', draw);
    canvasSig.addEventListener('mouseup', () => isDrawing = false);
    canvasSig.addEventListener('mouseout', () => isDrawing = false);

    // Touch Events
    canvasSig.addEventListener('touchstart', (e) => {
        if(e.target === canvasSig) e.preventDefault();
        isDrawing = true;
        const rect = canvasSig.getBoundingClientRect();
        lastX = e.touches[0].clientX - rect.left;
        lastY = e.touches[0].clientY - rect.top;
    });
    canvasSig.addEventListener('touchmove', draw);
    canvasSig.addEventListener('touchend', () => isDrawing = false);
    canvasSig.addEventListener('touchcancel', () => isDrawing = false);

    document.getElementById('clear-sig').addEventListener('click', () => {
        ctxSig.clearRect(0, 0, canvasSig.width, canvasSig.height);
        previews.firma.style.display = 'none';
        previews.firma.src = '';
    });

    document.getElementById('save-sig').addEventListener('click', () => {
        const dataURL = canvasSig.toDataURL('image/png');
        previews.firma.src = dataURL;
        previews.firma.style.display = 'block';
        alert("Firma aplicada al carnet.");
    });

    // --- 6. Tabs Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            // Add active
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
        });
    });

    // --- 7. Export / Download Carnet ---
    const exportBtn = document.getElementById('export-btn');
    
    exportBtn.addEventListener('click', async () => {
        exportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';
        exportBtn.disabled = true;

        try {
            // We capture Front and Back cards
            const cardFront = document.getElementById('card-front');
            const cardBack = document.getElementById('card-back');

            // Render Front
            const canvasFront = await html2canvas(cardFront, { 
                scale: 3, // High quality 
                useCORS: true,
                backgroundColor: null
            });
            
            // Render Back
            const canvasBack = await html2canvas(cardBack, { 
                scale: 3,
                useCORS: true,
                backgroundColor: null
            });

            // Create a Combined Canvas (Side by Side or Top/Bottom)
            const padding = 40;
            const combined = document.createElement('canvas');
            combined.width = (canvasFront.width * 2) + (padding * 3);
            combined.height = canvasFront.height + (padding * 2);
            const ctxComb = combined.getContext('2d');
            
            // White Background for final image
            ctxComb.fillStyle = '#FFFFFF';
            ctxComb.fillRect(0, 0, combined.width, combined.height);

            // Draw Front
            ctxComb.drawImage(canvasFront, padding, padding);
            // Draw Back
            ctxComb.drawImage(canvasBack, canvasFront.width + (padding*2), padding);

            // Trigger Download
            const link = document.createElement('a');
            link.download = `Carnet_UPTBAL_${inputs.nombres.value || 'Nuevo'}.png`;
            link.href = combined.toDataURL('image/png', 1.0);
            link.click();

        } catch (error) {
            console.error("Error generating image:", error);
            alert("Hubo un error al generar el carnet. Intente nuevamente.");
        } finally {
            exportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Exportar Carnet';
            exportBtn.disabled = false;
        }
    });

});
