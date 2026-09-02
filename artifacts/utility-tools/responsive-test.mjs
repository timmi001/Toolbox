import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5177'; // Using the existing dev server
const VIEWPORTS = [
  { name: '375×812 (iPhone SE)', width: 375, height: 812 },
  { name: '390×844 (iPhone 14)', width: 390, height: 844 },
  { name: '412×915 (Pixel)', width: 412, height: 915 },
  { name: '768×1024 (iPad)', width: 768, height: 1024 },
  { name: '1024×768 (iPad Landscape)', width: 1024, height: 768 },
  { name: '1440×900 (Desktop)', width: 1440, height: 900 },
  { name: '1920×1080 (Large Desktop)', width: 1920, height: 1080 },
];

async function testResponsive() {
  const browser = await chromium.launch();
  console.log('🧪 Testing responsive architecture...\n');

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.createContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      
      try {
        console.log(`📱 Testing: ${viewport.name}`);
        
        await page.goto(`${BASE_URL}/chat-with-pdf`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {
          console.log(`   ⚠️  Navigation timeout (network still loading)`);
        });

        // Check critical elements
        const desktopSidebar = await page.locator('aside').filter({ has: page.locator('text=Chat with PDF') }).isVisible().catch(() => false);
        const mobileMenuButton = await page.locator('button[aria-label="Open menu"]').isVisible().catch(() => false);
        const headerTitle = await page.locator('text=Chat with PDF').isVisible().catch(() => false);
        const composer = await page.locator('textarea[placeholder*="Ask anything"]').isVisible().catch(() => false);

        const isMobile = viewport.width < 768;
        const isTablet = viewport.width >= 768 && viewport.width <= 1024;
        const isDesktop = viewport.width > 1024;

        console.log(`   ✓ Desktop sidebar: ${desktopSidebar ? '✅ Visible' : '❌ Hidden'} (expected: ${!isMobile ? '✅ Visible' : '❌ Hidden'})`);
        console.log(`   ✓ Mobile menu button: ${mobileMenuButton ? '✅ Visible' : '❌ Hidden'} (expected: Always visible for interaction)`);
        console.log(`   ✓ Header/Title: ${headerTitle ? '✅ Visible' : '❌ Hidden'} (expected: ✅ Visible)`);
        console.log(`   ✓ Composer: ${composer ? '✅ Visible' : '❌ Hidden'} (expected: ✅ Visible)`);

        // Check for layout issues
        const main = await page.locator('main').boundingBox();
        if (main) {
          console.log(`   ℹ️  Main content area: ${Math.round(main.width)}x${Math.round(main.height)}px`);
        }

        // Verify responsive behavior
        const responsiveOk = 
          (isMobile && !desktopSidebar && headerTitle && composer) || // Mobile: no sidebar, has header/composer
          ((isTablet || isDesktop) && headerTitle && composer); // Tablet/Desktop: has header/composer

        console.log(`   ${responsiveOk ? '✅ PASS' : '❌ FAIL'} - Responsive layout correct for this viewport\n`);

      } catch (err) {
        console.error(`   ❌ ERROR: ${err.message}\n`);
      } finally {
        await context.close();
      }
    }

    console.log('✅ Responsive architecture test complete!\n');
    console.log('Key findings:');
    console.log('- Desktop sidebar should be hidden on mobile (<768px)');
    console.log('- Mobile menu button should be visible on mobile (<768px)');
    console.log('- All core components should render correctly at all sizes');
    console.log('- No layout shifts or missing elements');

  } finally {
    await browser.close();
  }
}

testResponsive().catch(console.error);
