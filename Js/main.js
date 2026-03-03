// الملف الرئيسي لمملكة SNOW KORAL ❄️
// يحتوي على الوظائف العامة المستخدمة في جميع الصفحات

// ==================== الإعدادات العامة ====================
const SITE_CONFIG = {
    name: 'SNOW KORAL',
    version: '2.0.0',
    founded: '2024',
    adminPhone: '01204479735',
    whatsappLink: 'https://chat.whatsapp.com/LqEuzfepPhu6JGaZx8Ab9u',
    colors: {
        primary: '#4aa3ff',
        secondary: '#a8e6ff',
        dark: '#0a1f2e'
    }
};

// ==================== نظام الإشعارات ====================
class NotificationSystem {
    constructor() {
        this.notifications = [];
    }
    
    // عرض إشعار للمستخدم
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getIcon(type)}</div>
            <div class="notification-message">${message}</div>
            <div class="notification-close" onclick="this.parentElement.remove()">✕</div>
        `;
        
        // إضافة التنسيقات
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#00cc66' : type === 'error' ? '#ff4444' : type === 'warning' ? '#ffaa00' : '#4aa3ff'};
            color: ${type === 'warning' ? '#0a1f2e' : 'white'};
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 9999;
            animation: slideDown 0.3s ease;
            direction: rtl;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة بعد المدة المحددة
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || '📢';
    }
    
    // إشعار ترحيبي
    welcome(userName) {
        this.show(`❄️ مرحباً ${userName} في مملكة SNOW KORAL`, 'success', 5000);
    }
    
    // إشعار فعالية
    event(eventName, time) {
        this.show(`🎮 فعالية جديدة: ${eventName} الساعة ${time}`, 'info', 0); // 0 يعني لا يختفي تلقائياً
    }
}

// ==================== نظام العد التنازلي ====================
class CountdownTimer {
    constructor(targetDate, elementId) {
        this.targetDate = new Date(targetDate).getTime();
        this.element = document.getElementById(elementId);
        this.interval = null;
    }
    
    start() {
        this.interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = this.targetDate - now;
            
            if (distance < 0) {
                clearInterval(this.interval);
                this.element.innerHTML = "✨ الفعالية بدأت الآن!";
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            this.element.innerHTML = `
                <div class="countdown-item">${days} يوم</div>
                <div class="countdown-item">${hours} ساعة</div>
                <div class="countdown-item">${minutes} دقيقة</div>
                <div class="countdown-item">${seconds} ثانية</div>
            `;
        }, 1000);
    }
    
    stop() {
        clearInterval(this.interval);
    }
}

// ==================== نظام النسخ الاحتياطي ====================
class BackupSystem {
    // تصدير البيانات
    static exportData() {
        const data = {
            users: localStorage.getItem('snowKoralUsers') || '[]',
            points: localStorage.getItem('snowKoralPoints') || '{}',
            loans: localStorage.getItem('snowKoralLoans') || '[]',
            events: localStorage.getItem('snowKoralEvents') || '[]',
            exportDate: new Date().toISOString(),
            version: SITE_CONFIG.version
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snow-koral-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
    
    // استيراد البيانات
    static importData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                localStorage.setItem('snowKoralUsers', data.users);
                localStorage.setItem('snowKoralPoints', data.points);
                localStorage.setItem('snowKoralLoans', data.loans);
                localStorage.setItem('snowKoralEvents', data.events);
                
                alert('✅ تم استعادة البيانات بنجاح');
                location.reload();
            } catch (error) {
                alert('❌ خطأ في ملف الاستيراد');
            }
        };
        reader.readAsText(file);
    }
}

// ==================== دوال مساعدة ====================

// تنسيق التاريخ
function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = format === 'short' 
        ? { year: 'numeric', month: 'numeric', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    
    return d.toLocaleDateString('ar-EG', options);
}

// نسخ النص
function copyToClipboard(text, message = 'تم النسخ') {
    navigator.clipboard.writeText(text).then(() => {
        notifications.show(message, 'success', 2000);
    }).catch(() => {
        notifications.show('❌ فشل النسخ', 'error');
    });
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من صحة رقم الهاتف المصري
function isValidEgyptianPhone(phone) {
    const re = /^01[0125][0-9]{8}$/;
    return re.test(phone);
}

// إنشاء معرف فريد
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// ==================== تأثيرات بصرية ====================

// تأثير الثلج المتساقط (مطور)
class SnowEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }
    
    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // إنشاء حبيبات الثلج
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            p.y += p.speed;
            
            if (p.y > this.canvas.height) {
                p.y = 0;
                p.x = Math.random() * this.canvas.width;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ==================== التهيئة عند تحميل الصفحة ====================
document.addEventListener('DOMContentLoaded', function() {
    // تفعيل تأثير الثلج في الصفحة الرئيسية فقط
    if (window.location.pathname.includes('index') || window.location.pathname === '/') {
        new SnowEffect();
    }
    
    // تحديث رابط الواتساب في كل الصفحات
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
        btn.href = SITE_CONFIG.whatsappLink;
    });
    
    // إضافة أرقام التواصل
    document.querySelectorAll('.contact-phone').forEach(el => {
        el.textContent = SITE_CONFIG.adminPhone;
    });
    
    // تفعيل التلميحات
    initializeTooltips();
});

// ==================== أدوات إضافية ====================

// نظام التلميحات
function initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #0a1f2e;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                border: 1px solid #4aa3ff;
                font-size: 0.9rem;
                z-index: 10000;
                pointer-events: none;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            
            this.addEventListener('mouseleave', function() {
                tooltip.remove();
            });
        });
    });
}

// تصدير للاستخدام العام
window.notifications = new NotificationSystem();
window.SITE_CONFIG = SITE_CONFIG;
window.formatDate = formatDate;
window.copyToClipboard = copyToClipboard;
window.isValidEmail = isValidEmail;
window.isValidEgyptianPhone = isValidEgyptianPhone;
window.generateId = generateId;
window.BackupSystem = BackupSystem;
window.CountdownTimer = CountdownTimer;
