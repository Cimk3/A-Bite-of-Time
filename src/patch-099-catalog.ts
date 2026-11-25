import type {Patch090Item} from './patch-090-catalog.js';

export const postOfficeGroup='post_office';
export const postOfficeItems=[
 {key:'postal_counter',zh:'邮政柜台',en:'Postal Counter',kind:'solid',size:[3,1,1]},
 {key:'postal_sorting_cubbies',zh:'分拣格柜',en:'Mail Sorting Cubbies',kind:'solid',size:[2,1,2]},
 {key:'postal_parcel_lockers',zh:'包裹自提柜',en:'Parcel Lockers',kind:'solid',size:[3,1,2]},
 {key:'postal_square_mailbox',zh:'方形邮筒',en:'Square Mailbox',kind:'solid',size:[1,1,1]},
 {key:'postal_cylinder_mailbox',zh:'圆柱邮筒',en:'Cylindrical Mailbox',kind:'solid',size:[1,1,1]},
 {key:'postal_parcel_scale',zh:'包裹称重台',en:'Parcel Scale',kind:'surface',size:[1,1,.5]},
 {key:'postal_parcel_small',zh:'小号邮寄纸箱',en:'Small Postal Parcel',kind:'surface',size:[1,1,.5]},
 {key:'postal_parcel_medium',zh:'中号邮寄纸箱',en:'Medium Postal Parcel',kind:'surface',size:[1,1,.75]},
 {key:'postal_parcel_large',zh:'大号邮寄纸箱',en:'Large Postal Parcel',kind:'surface',size:[1,1,.75]},
] as const satisfies readonly (Omit<Patch090Item,'group'> & {en:string})[];

export const postOfficeProps=postOfficeItems.map(item=>({
 ...item,group:postOfficeGroup,height:Math.ceil(item.size[2]),wallOnly:false,placementFront:0,
 footprint:item.size[0]>1?{width:item.size[0],depth:item.size[1]}:undefined,
}));
export const postOfficeKeys=new Set<string>(postOfficeProps.map(d=>d.key));
