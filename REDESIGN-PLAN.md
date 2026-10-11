# REDESIGN-PLAN.md — CheerLight 2.0 (triển khai)

> **Trạng thái (2026-10-11):** đã code xong P0–P5 và phần code của P6 trên nhánh `redesign-v2`, theo
> đề xuất ở mục 9 (D1–D6). Icon dùng font Ionicons tự nạp thay vì thư viện (lý do trong `NOTES.md`).
> Phần test thủ công/máy thật còn lại nằm trong checklist "Redesign 2.0" của `NOTES.md`.

> Kế hoạch code cho bản redesign, bám theo đặc tả thiết kế "CheerLight 2.0 — Kế hoạch triển khai redesign"
> (gọi tắt là **Spec**). Tài liệu này ánh xạ Spec vào code **đang có** trong `src/`, chốt các chỗ Spec
> và code lệch nhau, và chia việc theo phase. Làm tuần tự. Mỗi phase phải pass `npx tsc --noEmit` và
> `npx expo lint` rồi commit `redesign-pN: <mô tả>`.
>
> Trước khi dùng API Expo/RN nào, đọc docs của SDK 57: https://docs.expo.dev/versions/v57.0.0/

---

## 0. Việc cần làm trước

1. **Commit phần đang dở** (`preset-manager.tsx`, `presets.ts`, `use-apply-preset.ts`, sửa ở
   `settings-provider.tsx`/`sanitize.ts`/…) thành một commit riêng. Redesign sẽ xoá `preset-manager.tsx`
   và các chip mẫu trong `display-controls.tsx`, nên cần một mốc để so sánh và quay lại nếu cần.
2. Chốt 4 điểm mở ở **mục 9**. Ít nhất phải chốt D1 và D2 trước P0.3.

---

## 1. Spec → code: tên và quyết định giữ nguyên

Spec ghi rõ tên trong Spec chỉ là đề xuất. **Giữ tên đang có trong code**, chỉ thêm field mới.

| Spec | Code hiện tại (giữ) | Ghi chú |
|---|---|---|
| `DisplaySettings` | `LightSettings` (`src/types/settings.ts`) | |
| `bgColor` | `backgroundColor` | |
| `Effect = 'static' \| …` | `EffectMode = 'solid' \| …` | Nhãn UI vẫn là "Tĩnh" |
| `textSize` | `fontSize` | 40–240, bước 20 (`FONT_SIZE_STEP` ở `index.tsx` → chuyển vào `configs/effects.ts`) |
| `textSpeed` | `scrollSpeed` | Spec bỏ sót slider này ở tab con Chữ. **Giữ lại** slider "Tốc độ chạy" (xem D5) |
| `direction` | `scrollDirection` | |
| `flashEnabled / flashSync / flashMode / flashRate` | `torchEnabled / torchSyncWithEffect / torchMode / torchRate` | `torchPlan()` đã giới hạn ≤ 5 lần/giây, không đổi |
| `font: 'led' \| 'system'` | `textFont` | |
| — | **mới:** `textColorMode: 'auto' \| 'fixed'` | |
| `Preset { …, updatedAt }` | `Preset { id, name, settings }` | **Thêm** `updatedAt: number` |
| `PersistedState { version: 2, … }` một blob | Mỗi thứ một key trong `STORAGE_KEYS` | **Giữ nhiều key** (xem 3.2) |
| `src/utils/color.ts` | `src/configs/colors.ts` đã có `isValidHex`, `normalizeHex` | Thêm luminance vào `configs/colors.ts`, không tạo `utils/` |
| `src/components/ui/` | `src/components/` phẳng | Tạo `src/components/ui/` cho component dùng chung mới |

Engine hiệu ứng (`light-canvas.tsx`: `useEffectClock`, `LightCanvas`), `marquee.tsx`,
`torch-controller.tsx`, `use-landscape.ts`, `use-max-brightness.ts` **giữ nguyên logic**. Chỉ đổi màu
hoặc thêm tham số.

---

## 2. Cấu trúc file sau redesign

```
src/app/
  _layout.tsx            Stack gốc: (tabs) + display. anchor: '(tabs)'. Bỏ header.
  (tabs)/
    _layout.tsx          <Tabs tabBar={FloatingTabBar} screenOptions={{ headerShown: false }}>, usePortrait()
    index.tsx            Tab Mẫu (MỚI, thay màn cài đặt cũ)
    create.tsx           Tab Tạo (dời nội dung form từ app/index.tsx cũ sang, chia tab con)
    settings.tsx         Tab Cài đặt (MỚI)
  display.tsx            Màn Phát (viết lại phần điều khiển)

src/components/ui/       floating-tab-bar, large-title, nav-bar, grouped-section, list-row,
                         icon-badge, segmented-control, slider, toggle, color-swatch,
                         custom-color-swatch, hex-color-sheet, play-button, context-menu,
                         confirm-dialog
src/components/
  preview-frame.tsx      ← đổi tên + style lại từ effect-preview.tsx
  preset-tile.tsx        ô mẫu trong lưới (MỚI)
  recent-preset-card.tsx thẻ "Dùng gần nhất" (MỚI)
  create/                color-tab.tsx, effect-tab.tsx, text-tab.tsx, flash-tab.tsx
  display-overlay.tsx    ← thay display-controls.tsx (Thoát / Khoá / nhãn Flash / nhãn khoá)
  strobe-warning.tsx     giữ hook useEffectChooser, vẽ modal bằng ConfirmDialog
  torch-settings.tsx     → tách: create/flash-tab.tsx (UI) + hooks/use-torch-permission.ts (logic quyền)

Xoá: preset-manager.tsx, display-controls.tsx, effect-selector.tsx, color-picker.tsx,
     section.tsx, segmented.tsx, speed-slider.tsx (được thay bằng ui/*, xoá khi không còn import)
```

Quy tắc AGENTS.md: tên file kebab-case, không để file không phải route trong `src/app/`.

---

## 3. Dữ liệu và trạng thái

### 3.1 Type

```ts
// src/types/settings.ts
export type TextColorMode = 'auto' | 'fixed';
export interface LightSettings { /* như cũ */ textColorMode: TextColorMode; }
export interface Preset { id: string; name: string; settings: LightSettings; updatedAt: number; }

export type AutoHideMs = 2000 | 3000 | 5000;
export interface AppPrefs {
  showTapHint: boolean;     // true
  maxBrightness: boolean;   // true
  autoHideMs: AutoHideMs;   // 3000
}
```

`strobeAccepted` vẫn là state riêng trong provider như hiện tại. Không gộp vào `AppPrefs`, vì đã có key
lưu riêng.

### 3.2 Lưu trữ (`src/configs/storage.ts`)

```ts
export const STORAGE_KEYS = {
  settings: 'cheerlight:settings:v1',              // = bản nháp tab Tạo (giữ key, không cần chuyển dữ liệu)
  strobeWarningAccepted: 'cheerlight:strobeWarningAccepted:v1',
  presets: 'cheerlight:presets:v1',
  lastUsedPresetId: 'cheerlight:lastUsedPresetId:v1', // MỚI
  prefs: 'cheerlight:prefs:v1',                       // MỚI
} as const;
```

**Migration không cần bước riêng.** `sanitize.ts` đã dựng lại dữ liệu từ JSON bất kỳ, nên chỉ cần mở rộng nó:

- `sanitizeSettings`: nếu `r.textColorMode` không hợp lệ hoặc không có, suy ra từ dữ liệu cũ:
  `textColor` chuẩn hoá bằng `#FFFFFF` thì `'auto'`, còn lại `'fixed'`.
- `sanitizePresets`: `updatedAt` thiếu thì dùng `Date.now() - index` để giữ thứ tự cũ.
- `sanitizePrefs(raw)`: hàm mới, cùng kiểu với `sanitizeSettings`.
- `lastUsedPresetId`: không có hoặc trỏ tới mẫu không còn thì lấy mẫu có `updatedAt` lớn nhất (không có mẫu thì `undefined`).
- Màu nền cũ không còn trong bảng 14 màu vẫn giữ nguyên hex. `hex()` đã làm vậy.

> Bản 1.0 đã phát hành chỉ lưu `settings:v1` và `strobeWarningAccepted:v1`. `presets:v1` chưa từng
> được commit, nên với người dùng thật, "migration" chỉ là thêm `textColorMode`. Dù vậy vẫn xử lý dữ
> liệu mẫu dev đang có.

### 3.3 Provider (`settings-provider.tsx`, `use-settings.ts`)

Hiện tại chỉ có một `settings`, dùng cho cả màn cài đặt lẫn màn Phát. Bản mới cần tách 3 thứ:

| State | Lưu? | Dùng ở |
|---|---|---|
| `draft: LightSettings` (đổi tên từ `settings`) | có, debounce như cũ | Tab Tạo, chế độ tạo mới |
| `presets`, `lastUsedPresetId`, `prefs` | có, lưu ngay | Tab Mẫu, Cài đặt |
| `nowPlaying: LightSettings` | **không**, chỉ trong RAM | Màn Phát |

API context mới (thay `updateSettings`/`savePreset`):

```ts
updateDraft(patch) / resetDraft()
createPreset(name, settings)          // trùng tên → ghi đè (giữ logic savePreset hiện tại)
updatePreset(id, patch: { name?, settings? })  // cập nhật updatedAt
renamePreset(id, name) → 'ok' | 'duplicate'
duplicatePreset(id) → 'ok' | 'full'   // "Tên (bản sao)", cắt còn 30 ký tự, tránh trùng bằng (bản sao 2)…
deletePreset(id)                      // nếu là lastUsed → chuyển sang mẫu updatedAt mới nhất còn lại
play(settings, presetId?)             // set nowPlaying (+ lastUsedPresetId nếu có id), áp dụng gating flash
updatePrefs(patch)
resetStrobeWarning()                  // strobeAccepted = false, ghi 'false'
```

`play()` gồm logic gating flash đang có trong `use-apply-preset.ts`: chỉ bật flash khi
`torchAvailable && permission.granted`. `use-apply-preset.ts` được thay bằng hook
`usePlay()` (hooks/use-play.ts): chặn Strobe (xem 3.5), gọi `play()`, rồi `router.push('/display')`.

Nếu vào `display` qua deep link mà `nowPlaying` rỗng: dùng mẫu `lastUsedPresetId`, không có thì dùng `draft`.

### 3.4 Màu chữ tự động (`src/configs/colors.ts`)

Thêm `relativeLuminance`, `autoTextColor` (ngưỡng 0.3), `resolveTextColor(s)` đúng như Spec mục 5.
Có 3 chỗ phải dùng `resolveTextColor` thay cho `settings.textColor`: `display.tsx`, `preview-frame.tsx`,
`preset-tile.tsx`/`recent-preset-card.tsx`. Dấu ✓ trên `ColorSwatch` dùng `autoTextColor(hex)`.

Thay `PRESET_COLORS` bằng `PLAY_COLORS` (14 màu, có `name`) và `TEXT_COLOR_QUICK`. Đổi
`DEFAULT_SETTINGS.backgroundColor` từ `#FF00E6` (không còn trong bảng) sang `#FF2FD6`, và thêm
`textColorMode: 'auto'`.

### 3.5 Chặn Strobe

Spec bỏ cảnh báo Strobe khỏi màn Phát. Nhưng sau khi bấm "Hiện lại cảnh báo Strobe", phát một mẫu
Strobe sẽ bỏ qua được cảnh báo. Vì vậy **chặn trước khi điều hướng**: `usePlay()` dùng lại
`useEffectChooser`. Nếu `settings.effect === 'strobe' && !strobeAccepted` thì hiện cảnh báo trước,
"Tôi hiểu" mới `play` + `push`, "Huỷ" thì đứng yên. Áp dụng cho ô mẫu, thẻ gần nhất và ▶ ở tab Tạo.

---

## 4. Design tokens (`src/configs/ui.ts`)

Thay toàn bộ `UI` bằng bộ token sáng của Spec 4.1. Đặt tên khớp Spec (`bg`, `surface`, `fill`,
`separator`, `label`, `secondary`, `chevron`, `accent`, `accentPressed`, `danger`, `overlay`) và thêm:

```ts
export const ICON_BG = { blue: '#0A84FF', orange: '#FF9F0A', red: '#FF3B30', yellow: '#FFCC00', gray: '#8E8E93', purple: '#AF52DE' } as const;
export const TYPE = { largeTitle: {…}, navTitle: {…}, sectionTitle: {…}, body: {…}, groupLabel: {…}, caption: {…} } as const;
export const RADII = { group: 18, tile: 22, recentCard: 26, preview: 20, segmented: 9, segmentedThumb: 7, tabBar: 30, tabPill: 24 } as const;
export const SHADOW = { floating: Platform.select({ ios: {…0.16, r15, (0,10)}, android: { elevation: 8 } }) };
export const SPACING = 16;
export const TAB_BAR_CLEARANCE = 116; // paddingBottom cho nội dung cuộn ở 3 tab
```

Đổi tên khiến mọi chỗ dùng `UI.background`/`UI.text`/`UI.textMuted`/… bị lỗi type. **Tận dụng việc đó**:
`tsc` sẽ liệt kê hết những chỗ còn dùng màu cũ.

`app.json`: `userInterfaceStyle: "light"`, `backgroundColor` và splash `backgroundColor` → `#F2F2F7`.
Nếu đổi icon thì đổi luôn `adaptiveIcon.backgroundColor`.

---

## 5. Phase

### P0 — Nền tảng (≈ 1.5 ngày)

- **0.1 Token:** viết lại `ui.ts`, `colors.ts` (`PLAY_COLORS`, `TEXT_COLOR_QUICK`, luminance). Sửa `app.json`.
- **0.2 Test:** dự án chưa có test runner. Cài `jest-expo` + `jest` (devDependency, thuần JS, không
  ảnh hưởng native) bằng `npx expo install jest-expo jest @types/jest -- --save-dev`, thêm script `"test"`.
  Viết test cho: `autoTextColor` (đủ 14 màu theo tiêu chí nghiệm thu ở Spec mục 9), `resolveTextColor`,
  `normalizeHex`, `sanitizeSettings` (suy ra `textColorMode`), `sanitizePresets` (`updatedAt`),
  `torchPlan` (không bao giờ < 200 ms).
- **0.3 Store:** làm theo mục 3. Thêm `hooks/use-play.ts`, xoá `use-apply-preset.ts`.
- **0.4 Route:** tạo `(tabs)/` với 3 file tạm (create.tsx tạm dùng lại form cũ). `_layout.tsx` gốc:
  `anchor: '(tabs)'`, `headerShown: false`, `StatusBar style="dark"` (display tự ẩn).
  `(tabs)/_layout.tsx` gọi `usePortrait()`; `display.tsx` giữ `useLandscape()`.
  Kiểm tra trên simulator: chuyển qua lại giữa tab và Phát thì hướng màn hình đúng như NOTES Phase 1.

### P1 — Component chung (≈ 2 ngày)

- **1.1 `FloatingTabBar`** (`tabBar` prop của `Tabs`, đã kiểm tra expo-router 57 có hỗ trợ). Thêm:
  - Tự xử lý ẩn khi bàn phím mở trên Android (`Keyboard` listener), vì `tabBarHideOnKeyboard`
    không áp dụng cho tab bar tự vẽ. Nếu không làm, ô nhập chữ ở tab Tạo bị che.
  - Bấm tab **Tạo** luôn `navigate('create', { presetId: undefined })`. Tab giữ params cũ, nên nếu
    không xoá thì người dùng đang sửa mẫu, chuyển tab rồi quay lại sẽ vẫn ở chế độ Sửa (xem P3).
  - Viên thuốc dùng `LinearTransition` của Reanimated 4 (tên API mới, không phải `Layout`). Kiểm tra lại trong docs.
- **1.2** `LargeTitle`, `NavBar`, `GroupedSection`, `ListRow`, `IconBadge`.
- **1.3** `SegmentedControl` (thumb trượt bằng Reanimated). `Slider`: chuyển `speed-slider.tsx` sang
  `ui/slider.tsx`, giữ logic responder và a11y, đổi style (track 4, núm 28, bỏ ticks, nhãn 2 đầu).
  `Toggle`.
- **1.4** `ColorSwatch`, `CustomColorSwatch` (PNG tĩnh), `HexColorSheet` (`Modal` + `TextInput`, dùng
  `normalizeHex`), `PlayButton`, `ConfirmDialog` (có biến thể có ô nhập cho Đặt tên/Đổi tên).
  Vẽ lại `StrobeWarningModal` bằng `ConfirmDialog`, giữ nguyên nội dung chữ.
- **Icon:** xem D3. Cho tới khi chốt, dùng ký tự Unicode trong `IconBadge` để không chặn tiến độ.

### P2 — Tab Mẫu (≈ 1.5 ngày)

- **2.1** `recent-preset-card.tsx` (nền Cầu vồng dùng PNG gradient tĩnh), `preset-tile.tsx`, hàng tiêu
  đề `n/20` + "＋ Mẫu mới" (mờ và `disabled` khi đủ `PRESET_MAX`), trạng thái trống, lưới 2 cột bằng
  `flexWrap` (≤ 20 ô nên không cần FlatList). Con trực tiếp của `ScrollView` có `flexShrink: 0`.
  Sắp xếp lưới: theo thứ tự tạo (ổn định). Thẻ gần nhất lo phần "mới dùng".
  Mô tả ngắn ("Nháy · ⚡ Flash"): viết hàm `presetSummary(settings)` trong `configs/presets.ts`.
- **2.2** `ContextMenu`: popover tuyệt đối, đo vị trí nút ⋯ bằng `measureInWindow`, tự lật lên trên nếu
  sát đáy, nền `overlay`. Bốn hành động gọi API ở 3.3. Xoá thì dùng `Alert.alert`, như `preset-manager` đang làm.

### P3 — Tab Tạo (≈ 2.5 ngày)

- **3.1 Khung**
  - Chế độ: `const { presetId } = useLocalSearchParams<{ presetId?: string }>()`.
  - **Bộ đệm sửa:** chế độ Tạo sửa trực tiếp `draft` trong provider (đã được lưu). Chế độ Sửa dùng
    `useState` local, khởi tạo từ `preset.settings` mỗi khi `presetId` đổi. Không động vào `draft`.
    Thoát khỏi chế độ Sửa mà chưa Lưu thì bỏ thay đổi (giống iOS). Nếu `presetId` không tồn tại thì `router.setParams({ presetId: undefined })`.
  - "Đặt lại": chế độ Tạo thì `resetDraft()` (về `DEFAULT_SETTINGS`), chế độ Sửa thì về `preset.settings`. Cả hai hỏi xác nhận bằng `Alert`.
  - "Lưu": chế độ Tạo mở `ConfirmDialog` đặt tên (gợi ý `suggestPresetName`, trùng tên thì ghi đè như
    cũ). Chế độ Sửa thì `updatePreset` rồi `router.navigate('/')`.
  - `PreviewFrame` cố định trên, `SegmentedControl` 4 tab con, state tab con giữ ở module-level
    (`let lastSubTab`) hoặc trong provider, không lưu xuống đĩa.
  - Tiêu đề "Sửa · {tên}": `numberOfLines={1}` và `ellipsizeMode="tail"`, kiểm tra với tên có dấu.
- **3.2** Màu (lưới 8 cột, chú thích khi chọn Cầu vồng) và Hiệu ứng (`ListRow` ×4 + ✓, slider tốc
  độ ẩn khi Tĩnh, chọn Strobe đi qua `useEffectChooser`).
- **3.3** Chữ: `TextInput` một dòng + `n/500`, segmented LED/Thường, hàng màu chữ
  (Tự động = `textColorMode:'auto'`, chọn ô thì `'fixed'` + `textColor`), hướng ←/→, cỡ chữ, tốc độ chạy.
- **3.4** Flash: chuyển `torch-settings.tsx` sang `ListRow` + `Toggle`. Tách logic quyền ra
  `hooks/use-torch-permission.ts` để tab Cài đặt dùng chung (`status: 'granted'|'undetermined'|'blocked'|'unavailable'`).
  Chế độ Sửa có thêm nút "🗑 Xoá mẫu này": `Alert`, `deletePreset`, rồi `router.navigate('/')`.

### P4 — Tab Cài đặt (≈ 0.5 ngày)

`GroupedSection` ×4 theo Spec 7.3. "Tự ẩn điều khiển": trên iOS dùng `ActionSheetIOS`; trên Android
dùng `ConfirmDialog` dạng 3 lựa chọn (chưa có thiết kế, xem D4). Quyền Camera dùng
`use-torch-permission`. Chưa hỏi lần nào thì bấm vào sẽ xin quyền, bị chặn thì gọi `Linking.openSettings()`.
Phiên bản lấy từ `Constants.expoConfig?.version`.

### P5 — Màn Phát (≈ 1 ngày)

- **5.1** Thay `DisplayControls` bằng `display-overlay.tsx`. Đọc `nowPlaying`. Dùng `resolveTextColor`.
  `useMaxBrightness(prefs.maxBrightness)`: thêm tham số `enabled`, không boost khi `false`. Auto-hide
  dùng `prefs.autoHideMs` (logic `interactionKey` hiện có dùng lại được). Bỏ trạng thái "hiện sẵn lúc
  mới vào". Thay bằng nhãn gợi ý 2 giây nếu `prefs.showTapHint`. Nhãn "⚡ Flash" lấy từ `torchPlan(...).kind !== 'off'`.
- **5.2** Khoá:
  - `locked` → `navigation.setOptions({ gestureEnabled: !locked })` (Stack gốc là native stack).
  - `BackHandler.addEventListener('hardwareBackPress', () => locked)`, gỡ khi unmount.
  - Khi khoá, chạm nền chỉ bật/tắt nhãn khoá. Nhãn là `Pressable onLongPress delayLongPress={600}`.
  - `app.json` đã có `predictiveBackGestureEnabled: false`, nên Android 14+ không có thoát ngầm.
  - Rời app rồi quay lại thì vẫn khoá (state nằm trong screen, không bị reset).

### P6 — Hoàn thiện & QA (≈ 1.5 ngày)

Splash và icon, chạy trên thiết bị theo Spec 6.2, kiểm tra a11y, cập nhật `README.md`/`NOTES.md` (thêm
checklist test thủ công cho phần khoá màn hình và flash). Chạy `npx expo-doctor`. Chạy `npx expo
prebuild --clean` vào một thư mục tạm/nhánh để xác nhận không có thay đổi native nào ngoài icon và splash, rồi xoá `ios/`/`android/` (CNG).

**Tổng: ≈ 10.5 ngày công**, giống Spec. Thêm khoảng 0.25 ngày để dựng jest ở P0.2.

---

## 6. Rủi ro đã thấy trong code hiện tại

| Rủi ro | Xử lý |
|---|---|
| `nowPlaying` và `draft` dùng chung một `settings` thì phát một mẫu sẽ ghi đè bản nháp đang làm | Tách state (3.3) |
| Tab giữ params nên tab Tạo bị kẹt ở chế độ Sửa | Xoá `presetId` khi bấm tab và sau khi Lưu/Xoá (P1.1, P3.1) |
| `EffectPreview` và màn Phát cùng chạy `useEffectClock`: preview ở tab Tạo vẫn chạy khi đã sang Phát | Tạm dừng preview khi tab không focus (`useIsFocused`). Strobe ở preview cũng là một nguồn nhấp nháy, nên vẫn phải qua cảnh báo |
| `textColor` cũ `#FFFFFF` trên nền trắng sau migration | `'auto'` sẽ cho chữ đen, đúng ý đồ |
| Bàn phím Android che ô nhập khi có tab bar nổi | Ẩn tab bar khi bàn phím mở và `KeyboardAvoidingView`/`automaticallyAdjustKeyboardInsets` |
| React Compiler đang bật | Không mutate ref trong render. Biến module-level cho tab con chỉ ghi trong handler |

---

## 7. Kiểm thử

- **Unit (jest):** các hàm ở P0.2, thêm `duplicatePreset` đặt tên, `deletePreset` chuyển `lastUsed`.
- **Thủ công:** toàn bộ Spec mục 9 (tiêu chí nghiệm thu). Phần cần máy thật (flash, độ sáng, Back
  Android, vuốt iOS khi khoá) ghi vào `NOTES.md` như các phase trước.
- **Migration:** cài bản `main` hiện tại lên simulator, tạo dữ liệu (chữ trắng và chữ màu), cập nhật
  lên bản mới, kiểm tra bản nháp và `textColorMode`.

---

## 8. Không làm trong redesign

Biến thể Material 3, haptics, blur, context menu native, thư viện gradient/SVG. Màn Phát giữ nguyên
engine hiệu ứng: nhịp tắt của Nháy vẫn để chữ sáng (Spec 10.1, giữ như mockup).

---

## 9. Quyết định cần chốt

| # | Câu hỏi | Đề xuất |
|---|---|---|
| D1 | Chạm mẫu ở tab Mẫu có ghi đè bản nháp tab Tạo không? Spec ghi "Mẫu được áp dụng rồi push" | **Không.** Dùng `nowPlaying` riêng, bản nháp giữ nguyên |
| D2 | Lưu một blob `version: 2` (Spec) hay giữ nhiều key? | **Giữ nhiều key**, không cần chuyển dữ liệu, ít rủi ro mất dữ liệu |
| D3 | Icon: Spec cấm thư viện icon *native*. `@expo/vector-icons` là JS thuần chạy trên `expo-font` (đã có), không đổi native | **Dùng `@expo/vector-icons` (Ionicons)**. Nếu không muốn thêm dependency thì dùng PNG |
| D4 | Thiết kế còn thiếu: HexColorSheet, Đổi tên, cảnh báo Strobe tông sáng, trạng thái trống, chọn Tự ẩn | Dev dựng theo token và để designer duyệt ở P6. Không chặn P1–P5 |
| D5 | Spec bỏ slider "Tốc độ chạy" chữ ở tab con Chữ, nhưng data model vẫn có `textSpeed` | **Giữ slider**. Nếu bỏ thì người dùng không chỉnh được tốc độ chữ |
| D6 | Sau khi Lưu ở chế độ Sửa thì ở lại hay về tab Mẫu? | Về tab Mẫu |
