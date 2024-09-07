const koffi = require("koffi");

// 加载user32.dll
const user32 = koffi.load("user32.dll");

// 定义 HANDLE 和 HWND
const HANDLE = koffi.pointer("HANDLE", koffi.opaque());
const HWND = koffi.alias("HWND", HANDLE);

// 定义 EnumWindowsProc 回调函数的签名
const EnumWindowsProc = koffi.proto(
  "bool __stdcall EnumWindowsProc(HWND hwnd, long lParam)"
);

// 定义 EnumWindows 函数的签名，注意这里使用 koffi.pointer 传递函数指针
const EnumWindows = user32.func(
  "bool __stdcall EnumWindows(void* EnumWindowsProc, long)"
);

// 枚举窗口的回调函数
const myEnumWindowsProc = koffi.register(
  (hwnd, lParam) => {
    console.log("Found window handle:", hwnd);
    // 返回 true 继续枚举，返回 false 停止枚举
    return true;
  },
  EnumWindowsProc // 传递回调签名
);

// 调用 EnumWindows 来列举所有顶级窗口，传递回调函数指针
EnumWindows(myEnumWindowsProc, 0);

console.log("Finished enumerating windows.");
