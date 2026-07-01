function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบบริหารบุคลากร PP7 — Pakorn HRMS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
