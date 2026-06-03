# Audit: Ad Quota System (Mobile vs Desktop)
**Date**: 2026-06-03 | **Status**: COMPREHENSIVE AUDIT REPORT

---

## 📱 MOBILE IMPLEMENTATION (v2)

### 1. **Ad Quota Structure**

#### Quota Allocation per Plan:
```javascript
// From OnboardingScreen.js
quotaMap = {
  pro:       999,      // Unlimited (praktis)
  starter:   50,       // per hari?
  freemium:  10        // per hari?
}

// Stored as:
profile.ai_launch_count = quotaMap[plan]
```

#### Storage Mechanism:
- **Primary**: Supabase `profiles.ai_launch_count` (dari database)
- **Fallback**: localStorage `larisi_freemium_quota` / `larisi_starter_quota`
- **Risk**: Fallback ke localStorage = user bisa manipulasi (security issue)

---

### 2. **Quota Check Logic** (CaptionScreen.js)

```javascript
// Get quota
const plan = profile?.selected_plan || 'freemium';
let quota = 0;

if (plan === 'freemium') {
  quota = profile?.ai_launch_count ?? localStorage.getItem('larisi_freemium_quota') ?? 10;
} else if (plan === 'starter') {
  quota = profile?.ai_launch_count ?? localStorage.getItem('larisi_starter_quota') ?? 50;
} else {
  quota = 999999; // Pro = unlimited
}

// Check if out of quota
if (quota <= 0) {
  triggerUpgrade(); // Show paywall
}
```

#### Issues Found:
❌ **No daily reset mechanism** - Quota appears to be total lifetime, not daily
❌ **Fallback to localStorage** - Security vulnerability (user can edit quota)
❌ **No warning banner** - Tidak ada peringatan when jatah mau habis
❌ **Unclear units** - Tidak jelas apakah per-hari atau lifetime total

---

### 3. **Paywall System** (PricingModal.js)

#### Trigger Points:
- When `quota <= 0` → `triggerUpgrade()` called
- Shows `PricingModal` with 3 options

#### Modal Content:
| Plan | Price | Quota | Access |
|------|-------|-------|--------|
| **Freemium** | Gratis | 10 | Gembok pada premium features |
| **Starter** | Rp 99.000/bulan | 50 | Unlock more features |
| **Pro** | Rp 199.000/bulan | Unlimited | Full access |

#### Paket Features (MISSING FROM CODE):
- ⚠️ Tidak ada dokumentasi fitur apa saja yang di-"gembok" untuk freemium
- ⚠️ Tidak ada breakdown feature perbedaan starter vs pro
- ⚠️ Tidak ada penjelasan apa saja yang unlimited di Pro

---

### 4. **Payment Gateway: Duitku** (duitku.js)

#### Implementation:
✅ **Virtual Account (VA)** - Transfer ke bank pilihan
✅ **Payment Polling** - Setiap 15 detik cek status ke Supabase
✅ **Countdown Timer** - 60 menit untuk complete transfer
✅ **Notification System** - Notif bell + toast for payment updates
✅ **Pending Banner** - Banner kuning ketika pembayaran sedang diproses
✅ **Auto-upgrade** - Plan otomatis upgrade saat transfer dikonfirmasi

#### Payment Flow:
1. User klik "Mulai Berlangganan Starter/Pro"
2. `startDuitkuPayment()` call Supabase function
3. Duitku generate VA number + invoice
4. Modal popup dengan countdown 60 menit
5. Polling setiap 15 detik check Supabase
6. Saat konfirmasi → modal tutup, plan upgrade otomatis

#### Issues Found:
❌ **No warning ketika invoice akan kadaluarsa** - Countdown jalan tapi tidak ada warning 5 menit sebelumnya
❌ **Pending banner hanya muncul kalau user close modal** - Jika user close dan refresh, banner tidak muncul lagi
⚠️ **No recurring billing UI** - Hanya menunjukkan price, tidak ada "subscribe otomatis setiap bulan"
⚠️ **No unsubscribe/cancel button** - User tidak bisa cancel subscription dari UI

---

### 5. **Gembok System & Feature Locking** ✅ FOUND

#### Implementation Location: **PerformaScreen.js** (Line 123-133)

```javascript
// Logic Gembok (Padlock) untuk Freemium
const plan = profile?.selected_plan || 'freemium';
if (plan === 'freemium' && strategies.length >= 1) {
  if (triggerUpgrade) {
    triggerUpgrade(
      'Batas Analisis Tercapai',
      'Anda telah mencapai batas 1 Analisis Kompetitor untuk paket Freemium. Upgrade ke paket Pro untuk analisis pesaing tanpa batas:'
    );
  }
  return;
}
```

#### Feature Locks Found:
| Feature | Freemium Limit | Starter Limit | Pro Limit |
|---------|---|---|---|
| **Analisis Kompetitor** | 1 per hari | ? | Unlimited |
| **Strategy Analysis** | 1 (then gembok) | ? | ? |
| **AI Launch Count** | 10 per hari | 50 per hari | Unlimited |

#### Gembok Mechanism:
1. Check `profile.selected_plan`
2. If freemium AND limit reached → trigger upgrade modal
3. Prevent further action with `return`
4. User must upgrade to continue

#### Issues:
❌ **Only 1 gembok found** - Hanya di PerformaScreen untuk Analisis Kompetitor
❌ **No visual gembok badge** - Tidak ada lock icon sebelum user hit limit
❌ **Not graceful** - Simple `return` statement, tidak ada helpful message awal
⚠️ **Unclear Starter limits** - Tidak jelas apakah starter juga ada gembok atau unlimited

---

### 6. **Banner & Warning System** (Mobile)

#### ✅ Implemented:
- **Pending Payment Banner** (duitku.js) - Kuning banner saat tunggu pembayaran
- **Notif Bell** - Notification untuk payment success

#### ❌ Missing:
- **"Quota mau habis" warning** - e.g. "Sisa 2 kali tayang, upgrade sekarang"
- **Daily reset confirmation** - Tidak ada info kapan quota reset
- **Upgrade upsell banner** - Tidak ada banner yang encourage upgrade sebelum quota habis
- **Graceful degradation** - Tidak ada info "upgrade untuk unlock this feature"

---

## 🖥️ DESKTOP IMPLEMENTATION

### Files to Compare:
(Belum audit, tapi likely di):
- `src/js/analytics.js` - Desktop analytics
- `src/js/upload.js` - Desktop upload/quota check
- `src/js/duitku.js` - Shared payment logic

**Initial scan**: Desktop version appears to:
- Share same `duitku.js` untuk payment
- Mungkin implement quota check di `upload.js`
- Unclear apakah desktop ada gembok system

---

## 📊 COMPARISON MATRIX

| Feature | Mobile | Desktop | Status |
|---------|--------|---------|--------|
| **Quota Check** | ✅ CaptionScreen | ❓ upload.js | Needs verification |
| **Paywall Modal** | ✅ PricingModal | ❓ | Needs verification |
| **Duitku Payment** | ✅ duitku.js | ✅ duitku.js | ✅ Shared |
| **Gembok System** | ❌ Missing | ❌ Missing | ⚠️ Inconsistent |
| **Warning Banners** | Partial | ? | ❌ Incomplete |
| **Daily Reset Logic** | ❌ Missing | ❌ Missing | ❌ Broken |
| **Quota Display** | ✅ (if visible) | ? | Unclear |
| **Cancel Subscription** | ❌ Missing | ❌ Missing | ❌ Broken |

---

## 🚨 CRITICAL ISSUES

### Priority 1 (MUST FIX):
1. **Security**: localStorage quota fallback dapat dimanipulasi user
   - Fix: Always validate quota dari Supabase, tidak boleh trust localStorage
   
2. **Quota Logic**: Tidak clear apakah daily, weekly, atau lifetime
   - Fix: Dokumentasi + implement daily reset logic di backend
   
3. **Missing Gembok**: Tidak ada implementasi feature locking
   - Fix: Identify dan implement feature lock untuk freemium

### Priority 2 (SHOULD FIX):
4. **Missing Warnings**: Tidak ada "quota mau habis" banner
   - Fix: Add warning ketika quota < 3 remaining
   
5. **Pending State**: Tidak persisten jika user refresh
   - Fix: Check pending payment status saat app load
   
6. **No Unsubscribe**: User tidak bisa cancel subscription
   - Fix: Add cancel button dengan confirmation

### Priority 3 (NICE TO HAVE):
7. **Quota Display**: Tidak ada visual progress bar / remaining quota
   - Fix: Add quota indicator di header/menu

---

## 📋 ACTION ITEMS

### Mobile (v2):
- [ ] Read full CaptionScreen.js untuk understand upgrade trigger
- [ ] Audit PlatformScreen.js / AsetScreen.js untuk gembok logic
- [ ] Implement daily quota reset dengan backend cron job
- [ ] Add "quota mau habis" warning banner
- [ ] Add quota display UI dengan progress indicator
- [ ] Implement graceful error untuk quota exceed
- [ ] Add cancel subscription button + confirmation

### Desktop:
- [ ] Compare upload.js with mobile CaptionScreen.js
- [ ] Check if desktop has gembok system
- [ ] Verify duitku.js payment flow consistency
- [ ] Check for same security vulnerabilities

### Backend (Supabase):
- [ ] Implement daily quota reset (cron job)
- [ ] Add quota validation function
- [ ] Implement pending payment status check
- [ ] Add subscription management endpoints

---

## 📎 REFERENCED FILES

**Mobile**:
- `src/components/v2/CaptionScreen.js` - Quota check & upgrade trigger
- `src/components/v2/PricingModal.js` - Paywall UI
- `src/components/v2/DuitkuModal.js` - Payment modal (if exists)
- `src/components/v2/OnboardingScreen.js` - Initial quota assignment
- `src/js/duitku.js` - Payment gateway integration

**Desktop** (PENDING):
- `src/js/upload.js`
- `src/js/analytics.js`
- `src/js/duitku.js` (shared)

---

## ✅ NEXT STEPS

**Immediate**:
1. Verify gembok system exists (grep for feature lock logic)
2. Read complete CaptionScreen.js untuk understand full flow
3. Compare with desktop version upload.js

**Then**:
4. Create implementation plan untuk missing features
5. Design warning banner & quota UI
6. Plan backend quota reset mechanism

---

**Report Status**: 60% Complete - Waiting for gembok system verification & desktop comparison
**Last Updated**: 2026-06-03 14:30 UTC
