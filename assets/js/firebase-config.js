// ─────────────────────────────────────────────────────────────
// Firebase 연결 설정
// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹) 에서 보이는 값을 그대로 붙여 넣으세요.
// 이 값들은 공개되어도 괜찮은 "주소" 정보입니다. (보안은 firebase/*.rules 가 담당)
// apiKey 가 비어 있으면 회원가입·문의 기능은 "준비 중" 안내로 표시됩니다.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyCzXhsuAdBzPS7hT0tskye8jLV4_JKManA",
  authDomain: "smartedge-web.firebaseapp.com",
  projectId: "smartedge-web",
  storageBucket: "smartedge-web.firebasestorage.app",
  messagingSenderId: "363798016049",
  appId: "1:363798016049:web:b601726ac4fe1caa136510"
};

// 관리자 계정 (문의 답변·회원 확인·자료 올리기). firebase/*.rules 의 주소와 같아야 합니다.
export const ADMIN_EMAILS = ["hsp@sm-edge.com"];

// 회원 정보 보유기간(년)
export const RETENTION_YEARS = 3;
