// نظام تسجيل الدخول والتسجيل الكامل لمملكة SNOW KORAL ❄️

// قاعدة بيانات المستخدمين (مؤقتة - في localStorage)
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('snowKoralUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('snowKoralCurrentUser')) || null;
        
        // بيانات النقابة
        this.ranks = {
            imperial: ['الامبراطور ⛓️', 'نائب الامبراطور ⛄', 'المستشار 🌹', 'اللورد 🌷', 'نائب اللورد ⚡'],
            royal: ['الملك 🔱', 'نائب الملك ⚜️'],
            ministerial: ['الوزير 🔦', 'نائب الوزير ⏱️'],
            admin: ['جنرال ⚙️', 'نائب جنرال 🧭', 'عميد 🕯', 'تشيبوكاي 🧮', 'ملازم ⚔️', 'حامل بريق ✨', 'حامل راية 🎀', 'متدرب 🧸'],
            weekly: ['ملك التفاعل 🔥', 'ملك الفعاليات 🌨️', 'ملك السوالف ☕', 'العضو الذهبي 🍷', 'المشرف الذهبي 🫧', 'ملك النشر 🌙', 'المشرف المتخاذل 💢']
        };
    }

    // تسجيل مستخدم جديد
    register(username, password, email, phone) {
        // التحقق من وجود المستخدم
        if (this.users.find(u => u.username === username)) {
            return { success: false, message: 'اسم المستخدم موجود بالفعل' };
        }

        const newUser = {
            id: Date.now(),
            username,
            password, // في التطبيق الحقيقي هنعمل hash
            email,
            phone,
            rank: 'متدرب 🧸', // الرتبة الابتدائية
            joinDate: new Date().toISOString(),
            isAdmin: false,
            profile: {
                avatar: '❄️',
                bio: 'عضو جديد في مملكة الثلج',
                favoriteAnime: [],
                points: 0
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return { success: true, message: 'تم التسجيل بنجاح', user: newUser };
    }

    // تسجيل الدخول
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('snowKoralCurrentUser', JSON.stringify(user));
            return { success: true, message: 'مرحباً بك في المملكة ❄️', user };
        }
        
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        localStorage.removeItem('snowKoralCurrentUser');
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // التحقق من صلاحيات الأدمن
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    // الحصول على جميع الأعضاء
    getAllMembers() {
        return this.users.map(u => ({
            id: u.id,
            username: u.username,
            rank: u.rank,
            avatar: u.profile.avatar,
            joinDate: u.joinDate,
            points: u.profile.points
        }));
    }

    // تحديث رتبة عضو
    updateMemberRank(userId, newRank) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.rank = newRank;
            this.saveUsers();
            return true;
        }
        return false;
    }

    // حذف عضو
    deleteMember(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        this.saveUsers();
    }

    // حفظ البيانات
    saveUsers() {
        localStorage.setItem('snowKoralUsers', JSON.stringify(this.users));
    }

    // إحصائيات النقابة
    getStats() {
        return {
            totalMembers: this.users.length,
            totalRanks: Object.values(this.ranks).flat().length,
            activeToday: Math.floor(Math.random() * 30) + 20, // وهمي حالياً
            newMembers: this.users.filter(u => {
                const joinDate = new Date(u.joinDate);
                const now = new Date();
                const diffDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
            }).length
        };
    }
}

// إنشاء كائن النظام
const authSystem = new AuthSystem();

// تصدير للاستخدام
window.authSystem = authSystem;
