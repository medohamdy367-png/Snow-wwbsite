// نظام النقاط والتسليف لمملكة SNOW KORAL ❄️

class PointsSystem {
    constructor() {
        this.points = JSON.parse(localStorage.getItem('snowKoralPoints')) || {};
        this.loans = JSON.parse(localStorage.getItem('snowKoralLoans')) || [];
        this.transactions = JSON.parse(localStorage.getItem('snowKoralTransactions')) || [];
    }
    
    // إضافة نقاط لعضو
    addPoints(userId, amount, reason) {
        if (!this.points[userId]) {
            this.points[userId] = 0;
        }
        
        this.points[userId] += amount;
        
        // تسجيل العملية
        this.transactions.push({
            userId,
            type: 'add',
            amount,
            reason,
            date: new Date().toISOString(),
            balance: this.points[userId]
        });
        
        this.save();
        return this.points[userId];
    }
    
    // خصم نقاط من عضو
    deductPoints(userId, amount, reason) {
        if (!this.points[userId] || this.points[userId] < amount) {
            return { success: false, message: 'رصيد غير كافٍ' };
        }
        
        this.points[userId] -= amount;
        
        this.transactions.push({
            userId,
            type: 'deduct',
            amount,
            reason,
            date: new Date().toISOString(),
            balance: this.points[userId]
        });
        
        this.save();
        return { success: true, balance: this.points[userId] };
    }
    
    // طلب تسليف
    requestLoan(userId, amount, reason, returnDate) {
        // التحقق من وجود تسليف سابق غير مسدد
        const existingLoan = this.loans.find(l => l.userId === userId && !l.paid);
        
        if (existingLoan) {
            return { success: false, message: 'لديك تسليف سابق غير مسدد' };
        }
        
        // الحد الأقصى للتسليف 500 نقطة
        if (amount > 500) {
            return { success: false, message: 'الحد الأقصى للتسليف 500 نقطة' };
        }
        
        const loan = {
            id: Date.now(),
            userId,
            amount,
            reason,
            requestDate: new Date().toISOString(),
            returnDate,
            status: 'pending', // pending, approved, rejected, paid
            interest: Math.floor(amount * 0.1), // فائدة 10%
            paid: false
        };
        
        this.loans.push(loan);
        this.save();
        
        return { success: true, loan };
    }
    
    // الموافقة على تسليف (للإدارة فقط)
    approveLoan(loanId) {
        const loan = this.loans.find(l => l.id === loanId);
        
        if (loan) {
            loan.status = 'approved';
            // إضافة النقاط للعضو
            this.addPoints(loan.userId, loan.amount, 'تسليف معتمد');
            this.save();
            return true;
        }
        
        return false;
    }
    
    // سداد التسليف
    payLoan(loanId) {
        const loan = this.loans.find(l => l.id === loanId);
        
        if (!loan || loan.paid) {
            return { success: false, message: 'التسليف غير موجود أو مسدد مسبقاً' };
        }
        
        const totalAmount = loan.amount + loan.interest;
        const userPoints = this.points[loan.userId] || 0;
        
        if (userPoints < totalAmount) {
            return { success: false, message: `تحتاج ${totalAmount} نقطة للسداد` };
        }
        
        // خصم النقاط
        this.points[loan.userId] -= totalAmount;
        loan.paid = true;
        loan.status = 'paid';
        loan.paidDate = new Date().toISOString();
        
        this.save();
        return { success: true, message: 'تم السداد بنجاح' };
    }
    
    // ترتيب المتصدرين
    getLeaderboard(limit = 10) {
        const leaderboard = [];
        
        for (const [userId, points] of Object.entries(this.points)) {
            leaderboard.push({ userId, points });
        }
        
        return leaderboard.sort((a, b) => b.points - a.points).slice(0, limit);
    }
    
    // الحصول على رصيد عضو
    getBalance(userId) {
        return this.points[userId] || 0;
    }
    
    // الحصول على تسليفات عضو
    getUserLoans(userId) {
        return this.loans.filter(l => l.userId === userId);
    }
    
    // الحصول على كل التسليفات النشطة
    getActiveLoans() {
        return this.loans.filter(l => l.status === 'approved' && !l.paid);
    }
    
    // معاقبة المتأخرين عن السداد
    penalizeLateLoans() {
        const now = new Date();
        const activeLoans = this.getActiveLoans();
        
        activeLoans.forEach(loan => {
            const returnDate = new Date(loan.returnDate);
            const daysLate = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
            
            if (daysLate > 0) {
                // غرامة 10 نقاط عن كل يوم تأخير
                const penalty = daysLate * 10;
                this.deductPoints(loan.userId, penalty, `غرامة تأخير تسليف ${daysLate} يوم`);
            }
        });
    }
    
    // حفظ البيانات
    save() {
        localStorage.setItem('snowKoralPoints', JSON.stringify(this.points));
        localStorage.setItem('snowKoralLoans', JSON.stringify(this.loans));
        localStorage.setItem('snowKoralTransactions', JSON.stringify(this.transactions));
    }
    
    // تصدير تقرير
    exportReport() {
        return {
            totalPoints: Object.values(this.points).reduce((a, b) => a + b, 0),
            activeLoans: this.getActiveLoans().length,
            totalLoansAmount: this.getActiveLoans().reduce((a, b) => a + b.amount, 0),
            topUsers: this.getLeaderboard(5)
        };
    }
}

// إنشاء كائن النظام
const pointsSystem = new PointsSystem();
window.pointsSystem = pointsSystem;
