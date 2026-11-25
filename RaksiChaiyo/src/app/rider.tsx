import { StaffGate } from '../views/components/StaffGate';
import { RiderScreen } from '../views/screens/RiderScreen';

export default function RiderRoute() {
  return (
    <StaffGate role="rider">
      <RiderScreen />
    </StaffGate>
  );
}
