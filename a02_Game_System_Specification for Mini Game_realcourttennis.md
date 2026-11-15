# Real Court Tennis - 게임 시스템 설계서 (Game System Specification)

## 1. 게임 스테이트 머신 (Game State Machine)

게임 전체 흐름은 GameManager가 관리하는 FSM(Finite State Machine)으로 구동됩니다.

```
[IntroState] (6초 영상 Play)
      ↓
[LoginState] (Guest / Google / Apple)
      ↓
[LobbyState] (캐릭터 선택, 설정, 마이페이지)
      ↓
[MatchStartState] (4초 스타팅 카메라 연출)
      ↓
[GameplayState] (실시간 라인 랠리)
      ↓
[MatchEndState] (승패 판정, 4초 엔딩 연출)
      ↓
[ResultScoreState] (스코어 확인, 랭킹 등록, 다음 스테이지/로비)
```

---

## 2. 오토 포지셔닝 (Auto-Positioning) 시스템 사양

### 2.1 메커니즘 개요
플레이어는 좌측 사다리꼴 패드를 터치/드래그하여 방향 의도(Left, Middle, Right, Forward, Backward)만 전달합니다.
BallPredictor가 상대방이 친 공의 착지 지점과 궤적을 예측하면, 캐릭터 AI가 이동 속도에 맞춰 최적 타구 위치(Hit Point)로 자동 수평 이동합니다.

### 2.2 자동 이동 알고리즘
```csharp
public class AutoPositioning : MonoBehaviour {
    public float moveSpeed = 6.5f;
    private Vector3 targetHitPosition;

    public void OnBallIncoming(Vector3 predictedLandingPoint) {
        // 공의 궤적과 캐릭터 현재 위치를 바탕으로 타격 지점 계산
        targetHitPosition = CalculateBestHitPosition(predictedLandingPoint);
    }

    private void Update() {
        if (isAutoMoving) {
            transform.position = Vector3.MoveTowards(
                transform.position, 
                targetHitPosition, 
                moveSpeed * Time.deltaTime
            );
        }
    }
}
```

---

## 3. 스테이지 및 진행 구조 (Stage Progression)

* **스테이지 구성**: 총 10개 스테이지
* **NPC 난이도 매핑**:
  - Stage 1~2: Level 1 NPC (리턴율 20%)
  - Stage 3~4: Level 2 NPC (리턴율 30%)
  - Stage 5~6: Level 3 NPC (리턴율 40%)
  - Stage 7~8: Level 4 NPC (리턴율 50%)
  - Stage 9~10: Level 5 NPC (리턴율 60% + 빠른 볼 속도)
* **매치 승리 조건**: 3점 선승제 (3-Point Rally)

---

## 4. 환경 설정 및 마이페이지 (Settings & MyPage)

### 4.1 오른손/왼손잡이 모드 (Handedness Setting)
* **설정 위치**: 마이페이지(MyPage) 전용 설정
* **디폴트 값**: 오른손잡이 (Right-Handed)
* **변환 시 동작**:
  - UI 레이아웃의 좌측 사다리꼴 패드와 우측 6개 스트로크 버튼 위치 반전.
  - 플레이어 캐릭터 3D 렌더링 및 애니메이션 미러링(Left-handed swing).

### 4.2 다국어 설정 (Localization)
* **지원 언어**: 한국어 (Ko, Default), 영어 (En), 일본어 (Ja)
* **설정 위치**: 상단 우측 언어 토글 버튼 (모든 화면에서 즉시 변경 가능)
