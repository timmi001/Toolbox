import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import React, { Suspense } from "react";

import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";
import BlogIndex from "@/pages/blog/BlogIndex";
import BlogPost from "@/pages/blog/BlogPost";

const Loading = () => <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tool...</div>;
const L = (imp: () => Promise<{ default: React.ComponentType }>) => {
  const C = React.lazy(imp);
  return () => <Suspense fallback={<Loading />}><C /></Suspense>;
};

// Text Tools
const WordCounter = L(() => import("@/pages/tools/text/word-counter"));
const CharacterCounter = L(() => import("@/pages/tools/text/character-counter"));
const CaseConverter = L(() => import("@/pages/tools/text/case-converter"));
const LineCounter = L(() => import("@/pages/tools/text/line-counter"));
const ParagraphCounter = L(() => import("@/pages/tools/text/paragraph-counter"));
const ReverseText = L(() => import("@/pages/tools/text/reverse-text"));
const RemoveDuplicateLines = L(() => import("@/pages/tools/text/remove-duplicate-lines"));
const AlphabeticalSorter = L(() => import("@/pages/tools/text/alphabetical-sorter"));
const LoremIpsum = L(() => import("@/pages/tools/text/lorem-ipsum"));
const SlugGenerator = L(() => import("@/pages/tools/text/slug-generator"));
const UrlEncoder = L(() => import("@/pages/tools/text/url-encoder"));
const UrlDecoder = L(() => import("@/pages/tools/text/url-decoder"));
const TextCleaner = L(() => import("@/pages/tools/text/text-cleaner"));
const WhitespaceRemover = L(() => import("@/pages/tools/text/whitespace-remover"));
const DuplicateWordFinder = L(() => import("@/pages/tools/text/duplicate-word-finder"));
const ReadingTime = L(() => import("@/pages/tools/text/reading-time"));
const RandomTextGenerator = L(() => import("@/pages/tools/text/random-text-generator"));
const KeywordDensity = L(() => import("@/pages/tools/text/keyword-density"));
const HtmlStripper = L(() => import("@/pages/tools/text/html-stripper"));
const MarkdownPreview = L(() => import("@/pages/tools/text/markdown-preview"));

// Developer Tools
const JsonFormatter = L(() => import("@/pages/tools/developer/json-formatter"));
const JsonValidator = L(() => import("@/pages/tools/developer/json-validator"));
const JsonMinifier = L(() => import("@/pages/tools/developer/json-minifier"));
const JsonBeautifier = L(() => import("@/pages/tools/developer/json-beautifier"));
const Base64Encode = L(() => import("@/pages/tools/developer/base64-encode"));
const Base64Decode = L(() => import("@/pages/tools/developer/base64-decode"));
const UuidGenerator = L(() => import("@/pages/tools/developer/uuid-generator"));
const Md5Generator = L(() => import("@/pages/tools/developer/md5-generator"));
const Sha256Generator = L(() => import("@/pages/tools/developer/sha256-generator"));
const UnixTimestamp = L(() => import("@/pages/tools/developer/unix-timestamp"));
const RegexTester = L(() => import("@/pages/tools/developer/regex-tester"));
const HtmlEncoder = L(() => import("@/pages/tools/developer/html-encoder"));
const HtmlDecoder = L(() => import("@/pages/tools/developer/html-decoder"));
const UrlParser = L(() => import("@/pages/tools/developer/url-parser"));
const CssGradient = L(() => import("@/pages/tools/developer/css-gradient"));
const HexToRgb = L(() => import("@/pages/tools/developer/hex-to-rgb"));
const RgbToHex = L(() => import("@/pages/tools/developer/rgb-to-hex"));
const ColorPicker = L(() => import("@/pages/tools/developer/color-picker"));
const JwtDecoder = L(() => import("@/pages/tools/developer/jwt-decoder"));
const QrCode = L(() => import("@/pages/tools/developer/qr-code"));

// Image Tools
const ImageCompressor = L(() => import("@/pages/tools/image/image-compressor"));
const ImageResizer = L(() => import("@/pages/tools/image/image-resizer"));
const CropImage = L(() => import("@/pages/tools/image/crop-image"));
const RotateImage = L(() => import("@/pages/tools/image/rotate-image"));
const FlipImage = L(() => import("@/pages/tools/image/flip-image"));
const JpgToPng = L(() => import("@/pages/tools/image/jpg-to-png"));
const PngToJpg = L(() => import("@/pages/tools/image/png-to-jpg"));
const PngToWebp = L(() => import("@/pages/tools/image/png-to-webp"));
const WebpToPng = L(() => import("@/pages/tools/image/webp-to-png"));
const ImageToBase64 = L(() => import("@/pages/tools/image/image-to-base64"));
const Base64ToImage = L(() => import("@/pages/tools/image/base64-to-image"));
const SvgViewer = L(() => import("@/pages/tools/image/svg-viewer"));
const FaviconGenerator = L(() => import("@/pages/tools/image/favicon-generator"));
const ImageMetadata = L(() => import("@/pages/tools/image/image-metadata"));
const DominantColor = L(() => import("@/pages/tools/image/dominant-color"));
const BlurImage = L(() => import("@/pages/tools/image/blur-image"));
const SharpenImage = L(() => import("@/pages/tools/image/sharpen-image"));
const ConvertIco = L(() => import("@/pages/tools/image/convert-ico"));
const ImageDimensions = L(() => import("@/pages/tools/image/image-dimensions"));
const ScreenshotFrame = L(() => import("@/pages/tools/image/screenshot-frame"));

// PDF Tools
const MergePdf = L(() => import("@/pages/tools/pdf/merge-pdf"));
const SplitPdf = L(() => import("@/pages/tools/pdf/split-pdf"));
const CompressPdf = L(() => import("@/pages/tools/pdf/compress-pdf"));
const RotatePdf = L(() => import("@/pages/tools/pdf/rotate-pdf"));
const DeletePdfPages = L(() => import("@/pages/tools/pdf/delete-pdf-pages"));
const RearrangePdfPages = L(() => import("@/pages/tools/pdf/rearrange-pdf-pages"));
const PdfToJpg = L(() => import("@/pages/tools/pdf/pdf-to-jpg"));
const JpgToPdf = L(() => import("@/pages/tools/pdf/jpg-to-pdf"));
const PngToPdf = L(() => import("@/pages/tools/pdf/png-to-pdf"));
const PdfPageExtractor = L(() => import("@/pages/tools/pdf/pdf-page-extractor"));
const WatermarkPdf = L(() => import("@/pages/tools/pdf/watermark-pdf"));
const UnlockPdf = L(() => import("@/pages/tools/pdf/unlock-pdf"));
const ProtectPdf = L(() => import("@/pages/tools/pdf/protect-pdf"));
const AddPageNumbers = L(() => import("@/pages/tools/pdf/add-page-numbers"));
const PdfMetadata = L(() => import("@/pages/tools/pdf/pdf-metadata"));
const PdfSizeChecker = L(() => import("@/pages/tools/pdf/pdf-size-checker"));
const PdfPageCounter = L(() => import("@/pages/tools/pdf/pdf-page-counter"));
const PdfPreview = L(() => import("@/pages/tools/pdf/pdf-preview"));
const PdfOrientation = L(() => import("@/pages/tools/pdf/pdf-orientation"));
const PdfThumbnail = L(() => import("@/pages/tools/pdf/pdf-thumbnail"));

// Calculator Tools
const PercentageCalculator = L(() => import("@/pages/tools/calculators/percentage-calculator"));
const AgeCalculator = L(() => import("@/pages/tools/calculators/age-calculator"));
const BmiCalculator = L(() => import("@/pages/tools/calculators/bmi-calculator"));
const DateDifference = L(() => import("@/pages/tools/calculators/date-difference"));
const TimeDuration = L(() => import("@/pages/tools/calculators/time-duration"));
const UnitConverter = L(() => import("@/pages/tools/calculators/unit-converter"));
const CurrencyConverter = L(() => import("@/pages/tools/calculators/currency-converter"));
const DiscountCalculator = L(() => import("@/pages/tools/calculators/discount-calculator"));
const ProfitMargin = L(() => import("@/pages/tools/calculators/profit-margin"));
const CompoundInterest = L(() => import("@/pages/tools/calculators/compound-interest"));
const LoanCalculator = L(() => import("@/pages/tools/calculators/loan-calculator"));
const MortgageCalculator = L(() => import("@/pages/tools/calculators/mortgage-calculator"));
const FuelCost = L(() => import("@/pages/tools/calculators/fuel-cost"));
const VatCalculator = L(() => import("@/pages/tools/calculators/vat-calculator"));
const TipCalculator = L(() => import("@/pages/tools/calculators/tip-calculator"));
const AverageCalculator = L(() => import("@/pages/tools/calculators/average-calculator"));
const ScientificCalculator = L(() => import("@/pages/tools/calculators/scientific-calculator"));
const GpaCalculator = L(() => import("@/pages/tools/calculators/gpa-calculator"));
const TimezoneConverter = L(() => import("@/pages/tools/calculators/timezone-converter"));
const BinaryCalculator = L(() => import("@/pages/tools/calculators/binary-calculator"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />

        {/* Categories */}
        <Route path="/text-tools" component={CategoryPage} />
        <Route path="/developer-tools" component={CategoryPage} />
        <Route path="/image-tools" component={CategoryPage} />
        <Route path="/pdf-tools" component={CategoryPage} />
        <Route path="/calculators" component={CategoryPage} />

        {/* Blog */}
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* Text Tools */}
        <Route path="/tools/text/word-counter" component={WordCounter} />
        <Route path="/tools/text/character-counter" component={CharacterCounter} />
        <Route path="/tools/text/case-converter" component={CaseConverter} />
        <Route path="/tools/text/line-counter" component={LineCounter} />
        <Route path="/tools/text/paragraph-counter" component={ParagraphCounter} />
        <Route path="/tools/text/reverse-text" component={ReverseText} />
        <Route path="/tools/text/remove-duplicate-lines" component={RemoveDuplicateLines} />
        <Route path="/tools/text/alphabetical-sorter" component={AlphabeticalSorter} />
        <Route path="/tools/text/lorem-ipsum" component={LoremIpsum} />
        <Route path="/tools/text/slug-generator" component={SlugGenerator} />
        <Route path="/tools/text/url-encoder" component={UrlEncoder} />
        <Route path="/tools/text/url-decoder" component={UrlDecoder} />
        <Route path="/tools/text/text-cleaner" component={TextCleaner} />
        <Route path="/tools/text/whitespace-remover" component={WhitespaceRemover} />
        <Route path="/tools/text/duplicate-word-finder" component={DuplicateWordFinder} />
        <Route path="/tools/text/reading-time" component={ReadingTime} />
        <Route path="/tools/text/random-text-generator" component={RandomTextGenerator} />
        <Route path="/tools/text/keyword-density" component={KeywordDensity} />
        <Route path="/tools/text/html-stripper" component={HtmlStripper} />
        <Route path="/tools/text/markdown-preview" component={MarkdownPreview} />

        {/* Developer Tools */}
        <Route path="/tools/developer/json-formatter" component={JsonFormatter} />
        <Route path="/tools/developer/json-validator" component={JsonValidator} />
        <Route path="/tools/developer/json-minifier" component={JsonMinifier} />
        <Route path="/tools/developer/json-beautifier" component={JsonBeautifier} />
        <Route path="/tools/developer/base64-encode" component={Base64Encode} />
        <Route path="/tools/developer/base64-decode" component={Base64Decode} />
        <Route path="/tools/developer/uuid-generator" component={UuidGenerator} />
        <Route path="/tools/developer/md5-generator" component={Md5Generator} />
        <Route path="/tools/developer/sha256-generator" component={Sha256Generator} />
        <Route path="/tools/developer/unix-timestamp" component={UnixTimestamp} />
        <Route path="/tools/developer/regex-tester" component={RegexTester} />
        <Route path="/tools/developer/html-encoder" component={HtmlEncoder} />
        <Route path="/tools/developer/html-decoder" component={HtmlDecoder} />
        <Route path="/tools/developer/url-parser" component={UrlParser} />
        <Route path="/tools/developer/css-gradient" component={CssGradient} />
        <Route path="/tools/developer/hex-to-rgb" component={HexToRgb} />
        <Route path="/tools/developer/rgb-to-hex" component={RgbToHex} />
        <Route path="/tools/developer/color-picker" component={ColorPicker} />
        <Route path="/tools/developer/jwt-decoder" component={JwtDecoder} />
        <Route path="/tools/developer/qr-code" component={QrCode} />

        {/* Image Tools */}
        <Route path="/tools/image/image-compressor" component={ImageCompressor} />
        <Route path="/tools/image/image-resizer" component={ImageResizer} />
        <Route path="/tools/image/crop-image" component={CropImage} />
        <Route path="/tools/image/rotate-image" component={RotateImage} />
        <Route path="/tools/image/flip-image" component={FlipImage} />
        <Route path="/tools/image/jpg-to-png" component={JpgToPng} />
        <Route path="/tools/image/png-to-jpg" component={PngToJpg} />
        <Route path="/tools/image/png-to-webp" component={PngToWebp} />
        <Route path="/tools/image/webp-to-png" component={WebpToPng} />
        <Route path="/tools/image/image-to-base64" component={ImageToBase64} />
        <Route path="/tools/image/base64-to-image" component={Base64ToImage} />
        <Route path="/tools/image/svg-viewer" component={SvgViewer} />
        <Route path="/tools/image/favicon-generator" component={FaviconGenerator} />
        <Route path="/tools/image/image-metadata" component={ImageMetadata} />
        <Route path="/tools/image/dominant-color" component={DominantColor} />
        <Route path="/tools/image/blur-image" component={BlurImage} />
        <Route path="/tools/image/sharpen-image" component={SharpenImage} />
        <Route path="/tools/image/convert-ico" component={ConvertIco} />
        <Route path="/tools/image/image-dimensions" component={ImageDimensions} />
        <Route path="/tools/image/screenshot-frame" component={ScreenshotFrame} />

        {/* PDF Tools */}
        <Route path="/tools/pdf/merge-pdf" component={MergePdf} />
        <Route path="/tools/pdf/split-pdf" component={SplitPdf} />
        <Route path="/tools/pdf/compress-pdf" component={CompressPdf} />
        <Route path="/tools/pdf/rotate-pdf" component={RotatePdf} />
        <Route path="/tools/pdf/delete-pdf-pages" component={DeletePdfPages} />
        <Route path="/tools/pdf/rearrange-pdf-pages" component={RearrangePdfPages} />
        <Route path="/tools/pdf/pdf-to-jpg" component={PdfToJpg} />
        <Route path="/tools/pdf/jpg-to-pdf" component={JpgToPdf} />
        <Route path="/tools/pdf/png-to-pdf" component={PngToPdf} />
        <Route path="/tools/pdf/pdf-page-extractor" component={PdfPageExtractor} />
        <Route path="/tools/pdf/watermark-pdf" component={WatermarkPdf} />
        <Route path="/tools/pdf/unlock-pdf" component={UnlockPdf} />
        <Route path="/tools/pdf/protect-pdf" component={ProtectPdf} />
        <Route path="/tools/pdf/add-page-numbers" component={AddPageNumbers} />
        <Route path="/tools/pdf/pdf-metadata" component={PdfMetadata} />
        <Route path="/tools/pdf/pdf-size-checker" component={PdfSizeChecker} />
        <Route path="/tools/pdf/pdf-page-counter" component={PdfPageCounter} />
        <Route path="/tools/pdf/pdf-preview" component={PdfPreview} />
        <Route path="/tools/pdf/pdf-orientation" component={PdfOrientation} />
        <Route path="/tools/pdf/pdf-thumbnail" component={PdfThumbnail} />

        {/* Calculator Tools */}
        <Route path="/tools/calculators/percentage-calculator" component={PercentageCalculator} />
        <Route path="/tools/calculators/age-calculator" component={AgeCalculator} />
        <Route path="/tools/calculators/bmi-calculator" component={BmiCalculator} />
        <Route path="/tools/calculators/date-difference" component={DateDifference} />
        <Route path="/tools/calculators/time-duration" component={TimeDuration} />
        <Route path="/tools/calculators/unit-converter" component={UnitConverter} />
        <Route path="/tools/calculators/currency-converter" component={CurrencyConverter} />
        <Route path="/tools/calculators/discount-calculator" component={DiscountCalculator} />
        <Route path="/tools/calculators/profit-margin" component={ProfitMargin} />
        <Route path="/tools/calculators/compound-interest" component={CompoundInterest} />
        <Route path="/tools/calculators/loan-calculator" component={LoanCalculator} />
        <Route path="/tools/calculators/mortgage-calculator" component={MortgageCalculator} />
        <Route path="/tools/calculators/fuel-cost" component={FuelCost} />
        <Route path="/tools/calculators/vat-calculator" component={VatCalculator} />
        <Route path="/tools/calculators/tip-calculator" component={TipCalculator} />
        <Route path="/tools/calculators/average-calculator" component={AverageCalculator} />
        <Route path="/tools/calculators/scientific-calculator" component={ScientificCalculator} />
        <Route path="/tools/calculators/gpa-calculator" component={GpaCalculator} />
        <Route path="/tools/calculators/timezone-converter" component={TimezoneConverter} />
        <Route path="/tools/calculators/binary-calculator" component={BinaryCalculator} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
