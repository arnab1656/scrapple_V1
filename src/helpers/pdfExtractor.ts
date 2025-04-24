import fs from "fs";
import path from "path";

export const pdfExtractor = () => {
  const pdfPath = path.join(
    process.cwd(),
    "public",
    "Arnab_Full_Stack_Resume.pdf"
  );
  const pdfContent = fs.readFileSync(pdfPath);

  return pdfContent;
};
