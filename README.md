# koffi-example

## install

node version

```powershell
PS C:\Users\Administrator\Desktop\koffi-example> node -v
v18.14.0
PS C:\Users\Administrator\Desktop\koffi-example>
```

```powershell
npm install
```

## run

### 1. 遍历所有屏幕并返回句柄 id

```powershell
node desktop.js
```

result

```powershell
PS C:\Users\Administrator\Desktop\koffi-example> node desktop.js
[hwnd, lParam] 1572928 0
[hwnd, lParam] 1902364 0
[hwnd, lParam] 66012 0
[hwnd, lParam] 65936 0
[hwnd, lParam] 1311860 0
[hwnd, lParam] 264564 0
[hwnd, lParam] 65796 0
[hwnd, lParam] 131240 0
[hwnd, lParam] 131244 0
[hwnd, lParam] 131250 0
[hwnd, lParam] 196668 0
...more
[hwnd, lParam] 196706 0
[hwnd, lParam] 264112 0
EnumWindowsProc [External: 247923e8cc8]
PS C:\Users\Administrator\Desktop\koffi-example>
```

### 2. 获取所有显示器的句柄 id 和坐标

```powershell
node EnumDisplayMonitors.js
```

result

```powershell
PS C:\Users\Administrator\Desktop\koffi-example> node .\EnumDisplayMonitors.js
rect1 { x: 0, y: 0, width: 2048, height: 1152 }
Monitor handle: 131073
Monitor lprcMonitor: [External: 1fa2328ffb8]
rect1 { x: 2560, y: 0, width: 1920, height: 1080 }
Monitor handle: 65592
Monitor lprcMonitor: [External: 1fa2328ffb8]
EnumDisplayMonitors: 3.033ms
PS C:\Users\Administrator\Desktop\koffi-example>
```

## 中文文档

- https://docs.ffffee.com/electron/electron-koffi/koffi-官方例子.html
- https://docs.ffffee.com/electron/electron-koffi/koffi-定义回调函数.html
- https://docs.ffffee.com/electron/electron-koffi/koffi-遍历桌面返回所有窗口的句柄ID.html
