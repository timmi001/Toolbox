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
          <Route path="/chat-with-pdf/history" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/documents" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/tools" component={ChatWithPdfRoutes} />
          <Route path="/chat-with-pdf/saved" component={ChatWithPdfRoutes} />
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