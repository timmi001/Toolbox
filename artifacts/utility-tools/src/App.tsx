import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { CurrencyPreferenceProvider } from "@/contexts/CurrencyPreferenceContext";
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import Home from "@/pages/Home";
import HubWorkspace from "@/pages/HubWorkspace";
import NotFound from "@/pages/not-found";
import BlogIndex from "@/pages/blog/BlogIndex";
import BlogPost from "@/pages/blog/BlogPost";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import DmcaPolicy from "@/pages/DmcaPolicy";
import AboutUs from "@/pages/AboutUs";
import Contact from "@/pages/Contact";
import AiTools from "@/pages/AiTools";
import ChatWithPdfRoutes from "@/pages/ChatWithPdf";
import PdfToolsIndex from "@/pages/PdfToolsIndex";
import PdfToolUnavailable from "@/pages/PdfToolUnavailable";
import MergePdf from "@/pages/tools/pdf/merge-pdf";
import SplitPdf from "@/pages/tools/pdf/split-pdf";
import PdfPageExtractor from "@/pages/tools/pdf/pdf-page-extractor";
import DeletePdfPages from "@/pages/tools/pdf/delete-pdf-pages";
import RearrangePdfPages from "@/pages/tools/pdf/rearrange-pdf-pages";
import RotatePdf from "@/pages/tools/pdf/rotate-pdf";
import CompressPdf from "@/pages/tools/pdf/compress-pdf";
import PdfToJpg from "@/pages/tools/pdf/pdf-to-jpg";
import JpgToPdf from "@/pages/tools/pdf/jpg-to-pdf";
import WatermarkPdf from "@/pages/tools/pdf/watermark-pdf";
import AddPageNumbers from "@/pages/tools/pdf/add-page-numbers";
import ProtectPdf from "@/pages/tools/pdf/protect-pdf";
import UnlockPdf from "@/pages/tools/pdf/unlock-pdf";
import { getToolBySlug, type Tool } from "@/lib/tools-data";

function getPdfTool(slug: string, name: string, description: string): Tool {
  return getToolBySlug(slug) ?? { slug, name, description, category: "pdf", keywords: [], icon: "FileText" };
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#090D12] px-6 text-white">
          <section className="max-w-md rounded-2xl border border-[#263746] bg-[#0D151E] p-6 text-center">
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm leading-6 text-[#9BA9B8]">{this.state.message}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-[#5BE4B6] px-4 py-2 text-sm font-bold text-[#071713]">
              Reload workspace
            </button>
          </section>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

function Router() {
  return (
    <CurrencyPreferenceProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/ai-tools" component={AiTools} />
          <Route path="/hub/ai" component={() => <Redirect to="/chat-with-pdf" />} />
          <Route path="/hub/:hub" component={HubWorkspace} />
          <Route path="/chat-with-pdf" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/documents" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/tools" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/saved" component={ChatWithPdfRoutes} />
          <Route path="/pdf-tools" component={PdfToolsIndex} />
          <Route path="/pdf/merge" component={MergePdf} />
          <Route path="/pdf/split" component={SplitPdf} />
          <Route path="/pdf/extract-pages" component={PdfPageExtractor} />
          <Route path="/pdf/delete-pages" component={DeletePdfPages} />
          <Route path="/pdf/reorder-pages" component={RearrangePdfPages} />
          <Route path="/pdf/rotate" component={RotatePdf} />
          <Route path="/pdf/compress" component={CompressPdf} />
          <Route path="/pdf/pdf-to-jpg" component={PdfToJpg} />
          <Route path="/pdf/jpg-to-pdf" component={JpgToPdf} />
          <Route path="/pdf/watermark" component={WatermarkPdf} />
          <Route path="/pdf/add-page-numbers" component={AddPageNumbers} />
          <Route path="/pdf/protect" component={ProtectPdf} />
          <Route path="/pdf/unlock" component={UnlockPdf} />
          <Route path="/pdf/repair" component={() => <PdfToolUnavailable tool={getPdfTool("pdf-repair", "Repair PDF", "Repair a PDF file.")} />} />
          <Route path="/pdf/flatten" component={() => <PdfToolUnavailable tool={getPdfTool("pdf-flatten", "Flatten PDF", "Flatten PDF form fields.")} />} />
          <Route path="/pdf/pdf-to-word" component={() => <PdfToolUnavailable tool={getPdfTool("pdf-to-word", "PDF to Word", "Convert a PDF to Word.")} />} />
          <Route path="/pdf/pdf-to-excel" component={() => <PdfToolUnavailable tool={getPdfTool("pdf-to-excel", "PDF to Excel", "Convert a PDF to Excel.")} />} />
          <Route path="/pdf/pdf-to-powerpoint" component={() => <PdfToolUnavailable tool={getPdfTool("pdf-to-powerpoint", "PDF to PowerPoint", "Convert a PDF to PowerPoint.")} />} />
          <Route path="/pdf/word-to-pdf" component={() => <PdfToolUnavailable tool={getPdfTool("word-to-pdf", "Word to PDF", "Convert Word documents to PDF.")} />} />
          <Route path="/pdf/excel-to-pdf" component={() => <PdfToolUnavailable tool={getPdfTool("excel-to-pdf", "Excel to PDF", "Convert Excel documents to PDF.")} />} />
          <Route path="/pdf/powerpoint-to-pdf" component={() => <PdfToolUnavailable tool={getPdfTool("powerpoint-to-pdf", "PowerPoint to PDF", "Convert PowerPoint documents to PDF.")} />} />
          <Route path="/pdf/edit" component={() => <PdfToolUnavailable tool={getPdfTool("edit-pdf", "Edit PDF", "Edit a PDF.")} />} />
          <Route path="/pdf/add-text" component={() => <PdfToolUnavailable tool={getPdfTool("add-text", "Add Text", "Add text to a PDF.")} />} />
          <Route path="/pdf/add-image" component={() => <PdfToolUnavailable tool={getPdfTool("add-image", "Add Image", "Add an image to a PDF.")} />} />
          <Route path="/pdf/sign" component={() => <PdfToolUnavailable tool={getPdfTool("sign-pdf", "Sign PDF", "Sign a PDF.")} />} />
          <Route path="/pdf/redact" component={() => <PdfToolUnavailable tool={getPdfTool("redact-pdf", "Redact PDF", "Redact a PDF.")} />} />
          <Route path="/blog" component={BlogIndex} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/copyright-policy" component={DmcaPolicy} />
          <Route path="/dmca" component={DmcaPolicy} />
          <Route path="/about" component={AboutUs} />
          <Route path="/contact" component={Contact} />
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
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;