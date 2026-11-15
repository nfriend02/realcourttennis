# Open Questions — Real Court Tennis

| # | 질문 | 현재 기본값 | 필요한 것 |
| --- | --- | --- | --- |
| Q01 | Firebase Project Web Config | **해결 (X40)**: project/DB `realcourttennis` @ asia-northeast3, rules·indexes·storage 배포·CRUD smoke 통과 | Vercel 배포 시 Authorized Domains에 프로덕션 도메인 추가. Console의 Phone(SMS) Provider는 앱에서 미사용(휴대폰=Email/Password alias) — 혼동 방지로 비활성 권장 |
| Q02 | Google / Apple Sign-in | 미설정 → Login 화면에서 "설정 필요" 안내 | Firebase Auth Provider 활성화 + Authorized Domain 등록 (Apple은 Apple Developer Service ID 필요) |
| Q03 | 실제 Character Model(GLTF), Video, Image, Audio Asset | 없음 → Placeholder | 08_AI Prompt Master Set.md의 Prompt로 생성 후 public/assets/ 규칙대로 투입 |
| Q04 | 07 §28 Open Decisions D02~D12, D14 | 07 기본값 적용 | 사용자 확인 시 변경 |
| Q05 | Ranking 부정 방지 강화 여부 | Firestore Rules 범위 검증 (Spark Plan) | 필요 시 Blaze Plan + Cloud Functions로 Result 검증 이전 |
