# NOTES.md — CheerLight

Ghi chú kỹ thuật, quyết định lệch khỏi `PLAN.md`, và checklist test thủ công.

## Môi trường

- Expo SDK 57 (`expo ~57.0.27`), React Native 0.86, React 19.2, TypeScript 6 (`strict`).
- Reanimated 4.5 + `react-native-worklets` 0.10. Babel plugin `react-native-worklets/plugin` được
  `babel-preset-expo` tự thêm khi package có mặt → **không cần `babel.config.js`**.
- React Compiler đang bật (`experiments.reactCompiler` trong `app.json`, mặc định của template).

## Quyết định / lệch khỏi PLAN

- **Cấu trúc thư mục nằm dưới `src/`** (`src/app`, `src/components`, …) vì template SDK 57 dùng
  `src/app/` cho expo-router. Alias `@/*` → `src/*`.
- Đã gỡ các package template không dùng: `@expo/ui`, `expo-glass-effect`, `expo-symbols`,
  `expo-image`, `expo-device`, `expo-web-browser`.
- Thêm `src/components/settings-provider.tsx` (context giữ settings dùng chung giữa 2 màn hình) và
  `src/configs/defaults.ts` (giá trị mặc định).

## Thư viện ngoài danh sách PLAN mục 2

| Thư viện | Lý do |
|---|---|
| `expo-navigation-bar` | Ẩn thanh điều hướng Android ở màn hình `display` (Phase 1 yêu cầu full screen). Thư viện chính thức của Expo, không có cách khác trong managed workflow. |

## Phase 1 — Màn hình hiển thị

- `app.json`: `orientation: "default"` (thay vì `portrait`) để iOS khai báo hỗ trợ landscape trong
  Info.plist — nếu không `lockAsync(LANDSCAPE)` sẽ không có tác dụng ở bản build thật. Hướng dọc của
  màn hình cài đặt được đảm bảo bằng `usePortrait()`; plugin `expo-screen-orientation` với
  `initialOrientation: PORTRAIT_UP`; `ios.requireFullScreen: true` (iPad split view chặn khoá hướng).
- Hook dùng `useFocusEffect` (không chỉ mount/unmount) + lắng nghe `AppState` để khoá lại hướng khi
  quay về foreground.
- Độ sáng: Android chỉ đổi brightness của window (khôi phục bằng `restoreSystemBrightnessAsync`);
  iOS `setBrightnessAsync` đổi độ sáng màn hình thật và **giữ nguyên khi app vào background**, nên
  hook khôi phục giá trị cũ khi app rời foreground và đặt lại 1 khi quay về.
- Ẩn status bar (`expo-status-bar`) + navigation bar Android (`expo-navigation-bar`) dưới dạng
  component, phụ thuộc `useIsFocused()`; ẩn home indicator iOS bằng `autoHideHomeIndicator`.

Đã kiểm tra trên iOS Simulator (iPhone 16 Pro, Expo Go SDK 57): vào `display` → ngang, ẩn status
bar; về `index` → dọc, status bar hiện lại; background → foreground ở `display` → vẫn ngang.

## Checklist test thủ công trên máy thật

### Phase 1
- [ ] iOS + Android: vào `display` → độ sáng nhảy lên tối đa; về `index` → trở lại mức cũ.
- [ ] iOS: đang ở `display`, vuốt về Home → độ sáng hệ thống trở lại mức cũ; mở lại app → tối đa.
- [ ] Android: thanh điều hướng (3 nút / gesture bar) bị ẩn ở `display`, hiện lại ở `index`.
- [ ] Để yên ở `display` lâu hơn thời gian tự khoá màn hình → màn hình không tắt.
- [ ] Bật "Khoá xoay" (rotation lock) của hệ thống → `display` vẫn ngang, `index` vẫn dọc.
- [ ] iPad: `display` khoá ngang được (nhờ `requireFullScreen`).

## Phase 2 — Đổi màu & nhấp nháy

- `useEffectClock(effect, speed)` (trong `LightCanvas.tsx`): một shared value `progress` chạy 0 → 1
  mỗi chu kỳ bằng `withRepeat(withSequence(withTiming…))` trên UI thread. Khi đổi tốc độ, animation
  được khởi động lại **từ pha hiện tại** (chạy nốt phần còn lại với chu kỳ mới) nên không nhảy màu.
  `cancelAnimation` khi chuyển sang `solid` và khi unmount → không rò rỉ animation.
- `LightCanvas` tính màu nền trong `useAnimatedStyle` từ `progress` + shared value màu/chế độ, nên
  không có re-render React theo frame. Blink/strobe dùng tỉ lệ sáng 50% / 30% chu kỳ.
- Dùng `.get()/.set()` cho shared value (khuyến nghị của Reanimated 4 khi bật React Compiler).
- Animation dùng `ReduceMotion.Never`: hiệu ứng do người dùng chủ động chọn, nếu theo cài đặt
  "Giảm chuyển động" của hệ thống thì blink/strobe/rainbow sẽ đứng yên.
- `SpeedSlider` tự viết bằng responder system của RN (không thêm `@react-native-community/slider`).
- Cảnh báo strobe: modal hiện khi chọn `strobe` lần đầu; trạng thái đồng ý lưu ở AsyncStorage
  (`cheerlight:strobeWarningAccepted:v1`). Nếu bấm "Huỷ" thì không đổi chế độ và lần sau vẫn hỏi.

Đã kiểm tra trên iOS Simulator: đo màu pixel qua nhiều ảnh chụp liên tiếp — blink xanh/đen xen kẽ,
strobe chủ yếu đen với chớp trắng ngắn, rainbow đổi dải màu, đổi speed khi đang chạy vẫn mượt. Đếm
render của `display` bằng log tạm thời: chỉ tăng khi đổi setting, không tăng theo frame.

### Phase 2 (test thủ công)
- [ ] Chọn Strobe lần đầu → hiện cảnh báo; "Huỷ" → không đổi; "Tôi hiểu" → đổi sang Strobe.
      Chọn lại Strobe (kể cả sau khi tắt app) → không hiện cảnh báo nữa.
- [ ] Nhập mã hex sai (vd `#12`) → viền đỏ + thông báo lỗi; nhập `#0f0` → nền đổi sang xanh lá.
- [ ] Kéo slider tốc độ trong khi ScrollView đang cuộn → slider không bị "giật mất" thao tác.
- [ ] Bật "Giảm chuyển động" (iOS) / "Remove animations" (Android) → hiệu ứng vẫn chạy.

## Phase 3 — Chữ chạy LED

### Font
- **CheerLightDots** (`assets/fonts/CheerLightDots-Regular.ttf`) — bản tĩnh dựng từ font
  **Tiny5** (© The Tiny5 Project Authors, https://github.com/Gissio/font_tiny5), giấy phép
  **SIL Open Font License 1.1** (`assets/fonts/OFL.txt`). Tiny5 không khai báo Reserved Font Name;
  vẫn đổi tên family để phân biệt với bản gốc vì đây là Modified Version.
- Cách dựng (fontTools, chỉ dùng lúc build, không phải dependency của app):
  `fonttools varLib.instancer Tiny5[BLED,JITT,ROND,wdth,wght].ttf wght=400 wdth=100 ROND=100 BLED=0 JITT=0`
  rồi đổi name table thành `CheerLightDots`. `ROND=100` biến pixel vuông thành chấm tròn → giống
  bảng LED dot-matrix.
- Lý do chọn: đã kiểm tra bảng `cmap` của các font dot/pixel OFL trên Google Fonts. Doto,
  DotGothic16, Sixtyfour **thiếu ~100 ký tự tiếng Việt** (ạ, ế, ộ…). Tiny5 có đủ 134/134 ký tự tiếng
  Việt có dấu (hoa + thường).
- Emoji: font không có emoji, iOS/Android tự fallback sang font emoji hệ thống (đã thấy 🇻🇳 🎉 hiển
  thị đúng trên simulator). Vẫn có tuỳ chọn "Kiểu chữ: Thường" (font hệ thống) cho ai thích dễ đọc.

### Marquee
- Đo `screenWidth` (onLayout container) và `textWidth` (onLayout hàng chữ). `translateX` chạy
  `screenWidth → -textWidth` (trái) hoặc ngược lại (phải), thời gian = `(textWidth + screenWidth) / pps`.
- Hàng chữ nằm trong một View vô hình rộng 1.000.000px để Yoga không giới hạn chiều rộng Text
  (nếu không, `numberOfLines={1}` sẽ cắt chữ bằng dấu "…").
- Chữ được chia thành các đoạn ~24 ký tự **tại khoảng trắng** (không cắt dấu tiếng Việt hay chuỗi
  emoji), mỗi đoạn một `<Text>`, để không có native view nào quá rộng (giới hạn texture/bộ nhớ).
  Đo trên simulator: 280 ký tự, cỡ 240 → hàng chữ rộng 29.250px, bộ nhớ chỉ tăng ~8MB.
- Đổi nội dung/cỡ chữ/hướng → chạy lại từ mép; chỉ đổi tốc độ → đi tiếp từ vị trí hiện tại.
- Giới hạn nội dung 500 ký tự (`TEXT_MAX_LENGTH`).

Đã kiểm tra trên iOS Simulator: chữ căn giữa dọc, chạy trái/phải, chạy tiếp khi nền blink/rainbow,
tiếng Việt có dấu (CỐ LÊN VIỆT NAM, "Cố lên các bạn ơi") hiển thị đúng ở cả font LED và font thường.

### Phase 3 (test thủ công)
- [ ] Chữ ngắn ("Hi") và chữ 300+ ký tự đều chạy liên tục, không giật, tốc độ nhìn như nhau.
- [ ] Đổi nội dung khi đang ở màn hình `display` (qua thanh điều khiển Phase 5) → chạy lại từ mép.
- [ ] Android: chữ LED hiển thị đúng font chấm tròn, không bị cắt phần dấu phía trên (Ệ, Ố…).

## Phase 4 — Đèn flash

- `expo-camera` plugin trong `app.json`: chỉ xin quyền camera (`microphonePermission: false`,
  `recordAudioAndroid: false`, `barcodeScannerEnabled: false`).
- `TorchController` render `CameraView` 1×1, `opacity: 0`, và **chỉ mount khi**: flash bật + có quyền
  + màn hình `display` đang focus + app ở foreground (`AppState === 'active'`). Rời màn hình / app vào
  background (kể cả `inactive` khi kéo Control Center) / unmount → CameraView bị tháo → phiên camera
  dừng → flash tắt, không phụ thuộc việc JS kịp gửi `enableTorch=false`.
- `torchPlan()` (`configs/effects.ts`) quyết định cách điều khiển. Đã kiểm tra hết 3.200 tổ hợp
  input: **không tổ hợp nào vượt 5 lần nháy/giây**, flash không bao giờ sáng khi `torchEnabled=false`.
  - Nhịp riêng: chu kỳ 1000ms → 200ms (1 → 5 lần/giây).
  - Đồng bộ `blink`: theo đồng hồ hiệu ứng (`useAnimatedReaction`, chỉ báo JS khi đổi sáng/tắt) nếu
    chu kỳ ≥ 200ms; nhanh hơn (speed cao) hoặc `strobe` → timer riêng ở mức tối đa 200ms.
  - Đồng bộ với `solid` / `rainbow`: không có nhịp → sáng liên tục.
- Nháy flash dùng `setTimeout` + state trong component nhỏ `TorchCamera`: đây là bật/tắt một prop
  native ≤ 10 lần/giây, không phải nháy màu nền (quy tắc 3.5 vẫn giữ cho `LightCanvas`).
- Quyền: bật công tắc mới xin quyền. Bị từ chối vĩnh viễn (`canAskAgain=false`) → ẩn công tắc, hiện
  hướng dẫn + nút "Mở Cài đặt" (`Linking.openSettings()`); tự kiểm tra lại quyền khi app quay về
  foreground. Bị thu hồi quyền → tự tắt flash.

### Giới hạn đã biết: phát hiện máy không có flash
- expo-camera 57 **không có API** kiểm tra có flash hay không. Native đã chặn sẵn
  (iOS `device.hasTorch`, Android `cameraInfo.hasFlashUnit()`) nên máy không có flash **không crash**,
  chỉ là flash không sáng.
- Tính năng tự ẩn khi `CameraView` báo `onMountError` (Android: không mở được camera). Lỗi tạm thời
  "Camera session was reset" của iOS được bỏ qua.
- Máy **có camera sau nhưng không có flash** (một số tablet): công tắc vẫn hiện nhưng không có tác dụng.
  Muốn ẩn chính xác cần native module nhỏ (Android `FEATURE_CAMERA_FLASH`, iOS
  `AVCaptureDevice.hasTorch`) → cần development build, chưa làm.
- Trên iOS Simulator (không có camera) CameraView không báo lỗi; đã kiểm tra không crash. Đã kiểm tra
  giao diện bị từ chối quyền bằng `xcrun simctl privacy booted revoke camera host.exp.Exponent`.
- Android emulator (camera sau không có flash): CameraView mount bình thường, không crash — xem
  "Kết quả test trên Android emulator" ở cuối file.

### Phase 4 (test thủ công — bắt buộc trên máy thật)
- [ ] Bật flash lần đầu → hiện hộp thoại xin quyền Camera với nội dung tiếng Việt.
- [ ] Từ chối quyền (Android: chọn "Không cho phép" 2 lần) → hiện hướng dẫn + nút "Mở Cài đặt";
      cấp quyền trong Cài đặt rồi quay lại → công tắc hiện lại.
- [ ] Sáng liên tục: vào `display` → flash sáng; quay lại `index` → flash tắt ngay.
- [ ] Nháy nhịp riêng 1 → 10: từ 1 lần/giây tới 5 lần/giây, nhịp đều, không bị "kẹt" sáng.
- [ ] Đồng bộ + Nháy speed 1–5: flash sáng cùng lúc nền sáng. Speed 10 và Strobe: flash nháy 5 lần/giây.
- [ ] Đang nháy → vuốt về Home / kéo Control Center / khoá màn hình → flash tắt ngay; mở lại → nháy tiếp.
- [ ] Đang nháy → vuốt kill app → flash tắt.
- [ ] Mở app Camera khác trong lúc CheerLight ở background rồi quay lại → không crash.
- [ ] Tablet/máy không có flash: không crash khi bật công tắc.

## Phase 5 — Hoàn thiện

- Lưu cài đặt: `SettingsProvider` nạp `LightSettings` từ AsyncStorage (`cheerlight:settings:v1`) khi
  khởi động, đi qua `sanitizeSettings()` (kiểm tra kiểu, kẹp giá trị, hex hợp lệ, cắt text) nên dữ liệu
  cũ/hỏng không làm crash app. Ghi lại sau 300ms (debounce) và ghi ngay khi app rời foreground.
  Splash giữ tới khi font + cài đặt đã nạp để không nháy giá trị mặc định.
- `display`: chạm màn hình → hiện/ẩn thanh điều khiển nổi (Quay lại, đổi hiệu ứng có cảnh báo strobe,
  10 màu nhanh, bật/tắt flash nếu có quyền). Tự ẩn 3 giây sau lần chạm cuối; hiện sẵn lúc mới vào.
- "Xem trước" ở màn hình cài đặt: khung thu nhỏ đúng tỉ lệ màn hình ngang, cỡ chữ và tốc độ chữ nhân
  cùng tỉ lệ; ghim phía trên để thấy thay đổi ngay khi chỉnh. Ẩn → unmount, dừng animation.
- `app.json`: tên **CheerLight**, icon + adaptive icon + splash placeholder (vẽ bằng script Python,
  hình lightstick đầu chấm LED), giao diện tối. Đã bỏ `assets/expo.icon` của template.
- `android.blockedPermissions`: `expo-brightness` tự thêm `WRITE_SETTINGS` dù app không dùng (chỉ
  đổi brightness của window) → chặn. Chặn luôn `READ/WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`.
  Đã kiểm tra bằng `npx expo config --type introspect`.

Đã kiểm tra trên iOS Simulator: thanh điều khiển hiện lúc vào và tự ẩn sau 3 giây; đặt cài đặt →
kill Expo Go (`simctl terminate`) → mở lại → màu, hiệu ứng, tốc độ, chữ giữ nguyên; khung xem trước
chạy rainbow + chữ chạy thu nhỏ.

### Phase 5 (test thủ công)
- [ ] Đổi nhiều cài đặt → vuốt kill app ngay lập tức → mở lại → cài đặt vẫn còn.
- [ ] `display`: chạm → thanh hiện; chạm lần nữa → ẩn; để yên 3 giây → tự ẩn; chạm vào vùng trống của
      thanh → thanh không ẩn và đếm lại 3 giây.
- [ ] Đổi hiệu ứng sang Strobe từ thanh nổi (khi chưa đồng ý cảnh báo) → modal hiện đúng ở màn ngang.
- [ ] Icon, tên "CheerLight" và splash tối hiển thị đúng ở bản development build.

## Ghi chú về cách agent test

- Không có máy thật; test bằng iOS Simulator + Expo Go SDK 57. Không điều khiển chạm được
  (osascript không có quyền Accessibility) nên điều hướng bằng deep link `exp://…/--/display` và
  dùng một hook **tạm thời** đọc query params để đổi cài đặt (không commit).
- Màu hiệu ứng được kiểm bằng cách đọc pixel từ nhiều ảnh chụp liên tiếp (`simctl io screenshot`).
- Android: emulator Pixel 7 Pro (Android 13) + Expo Go, **chạm thật bằng `adb shell input`**.

### Kết quả test trên Android emulator
- Cảnh báo strobe: hiện lần đầu; "Huỷ" giữ nguyên chế độ; chọn lại vẫn hỏi; "Tôi hiểu" → Strobe;
  sau đó chọn lại không hỏi nữa. ✅
- Slider kéo hai chiều, kể cả bắt đầu kéo từ núm ở mép phải. ✅ (đã sửa lỗi, xem dưới)
- Quyền camera: hộp thoại hệ thống; từ chối 2 lần → giao diện "Mở Cài đặt" → mở đúng trang App info. ✅
- `display`: ngang (`ROTATION_90`), ẩn status + navigation bar (Android hiện thông báo "Viewing full
  screen" lần đầu), blink chạy, thanh nổi hiện/ẩn/tự ẩn, đổi màu + hiệu ứng từ thanh nổi được lưu. ✅
- Camera (dùng cho torch): mở khi vào `display`; **đóng** khi bấm Home (sau ~1–2 giây), mở lại khi quay
  về, đóng khi bấm Back (`dumpsys media.camera` → `Active Camera Clients: []`). ✅
- Camera sau của emulator có `android.flash.info.available = FALSE` → đúng trường hợp "có camera,
  không có flash": không crash, torch không có tác dụng. ✅
- Cài đặt giữ nguyên sau `am force-stop`. ✅

### Lỗi tìm thấy khi test Android và đã sửa
- **Slider**: núm ở hai đầu thò ra ngoài vùng chạm; Android không nhận chạm ngoài bounds của view
  cha → không kéo được từ núm. Sửa: vùng chạm rộng hết cỡ, `rail` (dùng để đo) thụt vào trong.
- **Bàn phím tự bật lại** sau khi đóng hộp thoại quyền (ô nhập chữ vẫn giữ focus). Sửa:
  `Keyboard.dismiss()` trước khi xin quyền; `keyboardDismissMode="on-drag"` cho ScrollView.
- **Camera đóng chậm** (~2–3 giây sau Home trên emulator) → torch có thể còn sáng một lúc. Sửa:
  khi mất điều kiện sáng (background, blur, tắt flash), giữ `CameraView` thêm 400ms với
  `enableTorch=false` (lệnh tắt torch có hiệu lực ngay) rồi mới tháo.
- **Mở thẳng `display` bằng deep link** rồi bấm Back → thoát app (không có `index` bên dưới). Sửa:
  `unstable_settings = { anchor: 'index' }` trong `_layout.tsx` + nút "Quay lại" dùng
  `router.canGoBack()` rồi mới `back()`, nếu không thì `replace('/')`.

### Lưu ý khi test bằng Expo Go
- Expo Go lưu quyền **theo từng project** chồng lên quyền của hệ điều hành: cấp quyền bằng
  `adb shell pm grant` (hoặc trong Cài đặt của Expo Go) **không** làm app thấy `granted`. Bản
  development/production build không có lớp này. Muốn reset: `adb shell pm clear host.exp.exponent`.
- Nút "Mở Cài đặt" trong Expo Go mở trang App info của **Expo Go**, không phải của CheerLight.
