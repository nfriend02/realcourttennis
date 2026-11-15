# Real Court Tennis - Cursor Agent 개발 가이드

## 1. Cursor Agent 코딩 규칙 (.cursorrules)
1. **C# 및 Unity 6 표준 준수**: Naming convention (PascalCase for classes/methods, camelCase for variables).
2. **GC Alloc 최적화**: Update 메서드 내 new 키워드 생성 금지.
3. **주석 작성**: 주요 테니스 물리식 및 타점 판정 로직에 한글 주석 필수 명시.

---

## 2. Cursor 프롬프트 템플릿 예시

### 템플릿: 9분할 라켓 타격 판정 클래스 생성
```text
Role: Unity C# Expert
Task: Create a RacketHitDetector script for Real Court Tennis.
Requirements:
1. Normalize ball landing position on racket to local (x, y) coordinates between -1.0 and 1.0.
2. Evaluate HitQuality (Perfect, Great, Good, Late, Early, Miss) based on distance from racket center.
3. Return ShotResult (In, LongOut, Net, LeftOut, RightOut) if hit is outside 25% boundary.
4. Keep script clean and optimized for mobile 60 FPS.
```
