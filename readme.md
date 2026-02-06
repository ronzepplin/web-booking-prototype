# St. Nikolaus Tower Tour – Demo Web Platform

This project is a **demo web platform** created as part of an academic course.  
It presents a fictional but realistic website for the **St. Nikolaus Church Tower Tour event** in Rosenheim.

The website is designed to demonstrate:
- Semantic HTML structure
- Responsive layout
- Basic interaction using JavaScript
- Bi-lingual support (English / German)
- Reusable components (header & footer)
- Clear information architecture for a cultural / heritage website

⚠️ **This is a demo project only.**  
No real bookings, payments, or commercial services are provided.

---

## Features

- Fully static website (HTML, CSS, JavaScript)
- Responsive design (desktop & mobile)
- Bilingual content (EN / DE) using JSON-based i18n
- Reusable header and footer components
- Accessible navigation and semantic markup
- Legal pages (Impressum, Data Protection, Terms, Safety, Cookies)
- Image galleries with optional zoom interaction
- Clear separation of content, styles, and logic

---

## Technologies Used

- **HTML5** – semantic page structure
- **CSS3** – layout, typography, responsive design
- **JavaScript (Vanilla)** – component loading & language switching
- **JSON** – internationalization (i18n)
- **Markdown** – project documentation

No frameworks or external libraries are used.

---

## Project Structure

PROJECT ST NIKOLAUS
│
├── index.html
├── history.html
├── gallery.html
├── tower-tour.html
├── top-view.html
├── attic.html
├── bells.html
├── baselbag.html
├── church-tour.html
├── guide.html
├── book-tour.html
├── payment.html
├── thank-you.html
├── contact.html
├── impressum.html
├── data-protection.html
├── terms.html
├── safety.html
├── cookie-policy.html
│
├── assets/
│ ├── css/
│ │ └── styles.css
│ ├── js/
│ │ └── app.js
│ ├── img/
│ │ ├── home/
│ │ ├── history/
│ │ ├── gallery/
│ │ ├── tower-tour/
│ │ ├── attic/
│ │ ├── bells/
│ │ ├── baselbalg/
│ │ ├── church-tour/
│ │ └── top-view/
│ └── video/
│
├── components/
│ ├── header.html
│ └── footer.html
│
├── locales/
│ ├── en.json
│ └── de.json
│
└── readme.md


---

## How to Use the Project

1. Download or unzip the project folder
2. Open `index.html` in a modern web browser
3. Use the language switcher (EN / DE) in the header
4. Navigate through pages using the main navigation and footer links

No build process or server is required.

---

## Internationalization (i18n)

- Text content is stored in:
  - `locales/en.json`
  - `locales/de.json`
- Each translatable element uses a `data-i18n` attribute
- Language switching is handled in `assets/js/app.js`
- The selected language applies across all pages

---

## Accessibility & Design Notes

- Semantic HTML elements are used (`header`, `nav`, `main`, `section`, `footer`)
- Images include descriptive `alt` attributes
- Text contrast and spacing are optimized for readability
- Layout adapts to mobile and desktop screens
- Interactive elements are keyboard accessible where applicable

---

## Disclaimer

This website is a **demo project for a university course**.

- All names, roles, and descriptions are fictional
- Images are used for illustrative purposes
- No real payments or bookings are processed
- The project is not affiliated with an actual organization

---

## Author
sm-rahmatullah
Created as part of an academic web development course  
© 2025–2026 – Demo Project

---

## License

This project is intended **for educational use only**.
