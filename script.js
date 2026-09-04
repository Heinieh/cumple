// --- YouTube Player Audio ---
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'bJ7yyX4Qic4', 
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': 'bJ7yyX4Qic4' // Needed for loop
        },
        events: {
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.ENDED) {
                    player.playVideo();
                }
            }
        }
    });
}

// Botón de Entrar
document.getElementById('enter-btn').addEventListener('click', () => {
    const overlay = document.getElementById('welcome-overlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        
        // Trigger header animation
        document.getElementById('main-header').classList.add('animate-in');
    }, 1000);
    
    // Play music
    if(player && player.playVideo) {
        player.playVideo();
    }
});

// --- Sparkles Effect ---
function createSparkles() {
    const container = document.getElementById('sparkles-container');
    const sparklesCount = 30; // Cantidad de destellos
    
    for (let i = 0; i < sparklesCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        // Posición aleatoria, concentrada en la mitad superior
        sparkle.style.top = Math.random() * 50 + 'vh'; 
        sparkle.style.left = Math.random() * 100 + 'vw';
        
        // Tamaño aleatorio
        const size = Math.random() * 3 + 1;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        
        // Retraso y duración aleatoria
        sparkle.style.animationDelay = Math.random() * 5 + 's';
        sparkle.style.animationDuration = Math.random() * 3 + 2 + 's';
        
        container.appendChild(sparkle);
    }
}
createSparkles();

// --- Countdown Timer ---
// Fecha objetivo: 08 Septiembre 2026, 13:00 hrs
const countdownDate = new Date("Sep 06, 2026 15:00:00").getTime();

const countdownTimer = setInterval(function() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownTimer);
        document.getElementById("countdown").innerHTML = "<h2>¡ES HOY!</h2>";
    }
}, 1000);
// --- Photo Preview ---
document.getElementById('photo').addEventListener('change', function(e) {
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = '';
    const file = e.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
});

// --- Form Submission with Google Drive ---
const form = document.getElementById('rsvp-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('photo');
    const photoUrlInput = document.getElementById('photo-url');
    
    if (fileInput.files.length > 0) {
        submitBtn.innerText = "Subiendo foto...";
        submitBtn.disabled = true;

        const file = fileInput.files[0];
        
        const getBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        try {
            const base64Data = await getBase64(file);
            const params = new URLSearchParams();
            params.append('filename', file.name);
            params.append('mimeType', file.type);
            params.append('data', base64Data);

            // POST a Google Apps Script
            const response = await fetch("https://script.google.com/macros/s/AKfycbyXEhZ2YGRzyQkyU728o2FPbZghw5v0WPkL7Fvzla8RBcJ39CKrstdNXI5CARxexDmSqw/exec", {
                method: 'POST',
                body: params
            });
            const result = await response.json();
            
            if (result.url) {
                photoUrlInput.value = result.url;
            }
        } catch (error) {
            console.error("Error al subir a Drive:", error);
        }
        
        // Vaciamos el input de archivo para que no interfiera
        fileInput.value = '';
    }
    
    submitBtn.innerText = "Enviando confirmación...";
    
    // Enviar a Formspree usando AJAX para evitar salir de la página
    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            form.style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
        } else {
            alert("Hubo un problema al enviar tu confirmación. Por favor intenta de nuevo.");
            submitBtn.innerText = "Confirmar Asistencia";
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error al enviar a Formspree:", error);
        alert("Hubo un problema al enviar tu confirmación. Por favor intenta de nuevo.");
        submitBtn.innerText = "Confirmar Asistencia";
        submitBtn.disabled = false;
    }
});
