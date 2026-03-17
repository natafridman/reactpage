import { removeBackground } from "@imgly/background-removal-node";
import fs from "fs";
import path from "path";

const inputDir = "public/images/Categorias/Mundial/Camiseta";
const outputDir = inputDir;

const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));

console.log(`Found ${files.length} images to process...`);

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const outputName = file.replace(/\.\w+$/, ".png");
  const outputPath = path.join(outputDir, outputName);

  console.log(`Processing: ${file}...`);
  try {
    const blob = await removeBackground(inputPath);
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    console.log(`  Done -> ${outputName}`);
  } catch (err) {
    console.error(`  Error: ${err.message}`);
  }
}

console.log("All done! Now run: python add-white-bg.py");
