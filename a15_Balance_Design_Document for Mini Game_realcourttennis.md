# Real Court Tennis - 밸런스 설계 문서 (Balance Design Document)

## 1. 게임 밸런스 철학
* **입문은 쉽게, 숙련은 깊게 (Easy to learn, Hard to master)**:
  - 오토 포지셔닝으로 초보자도 쉽게 랠리 참여.
  - 6개 스트로크 선택과 정밀 타이밍(Perfect Hit)을 통해 고숙련자의 유불리 차별화.

---

## 2. 스테이지 난이도 곡선 (Difficulty Progression Curve)

```
[Stage 1~2]  : LV 1 NPC (리턴율 20%, 천천히 오는 볼)
[Stage 3~4]  : LV 2 NPC (리턴율 30%, 보통 속도)
[Stage 5~6]  : LV 3 NPC (리턴율 40%, 구석 공격 추가)
[Stage 7~8]  : LV 4 NPC (리턴율 50%, 빠른 크로스 리턴)
[Stage 9~10] : LV 5 NPC (리턴율 60%, 최고속 드라이브 및 스매시)
```

---

## 3. 타이밍 윈도우 및 히트박스 밸런스

```
Perfect Window : ±30ms (중심 10% 범위) -> 득점 확률 극대화
Great Window   : ±70ms (중심 30% 범위) -> 인 판정 90%
Good Window    : ±120ms (중심 60% 범위) -> 인 판정 70%
Late/Early     : ±180ms -> 아웃/네트 확률 급증
```
