import { Header } from './ui/header';

export function LandingHeader({ dashboardHref }: { dashboardHref?: string }) {
  return <Header dashboardHref={dashboardHref} />;
}
