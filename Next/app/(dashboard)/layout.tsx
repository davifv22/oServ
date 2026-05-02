import DashboardShell from '@/components/DashboardShell'
import packageJson from '../../package.json'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell appVersion={packageJson.version}>{children}</DashboardShell>
}
