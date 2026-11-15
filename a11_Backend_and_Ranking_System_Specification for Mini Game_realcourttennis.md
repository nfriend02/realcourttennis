# Real Court Tennis - Backend & Ranking System Specification

## 1. 백엔드 기술 스택 (Backend Tech Stack)
* **BaaS Framework**: Supabase
* **Database**: PostgreSQL (Supabase DB)
* **Authentication**: Supabase Auth (Google Login, Apple Login, Guest Login)
* **Analytics**: Firebase Analytics & Crashlytics

---

## 2. 데이터베이스 스키마 (Database Schema)

### profiles 테이블
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    handedness VARCHAR(10) DEFAULT 'Right', -- 'Right' or 'Left'
    preferred_language VARCHAR(5) DEFAULT 'Ko', -- 'Ko', 'En', 'Ja'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### rankings 테이블
```sql
CREATE TABLE public.rankings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    stage_cleared INT NOT NULL DEFAULT 1,
    high_score INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 3. 랭킹 API 연동 (Supabase C#)

```csharp
using Supabase;
using UnityEngine;

public class RankingManager : MonoBehaviour {
    public async void SubmitScore(int score, int stage) {
        var client = SupabaseClient.Instance;
        var rankingEntry = new RankingModel { HighScore = score, StageCleared = stage };
        await client.From<RankingModel>().Insert(rankingEntry);
    }
}
```
