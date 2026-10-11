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
- Thêm `src/components/SettingsProvider.tsx` (context giữ settings dùng chung giữa 2 màn hình) và
  `src/constants/defaults.ts` (giá trị mặc định).

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
