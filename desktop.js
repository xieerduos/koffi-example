const koffi = require("koffi");

// 加载user32.dll
const user32 = koffi.load("user32.dll");

// 定义 HANDLE 和 HWND
const HANDLE = koffi.pointer("HANDLE", koffi.opaque());
const HWND = koffi.alias("HWND", HANDLE);

// 定义 EnumWindowsProc 回调函数的签名
const EnumWindowsProc = koffi.proto(
  "bool __stdcall EnumWindowsProc(int32, int32)"
);

// 定义 EnumWindows 函数的签名，注意这里使用 koffi.pointer 传递函数指针
const EnumWindows = user32.func("__stdcall", "EnumWindows", "bool", [
  koffi.pointer(EnumWindowsProc),
  "int",
]);
// 定义 GetWindowTextA 函数的签名，注意这里使用 koffi.pointer 传递函数指针
const GetWindowTextA = user32.func("__stdcall", "GetWindowTextA", "bool", [
  "int32",
  "string", // 用于接收窗口标题的字符串缓冲区
  "int",
]);

// 枚举窗口的回调函数
let cb1 = koffi.register((hwnd, lParam) => {
  console.log("[hwnd, lParam]", hwnd, lParam);

  const buffer = Buffer.alloc(256); // 分配一个缓冲区存放标题
  // 获取窗口标题
  GetWindowTextA(hwnd, buffer, 256);
  // 输出获取到的标题
  console.log("Window Title:", buffer.toString("utf-8"));

  // 返回 true 继续枚举，返回 false 停止枚举
  return true;
}, koffi.pointer(EnumWindowsProc)); // 传递回调签名

// 调用 EnumWindows 来列举所有顶级窗口，传递回调函数指针
EnumWindows(cb1, 0);

koffi.unregister(cb1);

console.log("EnumWindowsProc", EnumWindowsProc);
