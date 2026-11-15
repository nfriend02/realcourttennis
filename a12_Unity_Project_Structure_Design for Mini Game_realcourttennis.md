# Real Court Tennis - Unity 프로젝트 구조 설계

## 1. 디렉토리 구조 (Directory Layout)

```
Assets/_RealCourtTennis/
├── 01.Scenes/
│   ├── Scene_Intro.unity
│   ├── Scene_MainLobby.unity
│   └── Scene_GamePlay.unity
├── 02.Scripts/
│   ├── Core/ (GameManager, SoundManager)
│   ├── Physics/ (BallController, RacketHitDetector, TennisPhysics)
│   ├── Input/ (TouchPadController, StrokeButton)
│   ├── AI/ (NPCAIController)
│   ├── UI/ (UIManager, LocalizationController)
│   └── Network/ (SupabaseManager)
├── 03.Prefabs/
│   ├── Characters/ (David, Susan, Wolfson)
│   ├── Environment/ (Courts_01_to_04)
│   └── UI/ (HUD_Canvas, Settings_Popup)
├── 04.Art/
│   ├── Animations/ (18 Reach Swing Clips)
│   ├── Materials/ (CellShade_Materials)
│   └── Shaders/ (URP_CellShader.shadergraph)
└── 05.Audio/
    ├── SFX/
    └── BGM/
```

---

## 2. 어셈블리 데피니션 (Assembly Definitions)
* RCT.Core.asmdef
* RCT.Physics.asmdef
* RCT.UI.asmdef
* RCT.AI.asmdef
* RCT.Network.asmdef
