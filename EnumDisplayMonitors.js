// EnumDisplayMonitors
// 官方文档：https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-enumdisplaymonitors
const koffi = require("koffi");

// 加载 user32.dll
const user32 = koffi.load("user32.dll");

function getAllDisplays() {
  // 定义数据类型
  const HANDLE = koffi.pointer("HANDLE", koffi.opaque());

  const HDC = koffi.pointer("HDC", koffi.opaque());
  const RECT = koffi.struct("RECT", {
    left: "long",
    top: "long",
    right: "long",
    bottom: "long",
  });
  const LPARAM = koffi.alias("LPARAM", "long");

  // 定义 MONITORINFO 结构
  const MONITORINFO = Buffer.alloc(40);
  MONITORINFO.writeInt32LE(40, 0); // cbSize

  const MONITORINFOF_PRIMARY = 0x00000001;

  // 定义 MONITORENUMPROC 回调函数的签名
  const MonitorEnumProc = koffi.proto(
    //   "bool __stdcall MonitorEnumProc(HANDLE HMONITOR, HDC hdcMonitor, RECT* lprcMonitor, LPARAM dwData)"
    "bool __stdcall MonitorEnumProc(int32, HDC hdcMonitor, RECT* lprcMonitor, LPARAM dwData)"
  );

  // 声明 EnumWindows 函数，这是 user32.dll 中的一个函数，用于枚举所有顶层窗口
  const EnumDisplayMonitors = user32.func(
    "__stdcall",
    "EnumDisplayMonitors",
    "bool",
    [
      HANDLE,
      HANDLE,
      koffi.pointer(MonitorEnumProc), // 回调函数的指针
      LPARAM, // 附加参数，传递给回调函数
    ]
  );

  const GetMonitorInfoW = user32.func(
    "bool __stdcall GetMonitorInfoW(int32, HANDLE lpmi)"
  );

  const monitors = [];
  // 枚举窗口的回调函数
  const cb1 = koffi.register((hMonitor, hdcMonitor, lprcMonitor, dwData) => {
    // const rect = koffi.decode(lprcMonitor, RECT);
    // console.log("rect1", convertToXYWH({ rect: rect }));
    if (GetMonitorInfoW(hMonitor, MONITORINFO)) {
      const left = MONITORINFO.readInt32LE(4);
      const top = MONITORINFO.readInt32LE(8);
      const right = MONITORINFO.readInt32LE(12);
      const bottom = MONITORINFO.readInt32LE(16);
      const rect = convertToXYWH({ rect: { left, top, right, bottom } });
      // console.log("rect2", rect);

      // 判断是否为主显示器
      // #region isPrimaryMonitor
      const dwFlags = MONITORINFO.readInt32LE(36);
      const isPrimaryMonitor = (dwFlags & MONITORINFOF_PRIMARY) !== 0;
      // console.log("isPrimaryMonitor", isPrimaryMonitor);
      // #endregion isPrimaryMonitor

      // 获取工作区
      // #region workArea
      const workArea = {};

      workArea.left = MONITORINFO.readInt32LE(20);
      workArea.top = MONITORINFO.readInt32LE(24);
      workArea.right = MONITORINFO.readInt32LE(28);
      workArea.bottom = MONITORINFO.readInt32LE(32);

      // console.log("workArea", convertToXYWH({ rect: workArea }));
      // #endregion workArea

      monitors.push({
        ...rect,
        isPrimaryMonitor,
        workArea,
      });
    }

    // console.log("Monitor handle:", hMonitor);
    // console.log("Monitor lprcMonitor:", lprcMonitor);
    return true; // 返回 true 继续枚举，返回 false 停止枚举
  }, koffi.pointer(MonitorEnumProc)); // 传递回调签名

  function convertToXYWH({ rect, className }) {
    const newItem = {
      x: rect.left,
      y: rect.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      className,
    };
    if (!className) {
      delete newItem.className;
    }
    return newItem;
  }

  EnumDisplayMonitors(0, 0, cb1, 0);
  koffi.unregister(cb1);

  return monitors;
}
console.time("EnumDisplayMonitors");
const monitors = getAllDisplays();

console.log("monitors", monitors);
console.timeEnd("EnumDisplayMonitors");
