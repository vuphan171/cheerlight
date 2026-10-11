# CheerLight 🎉

Biến màn hình điện thoại thành **lightstick cổ vũ**: nền đổi màu và nhấp nháy, chữ chạy kiểu bảng
LED, sáng tối đa, xoay ngang toàn màn hình, nháy đèn flash. Android + iOS, viết bằng Expo SDK 57
(React Native 0.86, TypeScript strict).

## Tính năng

Giao diện sáng kiểu iOS, 3 tab với thanh tab nổi:

- **Mẫu** (màn chính): thẻ "Dùng gần nhất" và lưới mẫu đã lưu (tối đa 20). Chạm một lần là phát.
  Menu ⋯ (hoặc nhấn giữ): Sửa, Đổi tên, Nhân bản, Xoá.
- **Tạo**: khung xem trước cố định + 4 tab con:
  - **Màu**: 14 màu hoặc nhập mã hex (`#RGB` / `#RRGGBB`).
  - **Hiệu ứng**: Tĩnh, Nháy, Strobe, Cầu vồng; tốc độ 1–10. Animation chạy trên UI thread (Reanimated).
    Có **cảnh báo động kinh do ánh sáng** khi chọn hoặc phát Strobe lần đầu.
  - **Chữ**: chữ chạy LED tới 500 ký tự (font dot-matrix đủ tiếng Việt có dấu, hoặc font thường),
    màu chữ **Tự động** (đen/trắng theo độ chói nền) hoặc cố định, hướng, cỡ chữ, tốc độ chạy.
  - **Flash**: sáng liên tục, nhịp riêng, hoặc nháy theo hiệu ứng. Luôn **tối đa 5 lần/giây**.
  Chế độ Sửa (từ menu ⋯) chỉnh trên bản sao của mẫu, bấm Lưu mới ghi đè.
- **Cài đặt**: gợi ý "chạm để mở", độ sáng tối đa, thời gian tự ẩn điều khiển, quyền Camera,
  hiện lại cảnh báo Strobe.
- **Màn Phát**: khoá ngang, ẩn thanh hệ thống, không tự tắt màn hình. Chạm để hiện 2 nút **Thoát** và
  **Khoá màn hình**. Khi khoá: chạm, nút Back (Android) và vuốt quay lại (iOS) đều bị chặn; nhấn giữ
  nhãn khoá 600 ms để mở.
- Dữ liệu được **lưu lại** (AsyncStorage). Dữ liệu từ bản 1.0 được giữ nguyên khi cập nhật.

## Chạy app

Yêu cầu: Node.js 20+ (đã dùng Node 24), Expo Go SDK 57 trên điện thoại hoặc iOS Simulator /
Android Emulator.

```bash
npm install
npx expo start          # quét QR bằng Expo Go, hoặc nhấn i / a để mở simulator / emulator
```

Mọi thư viện dùng trong app đều có sẵn trong Expo Go. Muốn có đúng tên app, icon, splash và
quyền camera tuỳ chỉnh thì cần development build:

```bash
npx expo run:ios        # hoặc: npx expo run:android
# hoặc build trên cloud: npx eas-cli@latest build --profile development
```

### Kiểm tra

```bash
npx tsc --noEmit
npx expo lint
npm test                # unit test (jest-expo)
npx expo-doctor
```

## Cấu trúc

```
src/
  app/            _layout.tsx (font, splash, provider), display.tsx (màn Phát)
    (tabs)/       _layout.tsx (thanh tab nổi), index.tsx (Mẫu), create.tsx (Tạo/Sửa), settings.tsx
  components/     light-canvas, marquee, torch-controller, preview-frame, display-overlay, …
    create/       4 tab con của tab Tạo
    ui/           component dùng chung (tab bar, list row, segmented, slider, dialog, icon…)
  hooks/          use-settings, use-play, use-torch-permission, use-max-brightness, use-landscape
  configs/        ui (token), colors, effects, presets, sanitize (+ migration), storage, …
  types/          settings.ts
assets/fonts/     CheerLightDots-Regular.ttf + OFL.txt, Ionicons.ttf + IONICONS-LICENSE.txt
```

Chi tiết kỹ thuật, các quyết định và checklist test thủ công: xem [`NOTES.md`](NOTES.md).
Kế hoạch gốc: [`PLAN.md`](PLAN.md). Kế hoạch redesign 2.0: [`REDESIGN-PLAN.md`](REDESIGN-PLAN.md).

## Giới hạn đã biết

- **Simulator / emulator không có flash và không đổi được độ sáng**: hai tính năng này phải test trên
  máy thật (checklist trong `NOTES.md`).
- **Máy có camera nhưng không có flash** (một số tablet): expo-camera không có API kiểm tra flash, nên
  công tắc flash vẫn hiện nhưng không có tác dụng (không crash). Chỉ tự ẩn khi không mở được camera.
- **iOS**: `setBrightnessAsync` đổi độ sáng màn hình thật; app khôi phục độ sáng cũ khi rời màn hình
  hiển thị hoặc vào background. Nếu app bị hệ thống kill khi đang ở màn hình hiển thị, độ sáng giữ
  mức tối đa cho tới khi khoá máy.
- **Android**: độ sáng chỉ áp dụng cho cửa sổ của app (không cần quyền `WRITE_SETTINGS`; quyền này đã
  bị chặn trong `app.json`).
- Hiệu ứng vẫn chạy khi bật "Giảm chuyển động" của hệ thống (người dùng chủ động chọn hiệu ứng).
- Ngoài phạm vi: nháy theo nhạc, đồng bộ nhiều máy, tài khoản / chia sẻ preset.

## Giấy phép font

Icon dùng font **Ionicons** © Ionic, giấy phép MIT ([`IONICONS-LICENSE.txt`](assets/fonts/IONICONS-LICENSE.txt)).

Font LED **CheerLightDots** là bản sửa đổi (chấm tròn) của **Tiny5** © The Tiny5 Project Authors,
phát hành theo [SIL Open Font License 1.1](assets/fonts/OFL.txt).
