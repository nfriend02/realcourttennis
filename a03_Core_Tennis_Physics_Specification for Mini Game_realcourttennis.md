# Real Court Tennis - Core Tennis Physics Specification

## 1. 물리 엔진 아키텍처 개요
RigidBody 물리 엔진 대신 커스텀 포물선 탄도 공식(Custom Projectile Ballistics)을 사용합니다. 모바일 기기에서의 오차를 방지하고 프레임 독립적인 타점 판정을 구현합니다.

---

## 2. 공 비행 탄도 공식 (Ball Dynamics)

P(t) = P0 + V0 × t + ½ × g × t²

- g = (0, −18.0, 0) m/s² (테니스 미니게임용 보정 중력)
- 공의 스핀 종류에 따른 중력 및 공기저항 계수 차등 적용:
  - **Top Spin**: 중력 가속도 증가 (1.3 × g), 급격하게 하강.
  - **Flat**: 표준 중력 (1.0 × g), 직선적 고속 비행.
  - **Slice**: 중력 가속도 감소 (0.7 × g), 낮은 체공 높이.

---

## 3. 라켓 9분할 타격 면 (3x3 Matrix) & 반사각 계산

라켓 면을 로컬 좌표계 (x, y) ∈ [−1.0, 1.0] 범위로 규격화합니다.

```
┌──────┬──────┬──────┐
│  A1  │  A2  │  A3  │  (상단: 로브 / Long Out 영역)
├──────┼──────┼──────┤
│  B1  │  B2  │  B3  │  (중앙: 정타 / 크로스 / 플랫)
├──────┼──────┼──────┤
│  C1  │  C2  │  C3  │  (하단: 슬라이스 / Net 영역)
└──────┴──────┴──────┘
```

### 3.1 라켓 오프셋별 발사 벡터 계산
D_launch = normalize(F_stroke + c_x × x_offset × R + c_y × y_offset × U)

- x_offset < −0.5: 좌측 25% 맞음 → Left Out 또는 크로스 각도 증대
- x_offset > 0.5: 우측 25% 맞음 → Right Out 또는 역크로스 각도 증대
- y_offset > 0.5: 상단 25% 맞음 → Long Out (아웃 판정)
- y_offset < −0.5: 하단 25% 맞음 → Net Hit (네트 안 걸림)

---

## 4. 타구 품질 판정 (Hit Quality & Timing)

플레이어가 버튼을 뗀 시점 t_swing과 공이 타구 라인을 통과하는 시점 t_ball의 차이 Δt = (t_swing − t_ball)의 절댓값을 계산.

| Hit Quality | Timing Delta (Δt) | Racket Distance Offset | Effect & Result |
| :--- | :--- | :--- | :--- |
| **Perfect** | ≤ 0.03 s | < 0.15 | 불꽃 이펙트, 카메라 진동, 묵직한 타격음, 에이스 확률 증가 |
| **Great** | ≤ 0.07 s | < 0.35 | 청량한 타격음, 높은 인(In) 판정률 |
| **Good** | ≤ 0.12 s | < 0.60 | 일반 타구 |
| **Late / Early**| > 0.12 s | > 0.60 | 구질 악화, 빗맞음 |
| **Miss** | > 0.18 s | > 1.00 | 헛스윙 / 헛치기 (실점) |

---

## 5. 핵심 C# 구현 코드

```csharp
using UnityEngine;

public enum ShotResult { In, LeftOut, RightOut, LongOut, Net }

public class TennisPhysics {
    public static ShotResult EvaluateShot(float xOffset, float yOffset) {
        if (yOffset > 0.5f) return ShotResult.LongOut;
        if (yOffset < -0.5f) return ShotResult.Net;
        if (xOffset < -0.5f) return ShotResult.LeftOut;
        if (xOffset > 0.5f) return ShotResult.RightOut;
        return ShotResult.In;
    }

    public static Vector3 CalculateReflectedVelocity(Vector3 currentBallPos, float xOffset, float yOffset, float power) {
        Vector3 baseDir = Vector3.forward;
        baseDir.x += xOffset * 0.75f;
        baseDir.y += yOffset * 0.45f;
        return baseDir.normalized * power;
    }
}
```
