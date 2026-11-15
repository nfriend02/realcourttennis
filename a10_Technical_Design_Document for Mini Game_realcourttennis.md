# Real Court Tennis - Technical Design Document (TDD)

## 1. 아키텍처 개요 (Architecture Overview)

Unity 6 URP 기반의 싱글톤 매니저 패턴(Manager Pattern) 및 이벤트 기반 아키텍처(Event-Driven Architecture)를 구축합니다.

```
[GameManager] (전체 FSM)
   ├── [InputManager] (터치/마우스 및 6개 스트로크 이벤트)
   ├── [PhysicsManager] (커스텀 탄도 물리 및 9분할 타점 판정)
   ├── [AIManager] (NPC AI 1~5단계 구동)
   ├── [UIManager] (Canvas Scaler & 다국어)
   └── [NetworkManager] (Supabase SDK & REST API)
```

---

## 2. 모바일 최적화 및 타겟 사양 (Performance Targets)
* **타겟 프레임**: 60 FPS (iOS / Android)
* **드로우콜 (Draw Calls)**: 80 이하 유지 (Batching & Texture Atlas 사용)
* **메모리 할당**: GC Alloc 제로화 (Garbage Collection 방지를 위해 Object Pooling 적용)

---

## 3. 핵심 C# 매니저 클래스 사양

```csharp
using UnityEngine;
using System;

public class PhysicsManager : MonoBehaviour {
    public static PhysicsManager Instance { get; private set; }

    public event Action<HitResult> OnBallHit;

    private void Awake() {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    public void ProcessSwing(Vector3 ballPos, Vector3 racketPos, StrokeType stroke) {
        // 커스텀 타점 및 충돌 좌표 계산
    }
}
```
