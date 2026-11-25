import type { ReactNode } from 'react';
import { useRole } from '../../controllers/staffControllers';
import { useT } from '../../i18n';
import type { Role } from '../../models/types';
import { AppHeader } from './AppHeader';
import { Screen } from './Layout';
import { EmptyState } from './StateView';

/** Shows children only to the given role. The server checks roles too; this just keeps the UI honest. */
export function StaffGate({ role, children }: { role: Role; children: ReactNode }) {
  const t = useT();
  const current = useRole();
  if (current === role) return <>{children}</>;
  return (
    <Screen>
      <AppHeader back showCart={false} />
      <EmptyState icon="alert" title={t('staff.notAllowed')} />
    </Screen>
  );
}
