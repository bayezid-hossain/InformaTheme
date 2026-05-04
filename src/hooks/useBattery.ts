import { useEffect, useState } from 'react';
import * as Battery from 'expo-battery';

export interface BatteryState {
  level: number;
  charging: boolean;
}

export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({ level: 1, charging: false });

  useEffect(() => {
    let levelSub: Battery.Subscription;
    let chargeSub: Battery.Subscription;

    Battery.getBatteryLevelAsync().then((level) => setState((s) => ({ ...s, level })));
    Battery.getBatteryStateAsync().then((battState) =>
      setState((s) => ({ ...s, charging: battState === Battery.BatteryState.CHARGING || battState === Battery.BatteryState.FULL }))
    );

    levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) =>
      setState((s) => ({ ...s, level: batteryLevel }))
    );
    chargeSub = Battery.addBatteryStateListener(({ batteryState }) =>
      setState((s) => ({ ...s, charging: batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL }))
    );

    return () => {
      levelSub?.remove();
      chargeSub?.remove();
    };
  }, []);

  return state;
}
