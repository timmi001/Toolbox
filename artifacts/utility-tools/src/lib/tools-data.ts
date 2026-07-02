export type ToolCategory = 'text' | 'developer' | 'image' | 'pdf' | 'calculators' | 'seo' | 'file-conversion';

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  trending?: boolean;
  popular?: boolean;
  new?: boolean;
  icon: string;
};

export const toolsData: Tool[] = [
  // Text Tools
  { slug: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, paragraphs, and reading time in real-time.', category: 'text', keywords: ['word count', 'character count', 'reading time'], popular: true, icon: 'FileText' },
  { slug: 'character-counter', name: 'Character Counter', description: 'Count characters with and without spaces.', category: 'text', keywords: ['character count', 'letters', 'length'], icon: 'Type' },
  { slug: 'line-counter', name: 'Line Counter', description: 'Count total lines, blank lines, and non-blank lines.', category: 'text', keywords: ['lines', 'count lines', 'text lines'], icon: 'AlignLeft' },
  { slug: 'paragraph-counter', name: 'Paragraph Counter', description: 'Count paragraphs and average words per paragraph.', category: 'text', keywords: ['paragraphs', 'count'], icon: 'AlignJustify' },
  { slug: 'reading-time', name: 'Reading Time Calculator', description: 'Calculate reading time at various WPM speeds.', category: 'text', keywords: ['reading time', 'wpm', 'speed'], icon: 'Clock' },
  { slug: 'case-converter', name: 'Case Converter', description: 'Convert text to uppercase, lowercase, title case, and more.', category: 'text', keywords: ['uppercase', 'lowercase', 'camelcase'], popular: true, icon: 'CaseUpper' },
  { slug: 'remove-duplicate-lines', name: 'Remove Duplicate Lines', description: 'Find and remove duplicate lines from your text.', category: 'text', keywords: ['duplicates', 'clean text', 'unique'], icon: 'ListMinus' },
  { slug: 'alphabetical-sorter', name: 'Alphabetical Sorter', description: 'Sort lines alphabetically (A-Z or Z-A).', category: 'text', keywords: ['sort', 'alphabetical', 'order'], icon: 'ArrowDownAZ' },
  { slug: 'reverse-text', name: 'Reverse Text', description: 'Reverse entire text or reverse each word.', category: 'text', keywords: ['reverse', 'backwards', 'flip text'], icon: 'ArrowLeftRight' },
  { slug: 'random-text-generator', name: 'Random Text Generator', description: 'Generate random words, sentences, or paragraphs.', category: 'text', keywords: ['random', 'generator', 'words'], icon: 'Shuffle' },
  { slug: 'lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate Lorem Ipsum dummy text.', category: 'text', keywords: ['lorem ipsum', 'dummy text', 'placeholder'], popular: true, icon: 'FileType' },
  { slug: 'slug-generator', name: 'Slug Generator', description: 'Convert text to a URL-friendly slug.', category: 'text', keywords: ['slug', 'url', 'seo'], icon: 'Link2' },
  { slug: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate title, description, keyword, and robots meta tags for any page.', category: 'seo', keywords: ['meta tags', 'seo', 'html'], icon: 'Tag' },
  { slug: 'robots-generator', name: 'Robots.txt Generator', description: 'Create a simple robots.txt file with allow and disallow rules.', category: 'seo', keywords: ['robots', 'seo', 'crawl'], icon: 'Bot' },
  { slug: 'sitemap-generator', name: 'Sitemap Generator', description: 'Generate a basic XML sitemap from your page list.', category: 'seo', keywords: ['sitemap', 'xml', 'seo'], icon: 'Map' },
  { slug: 'serp-preview', name: 'SERP Preview', description: 'Preview how your page title and description may look in search results.', category: 'seo', keywords: ['serp', 'seo', 'preview'], icon: 'Search' },
  { slug: 'schema-markup-generator', name: 'Schema Markup Generator', description: 'Create JSON-LD schema markup for your website or business.', category: 'seo', keywords: ['schema', 'json-ld', 'seo'], icon: 'Code2' },
  { slug: 'open-graph-generator', name: 'Open Graph Generator', description: 'Generate Open Graph tags for elegant social previews.', category: 'seo', keywords: ['open graph', 'social preview', 'seo'], icon: 'Share2' },
  { slug: 'url-encoder', name: 'URL Encoder', description: 'Encode URL or URL components.', category: 'text', keywords: ['encode', 'url', 'percent encoding'], icon: 'Lock' },
  { slug: 'url-decoder', name: 'URL Decoder', description: 'Decode URL-encoded strings.', category: 'text', keywords: ['decode', 'url', 'percent decoding'], icon: 'Unlock' },
  { slug: 'text-cleaner', name: 'Text Cleaner', description: 'Remove extra spaces and special characters.', category: 'text', keywords: ['clean', 'format', 'spaces'], icon: 'Eraser' },
  { slug: 'whitespace-remover', name: 'Whitespace Remover', description: 'Trim leading, trailing, or all whitespace.', category: 'text', keywords: ['whitespace', 'trim', 'spaces'], icon: 'Space' },
  { slug: 'duplicate-word-finder', name: 'Duplicate Word Finder', description: 'Find and highlight duplicate words in text.', category: 'text', keywords: ['duplicate', 'words', 'finder'], icon: 'Search' },
  { slug: 'keyword-density', name: 'Keyword Density', description: 'Analyze keyword frequency and density percentage.', category: 'text', keywords: ['seo', 'keywords', 'density'], icon: 'BarChart' },
  { slug: 'html-stripper', name: 'HTML Stripper', description: 'Strip HTML tags from text to get plain text.', category: 'text', keywords: ['html', 'strip', 'plain text'], icon: 'Code' },
  { slug: 'markdown-preview', name: 'Markdown Preview', description: 'Live preview markdown to HTML.', category: 'text', keywords: ['markdown', 'preview', 'html'], icon: 'FileCode' },

  // Developer Tools
  { slug: 'json-formatter', name: 'JSON Formatter', description: 'Pretty-print JSON with syntax highlighting.', category: 'developer', keywords: ['json', 'format', 'pretty'], popular: true, icon: 'Braces' },
  { slug: 'json-validator', name: 'JSON Validator', description: 'Validate JSON and find errors.', category: 'developer', keywords: ['json', 'validate', 'lint'], icon: 'CheckCircle' },
  { slug: 'json-minifier', name: 'JSON Minifier', description: 'Minify JSON to reduce file size.', category: 'developer', keywords: ['json', 'minify', 'compress'], icon: 'Minimize' },
  { slug: 'json-beautifier', name: 'JSON Beautifier', description: 'Beautify JSON with configurable indentation.', category: 'developer', keywords: ['json', 'beautify', 'indent'], icon: 'Code' },
  { slug: 'base64-encode', name: 'Base64 Encode', description: 'Encode text to Base64 format.', category: 'developer', keywords: ['base64', 'encode', 'data'], icon: 'Binary' },
  { slug: 'base64-decode', name: 'Base64 Decode', description: 'Decode Base64 strings to plain text.', category: 'developer', keywords: ['base64', 'decode', 'data'], icon: 'FileDigit' },
  { slug: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUIDs (v4).', category: 'developer', keywords: ['uuid', 'guid', 'random'], trending: true, icon: 'Hash' },
  { slug: 'md5-generator', name: 'MD5 Generator', description: 'Compute MD5 hash of input text.', category: 'developer', keywords: ['md5', 'hash', 'crypto'], icon: 'Shield' },
  { slug: 'sha256-generator', name: 'SHA-256 Generator', description: 'Compute SHA-256 hash using Web Crypto API.', category: 'developer', keywords: ['sha256', 'hash', 'secure'], icon: 'Lock' },
  { slug: 'unix-timestamp', name: 'Unix Timestamp Converter', description: 'Convert Unix timestamp to readable date/time.', category: 'developer', keywords: ['unix', 'timestamp', 'date', 'epoch'], icon: 'Clock' },
  { slug: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions against text.', category: 'developer', keywords: ['regex', 'regular expression', 'test'], icon: 'SearchCode' },
  { slug: 'html-encoder', name: 'HTML Encoder', description: 'Encode HTML entities safely.', category: 'developer', keywords: ['html', 'encode', 'entities'], icon: 'Code2' },
  { slug: 'html-decoder', name: 'HTML Decoder', description: 'Decode HTML entities back to characters.', category: 'developer', keywords: ['html', 'decode', 'entities'], icon: 'FileCode2' },
  { slug: 'url-parser', name: 'URL Parser', description: 'Parse URL into protocol, host, path, and params.', category: 'developer', keywords: ['url', 'parse', 'components'], icon: 'Link' },
  { slug: 'css-gradient', name: 'CSS Gradient Generator', description: 'Visual CSS gradient generator with live preview.', category: 'developer', keywords: ['css', 'gradient', 'design'], popular: true, icon: 'Palette' },
  { slug: 'hex-to-rgb', name: 'HEX to RGB', description: 'Convert HEX color to RGB/HSL.', category: 'developer', keywords: ['hex', 'rgb', 'color'], icon: 'Droplet' },
  { slug: 'rgb-to-hex', name: 'RGB to HEX', description: 'Convert RGB color to HEX.', category: 'developer', keywords: ['rgb', 'hex', 'color'], icon: 'Paintbucket' },
  { slug: 'color-picker', name: 'Color Picker', description: 'Pick colors and get HEX, RGB, and HSL values.', category: 'developer', keywords: ['color', 'picker', 'swatch'], icon: 'Pipette' },
  { slug: 'css-box-shadow-generator', name: 'CSS Box Shadow Generator', description: 'Create custom box shadow styles and copy the CSS instantly.', category: 'developer', keywords: ['css', 'box shadow', 'design'], icon: 'Layers' },
  { slug: 'css-button-generator', name: 'CSS Button Generator', description: 'Generate polished button styles with ready-to-use CSS.', category: 'developer', keywords: ['css', 'button', 'ui'], icon: 'MousePointerSquare' },
  { slug: 'palette-generator', name: 'Palette Generator', description: 'Generate harmonious color palettes for your next design.', category: 'developer', keywords: ['palette', 'color', 'design'], icon: 'Palette' },
  { slug: 'hex-rgb-converter', name: 'HEX ↔ RGB Converter', description: 'Switch seamlessly between HEX and RGB color formats.', category: 'developer', keywords: ['hex', 'rgb', 'color converter'], icon: 'Droplets' },
  { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JWT header and payload.', category: 'developer', keywords: ['jwt', 'token', 'decode'], trending: true, icon: 'Key' },
  { slug: 'qr-code', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs.', category: 'developer', keywords: ['qr code', 'generate', 'barcode'], new: true, icon: 'QrCode' },

  // Image Tools
  { slug: 'image-compressor', name: 'Image Compressor', description: 'Compress JPEG/PNG images to reduce file size.', category: 'image', keywords: ['image', 'compress', 'size'], popular: true, icon: 'Minimize2' },
  { slug: 'image-resizer', name: 'Image Resizer', description: 'Resize images to custom dimensions.', category: 'image', keywords: ['image', 'resize', 'dimensions'], icon: 'Scaling' },
  { slug: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPG images to PNG format.', category: 'image', keywords: ['convert', 'jpg', 'png'], popular: true, icon: 'Image' },
  { slug: 'png-to-jpg', name: 'PNG to JPG', description: 'Convert PNG images to JPG format.', category: 'image', keywords: ['convert', 'png', 'jpg'], icon: 'Image' },
  { slug: 'png-to-webp', name: 'PNG to WebP', description: 'Convert PNG images to WebP format.', category: 'image', keywords: ['convert', 'png', 'webp'], trending: true, icon: 'Image' },
  { slug: 'webp-to-png', name: 'WebP to PNG', description: 'Convert WebP images to PNG format.', category: 'image', keywords: ['convert', 'webp', 'png'], icon: 'Image' },
  { slug: 'image-to-base64', name: 'Image to Base64', description: 'Convert images to Base64 data URLs.', category: 'image', keywords: ['image', 'base64', 'data url'], icon: 'Code' },
  { slug: 'base64-to-image', name: 'Base64 to Image', description: 'Convert Base64 strings to images.', category: 'image', keywords: ['base64', 'image', 'decode'], icon: 'Image' },
  { slug: 'svg-viewer', name: 'SVG Viewer', description: 'Preview and download SVG code as images.', category: 'image', keywords: ['svg', 'viewer', 'preview'], icon: 'Image' },
  { slug: 'favicon-generator', name: 'Favicon Generator', description: 'Generate ICO and multi-size favicons from images.', category: 'image', keywords: ['favicon', 'icon', 'generate'], icon: 'AppWindow' },
  { slug: 'image-metadata', name: 'Image Metadata Viewer', description: 'View EXIF and other image metadata.', category: 'image', keywords: ['image', 'metadata', 'exif'], icon: 'Info' },
  { slug: 'dominant-color', name: 'Dominant Color Extractor', description: 'Extract dominant colors from an image.', category: 'image', keywords: ['color', 'palette', 'extract'], icon: 'Palette' },
  { slug: 'blur-image', name: 'Blur Image', description: 'Apply blur filter to images.', category: 'image', keywords: ['blur', 'filter', 'image'], icon: 'Image' },
  { slug: 'sharpen-image', name: 'Sharpen Image', description: 'Apply sharpening filter to images.', category: 'image', keywords: ['sharpen', 'filter', 'image'], icon: 'Image' },
  { slug: 'convert-ico', name: 'Convert to ICO', description: 'Convert PNG/JPG to ICO format.', category: 'image', keywords: ['ico', 'icon', 'convert'], icon: 'Image' },
  { slug: 'image-dimensions', name: 'Image Dimensions Checker', description: 'Check width, height, and aspect ratio of images.', category: 'image', keywords: ['dimensions', 'size', 'aspect ratio'], icon: 'Maximize' },
  { slug: 'screenshot-frame', name: 'Screenshot Frame Adder', description: 'Add browser or device frames to screenshots.', category: 'image', keywords: ['screenshot', 'frame', 'device'], new: true, icon: 'Monitor' },
  { slug: 'bg-remover', name: 'Background Remover & Object Eraser', description: 'Remove backgrounds or erase objects from images by clicking on the color to erase. Exports transparent PNG.', category: 'image', keywords: ['background removal', 'transparent', 'object eraser', 'png'], new: true, icon: 'Eraser' },
  { slug: 'hi-res-export', name: 'High Resolution PNG Export', description: 'Upscale and export images at 2×, 3×, 4×, 6× or 8× resolution as high-quality PNG files.', category: 'image', keywords: ['upscale', 'high resolution', 'png export', 'enlarge'], new: true, icon: 'Maximize2' },

  // File Conversion Tools
  { slug: 'mp4-to-mp3', name: 'MP4 to MP3', description: 'Convert video files to audio-only MP3 format for podcasts, voice notes, and music extraction.', category: 'file-conversion', keywords: ['video', 'audio', 'mp3', 'convert'], new: true, icon: 'Music' },
  { slug: 'zip-extractor', name: 'ZIP Extractor', description: 'Extract ZIP archives and browse the file contents directly in your browser.', category: 'file-conversion', keywords: ['zip', 'archive', 'extract'], new: true, icon: 'Archive' },
  { slug: 'file-compressor', name: 'File Compressor', description: 'Compress files into smaller archives with a simple drag-and-drop workflow.', category: 'file-conversion', keywords: ['compress', 'archive', 'zip'], new: true, icon: 'FileArchive' },
  { slug: 'epub-to-pdf', name: 'EPUB to PDF', description: 'Convert EPUB documents into a polished PDF layout for easy reading and sharing.', category: 'file-conversion', keywords: ['epub', 'pdf', 'convert'], new: true, icon: 'BookOpen' },
  { slug: 'excel-to-csv', name: 'Excel to CSV', description: 'Convert spreadsheet data to CSV format for easier import and analysis.', category: 'file-conversion', keywords: ['excel', 'csv', 'spreadsheet'], new: true, icon: 'FileSpreadsheet' },
  { slug: 'csv-to-json', name: 'CSV to JSON', description: 'Transform CSV data into JSON objects for APIs, apps, and scripts.', category: 'file-conversion', keywords: ['csv', 'json', 'convert'], new: true, icon: 'Braces' },

  // PDF Tools
  { slug: 'merge-pdf', name: 'Merge PDF', description: 'Merge multiple PDF files into one.', category: 'pdf', keywords: ['pdf', 'merge', 'combine'], popular: true, icon: 'Files' },
  { slug: 'split-pdf', name: 'Split PDF', description: 'Split PDF into separate files by page range.', category: 'pdf', keywords: ['pdf', 'split', 'divide'], icon: 'SplitSquareHorizontal' },
  { slug: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size without losing quality.', category: 'pdf', keywords: ['pdf', 'compress', 'reduce'], popular: true, icon: 'FileArchive' },
  { slug: 'rotate-pdf', name: 'Rotate PDF Pages', description: 'Rotate PDF pages by 90°, 180°, or 270°.', category: 'pdf', keywords: ['pdf', 'rotate', 'turn'], icon: 'RotateCw' },
  { slug: 'delete-pdf-pages', name: 'Delete PDF Pages', description: 'Remove specific pages from a PDF file.', category: 'pdf', keywords: ['pdf', 'delete', 'remove'], icon: 'FileX' },
  { slug: 'rearrange-pdf-pages', name: 'Rearrange PDF Pages', description: 'Change the order of pages in a PDF.', category: 'pdf', keywords: ['pdf', 'rearrange', 'order'], icon: 'ArrowUpDown' },
  { slug: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert PDF pages to JPG images.', category: 'pdf', keywords: ['pdf', 'jpg', 'convert'], trending: true, icon: 'Image' },
  { slug: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG images into a single PDF.', category: 'pdf', keywords: ['jpg', 'pdf', 'convert'], icon: 'FileText' },
  { slug: 'png-to-pdf', name: 'PNG to PDF', description: 'Convert PNG images into a single PDF.', category: 'pdf', keywords: ['png', 'pdf', 'convert'], icon: 'FileText' },
  { slug: 'pdf-page-extractor', name: 'PDF Page Extractor', description: 'Extract specific pages from a PDF to a new file.', category: 'pdf', keywords: ['pdf', 'extract', 'pages'], icon: 'FilePlus' },
  { slug: 'watermark-pdf', name: 'Watermark PDF', description: 'Add text watermark to PDF pages.', category: 'pdf', keywords: ['pdf', 'watermark', 'stamp'], icon: 'Droplets' },
  { slug: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password protection from PDF files.', category: 'pdf', keywords: ['pdf', 'unlock', 'password'], icon: 'Unlock' },
  { slug: 'protect-pdf', name: 'Protect PDF', description: 'Add password protection to PDF files.', category: 'pdf', keywords: ['pdf', 'protect', 'encrypt'], icon: 'Lock' },
  { slug: 'add-page-numbers', name: 'Add Page Numbers', description: 'Add page numbers to PDF footer.', category: 'pdf', keywords: ['pdf', 'page numbers', 'footer'], icon: 'ListOrdered' },
  { slug: 'pdf-metadata', name: 'PDF Metadata Viewer', description: 'View PDF document metadata (title, author, etc).', category: 'pdf', keywords: ['pdf', 'metadata', 'properties'], icon: 'Info' },
  { slug: 'pdf-size-checker', name: 'PDF Size Checker', description: 'Check detailed PDF file size information.', category: 'pdf', keywords: ['pdf', 'size', 'info'], icon: 'HardDrive' },
  { slug: 'pdf-page-counter', name: 'PDF Page Counter', description: 'Count total pages in a PDF file.', category: 'pdf', keywords: ['pdf', 'pages', 'count'], icon: 'Hash' },
  { slug: 'pdf-preview', name: 'PDF Preview', description: 'Preview PDF pages directly in the browser.', category: 'pdf', keywords: ['pdf', 'preview', 'view'], icon: 'Eye' },
  { slug: 'pdf-orientation', name: 'PDF Orientation Fixer', description: 'Detect and fix incorrect PDF page orientation.', category: 'pdf', keywords: ['pdf', 'orientation', 'rotate'], icon: 'LayoutTemplate' },
  { slug: 'pdf-thumbnail', name: 'PDF Thumbnail Generator', description: 'Generate image thumbnails from PDF files.', category: 'pdf', keywords: ['pdf', 'thumbnail', 'image'], new: true, icon: 'Image' },
  { slug: 'pdf-editor', name: 'PDF Editor', description: 'Add text annotations to any PDF page and download the edited document.', category: 'pdf', keywords: ['pdf', 'editor', 'annotate', 'text'], new: true, icon: 'PenLine' },

  // Calculators & Converters
  { slug: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages easily.', category: 'calculators', keywords: ['percentage', 'math', 'calculator'], popular: true, icon: 'Percent' },
  { slug: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age in years, months, and days.', category: 'calculators', keywords: ['age', 'date of birth', 'calculator'], icon: 'CalendarDays' },
  { slug: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate Body Mass Index.', category: 'calculators', keywords: ['bmi', 'health', 'weight'], icon: 'Activity' },
  { slug: 'date-difference', name: 'Date Difference Calculator', description: 'Calculate days between two dates.', category: 'calculators', keywords: ['date', 'difference', 'days'], icon: 'CalendarClock' },
  { slug: 'time-duration', name: 'Time Duration Calculator', description: 'Add or subtract time durations.', category: 'calculators', keywords: ['time', 'duration', 'calculator'], icon: 'Clock' },
  { slug: 'unit-converter', name: 'Unit Converter', description: 'Convert between different units of measurement.', category: 'calculators', keywords: ['unit', 'convert', 'measurement'], popular: true, icon: 'Ruler' },
  { slug: 'currency-converter', name: 'Currency Converter', description: 'Convert between major currencies.', category: 'calculators', keywords: ['currency', 'money', 'exchange'], icon: 'Coins' },
  { slug: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate price after discount.', category: 'calculators', keywords: ['discount', 'sale', 'price'], icon: 'Tags' },
  { slug: 'profit-margin', name: 'Profit Margin Calculator', description: 'Calculate gross profit and margin percentage.', category: 'calculators', keywords: ['profit', 'margin', 'business'], icon: 'TrendingUp' },
  { slug: 'compound-interest', name: 'Compound Interest Calculator', description: 'Calculate compound interest over time.', category: 'calculators', keywords: ['interest', 'compound', 'finance'], trending: true, icon: 'LineChart' },
  { slug: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate loan payments and total interest.', category: 'calculators', keywords: ['loan', 'mortgage', 'payment'], icon: 'Landmark' },
  { slug: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate monthly mortgage payments.', category: 'calculators', keywords: ['mortgage', 'home', 'loan'], icon: 'Home' },
  { slug: 'fuel-cost', name: 'Fuel Cost Calculator', description: 'Calculate total fuel cost for a trip.', category: 'calculators', keywords: ['fuel', 'gas', 'cost'], icon: 'Car' },
  { slug: 'vat-calculator', name: 'VAT Calculator', description: 'Calculate price with or without VAT.', category: 'calculators', keywords: ['vat', 'tax', 'price'], icon: 'Receipt' },
  { slug: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills.', category: 'calculators', keywords: ['tip', 'gratuity', 'restaurant'], icon: 'Utensils' },
  { slug: 'average-calculator', name: 'Average Calculator', description: 'Calculate mean, median, mode, and standard deviation.', category: 'calculators', keywords: ['average', 'mean', 'math'], icon: 'Sigma' },
  { slug: 'scientific-calculator', name: 'Scientific Calculator', description: 'Advanced scientific calculator.', category: 'calculators', keywords: ['calculator', 'math', 'scientific'], icon: 'Calculator' },
  { slug: 'gpa-calculator', name: 'GPA Calculator', description: 'Calculate weighted GPA from courses.', category: 'calculators', keywords: ['gpa', 'grades', 'school'], icon: 'GraduationCap' },
  { slug: 'timezone-converter', name: 'Timezone Converter', description: 'Convert time between different timezones.', category: 'calculators', keywords: ['timezone', 'time', 'world'], icon: 'Globe' },
  { slug: 'binary-calculator', name: 'Binary Calculator', description: 'Perform arithmetic on binary numbers.', category: 'calculators', keywords: ['binary', 'math', 'developer'], new: true, icon: 'Binary' }
];

export const getToolsByCategory = (category: ToolCategory) => toolsData.filter(t => t.category === category);
export const getToolBySlug = (slug: string) => toolsData.find(t => t.slug === slug);
export const searchTools = (query: string) => {
  const q = query.toLowerCase();
  return toolsData.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q) || 
    t.keywords.some(k => k.toLowerCase().includes(q))
  );
};
