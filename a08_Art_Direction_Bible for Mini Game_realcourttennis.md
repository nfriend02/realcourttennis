# Real Court Tennis - Art Direction Bible

## 1. 비주얼 컨셉 (Visual Concept)
* **스타일**: Realistic Cell-Shaded 3D Animation
* **비율**: 애니메이션 감성 30% + 리얼리스틱 스포츠 비율 70% (7.5등신)
* **톤앤매너**: 밝고 청량한 여름 스포츠 느낌, 세련된 셀 셰이딩 외곽선과 수채화풍 텍스처.

---

## 2. 렌더링 파이프라인 & 셰이더 (Rendering Pipeline)
* **파이프라인**: Unity URP (Universal Render Pipeline)
* **Custom Shader Graph**:
  - 2-Ramp Light Cell Shading (강한 하이라이트 + 툰 섀도우)
  - Smooth Outline Rendering (카메라 거리에 따른 가변 외곽선)
  - Rim Light (캐릭터 외곽 입체감 강조)

---

## 3. 코트 테마 4종 (Court Environments)
1. **주간 스포츠 센터 (Day Sports Center)**: 푸른 하늘, 초록색 잔디/하드 코트, 흰색 관중석.
2. **석양 코트 (Sunset Court)**: 주황빛 노을 조명, 주황색 코트 반사광.
3. **야간 프로 경기장 (Night Pro Stadium)**: 화려한 스포트라이트, 야간 조명, 열기 띤 관중석.
4. **실내 인도어 코트 (Indoor Court)**: 깔끔한 실내 조명과 맑은 목재/우레탄 바닥 texture.

---

## 4. 공 그림자 및 비주얼 피드백 (Ball Shadow & VFX)
* **공 Landing Shadow**: 거리 감각을 제공하기 위해 공 바로 아래 바닥에 원형 셀 그림자 항상 표시.
* **Perfect Hit FX**: 라켓 임팩트 지점에 강렬한 불꽃/스파크 파티클 + 카메라 셰이크 + 찰나의 슬로모션.
