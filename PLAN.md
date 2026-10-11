# PLAN.md — CheerLight (React Native + Expo)

> Tài liệu này dành cho AI coding agent thực thi. Làm **tuần tự từng Phase**, mỗi Phase phải đạt hết **Acceptance criteria** trước khi sang Phase tiếp theo.

---

## 1. Mục tiêu

Xây app di động biến màn hình điện thoại thành **lightstick cổ vũ**:
- Màn hình đổi màu, nhấp nháy với nhiều chế độ hiệu ứng
- Chữ chạy kiểu bảng LED (marquee)
- Độ sáng tối đa, giữ màn hình luôn sáng, xoay ngang
- Nháy đèn flash

Nền tảng: Android + iOS.

## 2. Tech stack

| Mục | Lựa chọn |
|---|---|
| Framework | Expo (SDK mới nhất, managed workflow) + TypeScript |
| Điều hướng | `expo-router` |
| Animation | `react-native-reanimated` |
| Độ sáng | `expo-brightness` |
| Giữ màn hình sáng | `expo-keep-awake` |
| Xoay màn hình | `expo-screen-orientation` |
| Đèn flash | `expo-camera` (`CameraView` với prop `enableTorch`) |
| Font LED | `expo-font` + font dot-matrix có license miễn phí (OFL) |
| Lưu cài đặt | `@react-native-async-storage/async-storage` |

## 3. Quy tắc cho agent

1. Cài thư viện bằng `npx expo install <pkg>` để đúng version tương thích SDK.
2. **Đọc tài liệu chính thức của version đã cài** trước khi dùng API (Reanimated, expo-camera, expo-router thay đổi API giữa các version). Không đoán API từ trí nhớ.
3. Chỉ dùng TypeScript, bật `strict`. Không dùng `any` trừ khi bắt buộc và có comment giải thích.
4. Sau mỗi Phase phải chạy và pass:
   - `npx tsc --noEmit`
   - `npx expo lint`
   - `npx expo-doctor`
5. Animation chạy trên UI thread (dùng `useSharedValue`, `useAnimatedStyle`, `withRepeat`, `withTiming`…). Không dùng `setInterval` + `setState` để nháy màu.
6. Không thêm thư viện ngoài danh sách ở mục 2 nếu chưa ghi lý do vào `NOTES.md`.
7. Mỗi Phase xong thì commit với message `phase-N: <mô tả>` và cập nhật checklist ở mục 6.
8. Các tính năng cần phần cứng (độ sáng, flash) không test được trên simulator: ghi rõ vào `NOTES.md` những gì cần người test trên máy thật.

## 4. Cấu trúc thư mục

> Thực tế nằm dưới `src/` (template Expo SDK 57 dùng `src/app/`), xem `NOTES.md`.

```
app/
  _layout.tsx          # Root layout, load font, provider
  index.tsx            # Màn hình cài đặt (dọc)
  display.tsx          # Màn hình hiển thị lightstick (ngang, full screen)
components/
  ColorPicker.tsx
  EffectSelector.tsx
  SpeedSlider.tsx
  Marquee.tsx
  LightCanvas.tsx      # Nền màu + hiệu ứng
  TorchController.tsx  # Điều khiển đèn flash
hooks/
  useMaxBrightness.ts
  useLandscape.ts
  useSettings.ts       # Đọc/ghi AsyncStorage
constants/
  colors.ts
  effects.ts
types/
  settings.ts
assets/fonts/
```

## 5. Data model

```ts
// types/settings.ts
export type EffectMode = 'solid' | 'blink' | 'strobe' | 'rainbow';

export interface LightSettings {
  backgroundColor: string;   // hex
  effect: EffectMode;
  speed: number;             // 1–10, quy đổi ra ms trong constants/effects.ts
  text: string;              // rỗng = không hiện marquee
  textColor: string;
  fontSize: number;
  scrollSpeed: number;       // 1–10
  scrollDirection: 'left' | 'right';
  torchEnabled: boolean;
  torchSyncWithEffect: boolean;
}
```

---

## 6. Các Phase

### Phase 0 — Khởi tạo project
**Tasks**
- [x] Tạo project Expo + TypeScript với template có `expo-router`
- [x] Cài toàn bộ thư viện ở mục 2 bằng `npx expo install`
- [x] Cấu hình Reanimated đúng theo docs của version đã cài (babel plugin / worklets)
- [x] Tạo cấu trúc thư mục ở mục 4 với file rỗng hoặc placeholder
- [x] Tạo `types/settings.ts` và `constants/` với giá trị mặc định
- [x] Tạo `NOTES.md`

**Acceptance criteria**
- `npx expo start` chạy không lỗi
- 3 lệnh kiểm tra ở mục 3.4 đều pass
- Điều hướng được giữa `index` và `display`

---

### Phase 1 — Nền tảng màn hình hiển thị
**Tasks**
- [x] `useMaxBrightness`: khi màn hình `display` mount thì lưu độ sáng hiện tại, set về `1`; khi unmount thì khôi phục. Dùng brightness của app (không đổi brightness hệ thống, không cần quyền `WRITE_SETTINGS`)
- [x] Gọi `useKeepAwake()` trong `display.tsx`
- [x] `useLandscape`: khóa landscape khi vào `display`, trả về portrait khi rời đi
- [x] Ẩn status bar và navigation bar ở màn hình `display`

**Acceptance criteria**
- Vào `display`: màn hình ngang, full screen, sáng tối đa, không tự tắt sau thời gian chờ
- Quay lại `index`: màn hình dọc, độ sáng trở về như cũ
- Không còn lock orientation khi app vào background rồi quay lại sai trạng thái

---

### Phase 2 — Đổi màu & nhấp nháy
**Tasks**
- [ ] `constants/colors.ts`: ít nhất 12 màu preset
- [ ] `ColorPicker`: chọn từ preset; có ô nhập mã hex (validate định dạng)
- [ ] `EffectSelector`: chọn `solid | blink | strobe | rainbow`
- [ ] `SpeedSlider`: giá trị 1–10
- [ ] `constants/effects.ts`: hàm quy đổi `speed` → chu kỳ ms cho từng chế độ
  - `blink`: khoảng 1000ms (speed 1) → 150ms (speed 10)
  - `strobe`: khoảng 200ms → 50ms
  - `rainbow`: chu kỳ đổi hết dải màu khoảng 6000ms → 800ms
- [ ] `LightCanvas`: nền full screen, hiệu ứng bằng Reanimated
  - `solid`: màu tĩnh
  - `blink`: bật/tắt giữa màu chọn và đen
  - `strobe`: như blink nhưng nhanh, chu kỳ sáng ngắn
  - `rainbow`: `interpolateColor` qua dải màu cầu vồng, lặp vô hạn
- [ ] Đổi setting khi đang chạy thì animation cập nhật ngay, không giật
- [ ] Hiện **cảnh báo động kinh do ánh sáng** (photosensitive epilepsy) lần đầu người dùng chọn `strobe`; lưu trạng thái đã đồng ý

**Acceptance criteria**
- Cả 4 chế độ chạy mượt, không rò rỉ animation khi đổi chế độ hoặc rời màn hình
- Không có re-render React theo từng frame (kiểm tra bằng React DevTools hoặc log)
- Cảnh báo strobe hiện đúng một lần

---

### Phase 3 — Chữ chạy LED (Marquee)
**Tasks**
- [ ] Thêm font dot-matrix vào `assets/fonts/`, load trong `_layout.tsx` bằng `expo-font`; ghi tên font + license vào `NOTES.md`
- [ ] `Marquee`:
  - Đo chiều rộng chữ (`onLayout`) và chiều rộng màn hình
  - Dịch `translateX` từ ngoài mép phải sang ngoài mép trái, lặp vô hạn bằng `withRepeat`
  - Thời gian một vòng tính theo `(textWidth + screenWidth) / pixelsPerSecond` để tốc độ ổn định với mọi độ dài chữ
  - Hỗ trợ `scrollDirection`
  - Chữ dài không bị cắt hay xuống dòng (`numberOfLines={1}`, không giới hạn width của Text)
- [ ] Màn hình cài đặt: ô nhập text, chọn màu chữ, slider cỡ chữ, slider tốc độ, chọn hướng
- [ ] Marquee hiển thị đè lên `LightCanvas` và vẫn chạy khi nền đang nháy
- [ ] Hỗ trợ tiếng Việt có dấu và emoji (kiểm tra font có glyph; nếu font LED thiếu dấu tiếng Việt thì có tùy chọn chuyển sang font thường)

**Acceptance criteria**
- Chữ ngắn và chữ rất dài (200+ ký tự) đều chạy mượt, liên tục, đúng tốc độ
- Đổi nội dung chữ khi đang chạy thì animation tính lại đúng
- Tiếng Việt có dấu hiển thị đúng

---

### Phase 4 — Nháy đèn flash
**Tasks**
- [ ] Xin quyền camera; nếu bị từ chối thì ẩn tính năng flash và hiện hướng dẫn mở Settings
- [ ] `TorchController`: render `CameraView` kích thước gần 0 / ẩn, điều khiển `enableTorch`
- [ ] Chế độ: bật liên tục, nháy theo nhịp riêng
- [ ] Giới hạn tần số nháy flash **tối đa 5 lần/giây** (bật/tắt torch nhanh hơn dễ bị bỏ qua hoặc gây lỗi trên nhiều máy)
- [ ] Tùy chọn `torchSyncWithEffect`: nháy theo nhịp `blink`; với `strobe` thì tự hạ xuống mức tối đa cho phép
- [ ] Tắt torch chắc chắn khi rời màn hình, khi app vào background, khi unmount

**Acceptance criteria**
- Flash bật/tắt/nháy đúng trên máy thật (ghi checklist test vào `NOTES.md` nếu agent không có máy thật)
- Không bao giờ để flash sáng sau khi đã thoát màn hình `display`
- Máy không có flash (một số tablet) không crash, tính năng tự ẩn

---

### Phase 5 — Hoàn thiện
**Tasks**
- [ ] `useSettings`: lưu và khôi phục toàn bộ `LightSettings` bằng AsyncStorage
- [ ] Ở `display`: chạm màn hình để ẩn/hiện thanh điều khiển nổi (đổi chế độ nhanh, nút quay lại); tự ẩn sau 3 giây
- [ ] Nút "Preview" nhỏ ở màn hình cài đặt hiển thị trước hiệu ứng
- [ ] Đặt tên app, icon, splash screen placeholder trong `app.json`
- [ ] Viết `README.md`: cách chạy, tính năng, giới hạn đã biết

**Acceptance criteria**
- Tắt hẳn app rồi mở lại vẫn giữ cài đặt cũ
- 3 lệnh kiểm tra ở mục 3.4 pass
- `README.md` và `NOTES.md` đầy đủ

---

## 7. Ngoài phạm vi (chưa làm)

- Nháy theo nhạc qua micro
- Đồng bộ nhiều điện thoại qua server (WebSocket)
- Tài khoản người dùng, chia sẻ preset online

## 8. Definition of Done

- Tất cả checkbox ở mục 6 đã tick
- App chạy trên Android và iOS qua Expo Go hoặc development build
- Không có warning đỏ trong console khi dùng các tính năng chính
- `NOTES.md` liệt kê những gì cần người test thủ công trên máy thật
