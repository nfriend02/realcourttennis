# Real Court Tennis - 데이터 테이블 설계서 (Data Table Specification)

## 1. CharacterTable.csv

| CharacterID | Name | Gender | Speed | Power | Reach | Control | PrefabPath |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CHAR_01** | David | Male | 85 | 80 | 82 | 88 | Prefabs/David.prefab |
| **CHAR_02** | Susan | Female | 92 | 74 | 86 | 90 | Prefabs/Susan.prefab |
| **CHAR_03** | Wolfson | Male | 80 | 92 | 84 | 78 | Prefabs/Wolfson.prefab |

---

## 2. AIDifficultyTable.csv

| Level | ReturnChance | Speed | HitAccuracy | Description |
| :--- | :--- | :--- | :--- | :--- |
| **LV_1** | 0.20 | 4.0 | 0.50 | 초보자급 (20% 성공) |
| **LV_2** | 0.30 | 5.0 | 0.65 | 수비형 (30% 성공) |
| **LV_3** | 0.40 | 6.0 | 0.75 | 균형형 (40% 성공) |
| **LV_4** | 0.50 | 7.0 | 0.85 | 공격형 (50% 성공) |
| **LV_5** | 0.60 | 8.0 | 0.95 | 프로급 (60% 성공) |

---

## 3. LocalizationTable.csv

| Key | Ko | En | Ja |
| :--- | :--- | :--- | :--- |
| UI_START | 게임 시작 | Start Game | 게임을 시작하다 (ゲーム開始) |
| UI_SCORE | 스코어 보기 | View Score | 스코어 보기 ( score 表示) |
| UI_SETTINGS| 설정 | Settings | 설정 (設定) |
| UI_LOGOUT | 로그아웃 | Logout | 로그아웃 (ログアウト) |
