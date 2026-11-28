import { districtProps } from './patch-100-catalog.js';
import { whole096Keys } from './patch-096-catalog.js';
import { patch095Props } from './patch-095-catalog.js';
import { mriKey } from './patch-097-catalog.js';
import { postOfficeProps } from './patch-099-catalog.js';
/** Complete visual meshes with native collision and ownership. */
export const whole090Keys = new Set(['asml_lithography', 'finance_trading_desk', 'police_file_cabinet']);
export const wholeSceneKeys = new Set([...whole090Keys, ...whole096Keys, ...patch095Props.filter(d => d.kind === 'solid').map(d => d.key), mriKey, ...[...postOfficeProps, ...districtProps].filter(d => d.kind === 'solid').map(d => d.key)]);
