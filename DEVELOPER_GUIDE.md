# Forge — Developer Guide (Sana Özel)

Bu doküman senin günlük geliştirme rehberin. ROADMAP.md "ne zaman" sorusunu cevaplıyor, bu doküman "nasıl ve hangi sırayla" sorusunu cevaplıyor. Haftalık 20+ saatlik bütçeni referans alıyor.

---

## 1. İlk Gün

1. Bu repo'yu oluştur (monorepo, Turborepo + pnpm workspaces).
2. Supabase projesini aç, `.env.local` dosyasına URL + anon key'i koy (bu bilgiler bana asla gelmemeli — sadece senin ortamında dursun).
3. Gemini API key'ini al (aistudio.google.com, ücretsiz tier).
4. `packages/types`, `packages/db`, `packages/core`, `packages/ai-provider` klasörlerini boş iskeletle oluştur (ARCHITECTURE.md §3'teki yapı).
5. DATABASE.md'deki şemayı Supabase'e migration olarak uygula, RLS politikalarını hemen aynı anda ekle — **tablo olmadan RLS olmaz, RLS olmadan tablo yayınlanmaz** kuralı gün 1'den geçerli.
6. `apps/web` için boş bir Next.js app oluştur, Vercel'e bağla, ilk (boş) deploy'u yap. Amaç: deployment pipeline'ının en baştan çalıştığını görmek, sonradan sürpriz olmasın.

İlk günün sonunda "çalışan bir şey" olmayabilir — ama **iskelet ve altyapı** tam olmalı. Bu normal, acele etme.

## 2. İlk Hafta

ROADMAP.md v0.1 kapsamı: Workspace + Auth + Task/Project Management.

Sıra:
1. `workspace_members` + `workspaces` tabloları ve basit workspace switcher UI'ı — bu olmadan hiçbir şey test edilemez, çünkü her şey workspace'e bağlı.
2. Auth akışı (Supabase Auth, tek kullanıcı ama gerçek auth — sahte/bypass auth yazma, ileride söker atarsın).
3. `projects` ve `tasks` CRUD — önce backend (API routes + service layer), sonra UI.
4. En az 2 gerçek workspace oluştur (örn. Nexflow, Nakhchivan Horse Club) ve gerçek görevlerini gir. **Bu adım opsiyonel değil** — Forge'u kendi işin için kullanmaya hafta 1'de başlaman, projenin dogfooding amacının garantisi.

Hafta sonunda: PRD.md'deki v0.1 "done when" kriteri sağlanmış olmalı (bkz. ROADMAP.md).

## 3. Modül Bağımlılıkları — Neden Bu Sıra

```
Workspace + Auth  →  Tasks/Projects  →  Notes  →  Dashboard  →  AI Chat  →  GitHub
```

- **Notes, Tasks'tan sonra gelir** çünkü not-görev ilişkisi (`notes.task_id`) task tablosunun var olmasını gerektirir.
- **Dashboard, hem Tasks hem Notes'tan sonra gelir** çünkü dashboard ikisini de özetler — önce özetlenecek veri olmalı.
- **AI Chat, Dashboard'dan sonra gelir** çünkü AI'nin `WorkspaceContext`'i (açık görevler + son notlar) dashboard'un zaten hesapladığı veriyle aynı — kod tekrarı yerine dashboard'un sorgularını yeniden kullanacaksın.
- **GitHub entegrasyonu en sona bırakıldı** çünkü diğer 4 modülün hiçbiri ona bağımlı değil ve PRD.md'de en düşük risk/etki olarak işaretlendi — sıkışırsan burayı ertelemek en ucuz esneme noktası.

Bu sırayı değiştirmek istersen (örneğin AI Chat'i erken istersen), önce hangi bağımlılığı kıracağını bil — kod yazmadan önce bana sor, birlikte değerlendirelim.

## 4. Ne Zaman Refactor Yapmalı

- Bir modülü ikinci kez farklı bir yerde kopyala-yapıştır yapmak istediğin an — o zaman ortak koda çıkar (`packages/core`'a taşı).
- Bir sonraki modüle geçmeden önce, o modülün "done when" kriteri karşılanmışsa ve kod gözle kirli görünüyorsa — küçük bir temizlik geçişi yap. Büyük refactor'ları modül ortasında yapma, modül sınırlarında yap.
- Refactor için ayrı zaman ayırma, her milestone'un sonuna doğal olarak 1-2 saatlik bir "temizlik" bloğu ekle.

## 5. Ne Zaman Test Yazmalı

MVP'de test-driven development'a boğulma — 20 saat/hafta ile bu gerçekçi değil. Ama şu üç şey için test **zorunlu**, milestone kapanmadan yazılmalı:

1. Workspace izolasyonu (RLS testi — workspace A'nın workspace B verisine erişememesi). Bu bug'ı production'da yakalamak istemezsin.
2. `AIProvider` adapter'ının sözleşmesi (interface'i implement eden her sağlayıcı aynı şekli döndürüyor mu).
3. Task/Project CRUD'un temel happy-path'i.

Diğer her şey için: manuel test + kendi günlük kullanımın yeterli birinci sinyal.

## 6. Ne Zaman Performans Optimizasyonu Yapmalı

v0.1-v1.0'da performans optimizasyonuna **vakit harcama** — tek kullanıcı, küçük veri seti. Tek istisna: sorgu gerçekten yavaşsa (gözle fark edilir gecikme), o zaman DATABASE.md §4'teki index'leri kontrol et. Erken optimizasyon, bu aşamada zaman kaybı.

## 7. Ne Zaman Dokümantasyon Güncellenmeli

- Bir mimari kararı değiştirdiğinde (örn. AI sağlayıcı değişti) → ARCHITECTURE.md aynı PR'da güncellenir, sonraya bırakılmaz.
- Her milestone kapanışında → CHANGELOG.md'ye entry eklenir.
- TODO.md → haftalık olarak gözden geçir, tamamlananları işaretle.

## 8. Git / Commit / PR — Kısa Özet

Detaylar CONTRIBUTING.md'de. Özet: `feature/*` branch → PR → CI yeşil → squash merge → `main` her zaman deploy edilebilir durumda.

Commit formatı: `feat(tasks): ...`, `fix(rls): ...` (Conventional Commits).

## 9. Release Planı

Her ROADMAP.md milestone'u bir tag: `v0.1.0`, `v0.2.0` ... `v1.0.0`. Tag atmadan önce CHANGELOG.md güncel olmalı.

## 10. MVP Sonrası (v1.0'dan sonra) — Ne Zaman Ne Eklenir

PRD.md §6'da "deferred" olarak işaretlenenler, şu sinyaller geldiğinde ele alınır, önceden değil:

- **Otomasyon/workflow engine** → sadece Forge içinde tekrar eden manuel bir işlemi n8n'e taşımak yeterli gelmediğinde.
- **Multi-user / takım rolleri** → Nexflow ekibinden gerçek bir ikinci kullanıcı Forge'a girmek istediğinde (Phase 2 sinyali).
- **SaaS/billing** → topluluktan "bunu kendi ekibim için de kullanmak istiyorum, para öderim" gibi somut bir talep geldiğinde.

Sinyal gelmeden bu maddelere zaman ayırma — PRD.md §3'teki "non-goals" bilerek orada.

## 11. Zaman Yönetimi Notu

Nexflow teslimlerin ve IELTS çalışman ile çakıştığı haftalarda, Forge'a ayırdığın saatler düşerse ROADMAP.md'deki tahminler kaymaz demek değil — o hafta hangi milestone'da olduğunu not al (TODO.md), gecikmeyi bir sonraki check-in'de bana söyle, tahminleri birlikte kalibre ederiz. Kendini "programdan geri kaldım" diye suçlamak yerine gerçek bütçeyi güncellemek daha faydalı.

---
*Bu rehber projeyle birlikte gelişir — bir varsayım yanlış çıkarsa (örn. bir modül tahmininden çok daha uzun sürerse), bana söyle, güncelleyelim.*
