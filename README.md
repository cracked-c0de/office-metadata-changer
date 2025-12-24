# 🚀 Office Metadata Changer

**Office Metadata Changer** is a Node.js CLI tool for viewing and editing metadata of Microsoft Office documents.

Supported formats:

* **DOCX**
* **XLSX**
* **PPTX**
* automatic conversion from **DOC → DOCX**

This project was created as a pet project and open-source tool to explore:

* Office Open XML format
* ZIP / XML processing
* CLI UX design and architecture

---

## ✨ Features

* 📄 View current document metadata
* ✏️ Edit core Office metadata:

  * Title
  * Subject
  * Author
  * Description
  * Keywords
  * Category
  * Last Modified By
  * Created Date
  * Modified Date
* ⏱ Date input with **UTC offset** support (e.g. UTC+5)
* 👀 **Overview before saving** (change preview)
* 💾 Save modes:

  * overwrite original file
  * create a new file
* ♻️ Safe workflow (nothing is changed without confirmation)
* 🔁 `back` and `exit` commands available on most steps

---

## 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/office-metadata-changer.git
cd office-metadata-changer
```

### 2️⃣ Install dependencies

```bash
npm install
```

---

## ▶️ Usage

### Run via Node.js

```bash
node src/index.js
```

or (if `bin` is configured):

```bash
omc
```

---

## 🧭 How it works (step by step)

1. **Enter file path**

   ```
   Path to file (or type exit to quit):
   ```

2. **Automatic format detection**

   ```
   Format: DOCX
   ```

3. **View current metadata**

   ```
   title             My Document
   creator           John Doe
   created           2024-01-10 09:00:00 (UTC)
   ```

4. **Select fields to edit**

   ```
   [x] Title
   [x] Created Date
   [ ] Keywords
   ```

5. **(If dates selected) — enter UTC offset**

   ```
   +5   → UTC+5
   -3   → UTC-3
   ```

6. **Enter new values**

   ```
   New value for title:
   ```

7. **Overview (preview before saving)**

   ```
   ──────────── OVERVIEW ────────────
   title
     old : My Document
     new : New Document

   created
     input : 2025-06-01 10:00:00 (UTC+5)
     saved : 2025-06-01T05:00:00Z
   ```

8. **Confirm and save**

   ```
   How to save the file?
   new        — create a new file
   overwrite  — overwrite original file
   ```

---

## ⏱ Date handling

* Dates are entered in **your local time with offset**
* Stored in files as **UTC (W3CDTF / ISO 8601)**, as required by Office standard

Example:

```
Input :  2025-06-01 10:00 (UTC+5)
Saved :  2025-06-01T05:00:00Z
```

---

## ⌨️ CLI Commands

| Command | Description              |
| ------- | ------------------------ |
| `exit`  | Exit the program         |
| `back`  | Go back to previous step |
| `Enter` | Accept default value     |

---

## 🗂 Project Structure

```
src/
 ├─ cli/            # CLI menu and prompts
 ├─ core/           # business logic
 ├─ formats/        # DOCX / XLSX / PPTX handlers
 ├─ utils/          # helpers, formatters, banner
 └─ index.js        # entry point
```

---

## ⚠️ Limitations

* Works only with **Office Open XML** formats
* Does NOT modify:

  * image EXIF metadata
  * embedded media metadata
* Legacy `.doc` files are converted to `.docx`

---

## 🧪 Why this is a pet project

This project was created to:

* practice XML / ZIP processing
* design a clean CLI UX
* explore Office document internals
* demonstrate architectural thinking

❗ Not intended as an enterprise solution (yet 😄)

---

## 👤 Author

**cracked-c0de**
Front-End / Full-Stack Developer
Pet projects • Open-source • Education

---

## 📄 License

MIT

---

> ⭐ If you find this project useful, consider giving it a star.
