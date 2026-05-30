# Polar 구독 결제 — 배포 가이드

코드는 전부 들어가 있습니다(`supabase/functions/*`, `supabase/subscriptions.sql`, 프론트 배선).
여기 적힌 건 **계정·상품·키·배포처럼 사람만 할 수 있는 단계**입니다.

## 왜 Polar인가 (요약)
Polar는 Merchant of Record입니다 — Polar가 법적 판매자가 되어 전 세계 부가세/판매세를
대신 징수·납부하고, 사장님에게 정산해줍니다. **한국 거주 개인도 사업자등록 없이** 글로벌에
팔 수 있습니다(한국은 Stripe Connect Express 정산 대상국으로 Polar가 공식 지원).
액세스 토큰은 Supabase Edge Function 서버에만 보관되고 브라우저엔 들어가지 않습니다.

## 1. Polar 계정 & 상품

1. https://polar.sh 가입(개인 가능). **먼저 Sandbox(https://sandbox.polar.sh)** 로 테스트 권장.
2. Organization 생성.
3. Products에서 두 개 생성, 각각 **Recurring(월간) 구독 가격**:
   - **Pro** — 월 구독 가격 입력 → 생성 후 **Product ID** 복사
   - **Team** — 월 구독 가격 입력 → **Product ID** 복사
   - 글로벌 개발자 타깃이면 가격 통화는 USD 권장(랜딩의 ₩ 표기는 한국 방문자용 표시일 뿐,
     실제 청구 통화는 Polar 상품에 설정한 값).
4. Settings → 토큰에서 **Organization Access Token** 발급 → 복사(`polar_oat_...`).

## 2. DB 테이블

Supabase 대시보드 → SQL Editor에서 `supabase/subscriptions.sql` 전체 실행.
(기존 `schema.sql`을 돌렸던 그 자리입니다.)

## 3. Supabase CLI 준비 (Edge Function 배포용)

```bash
brew install supabase/tap/supabase          # 최초 1회
supabase login
cd ~/handoff
supabase link --project-ref lcdgboolxhajstcuaikp
```

## 4. 서버 시크릿 등록

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY`는 Supabase가
함수에 자동 주입하므로 직접 설정할 필요 없습니다. 우리가 넣을 건 Polar 값:

```bash
supabase secrets set \
  POLAR_ACCESS_TOKEN="polar_oat_..." \
  POLAR_SERVER="sandbox" \
  POLAR_PRODUCT_PRO="<Pro Product ID>" \
  POLAR_PRODUCT_TEAM="<Team Product ID>"
# POLAR_WEBHOOK_SECRET 은 6단계에서 받은 뒤 추가로 set
```

> 라이브 전환 시 `POLAR_SERVER="production"` + 프로덕션 토큰/상품 ID/웹훅 시크릿으로 다시 set.

## 5. 함수 배포

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy polar-webhook        # config.toml에서 verify_jwt=false 적용됨
```

배포되면 webhook URL이 생깁니다:
`https://lcdgboolxhajstcuaikp.supabase.co/functions/v1/polar-webhook`

## 6. Webhook 등록

1. Polar 대시보드 → Settings → Webhooks → **Add Endpoint**.
2. URL = 위 polar-webhook 주소. Format = **Raw**.
3. 이벤트 선택: `subscription.created`, `subscription.active`, `subscription.updated`,
   `subscription.canceled`, `subscription.revoked`(있으면 `subscription.past_due`도).
4. 생성 시 나오는 **Webhook Secret** 복사 → secret 추가:
   ```bash
   supabase secrets set POLAR_WEBHOOK_SECRET="<webhook secret>"
   supabase functions deploy polar-webhook   # 시크릿 반영 위해 재배포
   ```

## 7. Customer Portal

Polar는 고객 포털을 기본 제공합니다(별도 활성화 불필요). 프론트의 "구독 관리"가
`create-portal-session` → Polar 포털 URL로 엽니다.

## 8. 테스트 (Sandbox)

1. lovable.app에서 GitHub 로그인 → 요금제 "구매하기" 클릭.
2. Polar Sandbox 체크아웃에서 테스트 카드 `4242 4242 4242 4242`, 미래 만료일/임의 CVC.
3. 결제 완료 → `/app?billing=success`로 복귀, 배너 표시.
4. 잠시 후 webhook이 `subscriptions` 테이블에 plan=`pro`/`team`, status=`active`,
   polar_subscription_id, current_period_end 기록.
   (확인: Supabase Table Editor / 로그는 `supabase functions logs polar-webhook`)

## 9. 라이브 전환

Sandbox 검증 끝나면 production Polar org에서 상품·토큰·웹훅을 다시 만들고,
4·6단계를 production 값으로 `supabase secrets set` (`POLAR_SERVER="production"` 포함).
함수 재배포.

---

### 프론트가 호출하는 것 (Polar로 바뀌어도 동일)
- "구매하기"(Pro/Team) → `create-checkout-session` → Polar Checkout으로 리다이렉트
- "구독 관리"(추후 UI) → `create-portal-session` → Polar Customer Portal
- 플랜 상태는 `src/lib/use-subscription.ts`의 `useSubscription()`이 RLS로 보호된
  `subscriptions` 테이블에서 읽습니다. 쓰기는 오직 polar-webhook(service-role)만.

### Stripe 대비 달라진 점
- 고객 사전 생성 불필요 — `externalCustomerId = Supabase user.id`로 Polar가 자동 연결.
- 세금 처리 Polar가 대행(MoR). `current_period_end`는 Polar가 정식 필드로 제공.
