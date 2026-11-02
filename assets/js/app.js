// 스마트엣지 고객지원 공용 스크립트 (Firebase 초기화와 공용 도우미)
import { firebaseConfig, ADMIN_EMAILS, RETENTION_YEARS } from "./firebase-config.js";

const V = "10.12.2";
const base = `https://www.gstatic.com/firebasejs/${V}`;

export const ready = !!firebaseConfig.apiKey;
export { ADMIN_EMAILS, RETENTION_YEARS };

let fbPromise = null;
export function getFirebase() {
  if (!ready) return Promise.resolve(null);
  if (!fbPromise) fbPromise = init();   // 여러 곳에서 동시에 불러도 한 번만 초기화
  return fbPromise;
}
async function init() {
  const [appM, authM, fsM, stM] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`),
    import(`${base}/firebase-storage.js`)
  ]);
  const app = appM.initializeApp(firebaseConfig);
  const auth = authM.getAuth(app);
  const db = fsM.getFirestore(app);
  const storage = stM.getStorage(app);
  return { app, auth, db, storage, A: authM, F: fsM, S: stM };
}

// 로그인 상태가 확정될 때 한 번(그리고 바뀔 때마다) 호출
export async function onUser(cb) {
  const f = await getFirebase();
  if (!f) { cb(null, null); return; }
  f.A.onAuthStateChanged(f.auth, async (user) => {
    let member = null;
    if (user) {
      try {
        const snap = await f.F.getDoc(f.F.doc(f.db, "members", user.uid));
        if (snap.exists()) member = snap.data();
      } catch (e) { /* 권한 없음 등 */ }
    }
    cb(user, member);
  });
}

export function isAdmin(user) {
  return !!user && user.emailVerified !== false && ADMIN_EMAILS.includes((user.email || "").toLowerCase());
}

export function memberValid(member) {
  if (!member || !member.expireAt) return false;
  return toDate(member.expireAt) > new Date();
}

export function toDate(v) {
  if (!v) return null;
  if (v.toDate) return v.toDate();
  return new Date(v);
}

export function fmtDate(v, withTime) {
  const d = toDate(v);
  if (!d) return "-";
  const p = (n) => String(n).padStart(2, "0");
  let s = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  if (withTime) s += ` ${p(d.getHours())}:${p(d.getMinutes())}`;
  return s;
}

export function addYears(d, n) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function showMsg(el, text, kind = "info") {
  if (!el) return;
  el.className = `msg show ${kind}`;
  el.textContent = text;
}
export function hideMsg(el) { if (el) el.className = "msg"; }

// Firebase 오류 코드를 쉬운 한국어로
export function koError(e) {
  const c = (e && e.code) || "";
  const map = {
    "auth/email-already-in-use": "이미 가입된 이메일입니다. 로그인해 주세요.",
    "auth/invalid-email": "이메일 주소 형식을 확인해 주세요.",
    "auth/weak-password": "비밀번호는 6자 이상으로 정해 주세요.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않습니다.",
    "auth/wrong-password": "이메일 또는 비밀번호가 맞지 않습니다.",
    "auth/user-not-found": "가입되지 않은 이메일입니다.",
    "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 해 주세요.",
    "auth/requires-recent-login": "보안을 위해 다시 로그인한 뒤 시도해 주세요.",
    "auth/popup-closed-by-user": "로그인 창이 닫혔습니다.",
    "permission-denied": "권한이 없습니다. 로그인 상태나 회원 보유기간을 확인해 주세요.",
    "storage/unauthorized": "회원 전용 자료입니다. 로그인 후 이용해 주세요.",
    "storage/object-not-found": "파일을 찾을 수 없습니다. 고객문의로 알려 주세요."
  };
  return map[c] || `처리 중 문제가 생겼습니다. (${c || (e && e.message) || "알 수 없음"})`;
}

export const NOT_READY_TEXT =
  "온라인 회원·문의 기능은 준비 중입니다. 급한 문의는 이메일 hsp@sm-edge.com 또는 전화 070-5015-0355 로 연락해 주세요.";

// 머리글의 로그인/회원 링크 표시
export function mountHeaderUser() {
  const slot = document.getElementById("nav-user");
  if (!slot) return;
  if (!ready) { slot.textContent = "로그인"; slot.href = "member.html"; return; }
  onUser((user) => {
    if (user) { slot.textContent = isAdmin(user) ? "관리자" : "내 정보"; slot.href = isAdmin(user) ? "admin.html" : "member.html#mypage"; }
    else { slot.textContent = "로그인"; slot.href = "member.html"; }
  });
}
