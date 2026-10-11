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
