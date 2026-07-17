import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { CurrencyPreferenceProvider } from "@/contexts/CurrencyPreferenceContext";
import React, { Suspense } from "react";

import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";
import BlogIndex from "@/pages/blog/BlogIndex";
import BlogPost from "@/pages/blog/BlogPost";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";

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
const MetaTagGenerator = L(() => import("@/pages/tools/ai/meta-tag-generator"));
const RobotsGenerator = L(() => import("@/pages/tools/ai/robots-generator"));
const SitemapGenerator = L(() => import("@/pages/tools/ai/sitemap-generator"));
const SerpPreview = L(() => import("@/pages/tools/ai/serp-preview"));
const SchemaMarkupGenerator = L(() => import("@/pages/tools/ai/schema-markup-generator"));
const OpenGraphGenerator = L(() => import("@/pages/tools/ai/open-graph-generator"));

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
const CssBoxShadowGenerator = L(() => import("@/pages/tools/developer/css-box-shadow-generator"));
const CssButtonGenerator = L(() => import("@/pages/tools/developer/css-button-generator"));
const PaletteGenerator = L(() => import("@/pages/tools/developer/palette-generator"));
const HexRgbConverter = L(() => import("@/pages/tools/developer/hex-rgb-converter"));
const JwtDecoder = L(() => import("@/pages/tools/developer/jwt-decoder"));
const QrCode = L(() => import("@/pages/tools/developer/qr-code"));
const ColorConverter = L(() => import("@/pages/tools/developer/color-converter"));
const CronGenerator = L(() => import("@/pages/tools/developer/cron-generator"));
const DiffChecker = L(() => import("@/pages/tools/developer/diff-checker"));
const DnsLookup = L(() => import("@/pages/tools/developer/dns-lookup"));
const HashGenerator = L(() => import("@/pages/tools/developer/hash-generator"));
const HttpHeadersChecker = L(() => import("@/pages/tools/developer/http-headers-checker"));
const IpLookup = L(() => import("@/pages/tools/developer/ip-lookup"));
const SqlFormatter = L(() => import("@/pages/tools/developer/sql-formatter"));
const SqlMinifier = L(() => import("@/pages/tools/developer/sql-minifier"));
const UserAgentParser = L(() => import("@/pages/tools/developer/user-agent-parser"));

// Image Tools
const ImageCompressor = L(() => import("@/pages/tools/image/image-compressor"));
const ImageResizer = L(() => import("@/pages/tools/image/image-resizer"));
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
const BgRemover = L(() => import("@/pages/tools/image/bg-remover"));
const HiResExport = L(() => import("@/pages/tools/image/hi-res-export"));

// File Conversion Tools
const Mp4ToMp3 = L(() => import("@/pages/tools/file-conversion/mp4-to-mp3"));
const FileCompressor = L(() => import("@/pages/tools/file-conversion/file-compressor"));
const EpubToPdf = L(() => import("@/pages/tools/file-conversion/epub-to-pdf"));
const ExcelToCsv = L(() => import("@/pages/tools/file-conversion/excel-to-csv"));
const CsvToJson = L(() => import("@/pages/tools/file-conversion/csv-to-json"));

// Business Tools
const InvoiceGenerator = L(() => import("@/pages/tools/business/invoice-generator"));
const ReceiptGenerator = L(() => import("@/pages/tools/business/receipt-generator"));
const BarcodeGenerator = L(() => import("@/pages/tools/business/barcode-generator"));
const BusinessProfitMarginCalculator = L(() => import("@/pages/tools/business/profit-margin-calculator"));
const AiBusinessName = L(() => import("@/pages/tools/business/ai-business-name"));
const AiSloganGenerator = L(() => import("@/pages/tools/business/ai-slogan-generator"));
const AiMissionStatement = L(() => import("@/pages/tools/business/ai-mission-statement"));
const AiVisionStatement = L(() => import("@/pages/tools/business/ai-vision-statement"));
const AiCompanyBio = L(() => import("@/pages/tools/business/ai-company-bio"));
const AiProductDescription = L(() => import("@/pages/tools/business/ai-product-description"));
const AiBrandStory = L(() => import("@/pages/tools/business/ai-brand-story"));

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
const BreakEvenCalculator = L(() => import("@/pages/tools/calculators/break-even-calculator"));
const BudgetPlanner = L(() => import("@/pages/tools/calculators/budget-planner"));
const CalorieCalculator = L(() => import("@/pages/tools/calculators/calorie-calculator"));
const ElectricityBillCalculator = L(() => import("@/pages/tools/calculators/electricity-bill-calculator"));
const GstCalculator = L(() => import("@/pages/tools/calculators/gst-calculator"));
const InflationCalculator = L(() => import("@/pages/tools/calculators/inflation-calculator"));
const PaceCalculator = L(() => import("@/pages/tools/calculators/pace-calculator"));
const PaypalFeeCalculator = L(() => import("@/pages/tools/calculators/paypal-fee-calculator"));
const PregnancyDueDate = L(() => import("@/pages/tools/calculators/pregnancy-due-date"));
const RetirementCalculator = L(() => import("@/pages/tools/calculators/retirement-calculator"));
const SleepCalculator = L(() => import("@/pages/tools/calculators/sleep-calculator"));
const WaterIntakeCalculator = L(() => import("@/pages/tools/calculators/water-intake-calculator"));

// Audio Tools
const Mp3Converter = L(() => import("@/pages/tools/audio/mp3-converter"));
const AudioTrimmer = L(() => import("@/pages/tools/audio/audio-trimmer"));
const VolumeBooster = L(() => import("@/pages/tools/audio/volume-booster"));
const VoiceRecorder = L(() => import("@/pages/tools/audio/voice-recorder"));
const AudioMerger = L(() => import("@/pages/tools/audio/audio-merger"));
const NoiseRemover = L(() => import("@/pages/tools/audio/noise-remover"));
const TextToSpeech = L(() => import("@/pages/tools/audio/text-to-speech"));
const SpeechToText = L(() => import("@/pages/tools/audio/speech-to-text"));

// Video Tools
const VideoConverter = L(() => import("@/pages/tools/video/video-converter"));
const VideoCompressor = L(() => import("@/pages/tools/video/video-compressor"));
const VideoTrimmer = L(() => import("@/pages/tools/video/video-trimmer"));
const MergeVideos = L(() => import("@/pages/tools/video/merge-videos"));
const ExtractAudio = L(() => import("@/pages/tools/video/extract-audio"));
const RotateCropVideo = L(() => import("@/pages/tools/video/rotate-crop-video"));
const AddSubtitles = L(() => import("@/pages/tools/video/add-subtitles"));
const ChangeVideoSpeed = L(() => import("@/pages/tools/video/change-video-speed"));
const GifMaker = L(() => import("@/pages/tools/video/gif-maker"));
const YoutubeDownloader = L(() => import("@/pages/tools/video/youtube-downloader"));
const FacebookDownloader = L(() => import("@/pages/tools/video/facebook-downloader"));
const InstagramDownloader = L(() => import("@/pages/tools/video/instagram-downloader"));
const TwitterDownloader = L(() => import("@/pages/tools/video/twitter-downloader"));
const TiktokDownloader = L(() => import("@/pages/tools/video/tiktok-downloader"));

// AI Tools
const AiWriter = L(() => import("@/pages/tools/ai/ai-writer"));
const AiSummarizer = L(() => import("@/pages/tools/ai/ai-summarizer"));
const AiParaphraser = L(() => import("@/pages/tools/ai/ai-paraphraser"));
const AiGrammarChecker = L(() => import("@/pages/tools/ai/ai-grammar-checker"));
const AiHumanizer = L(() => import("@/pages/tools/ai/ai-humanizer"));
const AiEmailWriter = L(() => import("@/pages/tools/ai/ai-email-writer"));
const AiResumeBuilder = L(() => import("@/pages/tools/ai/ai-resume-builder"));
const AiCoverLetter = L(() => import("@/pages/tools/ai/ai-cover-letter"));
const AiSeoTitle = L(() => import("@/pages/tools/ai/ai-seo-title"));
const AiMetaDescription = L(() => import("@/pages/tools/ai/ai-meta-description"));
const AiKeywordGenerator = L(() => import("@/pages/tools/ai/ai-keyword-generator"));
const AiSqlGenerator = L(() => import("@/pages/tools/developer/ai-sql-generator"));
const AiRegexGenerator = L(() => import("@/pages/tools/developer/ai-regex-generator"));
const AiCodeExplainer = L(() => import("@/pages/tools/developer/ai-code-explainer"));
const AiCodeReviewer = L(() => import("@/pages/tools/developer/ai-code-reviewer"));
const AiBugFinder = L(() => import("@/pages/tools/developer/ai-bug-finder"));
const AiJsonFormatter = L(() => import("@/pages/tools/developer/ai-json-formatter"));
const AiStudyNotes = L(() => import("@/pages/tools/ai/ai-study-notes"));
const AiQuizGenerator = L(() => import("@/pages/tools/ai/ai-quiz-generator"));
const AiFlashcardGenerator = L(() => import("@/pages/tools/ai/ai-flashcard-generator"));
const AiInterviewQuestions = L(() => import("@/pages/tools/ai/ai-interview-questions"));
const AiMeetingNotes = L(() => import("@/pages/tools/ai/ai-meeting-notes"));
const AiInterviewPractice = L(() => import("@/pages/tools/ai/ai-interview-practice"));
const AiHashtagGenerator = L(() => import("@/pages/tools/ai/ai-hashtag-generator"));
const AiYoutubeTitle = L(() => import("@/pages/tools/ai/ai-youtube-title"));
const AiInstagramCaption = L(() => import("@/pages/tools/ai/ai-instagram-caption"));
const AiAdCopyGenerator = L(() => import("@/pages/tools/ai/ai-ad-copy-generator"));
const AiFacebookAdCopyGenerator = L(() => import("@/pages/tools/ai/ai-facebook-ad-copy-generator"));
const AiGoogleAdsCopyGenerator = L(() => import("@/pages/tools/ai/ai-google-ads-copy-generator"));
const AiLinkedInAdCopyGenerator = L(() => import("@/pages/tools/ai/ai-linkedin-ad-copy-generator"));
const AiSalesCopyGenerator = L(() => import("@/pages/tools/ai/ai-sales-copy-generator"));
const AiLandingPageCopyGenerator = L(() => import("@/pages/tools/ai/ai-landing-page-copy-generator"));
const AiCtaGenerator = L(() => import("@/pages/tools/ai/ai-cta-generator"));
const AiResumeSummary = L(() => import("@/pages/tools/ai/ai-resume-summary"));
const AiResumeBulletPoints = L(() => import("@/pages/tools/ai/ai-resume-bullet-points"));
const AiLinkedinHeadline = L(() => import("@/pages/tools/ai/ai-linkedin-headline"));
const AiProfessionalBio = L(() => import("@/pages/tools/ai/ai-professional-bio"));
const AiTwitterPost = L(() => import("@/pages/tools/ai/ai-twitter-post"));
const AiLinkedinPost = L(() => import("@/pages/tools/ai/ai-linkedin-post"));
const AiTiktokCaption = L(() => import("@/pages/tools/ai/ai-tiktok-caption"));
const AiYoutubeDescription = L(() => import("@/pages/tools/ai/ai-youtube-description"));
const AiBlogTitle = L(() => import("@/pages/tools/ai/ai-blog-title"));
const AiBlogOutline = L(() => import("@/pages/tools/ai/ai-blog-outline"));
const AiBlogIntroduction = L(() => import("@/pages/tools/ai/ai-blog-introduction"));
const AiBlogConclusion = L(() => import("@/pages/tools/ai/ai-blog-conclusion"));
const AiArticleRewriter = L(() => import("@/pages/tools/ai/ai-article-rewriter"));
const AiParagraphRewriter = L(() => import("@/pages/tools/ai/ai-paragraph-rewriter"));
const AiSentenceRewriter = L(() => import("@/pages/tools/ai/ai-sentence-rewriter"));
const AiColdEmail = L(() => import("@/pages/tools/ai/ai-cold-email"));
const AiSalesEmail = L(() => import("@/pages/tools/ai/ai-sales-email"));
const AiFollowupEmail = L(() => import("@/pages/tools/ai/ai-followup-email"));
const AiSupportReply = L(() => import("@/pages/tools/ai/ai-support-reply"));
const AiThankYouEmail = L(() => import("@/pages/tools/ai/ai-thank-you-email"));
const AiTextImprover = L(() => import("@/pages/tools/ai/ai-text-improver"));
const AiToneChanger = L(() => import("@/pages/tools/ai/ai-tone-changer"));
const AiExpandText = L(() => import("@/pages/tools/ai/ai-expand-text"));
const AiShortenText = L(() => import("@/pages/tools/ai/ai-shorten-text"));
const AiProofreader = L(() => import("@/pages/tools/ai/ai-proofreader"));
const AiHomeworkHelper = L(() => import("@/pages/tools/ai/ai-homework-helper"));
const AiEssayWriter = L(() => import("@/pages/tools/ai/ai-essay-writer"));
const AiEssayImprover = L(() => import("@/pages/tools/ai/ai-essay-improver"));
const AiEssayGenerator = L(() => import("@/pages/tools/ai/ai-essay-generator"));
const AiParaphrasingTool = L(() => import("@/pages/tools/ai/ai-paraphrasing-tool"));
const AiMathSolver = L(() => import("@/pages/tools/ai/ai-math-solver"));
const AiStudyPlanner = L(() => import("@/pages/tools/ai/ai-study-planner"));
const AiJambCbtPractice = L(() => import("@/pages/tools/ai/ai-jamb-cbt-practice"));
const AiJambSubjectCombination = L(() => import("@/pages/tools/ai/ai-jamb-subject-combination"));
const AiJambCutoffChecker = L(() => import("@/pages/tools/ai/ai-jamb-cutoff-checker"));
const AiGhostwriting = L(() => import("@/pages/tools/ai/ai-ghostwriting"));
const AiStoryWriter = L(() => import("@/pages/tools/ai/ai-story-writer"));
const AiBookOutlineGenerator = L(() => import("@/pages/tools/ai/ai-book-outline-generator"));
const AiChapterGenerator = L(() => import("@/pages/tools/ai/ai-chapter-generator"));
const AiSpeechWriter = L(() => import("@/pages/tools/ai/ai-speech-writer"));

const queryClient = new QueryClient();

function Router() {
  return (
    <CurrencyPreferenceProvider>
      <Layout>
        <Switch>
        <Route path="/" component={Home} />

        {/* Categories */}
        <Route path="/text-tools" component={CategoryPage} />
        <Route path="/developer-tools" component={CategoryPage} />
        <Route path="/image-tools" component={CategoryPage} />
        <Route path="/file-conversion-tools" component={CategoryPage} />
        <Route path="/business-tools" component={CategoryPage} />
        <Route path="/pdf-tools" component={CategoryPage} />
        <Route path="/calculators" component={CategoryPage} />
        <Route path="/ai-tools" component={CategoryPage} />
        <Route path="/ai-marketing-advertising" component={CategoryPage} />
        <Route path="/ai-resume-tools" component={CategoryPage} />
        <Route path="/ai-social-media-tools" component={CategoryPage} />
        <Route path="/ai-blogging-seo-tools" component={CategoryPage} />
        <Route path="/ai-email-tools" component={CategoryPage} />
        <Route path="/ai-grammar-tools" component={CategoryPage} />
        <Route path="/audio-tools" component={CategoryPage} />
        <Route path="/video-tools" component={CategoryPage} />

        {/* Blog */}
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* Informational Pages */}
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/about" component={AboutUs} />
        <Route path="/contact" component={Contact} />

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
        <Route path="/tools/ai/meta-tag-generator" component={MetaTagGenerator} />
        <Route path="/tools/ai/robots-generator" component={RobotsGenerator} />
        <Route path="/tools/ai/sitemap-generator" component={SitemapGenerator} />
        <Route path="/tools/ai/serp-preview" component={SerpPreview} />
        <Route path="/tools/ai/schema-markup-generator" component={SchemaMarkupGenerator} />
        <Route path="/tools/ai/open-graph-generator" component={OpenGraphGenerator} />

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
        <Route path="/tools/developer/css-box-shadow-generator" component={CssBoxShadowGenerator} />
        <Route path="/tools/developer/css-button-generator" component={CssButtonGenerator} />
        <Route path="/tools/developer/palette-generator" component={PaletteGenerator} />
        <Route path="/tools/developer/hex-rgb-converter" component={HexRgbConverter} />
        <Route path="/tools/developer/jwt-decoder" component={JwtDecoder} />
        <Route path="/tools/developer/qr-code" component={QrCode} />
        <Route path="/tools/developer/color-converter" component={ColorConverter} />
        <Route path="/tools/developer/cron-generator" component={CronGenerator} />
        <Route path="/tools/developer/diff-checker" component={DiffChecker} />
        <Route path="/tools/developer/dns-lookup" component={DnsLookup} />
        <Route path="/tools/developer/hash-generator" component={HashGenerator} />
        <Route path="/tools/developer/http-headers-checker" component={HttpHeadersChecker} />
        <Route path="/tools/developer/ip-lookup" component={IpLookup} />
        <Route path="/tools/developer/sql-formatter" component={SqlFormatter} />
        <Route path="/tools/developer/sql-minifier" component={SqlMinifier} />
        <Route path="/tools/developer/user-agent-parser" component={UserAgentParser} />

        {/* Image Tools */}
        <Route path="/tools/image/image-compressor" component={ImageCompressor} />
        <Route path="/tools/image/image-resizer" component={ImageResizer} />
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
        <Route path="/tools/image/bg-remover" component={BgRemover} />
        <Route path="/tools/image/hi-res-export" component={HiResExport} />

        {/* File Conversion Tools */}
        <Route path="/tools/file-conversion/mp4-to-mp3" component={Mp4ToMp3} />
        <Route path="/tools/file-conversion/file-compressor" component={FileCompressor} />
        <Route path="/tools/file-conversion/epub-to-pdf" component={EpubToPdf} />
        <Route path="/tools/file-conversion/excel-to-csv" component={ExcelToCsv} />
        <Route path="/tools/file-conversion/csv-to-json" component={CsvToJson} />

        {/* Business Tools */}
        <Route path="/tools/business/invoice-generator" component={InvoiceGenerator} />
        <Route path="/tools/business/receipt-generator" component={ReceiptGenerator} />
        <Route path="/tools/business/barcode-generator" component={BarcodeGenerator} />
        <Route path="/tools/business/profit-margin-calculator" component={BusinessProfitMarginCalculator} />
        <Route path="/tools/business/ai-business-name" component={AiBusinessName} />
        <Route path="/tools/business/ai-slogan-generator" component={AiSloganGenerator} />
        <Route path="/tools/business/ai-mission-statement" component={AiMissionStatement} />
        <Route path="/tools/business/ai-vision-statement" component={AiVisionStatement} />
        <Route path="/tools/business/ai-company-bio" component={AiCompanyBio} />
        <Route path="/tools/business/ai-product-description" component={AiProductDescription} />
        <Route path="/tools/business/ai-brand-story" component={AiBrandStory} />

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
        <Route path="/tools/calculators/break-even-calculator" component={BreakEvenCalculator} />
        <Route path="/tools/calculators/budget-planner" component={BudgetPlanner} />
        <Route path="/tools/calculators/calorie-calculator" component={CalorieCalculator} />
        <Route path="/tools/calculators/electricity-bill-calculator" component={ElectricityBillCalculator} />
        <Route path="/tools/calculators/gst-calculator" component={GstCalculator} />
        <Route path="/tools/calculators/inflation-calculator" component={InflationCalculator} />
        <Route path="/tools/calculators/pace-calculator" component={PaceCalculator} />
        <Route path="/tools/calculators/paypal-fee-calculator" component={PaypalFeeCalculator} />
        <Route path="/tools/calculators/pregnancy-due-date" component={PregnancyDueDate} />
        <Route path="/tools/calculators/retirement-calculator" component={RetirementCalculator} />
        <Route path="/tools/calculators/sleep-calculator" component={SleepCalculator} />
        <Route path="/tools/calculators/water-intake-calculator" component={WaterIntakeCalculator} />

        {/* AI Tools */}
        <Route path="/tools/ai/ai-writer" component={AiWriter} />
        <Route path="/tools/ai/ai-summarizer" component={AiSummarizer} />
        <Route path="/tools/ai/ai-paraphraser" component={AiParaphraser} />
        <Route path="/tools/ai/ai-grammar-checker" component={AiGrammarChecker} />
        <Route path="/tools/ai/ai-humanizer" component={AiHumanizer} />
        <Route path="/tools/ai/ai-email-writer" component={AiEmailWriter} />
        <Route path="/tools/ai/ai-resume-builder" component={AiResumeBuilder} />
        <Route path="/tools/ai/ai-cover-letter" component={AiCoverLetter} />
        <Route path="/tools/ai/ai-seo-title" component={AiSeoTitle} />
        <Route path="/tools/ai/ai-meta-description" component={AiMetaDescription} />
        <Route path="/tools/ai/ai-keyword-generator" component={AiKeywordGenerator} />
        <Route path="/tools/developer/ai-sql-generator" component={AiSqlGenerator} />
        <Route path="/tools/developer/ai-regex-generator" component={AiRegexGenerator} />
        <Route path="/tools/developer/ai-code-explainer" component={AiCodeExplainer} />
        <Route path="/tools/developer/ai-code-reviewer" component={AiCodeReviewer} />
        <Route path="/tools/developer/ai-bug-finder" component={AiBugFinder} />
        <Route path="/tools/developer/ai-json-formatter" component={AiJsonFormatter} />
        <Route path="/tools/ai/ai-study-notes" component={AiStudyNotes} />
        <Route path="/tools/ai/ai-quiz-generator" component={AiQuizGenerator} />
        <Route path="/tools/ai/ai-flashcard-generator" component={AiFlashcardGenerator} />
        <Route path="/tools/ai/ai-interview-questions" component={AiInterviewQuestions} />
        <Route path="/tools/ai/ai-meeting-notes" component={AiMeetingNotes} />
        <Route path="/tools/ai/ai-interview-practice" component={AiInterviewPractice} />
        <Route path="/tools/ai/ai-hashtag-generator" component={AiHashtagGenerator} />
        <Route path="/tools/ai/ai-youtube-title" component={AiYoutubeTitle} />
        <Route path="/tools/ai/ai-instagram-caption" component={AiInstagramCaption} />
        <Route path="/tools/ai/ai-ad-copy-generator" component={AiAdCopyGenerator} />
        <Route path="/tools/ai/ai-facebook-ad-copy-generator" component={AiFacebookAdCopyGenerator} />
        <Route path="/tools/ai/ai-google-ads-copy-generator" component={AiGoogleAdsCopyGenerator} />
        <Route path="/tools/ai/ai-linkedin-ad-copy-generator" component={AiLinkedInAdCopyGenerator} />
        <Route path="/tools/ai/ai-sales-copy-generator" component={AiSalesCopyGenerator} />
        <Route path="/tools/ai/ai-landing-page-copy-generator" component={AiLandingPageCopyGenerator} />
        <Route path="/tools/ai/ai-cta-generator" component={AiCtaGenerator} />
        <Route path="/tools/ai/ai-resume-summary" component={AiResumeSummary} />
        <Route path="/tools/ai/ai-resume-bullet-points" component={AiResumeBulletPoints} />
        <Route path="/tools/ai/ai-linkedin-headline" component={AiLinkedinHeadline} />
        <Route path="/tools/ai/ai-professional-bio" component={AiProfessionalBio} />
        <Route path="/tools/ai/ai-twitter-post" component={AiTwitterPost} />
        <Route path="/tools/ai/ai-linkedin-post" component={AiLinkedinPost} />
        <Route path="/tools/ai/ai-tiktok-caption" component={AiTiktokCaption} />
        <Route path="/tools/ai/ai-youtube-description" component={AiYoutubeDescription} />
        <Route path="/tools/ai/ai-blog-title" component={AiBlogTitle} />
        <Route path="/tools/ai/ai-blog-outline" component={AiBlogOutline} />
        <Route path="/tools/ai/ai-blog-introduction" component={AiBlogIntroduction} />
        <Route path="/tools/ai/ai-blog-conclusion" component={AiBlogConclusion} />
        <Route path="/tools/ai/ai-article-rewriter" component={AiArticleRewriter} />
        <Route path="/tools/ai/ai-paragraph-rewriter" component={AiParagraphRewriter} />
        <Route path="/tools/ai/ai-sentence-rewriter" component={AiSentenceRewriter} />
        <Route path="/tools/ai/ai-cold-email" component={AiColdEmail} />
        <Route path="/tools/ai/ai-sales-email" component={AiSalesEmail} />
        <Route path="/tools/ai/ai-followup-email" component={AiFollowupEmail} />
        <Route path="/tools/ai/ai-support-reply" component={AiSupportReply} />
        <Route path="/tools/ai/ai-thank-you-email" component={AiThankYouEmail} />
        <Route path="/tools/ai/ai-text-improver" component={AiTextImprover} />
        <Route path="/tools/ai/ai-tone-changer" component={AiToneChanger} />
        <Route path="/tools/ai/ai-expand-text" component={AiExpandText} />
        <Route path="/tools/ai/ai-shorten-text" component={AiShortenText} />
        <Route path="/tools/ai/ai-proofreader" component={AiProofreader} />
        <Route path="/tools/ai/ai-homework-helper" component={AiHomeworkHelper} />
        <Route path="/tools/ai/ai-essay-writer" component={AiEssayWriter} />
        <Route path="/tools/ai/ai-essay-improver" component={AiEssayImprover} />
        <Route path="/tools/ai/ai-essay-generator" component={AiEssayGenerator} />
        <Route path="/tools/ai/ai-paraphrasing-tool" component={AiParaphrasingTool} />
        <Route path="/tools/ai/ai-math-solver" component={AiMathSolver} />
        <Route path="/tools/ai/ai-study-planner" component={AiStudyPlanner} />
        <Route path="/tools/ai/ai-jamb-cbt-practice" component={AiJambCbtPractice} />
        <Route path="/tools/ai/ai-jamb-subject-combination" component={AiJambSubjectCombination} />
        <Route path="/tools/ai/ai-jamb-cutoff-checker" component={AiJambCutoffChecker} />
        <Route path="/tools/ai/ai-ghostwriting" component={AiGhostwriting} />
        <Route path="/tools/ai/ai-story-writer" component={AiStoryWriter} />
        <Route path="/tools/ai/ai-book-outline-generator" component={AiBookOutlineGenerator} />
        <Route path="/tools/ai/ai-chapter-generator" component={AiChapterGenerator} />
        <Route path="/tools/ai/ai-speech-writer" component={AiSpeechWriter} />

        {/* Audio Tools */}
        <Route path="/tools/audio/mp3-converter" component={Mp3Converter} />
        <Route path="/tools/audio/audio-trimmer" component={AudioTrimmer} />
        <Route path="/tools/audio/volume-booster" component={VolumeBooster} />
        <Route path="/tools/audio/voice-recorder" component={VoiceRecorder} />
        <Route path="/tools/audio/audio-merger" component={AudioMerger} />
        <Route path="/tools/audio/noise-remover" component={NoiseRemover} />
        <Route path="/tools/audio/text-to-speech" component={TextToSpeech} />
        <Route path="/tools/audio/speech-to-text" component={SpeechToText} />

        {/* Video Tools */}
        <Route path="/tools/video/video-converter" component={VideoConverter} />
        <Route path="/tools/video/video-compressor" component={VideoCompressor} />
        <Route path="/tools/video/video-trimmer" component={VideoTrimmer} />
        <Route path="/tools/video/merge-videos" component={MergeVideos} />
        <Route path="/tools/video/extract-audio" component={ExtractAudio} />
        <Route path="/tools/video/rotate-crop-video" component={RotateCropVideo} />
        <Route path="/tools/video/add-subtitles" component={AddSubtitles} />
        <Route path="/tools/video/change-video-speed" component={ChangeVideoSpeed} />
        <Route path="/tools/video/gif-maker" component={GifMaker} />
        <Route path="/tools/video/youtube-downloader" component={YoutubeDownloader} />
        <Route path="/tools/video/facebook-downloader" component={FacebookDownloader} />
        <Route path="/tools/video/instagram-downloader" component={InstagramDownloader} />
        <Route path="/tools/video/twitter-downloader" component={TwitterDownloader} />
        <Route path="/tools/video/tiktok-downloader" component={TiktokDownloader} />

        <Route component={NotFound} />
      </Switch>
      </Layout>
    </CurrencyPreferenceProvider>
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
