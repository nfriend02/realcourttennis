# Real Court Tennis - NPC AI Design Document

## 1. AI 개요 및 시점 가시성
* **NPC 위치**: 네트 건너편 아랫쪽 코트에 위치.
* **시점 크기**: 3인칭 카메라 원근감에 따라 플레이어 캐릭터 신장의 1/3 크기로 화면에 렌더링.
* **동작 구동**: FSM 기반의 공 예측, 이동, 리턴 결정 엔진.

---

## 2. 난이도별 5단계 리턴 성공률 사양

플레이어 캐릭터가 정타(In)로 넘어온 볼에 대해 난이도 단계별로 확율적 리턴 성공 여부를 결정합니다.

| AI 난이도 | 리턴 성공 확률 | 이동 속도 | 주요 반응 특성 |
| :--- | :--- | :--- | :--- |
| **Level 1** | **20%** | 4.0 m/s | 초보자용. 공 반응이 늦고 에러율이 높음. |
| **Level 2** | **30%** | 5.0 m/s | 수비형. 기본 리턴 위주. |
| **Level 3** | **40%** | 6.0 m/s | 균형형. 좌우 크로스 리턴 시도. |
| **Level 4** | **50%** | 7.0 m/s | 공격형. 빠른 구질 및 구석 착지 공격. |
| **Level 5** | **60%** | 8.0 m/s | 프로급. 정타 리턴 및 하이볼 스매시 반응. |

---

## 3. AI 리턴 판정 C# 로직

```csharp
public class NPCAIController : MonoBehaviour {
    public int difficultyLevel = 1; // 1~5
    private float[] returnChances = { 0.20f, 0.30f, 0.40f, 0.50f, 0.60f };

    public bool DecideReturnShot(Vector3 incomingBallLandingPos) {
        // 1. NPC의 구역 도달 가능 여부 계산 (팔길이 + 라켓길이)
        float reachLimit = armLength + racketLength;
        float distanceToBall = Vector3.Distance(transform.position, incomingBallLandingPos);

        if (distanceToBall > reachLimit) {
            return false; // 도달 불가 -> 플레이어 득점
        }

        // 2. 확률 주사위
        float roll = Random.value;
        return roll < returnChances[difficultyLevel - 1];
    }
}
```
