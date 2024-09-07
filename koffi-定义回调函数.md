# koffi 回调函数

官网地址：https://koffi.dev/callbacks

## 代码例子

EnumWindowsProc callback function：https://learn.microsoft.com/en-us/previous-versions/windows/desktop/legacy/ms633498(v=vs.85)
EnumDesktopWindows 函数 (winuser.h)：https://learn.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-enumdesktopwindows?redirectedfrom=MSDN

### desktop.js

```js
const koffi = require("koffi");

// 加载user32.dll
const user32 = koffi.load("user32.dll");

const FindWindowW = user32.func("__stdcall", "FindWindowW", "int32", [
  "string",
  "string",
]);

console.log("FindWindowW", FindWindowW);
console.log(
  "FindWindowW",
  FindWindowW(Buffer.from(`Shell_TrayWnd\0`, "ucs2"), null)
);

const HANDLE = koffi.pointer("HANDLE", koffi.opaque());
const HWND = koffi.alias("HWND", HANDLE);

const EnumWindowsProc1 = koffi.proto(
  "bool __stdcall EnumWindowsProc (HWND hwnd, long lParam)"
);

console.log("EnumWindowsProc1", EnumWindowsProc1);

const EnumWindowsProc2 = koffi.proto("__stdcall", "EnumWindowsProc2", "bool", [
  "HWND",
  "long",
]);

console.log("EnumWindowsProc2", EnumWindowsProc2);
```

### 执行结果

```powershell
PS C:\Users\Administrator\Desktop\koffi-sample> node .\desktop.js
FindWindowW [Function: FindWindowW] {
  async: [Function: FindWindowW],
  info: {
    name: 'FindWindowW',
    arguments: [ [External: 215d4da3770], [External: 215d4da3770] ],
    result: [External: 215d4da29c8]
  }
}
FindWindowW 196684
EnumWindowsProc1 [External: 215d4da3b98]
EnumWindowsProc2 [External: 215d4da3c30]
PS C:\Users\Administrator\Desktop\koffi-sample>
```

## 为什么要定义 `const HANDLE = koffi.pointer('HANDLE', koffi.opaque()); const HWND = koffi.alias('HWND', HANDLE);`

在 `koffi` 中，定义 `const HANDLE = koffi.pointer('HANDLE', koffi.opaque())` 和 `const HWND = koffi.alias('HWND', HANDLE)` 是为了处理 C/C++ 中的 Windows API 数据类型，并在 JavaScript 环境中表示这些类型，以便调用 Windows API 函数时能够正确处理这些数据结构。

### 1. `HANDLE` 和 `HWND` 的含义：

- **`HANDLE`** 是 Windows API 中的一个通用指针类型，用于表示许多系统对象（如文件、窗口、进程等）的句柄。句柄本质上是一个抽象的引用，用于标识系统资源。
- **`HWND`** 是 Windows API 中的窗口句柄，它是一个特殊的 `HANDLE` 类型，用于表示窗口对象。

在 JavaScript 中没有直接与 C/C++ 的这些低级指针对应的数据类型，因此 `koffi` 需要通过以下两步来定义这些类型：

- **`koffi.pointer('HANDLE', koffi.opaque())`**：`HANDLE` 是一个指针类型，但具体指向的内容并不需要暴露（即不关心指针指向的是什么），因此使用 `koffi.opaque()` 表示这是一个不透明指针，封装其具体实现。
- **`koffi.alias('HWND', HANDLE)`**：`HWND` 是基于 `HANDLE` 的别名，表示它们本质上是同一种数据结构，但是为了代码的语义性和可读性，将 `HWND` 专门命名为一个与窗口相关的句柄。

### 为什么要这样做？

- **兼容 Windows API**：在 Windows 系统中，很多 API 调用需要传递 `HANDLE` 或 `HWND` 这样的类型。通过 `koffi` 的指针和别名机制，可以在 JavaScript 中模拟这些 Windows API 所期望的类型。
- **提高代码可读性**：虽然 `HWND` 和 `HANDLE` 在底层是同一种数据结构，但通过使用别名，可以让代码在语义上更清晰。例如，调用涉及窗口的函数时，使用 `HWND` 会比 `HANDLE` 更直观地表示其用途。
- **避免类型错误**：通过定义这些类型，`koffi` 可以确保你在与 C/C++ API 交互时，传递的参数类型是正确的，避免因为类型不匹配导致程序崩溃。

总结来说，这种类型定义方式允许你在 JavaScript 中准确模拟 Windows API 的数据结构，同时保持代码的可读性和安全性。

## `HWND` 并没有通过参数传入使用，但是不写又不行，为什么

虽然在实际代码中 `HWND` 可能并没有通过参数传入或者直接使用，但定义它是必要的，原因主要有以下几个方面：

### 1. **保持类型一致性**

即使 `HWND` 没有在参数传递中直接使用，Windows API 函数可能期望接收到一个特定类型的数据。`HWND` 在 Windows API 中是窗口句柄，而函数签名中的类型必须与预期的类型匹配。

即使在某些情况下你并不显式传递 `HWND`，如果你调用的函数签名需要 `HWND` 类型，你必须在代码中定义它，以确保在编译或运行时能够正确识别并处理这些类型。

### 2. **约束 API 结构**

很多 Windows API 函数的签名要求明确指定参数类型，即使这些参数在 JavaScript 代码中似乎没有实际使用。通过定义 `HWND` 类型，`koffi` 知道如何正确地解析和映射这些参数到相应的 Windows API 调用上，防止因类型不匹配而导致程序崩溃或者行为异常。

### 3. **语言限制和 ffi 约束**

在与 Windows API 进行交互时，ffi（Foreign Function Interface，外部函数接口）层需要处理复杂的类型系统。ffi 需要明确指定每个参数和返回值的类型，即使这些参数可能在 JavaScript 层面看起来没有直接用途。例如，`HWND` 类型可能是一个函数返回值或者回调函数的参数，即使你不显式使用它，ffi 层仍然要求这些类型定义存在，以便能正确处理底层的调用。

### 4. **符合 Windows API 调用约定**

Windows API 函数调用通常有明确的调用约定和参数要求。即使某些参数没有被显式传递或者使用，函数签名必须与 API 规范保持一致。如果省略 `HWND`，则可能违反 API 的调用约定，导致潜在的错误或不稳定性。

### 示例：`EnumWindowsProc`

例如，`EnumWindowsProc` 期望传递的第一个参数是 `HWND`。即使你在 JS 层面不需要直接操作这个 `HWND`，你必须在 ffi 定义中声明 `HWND`，否则 API 函数签名将不匹配。

```js
const EnumWindowsProc = koffi.proto(
  "bool __stdcall EnumWindowsProc (HWND hwnd, long lParam)"
);
```

这种情况下，`HWND` 的定义是函数签名所必需的，即使在你的代码逻辑中没有直接处理 `HWND`。

### 总结

`HWND` 的定义是为了满足底层 ffi 和 Windows API 的类型要求，即便在你的 JavaScript 代码中它看起来没有被显式使用。这种做法确保了函数调用的类型一致性，并且避免了由于类型不匹配而导致的错误或崩溃。

## `EnumWindowsProc` 仅仅是一个函数名称对吗？它可以是 `EnumWindowsProc2`，`EnumWindowsProc3` 对不对

是的，`EnumWindowsProc` 仅仅是一个函数名称。在 `koffi` 中，它只是用来标识该回调函数的名称，你完全可以使用不同的名字，比如 `EnumWindowsProc2` 或 `EnumWindowsProc3`，只要保证这个名字在你定义和使用的上下文中是一致的即可。

具体来说，这个名称的作用是给回调函数一个标识，并不会影响函数的实际逻辑。真正重要的是你定义的函数签名（如参数类型和返回类型）。例如：

```js
// 定义第一个回调
const EnumWindowsProc = koffi.proto(
  "bool __stdcall EnumWindowsProc (HWND hwnd, long lParam)"
);

// 定义另一个回调，可以使用不同的名称
const EnumWindowsProc2 = koffi.proto(
  "bool __stdcall EnumWindowsProc2 (HWND hwnd, long lParam)"
);
```

上面两个定义都是合法的，即便它们具有相同的函数签名，名称不同只是为了区分这两个回调函数。你可以根据需要自定义名称，确保在调用时保持一致即可。

### 关键点：

- **函数名称是可变的**：在 `koffi` 中，`EnumWindowsProc` 只是你定义的函数名称，完全可以更改为你需要的其他名称。
- **签名定义保持一致**：重要的是定义中的参数和返回值的类型，名称不影响函数的调用或功能实现。

因此，你可以像下面这样定义多个回调函数，每个函数有不同的名称，但它们的签名可以相同或不同：

```js
const EnumWindowsProc = koffi.proto(
  "bool __stdcall EnumWindowsProc(HWND hwnd, long lParam)"
);
const EnumWindowsProc2 = koffi.proto(
  "bool __stdcall EnumWindowsProc2(HWND hwnd, long lParam)"
);
```

总结：名称只是一个标识符，它可以自由更改，只要你在定义和使用时保持一致即可。

## 发现不加 `__stdcall` 也可以正常调用，加不加 `__stdcall` 的区别是什么

在 Windows API 调用中，`__stdcall` 是一种**调用约定**（Calling Convention），它定义了函数调用时如何传递参数、如何清理堆栈等细节。在你提到的场景下，加上或不加 `__stdcall` 都可以正常调用，可能是因为所运行的平台（如 64 位 Windows 系统）默认采用了相同的调用约定。但在某些情况下，加上或不加 `__stdcall` 是有区别的，尤其在 32 位系统中或特定情况下，调用约定会影响函数调用的正确性和稳定性。

### 调用约定的作用

调用约定主要定义了以下内容：

1. **参数传递顺序**：参数是从右到左还是从左到右传递到堆栈。
2. **堆栈清理**：调用者（Caller）还是被调用者（Callee）负责清理堆栈。
3. **寄存器的使用**：是否使用寄存器传递参数，哪些寄存器需要保存。

### `__stdcall` 调用约定

- **参数传递顺序**：`__stdcall` 调用约定规定函数的参数从**右到左**传递到堆栈。
- **堆栈清理**：函数调用结束后，**被调用者**负责清理堆栈。
- **使用场景**：`__stdcall` 是 Windows API 函数的默认调用约定，尤其在 32 位系统中。

### 不加 `__stdcall` 时的调用约定（默认调用约定）

在不加 `__stdcall` 时，函数可能会采用默认的调用约定，通常是 `__cdecl`（C calling convention）。`__cdecl` 与 `__stdcall` 的主要区别在于：

- **堆栈清理**：在 `__cdecl` 调用约定下，**调用者**负责清理堆栈，而不是被调用者。
- **使用场景**：`__cdecl` 是 C/C++ 编译器默认的调用约定，尤其在 32 位系统中。
- **参数传递顺序**：参数也是从**右到左**传递到堆栈。

### 为什么不加 `__stdcall` 也能正常调用？

- **在 64 位系统**：在 64 位 Windows 系统中，调用约定不同的差异缩小了，因为大多数 64 位系统采用统一的 `x64 calling convention`，该约定规定参数通过寄存器传递，因此你不太会遇到调用约定错误导致的崩溃或错误。
- **相同的堆栈清理方式**：`__stdcall` 和 `__cdecl` 都是从右到左传递参数，因此在很多情况下即使你不加 `__stdcall`，也能正常工作，因为堆栈结构是兼容的。

### `__stdcall` 和 `__cdecl` 的主要区别

1. **堆栈清理**：
   - `__stdcall`：由被调用的函数清理堆栈。
   - `__cdecl`：由调用的函数清理堆栈。
2. **应用场景**：
   - `__stdcall`：常用于 Windows API。
   - `__cdecl`：常用于一般的 C/C++ 函数，特别是在多变参数函数（如 `printf`）中。

### 什么时候必须使用 `__stdcall`？

在以下情况下，使用 `__stdcall` 是必要的：

- 当你调用 Windows API 函数时，Windows API 通常要求使用 `__stdcall`。
- 当你在 32 位系统上工作时，调用约定错误会导致崩溃或堆栈错误，因此此时加上 `__stdcall` 更为安全。

### 总结

- **`__stdcall`** 是 Windows API 函数的默认调用约定，堆栈清理由被调用者完成，适用于大部分 Windows API 函数。
- **不加 `__stdcall`** 时，通常会使用默认的 `__cdecl`，堆栈清理由调用者完成。
- 在 64 位系统中，调用约定的差异对调用结果的影响较小，因此不加 `__stdcall` 也可能正常工作。
- 在 32 位系统中或明确要求使用 `__stdcall` 的场合，必须加上 `__stdcall`，以避免堆栈错误。
