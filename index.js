// ES6 syntax: import koffi from 'koffi';
const koffi = require("koffi");

// Load the shared library
const lib = koffi.load("user32.dll");

// Declare constants
const MB_OK = 0x0;
const MB_YESNO = 0x4;
const MB_ICONQUESTION = 0x20;
const MB_ICONINFORMATION = 0x40;
const IDOK = 1;
const IDYES = 6;
const IDNO = 7;

// Find functions
// https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messageboxa
const MessageBoxA = lib.func("__stdcall", "MessageBoxA", "int", [
  "void *",
  "str",
  "str",
  "uint",
]);
const MessageBoxW = lib.func("__stdcall", "MessageBoxW", "int", [
  "void *",
  "str16",
  "str16",
  "uint",
]);

let ret = MessageBoxA(
  null,
  "Do you want another message box?",
  "Koffi",
  MB_YESNO | MB_ICONQUESTION
);
if (ret == IDYES) {
  MessageBoxW(null, "Hello World!", "Koffi", MB_ICONINFORMATION);
}
