/* Interactive Starry Canvas Background */
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.02 + 0.005
        });
    }
}

function animateStars() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";

    stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
            star.speed = -star.speed;
        }
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateStars();

/* Countdown Timer Logic */
const targetDate = new Date("2026-11-06T15:00:00+02:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const difference = Math.max(targetDate - now, 0);

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const elDays = document.getElementById("days");
    if (elDays) {
        elDays.innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* Open the envelope and begin audio only from this user gesture. */
let invitationOpened = false;
const envelopeContainer = document.getElementById('envelopeContainer');

if (envelopeContainer) {
    envelopeContainer.addEventListener('click', () => {
        if (invitationOpened) return;
        invitationOpened = true;

        const openingScreen = document.getElementById('openingScreen');
        const invitationContent = document.getElementById('invitationContent');
        
        envelopeContainer.classList.add('is-open');
        
        // Wait for envelope flap and card animation
        setTimeout(() => {
            invitationContent.classList.remove('is-locked');
            invitationContent.setAttribute('aria-hidden', 'false');
            
            startAudio();
            
            setTimeout(() => {
                openingScreen.classList.add('is-dismissed');
                setTimeout(() => openingScreen.remove(), 650);
            }, 600);
        }, 800);
    });

    // Keyboard support for envelope
    envelopeContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            envelopeContainer.click();
        }
    });
}

/* Modal Handlers */
function openModal(id) {
    closeAllModals();
    document.getElementById('modalBackdrop').classList.remove('hidden');
    document.getElementById(id).classList.remove('hidden');
}

function closeAllModals() {
    document.getElementById('modalBackdrop').classList.add('hidden');
    const modals = ['rsvpModal', 'locationModal', 'musicModal', 'contactModal'];
    modals.forEach(m => {
        const el = document.getElementById(m);
        if (el) el.classList.add('hidden');
    });
}

/* Audio Player Toggle */
let isPlaying = false;
function updateAudioControls(playing, status = '') {
    isPlaying = playing;
    const icon = document.getElementById('playBtnIcon');
    const text = document.getElementById('playBtnText');
    const badge = document.getElementById('musicBadge');
    const stat = document.getElementById('musicStatus');
    
    if (icon) icon.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
    if (text) text.innerText = playing ? "Pause Music" : "Play Music";
    if (badge) badge.classList.toggle('hidden', !playing);
    if (stat) stat.innerText = status;
}

function startAudio() {
    const audio = document.getElementById('bgAudio');
    if (audio) {
        audio.play().then(() => {
            updateAudioControls(true);
        }).catch(() => {
            updateAudioControls(false, 'Music could not be started. Use Play Music to try again.');
        });
    }
}

function toggleAudio() {
    const audio = document.getElementById('bgAudio');
    if (audio) {
        if (!audio.paused) {
            audio.pause();
            updateAudioControls(false);
        } else {
            startAudio();
        }
    }
}

/* RSVP Form Submission */
async function handleRSVPSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('rsvpSubmitBtn');
    const btnText = document.getElementById('rsvpBtnText');
    const btnIcon = document.getElementById('rsvpBtnIcon');
    const loader = document.getElementById('rsvpLoader');
    const resultDiv = document.getElementById('rsvpResult');
    
    // UI state during submission
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    btnText.innerText = 'Sending RSVP...';
    btnIcon.classList.add('hidden');
    loader.style.display = 'block';
    resultDiv.innerHTML = '';
    resultDiv.className = 'mt-3 text-sm text-center';
    
    const guestData = {
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        attendance: document.getElementById('attendanceStatus').value,
        companions: parseInt(document.getElementById('guestCount').value) || 0,
        message: document.getElementById('guestWish').value.trim()
    };
    
    try {
        const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guestData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success state
            form.reset();
            form.style.display = 'none'; // hide form
            resultDiv.innerHTML = `
                <div class="text-gold-300 font-serif text-lg mb-2">Thank You ❤️</div>
                <p class="text-slate-300">Your RSVP has been received successfully.</p>
                <p class="text-slate-400 text-xs mt-1">We can't wait to celebrate with you.</p>
            `;
            // Fetch messages again to update the list immediately
            fetchLatestMessages();
        } else {
            throw new Error(data.error || 'Something went wrong');
        }
    } catch (error) {
        // Error state
        resultDiv.classList.add('text-red-400');
        resultDiv.innerText = 'Something went wrong. Please try again in a moment.';
        
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        btnText.innerText = 'Send RSVP';
        btnIcon.classList.remove('hidden');
        loader.style.display = 'none';
    }
}

/* Save to Calendar (.ics format) */
function saveToCalendar() {
    const title = "Wedding of Ahmed & Sherouk";
    const location = "White Plaza, Ramag Hotel, El-Mushir Tantawy Axis, 5th Settlement, New Cairo";
    const details = "Wedding celebration: 3:00–6:00 PM. Katb ElKetab: 3:30 PM. Capacity is limited to 200 guests; RSVP does not reserve a seat. Google Maps: https://share.google/FNLdm4Xul2ibjzvrU";
    const startDate = "20261106T130000Z";
    const endDate = "20261106T160000Z";
    const escapeIcsText = value => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ahmed and Sherouk//Wedding Invitation//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:ahmed-sherouk-wedding-20261106@wedding-invitation
DTSTAMP:${timestamp}
SUMMARY:${escapeIcsText(title)}
LOCATION:${escapeIcsText(location)}
DESCRIPTION:${escapeIcsText(details)}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'ahmed_sherouk_wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

/* Fetch Latest Guest Messages */
async function fetchLatestMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    try {
        const response = await fetch('/api/messages');
        if (response.ok) {
            const messages = await response.json();
            
            if (messages.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center italic">Be the first to leave a message!</p>';
                return;
            }
            
            container.innerHTML = messages.map(msg => `
                <div class="message-card">
                    <p class="text-sm text-slate-200 italic mb-2">"${escapeHtml(msg.message)}"</p>
                    <div class="text-xs text-gold-400 text-right">— ${escapeHtml(msg.name)}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Helper to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    return (unsafe || "").replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Fetch messages on load and setup polling
document.addEventListener('DOMContentLoaded', () => {
    fetchLatestMessages();
    // Poll for new messages every 30 seconds
    setInterval(fetchLatestMessages, 30000);
});
