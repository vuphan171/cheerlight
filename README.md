# CheerLight 🎉

Biến màn hình điện thoại thành **lightstick cổ vũ**: nền đổi màu và nhấp nháy, chữ chạy kiểu bảng
LED, sáng tối đa, xoay ngang toàn màn hình, nháy đèn flash. Android + iOS, viết bằng Expo SDK 57
(React Native 0.86, TypeScript strict).

## Tính năng

- **Màu nền**: 14 màu preset hoặc nhập mã hex (`#RGB` / `#RRGGBB`, có kiểm tra định dạng).
- **Hiệu ứng**: Tĩnh, Nháy, Strobe, Cầu vồng; tốc độ 1–10. Animation chạy trên UI thread
  (Reanimated), đổi cài đặt khi đang chạy vẫn mượt.
- **Cảnh báo động kinh do ánh sáng** khi chọn Strobe lần đầu.
- **Chữ chạy LED**: font dot-matrix có đủ tiếng Việt có dấu, emoji; chọn màu, cỡ chữ, tốc độ,
  hướng chạy; có thể chuyển sang font thường. Chữ dài (tới 500 ký tự) vẫn chạy mượt, không bị cắt.
- **Màn hình hiển thị**: khoá ngang, ẩn status bar / navigation bar, độ sáng tối đa (chỉ trong app),
  không tự tắt màn hình. Chạm màn hình để hiện thanh điều khiển nổi (quay lại, đổi hiệu ứng, đổi màu,
  bật/tắt flash, chọn mẫu), tự ẩn sau 3 giây.
- **Đèn flash**: sáng liên tục, nháy theo nhịp riêng, hoặc đồng bộ với hiệu ứng nền. Luôn giới hạn
  **tối đa 5 lần/giây**. Flash tự tắt khi rời màn hình, khi app vào background.
- **Xem trước** hiệu ứng ngay ở màn hình cài đặt.
- **Mẫu đã lưu**: lưu tối đa 20 bộ cài đặt có đặt tên (lưu trùng tên = ghi đè), chạm để áp dụng,
  xoá có xác nhận. Đổi nhanh giữa các mẫu ngay trên thanh điều khiển nổi ở màn hình hiển thị.
- Tất cả cài đặt được **lưu lại** (AsyncStorage), tắt hẳn app mở lại vẫn giữ nguyên.

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
npx expo-doctor
```

## Cấu trúc

```
src/
  app/            _layout.tsx (font, splash, provider), index.tsx (cài đặt), display.tsx (lightstick)
  components/     LightCanvas, Marquee, TorchController, DisplayControls, EffectPreview, …
  hooks/          useMaxBrightness, useLandscape, useSettings
  configs/        colors, effects (quy đổi tốc độ, giới hạn flash), fonts, sanitize, …
  types/          settings.ts
assets/fonts/     CheerLightDots-Regular.ttf + OFL.txt
```

Chi tiết kỹ thuật, các quyết định và checklist test thủ công: xem [`NOTES.md`](NOTES.md).
Kế hoạch gốc: [`PLAN.md`](PLAN.md).

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

Font LED **CheerLightDots** là bản sửa đổi (chấm tròn) của **Tiny5** © The Tiny5 Project Authors,
phát hành theo [SIL Open Font License 1.1](assets/fonts/OFL.txt).
